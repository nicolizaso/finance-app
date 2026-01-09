const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// @desc    Obtener todas las transacciones
// @route   GET /api/transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 }); // Las más nuevas primero
        res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error de Servidor' });
    }
});

// @desc    Agregar una transacción
// @route   POST /api/transactions
router.post('/', async (req, res) => {
    try {
        // Aquí ocurre la magia de guardar en Mongo
        const transaction = await Transaction.create(req.body);
        
        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        if(error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        } else {
            return res.status(500).json({ success: false, error: 'Error de Servidor' });
        }
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