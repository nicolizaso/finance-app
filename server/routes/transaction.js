const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { calculateCreditProjection } = require('../utils/creditProjection');
const { checkAchievements } = require('../utils/gamification');

router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // <--- LEEMOS EL HEADER
        if (!userId) return res.json({ success: true, data: [] });

        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Obtener etiquetas únicas
// @route   GET /api/transactions/tags
router.get('/tags', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.json({ success: true, data: [] });

        const tags = await Transaction.distinct('tags', { userId });
        res.json({ success: true, data: tags });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Obtener proyección de tarjeta de crédito
// @route   GET /api/transactions/projection
router.get('/projection', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(400).json({ success: false, error: 'Usuario no identificado' });

        // Buscar solo gastos con tarjeta de crédito
        const credits = await Transaction.find({
            userId,
            paymentMethod: 'CREDIT',
            type: 'EXPENSE'
        });

        const { totalDebt, nextMonthBill } = calculateCreditProjection(credits);
        res.json({ success: true, data: { totalDebt, nextMonthBill } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al calcular proyección' });
    }
});

// CREAR (Asociado al usuario)
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; 
        if (!userId) return res.status(400).json({ success: false, error: 'Usuario no identificado' });

        // Extraer campos especiales de compartido
        const { isShared, sharedWith, myShare, otherShare, ...txData } = req.body;

        // 1. Crear MI transacción
        // NEW LOGIC: 'amount' siempre es el Total.
        // Guardamos 'myShare' explícitamente.
        const myTransactionData = {
            ...txData,
            userId,
            isShared: isShared || false,
            sharedWith: isShared ? sharedWith : '',
            sharedStatus: isShared ? 'OWNER' : 'NONE',
            amount: txData.amount, // Siempre Total
            otherShare: isShared ? otherShare : 0,
            myShare: isShared ? myShare : 0
        };

        const transaction = await Transaction.create(myTransactionData);

        // 2. Si es compartido con un usuario real de la BDD, le creamos su parte
        if (isShared && sharedWith && sharedWith.length === 24) { // Simple check for ObjectId length
             // Intentamos crear la transaccion espejo
             // Para el PARTNER:
             // - amount: Total
             // - myShare: lo que ERA 'otherShare' para mí (su parte)
             // - otherShare: lo que ERA 'myShare' para mí (mi parte)
             const otherTransactionData = {
                ...txData,
                userId: sharedWith, // ID del otro usuario
                isShared: true,
                sharedWith: userId, // Compartido CONMIGO (el creador)
                sharedStatus: 'PARTNER',
                amount: txData.amount, // Total
                description: `${txData.description} (Compartido)`,
                myShare: otherShare, // Su parte
                otherShare: myShare // La parte del creador
             };
             await Transaction.create(otherTransactionData);
        }

        // Gamification Check
        const gamificationResult = await checkAchievements(userId, 'ADD_TRANSACTION');

        res.status(201).json({ success: true, data: transaction, gamification: gamificationResult });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// @desc    Actualizar una transacción (Para marcar como pagado o editar)
// @route   PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
    try {
        // 1. Buscamos la transacción por el ID que viene en la URL
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transacción no encontrada' });
        }

        // 2. Actualizamos con los datos nuevos
        // { new: true } hace que mongoose nos devuelva el objeto YA actualizado
        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error de Servidor' });
    }
});

// @desc    Borrar una transacción
// @route   DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transacción no encontrada' });
        }

        await transaction.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error de Servidor' });
    }
});

module.exports = router;