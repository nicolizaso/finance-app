const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

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

// CREAR (Asociado al usuario)
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // <--- LEEMOS EL HEADER
        if (!userId) return res.status(400).json({ success: false, error: 'Usuario no identificado' });

        const transaction = await Transaction.create({ ...req.body, userId });
        res.status(201).json({ success: true, data: transaction });
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