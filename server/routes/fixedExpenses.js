const express = require('express');
const router = express.Router();
const FixedExpense = require('../models/FixedExpense');
const Transaction = require('../models/Transaction');

// 1. Guardar un nuevo Gasto Fijo (La Regla)
router.post('/', async (req, res) => {
    try {
        const fixed = await FixedExpense.create(req.body);
        res.status(201).json({ success: true, data: fixed });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// 2. Obtener gastos fijos
router.get('/', async (req, res) => {
    try {
        const fixed = await FixedExpense.find();
        res.status(200).json({ success: true, data: fixed });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error server' });
    }
});

// 3. EL MOTOR: Chequear y Generar pendientes del mes
router.post('/generate', async (req, res) => {
    try {
        const fixedExpenses = await FixedExpense.find();
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let createdCount = 0;

        for (const expense of fixedExpenses) {
            // Definimos la fecha de vencimiento de ESTE mes
            const dueDate = new Date(currentYear, currentMonth, expense.dayOfMonth);

            // Buscamos si YA existe una transacción para este gasto fijo en este mes
            // Usamos un rango de fechas para buscar en todo el mes actual
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

            const exists = await Transaction.findOne({
                description: expense.title, // Usamos el nombre como identificador simple por ahora
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });

            if (!exists) {
                // Si no existe, la creamos como PENDIENTE
                await Transaction.create({
                    description: expense.description || expense.title, // Fallback por si description no viene
                    amount: expense.amount, // Usamos el estimado
                    type: 'EXPENSE',
                    category: expense.category,
                    date: dueDate,
                    status: 'PENDING' // <--- Clave: Nace pendiente
                });
                createdCount++;
            }
        }

        res.status(200).json({ success: true, message: `Generados ${createdCount} gastos pendientes` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error generando gastos' });
    }
});

module.exports = router;