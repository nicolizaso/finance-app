const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const Transaction = require('../models/Transaction');
const { z } = require('zod');

// Schema Validation
const goalSchema = z.object({
    title: z.string().min(1),
    targetAmount: z.number().positive(),
    currentAmount: z.number().min(0).optional(),
    icon: z.string().optional(),
    deadline: z.string().optional().nullable(), // Date as string
    color: z.string().optional()
});

// GET /api/savings-goals
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const goals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: goals });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/savings-goals
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const validation = goalSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.errors });
        }

        const newGoal = new SavingsGoal({
            userId,
            ...validation.data
        });

        await newGoal.save();
        res.json({ success: true, data: newGoal });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/savings-goals/:id
router.put('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        // Allow partial updates
        const validation = goalSchema.partial().safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.errors });
        }

        const updatedGoal = await SavingsGoal.findOneAndUpdate(
            { _id: id, userId },
            validation.data,
            { new: true }
        );

        if (!updatedGoal) {
            return res.status(404).json({ success: false, error: 'Goal not found' });
        }

        res.json({ success: true, data: updatedGoal });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/savings-goals/:id
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;

        const deletedGoal = await SavingsGoal.findOneAndDelete({ _id: id, userId });
        if (!deletedGoal) {
            return res.status(404).json({ success: false, error: 'Goal not found' });
        }

        res.json({ success: true, data: deletedGoal });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/savings-goals/:id/add
router.post('/:id/add', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        const goal = await SavingsGoal.findOne({ _id: id, userId });
        if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

        // Update Goal
        goal.currentAmount += Number(amount);
        await goal.save();

        // Create Expense Transaction (To reduce "Spending Money")
        const transaction = new Transaction({
            userId,
            description: `Aporte a: ${goal.title}`,
            amount: Number(amount),
            type: 'EXPENSE',
            category: 'Ahorro',
            date: new Date(),
            status: 'COMPLETED',
            paymentMethod: 'TRANSFER', // Assuming transfer to savings
            isFixed: false
        });
        await transaction.save();

        res.json({ success: true, data: goal });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/savings-goals/:id/withdraw
router.post('/:id/withdraw', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        const goal = await SavingsGoal.findOne({ _id: id, userId });
        if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

        // Check if enough funds
        if (goal.currentAmount < amount) {
             return res.status(400).json({ success: false, error: 'Insufficient funds in goal' });
        }

        // Update Goal
        goal.currentAmount -= Number(amount);
        await goal.save();

        // Create Income Transaction (To increase "Spending Money")
        const transaction = new Transaction({
            userId,
            description: `Retiro de: ${goal.title}`,
            amount: Number(amount),
            type: 'INCOME',
            category: 'Ahorro',
            date: new Date(),
            status: 'COMPLETED',
            isFixed: false
        });
        await transaction.save();

        res.json({ success: true, data: goal });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
