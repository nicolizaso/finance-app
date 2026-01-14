const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { z } = require('zod');

// Schema validation for creating/updating budget
const budgetSchema = z.object({
    category: z.string().min(1),
    limitAmount: z.number().positive(),
    month: z.number().min(1).max(12),
    year: z.number().int().min(2000),
});

// GET /api/budgets?month=X&year=Y
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        const { month, year } = req.query;

        if (!month || !year) {
             return res.status(400).json({ error: 'Month and year are required' });
        }

        const budgets = await Budget.find({
            userId,
            month: parseInt(month),
            year: parseInt(year)
        });

        res.json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/budgets - Set or update a budget
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'User ID required' });
        }

        const validation = budgetSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }

        const { category, limitAmount, month, year } = validation.data;

        const budget = await Budget.findOneAndUpdate(
            { userId, category, month, year },
            { limitAmount },
            { new: true, upsert: true }
        );

        res.json(budget);

    } catch (error) {
        console.error('Error saving budget:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
