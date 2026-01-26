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
            sharedWith: (isShared && sharedWith) ? sharedWith : null,
            sharedStatus: isShared ? 'OWNER' : 'NONE',
            amount: isShared ? myShare : expenseData.amount,
            otherShare: isShared ? otherShare : 0,

            // New Fields for Display
            myShare: isShared ? myShare : expenseData.amount, // Save explicitly
            totalAmount: expenseData.totalAmount || expenseData.amount, // Save Total

            isSubscription: expenseData.isSubscription || false,
            lastAmount: expenseData.amount || 0
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

                // Cross-Assign Shares
                myShare: otherShare, // Their share is what I call otherShare
                otherShare: myShare, // Their otherShare is my share
                totalAmount: expenseData.totalAmount || expenseData.amount,

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
        
        const fixed = await FixedExpense.find({ userId })
            .sort({ dayOfMonth: 1 })
            .populate('sharedWith', 'name email');

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

        let updateData = { ...req.body };

        // Logic for Price Hike Detection (Subscription Radar)
        if (updateData.amount !== undefined && Number(updateData.amount) !== oldRule.amount) {
            updateData.lastAmount = oldRule.amount;
        }

        const updatedRule = await FixedExpense.findByIdAndUpdate(req.params.id, updateData, { new: true });

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

                // Sync Shared Info
                isShared: updatedRule.isShared,
                sharedWith: updatedRule.sharedWith,
                myShare: updatedRule.myShare,
                totalAmount: updatedRule.totalAmount,

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
        // Support for custom month generation
        const reqMonth = (req.body && req.body.month !== undefined) ? parseInt(req.body.month) : today.getMonth();
        const reqYear = (req.body && req.body.year !== undefined) ? parseInt(req.body.year) : today.getFullYear();
        
        let createdCount = 0;

        // 2. Optimization: Batch check for existing transactions
        const startOfMonth = new Date(reqYear, reqMonth, 1);
        const endOfMonth = new Date(reqYear, reqMonth + 1, 0);

        const expenseTitles = fixedExpenses.map(e => e.title);
        const existingTransactions = await Transaction.find({
            userId,
            description: { $in: expenseTitles },
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).select('description');

        const existingTitles = new Set(existingTransactions.map(t => t.description));
        const processedTitlesInBatch = new Set();
        const transactionsToCreate = [];

        for (const expense of fixedExpenses) {
            // Check against DB and current batch to prevent duplicates
            if (!existingTitles.has(expense.title) && !processedTitlesInBatch.has(expense.title)) {
                const dueDate = new Date(reqYear, reqMonth, expense.dayOfMonth);

                transactionsToCreate.push({
                    userId,
                    description: expense.title,
                    amount: expense.amount,
                    type: 'EXPENSE',
                    category: expense.category,
                    date: dueDate,
                    status: 'PENDING',
                    isFixed: true,

                    // Shared Fields
                    isShared: expense.isShared,
                    sharedWith: expense.sharedWith,
                    myShare: expense.myShare,
                    totalAmount: expense.totalAmount,

                    // Copiamos datos de pago
                    paymentMethod: expense.paymentMethod,
                    paymentLink: expense.paymentLink,
                    cbuAlias: expense.cbuAlias,
                    currency: expense.currency,
                    autoDebitCard: expense.autoDebitCard
                });

                processedTitlesInBatch.add(expense.title);
            }
        }

        if (transactionsToCreate.length > 0) {
            await Transaction.insertMany(transactionsToCreate);
            createdCount = transactionsToCreate.length;
        }

        res.status(200).json({ success: true, message: `Generados ${createdCount}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error generando' });
    }
});

// 6. VISTA MENSUAL UNIFICADA (On-Demand Generation)
router.get('/monthly-view', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(400).json({ success: false, error: 'Usuario no identificado' });

        const today = new Date();
        const reqMonth = req.query.month !== undefined ? parseInt(req.query.month) : today.getMonth();
        const reqYear = req.query.year !== undefined ? parseInt(req.query.year) : today.getFullYear();

        // 1. Obtener reglas activas
        const fixedExpenses = await FixedExpense.find({ userId });

        // 2. Definir rango de fechas
        const startOfMonth = new Date(reqYear, reqMonth, 1);
        const endOfMonth = new Date(reqYear, reqMonth + 1, 0);

        // 3. Obtener transacciones FIXED existentes (para el Gap Fill)
        let existingFixed = await Transaction.find({
            userId,
            isFixed: true,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // 4. Gap Fill: Rellenar huecos
        // Usamos un Set para búsqueda rápida por descripción
        const transactionMap = new Set(existingFixed.map(t => t.description));

        for (const expense of fixedExpenses) {
            if (!transactionMap.has(expense.title)) {
                // Crear transacción faltante
                const dueDate = new Date(reqYear, reqMonth, expense.dayOfMonth);

                await Transaction.create({
                    userId,
                    description: expense.title,
                    amount: expense.amount,
                    type: 'EXPENSE',
                    category: expense.category,
                    date: dueDate,
                    status: 'PENDING',
                    isFixed: true,

                    // Shared Fields
                    isShared: expense.isShared,
                    sharedWith: expense.sharedWith,
                    myShare: expense.myShare,
                    totalAmount: expense.totalAmount,

                    // Payment Fields
                    paymentMethod: expense.paymentMethod,
                    paymentLink: expense.paymentLink,
                    cbuAlias: expense.cbuAlias,
                    currency: expense.currency,
                    autoDebitCard: expense.autoDebitCard
                });

                transactionMap.add(expense.title);
            }
        }

        // 5. Fetch ALL Expenses for the month (Unified View)
        let allTransactions = await Transaction.find({
            $or: [
                { userId: userId },
                { sharedWith: userId }
            ],
            type: 'EXPENSE',
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).populate('userId', 'name email');

        // 6. Credit Card Logic (Injection)
        let prevMonth = reqMonth - 1;
        let prevYear = reqYear;
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear = reqYear - 1;
        }

        const startOfPrevMonth = new Date(prevYear, prevMonth, 1);
        const endOfPrevMonth = new Date(prevYear, prevMonth + 1, 0);

        // Sum previous month credit card usage
        const creditCardTransactions = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    type: 'EXPENSE',
                    paymentMethod: 'CREDIT',
                    date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);

        const ccTotal = creditCardTransactions.length > 0 ? creditCardTransactions[0].total : 0;

        // Convert documents to plain objects to allow injection
        let finalTransactions = allTransactions.map(t => t.toObject ? t.toObject() : t);

        if (ccTotal > 0) {
            const ccBill = {
                _id: 'cc-summary-virtual',
                description: 'Tarjeta de Crédito (Resumen)',
                amount: ccTotal,
                date: new Date(reqYear, reqMonth, 1), // 1st of current month
                category: 'Financiero',
                isFixed: true, // Visually styled as fixed
                isVirtual: true,
                isPaid: false,
                type: 'EXPENSE',
                status: 'PENDING',
                paymentMethod: 'ONLINE' // Default to avoid errors
            };
            finalTransactions.push(ccBill);
        }

        // Ordenar por fecha
        finalTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json({ success: true, data: finalTransactions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error obteniendo vista mensual' });
    }
});

module.exports = router;