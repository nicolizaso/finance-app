const express = require('express');
const router = express.Router();
const WealthItem = require('../models/WealthItem');
const { checkAchievements } = require('../utils/gamification');

// @desc    List all wealth items for user
// @route   GET /api/wealth
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.json({ success: true, data: [] });

        const items = await WealthItem.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Create new wealth item
// @route   POST /api/wealth
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(400).json({ success: false, error: 'Usuario no identificado' });

        const { type, title, totalAmount, currentAmount, currency, dueDate } = req.body;

        const newItem = await WealthItem.create({
            userId,
            type,
            title,
            totalAmount: Number(totalAmount),
            currentAmount: Number(currentAmount),
            currency: currency || 'ARS',
            dueDate: dueDate || null
        });

        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// @desc    Update wealth item
// @route   PUT /api/wealth/:id
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const item = await WealthItem.findOne({ _id: req.params.id, userId });

        if (!item) {
            return res.status(404).json({ success: false, error: 'Item no encontrado' });
        }

        // Filter allowed fields
        const { title, totalAmount, currentAmount, currency, type } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (totalAmount !== undefined) updateData.totalAmount = Number(totalAmount);
        if (currentAmount !== undefined) updateData.currentAmount = Number(currentAmount);
        if (currency !== undefined) updateData.currency = currency;
        if (type !== undefined) updateData.type = type;

        const updatedItem = await WealthItem.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        let gamificationResult = {};
        if (updatedItem.type === 'DEBT' && updatedItem.currentAmount === 0 && item.currentAmount > 0) {
             gamificationResult = await checkAchievements(userId, 'PAY_DEBT', { debtPaid: true });
        }

        res.status(200).json({ success: true, data: updatedItem, gamification: gamificationResult });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Delete wealth item
// @route   DELETE /api/wealth/:id
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const item = await WealthItem.findOne({ _id: req.params.id, userId });

        if (!item) {
            return res.status(404).json({ success: false, error: 'Item no encontrado' });
        }

        await item.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
