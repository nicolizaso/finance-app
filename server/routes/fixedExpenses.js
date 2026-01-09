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

// 2. Obtener todas las reglas
router.get('/', async (req, res) => {
    try {
        const fixed = await FixedExpense.find().sort({ dayOfMonth: 1 });
        res.status(200).json({ success: true, data: fixed });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error server' });
    }
});

// 3. EDITAR Regla (NUEVO)
// 3. EDITAR Regla y Sincronizar Pendientes
router.put('/:id', async (req, res) => {
    try {
        // A. Buscamos la regla ANTES de actualizar para tener el título original
        const oldRule = await FixedExpense.findById(req.params.id);
        
        if (!oldRule) {
            return res.status(404).json({ success: false, error: 'Regla no encontrada' });
        }

        // B. Actualizamos la regla maestra
        const updatedRule = await FixedExpense.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // C. Sincronización Mágica: Buscamos la transacción PENDIENTE de este mes
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Calculamos la nueva fecha de vencimiento por si cambió el día
        const newDueDate = new Date(today.getFullYear(), today.getMonth(), updatedRule.dayOfMonth);

        await Transaction.findOneAndUpdate(
            {
                description: oldRule.title, // Buscamos por el nombre viejo (por si lo cambiaste)
                status: 'PENDING',          // Solo actualizamos si no se pagó todavía
                type: 'EXPENSE',
                date: { $gte: startOfMonth, $lte: endOfMonth } // Solo la de este mes
            },
            {
                // Copiamos todos los datos nuevos a la transacción existente
                description: updatedRule.title,
                amount: updatedRule.amount,
                category: updatedRule.category,
                paymentLink: updatedRule.paymentLink, // <--- AQUÍ SE AGREGA EL LINK
                date: newDueDate
            }
        );

        res.status(200).json({ success: true, data: updatedRule });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// 4. BORRAR Regla (NUEVO)
// 4. BORRAR Regla y limpiar pendientes
router.delete('/:id', async (req, res) => {
    try {
        // Primero buscamos la regla para saber su nombre
        const rule = await FixedExpense.findById(req.params.id);
        
        if (!rule) {
            return res.status(404).json({ success: false, error: 'Regla no encontrada' });
        }

        // 1. Borramos la regla de la colección de fijos
        await FixedExpense.findByIdAndDelete(req.params.id);

        // 2. Borramos las transacciones PENDIENTES generadas por esa regla
        // (Para que desaparezcan del dashboard inmediatamente)
        await Transaction.deleteMany({
            description: rule.title,
            status: 'PENDING',
            type: 'EXPENSE'
        });

        res.status(200).json({ success: true, message: 'Regla y pendientes eliminados' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Generar transacciones del mes
router.post('/generate', async (req, res) => {
    try {
        const fixedExpenses = await FixedExpense.find();
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let createdCount = 0;

        for (const expense of fixedExpenses) {
            // Fecha de vencimiento este mes
            const dueDate = new Date(currentYear, currentMonth, expense.dayOfMonth);
            
            // Buscar si ya existe este mes (buscamos por titulo aproximado o exacto)
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
                    paymentLink: expense.paymentLink
                });
                createdCount++;
            }
        }

        res.status(200).json({ success: true, message: `Generados ${createdCount}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error generando gastos' });
    }
});

module.exports = router;