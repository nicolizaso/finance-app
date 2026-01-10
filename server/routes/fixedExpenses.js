const express = require('express');
const router = express.Router();
const FixedExpense = require('../models/FixedExpense');
const Transaction = require('../models/Transaction');

// 1. Guardar nueva regla
router.post('/', async (req, res) => {
    try {
        const fixed = await FixedExpense.create(req.body);
        res.status(201).json({ success: true, data: fixed });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 2. Obtener reglas
router.get('/', async (req, res) => {
    try {
        const fixed = await FixedExpense.find().sort({ dayOfMonth: 1 });
        res.status(200).json({ success: true, data: fixed });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error server' });
    }
});

// 3. EDITAR Regla y Sincronizar Pendientes (ACTUALIZADO)
router.put('/:id', async (req, res) => {
    try {
        const oldRule = await FixedExpense.findById(req.params.id);
        if (!oldRule) return res.status(404).json({ success: false, error: 'No encontrado' });

        const updatedRule = await FixedExpense.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Sincronizar
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const newDueDate = new Date(today.getFullYear(), today.getMonth(), updatedRule.dayOfMonth);

        await Transaction.findOneAndUpdate(
            {
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
                // --- ACTUALIZAMOS LOS CAMPOS NUEVOS ---
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

// 4. BORRAR Regla
router.delete('/:id', async (req, res) => {
    try {
        const rule = await FixedExpense.findById(req.params.id);
        if (!rule) return res.status(404).json({ success: false, error: 'No encontrado' });

        await FixedExpense.findByIdAndDelete(req.params.id);
        await Transaction.deleteMany({
            description: rule.title,
            status: 'PENDING',
            type: 'EXPENSE'
        });

        res.status(200).json({ success: true, message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. GENERAR (ACTUALIZADO)
router.post('/generate', async (req, res) => {
    try {
        const fixedExpenses = await FixedExpense.find();
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        let createdCount = 0;

        for (const expense of fixedExpenses) {
            const dueDate = new Date(currentYear, currentMonth, expense.dayOfMonth);
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

            const exists = await Transaction.findOne({
                description: expense.title, 
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });

            if (!exists) {
                await Transaction.create({
                    description: expense.title,
                    amount: expense.amount,
                    type: 'EXPENSE',
                    category: expense.category,
                    date: dueDate,
                    status: 'PENDING',
                    isFixed: true,
                    // --- COPIAMOS LOS CAMPOS NUEVOS ---
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