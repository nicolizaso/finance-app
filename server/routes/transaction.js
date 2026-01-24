const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { calculateCreditProjection } = require('../utils/creditProjection');
const { checkAchievements } = require('../utils/gamification');
const { randomUUID } = require('crypto');
const mongoose = require('mongoose');

// @desc    Obtener resumen financiero (Estadísticas y Totales)
// @route   GET /api/transactions/stats
router.get('/stats', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.json({ success: true, data: {} });

        // Logic to calculate effective amount in aggregation
        const effectiveAmountExpr = {
            $cond: {
                if: { $eq: ["$isShared", true] },
                then: {
                    $switch: {
                        branches: [
                            {
                                // Case 1: myPercentage exists and is not null
                                case: { $and: [{ $ne: ["$myPercentage", null] }, { $ne: ["$myPercentage", undefined] }] },
                                then: { $round: [{ $multiply: ["$amount", { $divide: ["$myPercentage", 100] }] }, 0] }
                            },
                            {
                                // Case 2: myShare exists
                                case: { $and: [{ $ne: ["$myShare", null] }, { $ne: ["$myShare", undefined] }] },
                                then: "$myShare"
                            },
                            {
                                // Case 3: otherShare exists
                                case: { $gt: ["$otherShare", 0] },
                                then: { $subtract: ["$amount", "$otherShare"] }
                            }
                        ],
                        default: "$amount"
                    }
                },
                else: "$amount"
            }
        };

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Pipeline for Balance (All time completed transactions)
        const balanceStats = await Transaction.aggregate([
            { $match: { userId: userId, status: 'COMPLETED' } },
            {
                $project: {
                    type: 1,
                    amount: effectiveAmountExpr
                }
            },
            {
                $group: {
                    _id: null,
                    income: {
                        $sum: { $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0] }
                    },
                    expense: {
                        $sum: { $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0] }
                    }
                }
            }
        ]);

        const balance = balanceStats[0] ? {
            income: Math.round(balanceStats[0].income),
            expense: Math.round(balanceStats[0].expense),
            total: Math.round(balanceStats[0].income - balanceStats[0].expense)
        } : { income: 0, expense: 0, total: 0 };

        // Helper to format months
        const getMonthName = (monthIndex) => {
            const date = new Date(2024, monthIndex, 1);
            return date.toLocaleString('default', { month: 'short' });
        };

        // Last 6 months Income vs Expense
        const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
        const last6MonthsStats = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    status: 'COMPLETED',
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $project: {
                    date: 1,
                    type: 1,
                    amount: effectiveAmountExpr
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    income: {
                        $sum: { $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0] }
                    },
                    expense: {
                        $sum: { $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0] }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Post-process to fill missing months and format
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - i, 1);
            const m = d.getMonth() + 1; // MongoDB months are 1-12
            const y = d.getFullYear();

            const stat = last6MonthsStats.find(s => s._id.month === m && s._id.year === y);
            last6Months.push({
                name: getMonthName(m - 1),
                Income: stat ? stat.income : 0,
                Expense: stat ? stat.expense : 0
            });
        }

        // Category Breakdown
        // We need 3 periods: thisMonth, lastMonth, thisYear
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthVal = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);

        // Fix: Ensure we include last month even if it falls in the previous year (e.g., Dec when curr is Jan)
        const earliestDate = lastMonthDate < startOfYear ? lastMonthDate : startOfYear;

        const categoryStats = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    type: 'EXPENSE',
                    status: 'COMPLETED',
                    date: { $gte: earliestDate }
                }
            },
             {
                 $match: {
                     $or: [
                        { date: { $gte: new Date(currentYear, 0, 1) } }, // This Year
                        { date: { $gte: lastMonthDate, $lt: new Date(currentYear, currentMonth, 1) } } // Last Month (if Dec previous year)
                     ]
                 }
            },
            {
                $project: {
                    date: 1,
                    category: 1,
                    amount: effectiveAmountExpr
                }
            },
            {
                $group: {
                    _id: {
                        category: "$category",
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const getBreakdown = (period) => {
             let filtered = [];
             if (period === 'thisMonth') {
                 filtered = categoryStats.filter(s => s._id.month === (currentMonth + 1) && s._id.year === currentYear);
             } else if (period === 'lastMonth') {
                 filtered = categoryStats.filter(s => s._id.month === (lastMonthVal + 1) && s._id.year === lastMonthYear);
             } else if (period === 'thisYear') {
                 filtered = categoryStats.filter(s => s._id.year === currentYear);
             }

             // Sum by category
             const map = {};
             filtered.forEach(s => {
                 map[s._id.category] = (map[s._id.category] || 0) + s.total;
             });

             return Object.entries(map)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
        };

        const categoryBreakdown = {
            thisMonth: getBreakdown('thisMonth'),
            lastMonth: getBreakdown('lastMonth'),
            thisYear: getBreakdown('thisYear')
        };

        // Spending Trend (Daily)
        // Group by day for this month and last month
        const trendStats = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    type: 'EXPENSE',
                    status: 'COMPLETED',
                    $or: [
                        { date: { $gte: new Date(currentYear, currentMonth, 1), $lt: new Date(currentYear, currentMonth + 1, 1) } }, // This month
                        { date: { $gte: lastMonthDate, $lt: new Date(lastMonthYear, lastMonthVal + 1, 1) } } // Last month
                    ]
                }
            },
            {
                $project: {
                    date: 1,
                    amount: effectiveAmountExpr
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$date" },
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    dailyTotal: { $sum: "$amount" }
                }
            }
        ]);

        const spendingTrend = [];
        let accumThis = 0;
        let accumLast = 0;

        for (let day = 1; day <= 31; day++) {
             const statThis = trendStats.find(s => s._id.day === day && s._id.month === (currentMonth + 1) && s._id.year === currentYear);
             const statLast = trendStats.find(s => s._id.day === day && s._id.month === (lastMonthVal + 1) && s._id.year === lastMonthYear);

             accumThis += statThis ? statThis.dailyTotal : 0;
             accumLast += statLast ? statLast.dailyTotal : 0;

             let valThis = accumThis;
             if (day > today.getDate() && currentMonth === today.getMonth()) {
                 valThis = null;
             }

             spendingTrend.push({
                 day,
                 thisMonth: valThis,
                 lastMonth: accumLast
             });
        }

        res.json({
            success: true,
            data: {
                balance,
                last6Months,
                categoryBreakdown,
                spendingTrend
            }
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Obtener gastos fijos y pendientes
// @route   GET /api/transactions/fixed
router.get('/fixed', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.json({ success: true, data: [] });

        const transactions = await Transaction.find({
            userId,
            $or: [
                { isFixed: true },
                { status: 'PENDING' }
            ]
        })
        .sort({ date: 1 }) // Closest dates first usually better for bills? Or desc? Existing logic used existing sorting.
        .populate('paidBy', 'name')
        .populate('sharedWith', 'name email');

        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // <--- LEEMOS EL HEADER
        if (!userId) return res.json({ success: true, data: [] });

        // Pagination Params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const total = await Transaction.countDocuments({ userId });

        const transactions = await Transaction.find({ userId })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('paidBy', 'name') // Populate payer info
            .populate('sharedWith', 'name email');

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
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
            .populate('paidBy', 'name')
            .populate('sharedWith', 'name email');

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

            const transactionDocs = splits.map((split) => {
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

                return {
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
            }).filter(doc => doc !== null);

            createdTransactions = await Transaction.insertMany(transactionDocs);

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