const express = require('express');
const router = express.Router();
const FixedExpense = require('../models/FixedExpense');
const Transaction = require('../models/Transaction');

// 1. Guardar nueva regla (Asociada al usuario)
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(400).json({ success: false, error: 'Usuario no identificado' });

        const { isShared, sharedWith, myShare, otherShare, ...expenseData } = req.body;

        // 1. Crear MI regla
        const myRuleData = {
            ...expenseData,
            userId,
            isShared: isShared || false,
            sharedWith: isShared ? sharedWith : '',
            sharedStatus: isShared ? 'OWNER' : 'NONE',
            amount: isShared ? myShare : expenseData.amount,
            otherShare: isShared ? otherShare : 0
        };

        const fixed = await FixedExpense.create(myRuleData);

        // 2. Si es compartido con usuario BDD, crear regla espejo
        if (isShared && sharedWith && sharedWith.length === 24) {
            const otherRuleData = {
                ...expenseData,
                userId: sharedWith,
                isShared: true,
                sharedWith: userId,
                sharedStatus: 'PARTNER',
                amount: otherShare,
                title: `${expenseData.title} (Compartido)`
            };
            await FixedExpense.create(otherRuleData);
        }

        res.status(201).json({ success: true, data: fixed });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 2. Obtener reglas (Solo del usuario)
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.json({ success: true, data: [] });
        
        const fixed = await FixedExpense.find({ userId }).sort({ dayOfMonth: 1 });
        res.status(200).json({ success: true, data: fixed });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error server' });
    }
});

// 3. EDITAR Regla y Sincronizar Pendientes del mes actual
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        
        // Buscamos la regla asegurando que pertenezca al usuario
        const oldRule = await FixedExpense.findOne({ _id: req.params.id, userId });
        if (!oldRule) return res.status(404).json({ success: false, error: 'No encontrado' });

        const updatedRule = await FixedExpense.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Sincronizar con la transacción pendiente actual de ESTE usuario
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const newDueDate = new Date(today.getFullYear(), today.getMonth(), updatedRule.dayOfMonth);

        await Transaction.findOneAndUpdate(
            {
                userId, // Importante: Solo actualizar la de este usuario
                description: oldRule.title,
                status: 'PENDING',
                type: 'EXPENSE',
                date: { $gte: startOfMonth, $lte: endOfMonth }
            },
            {
                description: updatedRule.title,
                amount: updatedRule.amount,
                category: updatedRule.category,
                date: newDueDate,
                isFixed: true,
                // Actualizamos campos de pago
                paymentMethod: updatedRule.paymentMethod,
                paymentLink: updatedRule.paymentLink,
                cbuAlias: updatedRule.cbuAlias,
                currency: updatedRule.currency,
                autoDebitCard: updatedRule.autoDebitCard
            }
        );

        res.status(200).json({ success: true, data: updatedRule });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 4. BORRAR Regla y limpiar pendientes
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        
        const rule = await FixedExpense.findOne({ _id: req.params.id, userId });
        if (!rule) return res.status(404).json({ success: false, error: 'No encontrado' });

        // Borrar regla
        await FixedExpense.findByIdAndDelete(req.params.id);
        
        // Borrar pendientes generados por esa regla (Solo de este usuario)
        await Transaction.deleteMany({
            userId,
            description: rule.title,
            status: 'PENDING',
            type: 'EXPENSE'
        });

        res.status(200).json({ success: true, message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. GENERAR GASTOS DEL MES (El Motor Principal)
router.post('/generate', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(400).json({ success: false, error: 'Usuario no identificado' });

        // 1. Buscamos SOLO las reglas de este usuario
        const fixedExpenses = await FixedExpense.find({ userId });
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let createdCount = 0;

        for (const expense of fixedExpenses) {
            const dueDate = new Date(currentYear, currentMonth, expense.dayOfMonth);
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

            // 2. Verificamos si ya existe la transacción para ESTE usuario este mes
            const exists = await Transaction.findOne({
                userId,
                description: expense.title, 
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });

            if (!exists) {
                // 3. Creamos la transacción asociada al usuario
                await Transaction.create({
                    userId,
                    description: expense.title,
                    amount: expense.amount,
                    type: 'EXPENSE',
                    category: expense.category,
                    date: dueDate,
                    status: 'PENDING',
                    isFixed: true,
                    // Copiamos datos de pago
                    paymentMethod: expense.paymentMethod,
                    paymentLink: expense.paymentLink,
                    cbuAlias: expense.cbuAlias,
                    currency: expense.currency,
                    autoDebitCard: expense.autoDebitCard
                });
                createdCount++;
            }
        }

        res.status(200).json({ success: true, message: `Generados ${createdCount}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error generando' });
    }
});

module.exports = router;