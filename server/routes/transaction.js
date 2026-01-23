const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { calculateCreditProjection } = require('../utils/creditProjection');
const { checkAchievements } = require('../utils/gamification');
const { randomUUID } = require('crypto');

router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // <--- LEEMOS EL HEADER
        if (!userId) return res.json({ success: true, data: [] });

        const transactions = await Transaction.find({ userId })
            .sort({ date: -1 })
            .populate('paidBy', 'name'); // Populate payer info
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Obtener gastos compartidos del usuario
// @route   GET /api/transactions/shared
router.get('/shared', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.json({ success: true, data: [] });

        const transactions = await Transaction.find({ userId, isShared: true })
            .sort({ date: -1 })
            .populate('paidBy', 'name');

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

        // Extraer campos
        const { isShared, splits, ...txData } = req.body;

        let createdTransactions = [];
        let gamificationResult = null;

        if (isShared && splits && Array.isArray(splits) && splits.length > 0) {
            // --- NUEVA LÓGICA DE COMPARTIDOS (Refactorizada) ---
            const sharedTransactionId = randomUUID();
            const paidBy = userId; // El creador paga
            const totalAmount = req.body.totalAmount || txData.amount; // Ensure totalAmount is passed or fallback

            const promises = splits.map(async (split) => {
                // Determinar el userId para esta transacción
                let targetUserId = split.userId;

                // Si es el creador, usamos el ID real
                if (targetUserId === 'CREATOR') {
                    targetUserId = userId;
                }

                // Si es un string (nombre "Otro") y no es un ID válido (24 chars),
                // NO creamos transacción (no se puede asignar a un User en DB),
                // SALVO que sea el creador.
                const isValidId = targetUserId && targetUserId.length === 24;

                // Si no es un ID válido (e.g. "Otro") y no es el creador, no podemos crear Transaction.
                if (!isValidId && targetUserId !== userId) return null;

                const transactionData = {
                    ...txData,
                    userId: targetUserId,
                    amount: split.amount, // SU parte (No el total)
                    type: 'EXPENSE',
                    category: txData.category,
                    isShared: true,
                    sharedTransactionId,
                    paidBy,
                    totalAmount,
                    // Fix frontend calculation issue:
                    myPercentage: 100,
                    myShare: split.amount,
                    otherShare: 0,
                    sharedWith: targetUserId === userId ? 'PARTNER' : userId,
                };

                return Transaction.create(transactionData);
            });

            const results = await Promise.all(promises);
            createdTransactions = results.filter(r => r !== null);

        } else {
            // --- LÓGICA ESTÁNDAR / LEGACY (Sin splits array) ---
            // If just normal transaction:
            const transaction = await Transaction.create({ ...txData, userId });
            createdTransactions = [transaction];
        }

        // Gamification Check (only once)
        gamificationResult = await checkAchievements(userId, 'ADD_TRANSACTION');

        res.status(201).json({ success: true, data: createdTransactions[0], gamification: gamificationResult });
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