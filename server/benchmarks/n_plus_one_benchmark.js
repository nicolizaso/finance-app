const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const FixedExpense = require('../models/FixedExpense');
const Transaction = require('../models/Transaction');

// --- Helper to create fixed expenses ---
async function seedFixedExpenses(userId, count) {
    const expenses = [];
    for (let i = 0; i < count; i++) {
        expenses.push({
            userId,
            title: `Fixed Expense ${i}`,
            category: 'General',
            amount: 100 + i,
            dayOfMonth: (i % 28) + 1,
            isShared: false,
            paymentMethod: 'ONLINE'
        });
    }
    await FixedExpense.insertMany(expenses);
    console.log(`✅ Seeded ${count} Fixed Expenses`);
}

// --- BASELINE (Slow) Logic ---
async function runBaseline(userId, reqMonth, reqYear) {
    const fixedExpenses = await FixedExpense.find({ userId });
    let createdCount = 0;

    const start = performance.now();

    for (const expense of fixedExpenses) {
        // Calculate specific dates based on request
        const dueDate = new Date(reqYear, reqMonth, expense.dayOfMonth);
        const startOfMonth = new Date(reqYear, reqMonth, 1);
        const endOfMonth = new Date(reqYear, reqMonth + 1, 0);

        // 2. Verificamos si ya existe la transacción para ESTE usuario este mes
        const exists = await Transaction.findOne({
            userId,
            description: expense.title,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        if (!exists) {
            // 3. Creamos la transacción asociada al usuario
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

                // Copiamos datos de pago
                paymentMethod: expense.paymentMethod,
                paymentLink: expense.paymentLink,
                cbuAlias: expense.cbuAlias,
                currency: expense.currency,
                autoDebitCard: expense.autoDebitCard
            });
            createdCount++;
        }
    }

    const end = performance.now();
    return { time: end - start, count: createdCount };
}

// --- OPTIMIZED (Fast) Logic ---
async function runOptimized(userId, reqMonth, reqYear) {
    const fixedExpenses = await FixedExpense.find({ userId });
    let createdCount = 0;

    const start = performance.now();

    const startOfMonth = new Date(reqYear, reqMonth, 1);
    const endOfMonth = new Date(reqYear, reqMonth + 1, 0);

    // 1. Bulk Fetch Existing Transactions
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

    const end = performance.now();
    return { time: end - start, count: createdCount };
}

// --- MAIN EXECUTION ---
(async () => {
    let mongod;
    try {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);

        const userId = 'user_bench_123';
        const ITEM_COUNT = 500; // Adjust load here

        // 1. Seed
        await seedFixedExpenses(userId, ITEM_COUNT);

        // 2. Run Baseline
        console.log('--- Running Baseline (N+1) ---');
        await Transaction.deleteMany({}); // Clean slate
        const res1 = await runBaseline(userId, 10, 2023); // Nov 2023
        console.log(`Baseline: ${res1.time.toFixed(2)}ms | Created: ${res1.count}`);

        // 3. Run Optimized
        console.log('--- Running Optimized (Batch) ---');
        await Transaction.deleteMany({}); // Clean slate
        const res2 = await runOptimized(userId, 10, 2023);
        console.log(`Optimized: ${res2.time.toFixed(2)}ms | Created: ${res2.count}`);

        // 4. Comparison
        const improvement = res1.time / res2.time;
        console.log(`\n🚀 Speedup: ${improvement.toFixed(2)}x`);

        if (res1.count !== res2.count) {
            console.error('❌ Mismatch in created count!');
            process.exit(1);
        } else {
            console.log('✅ Correctness Verified');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        if (mongod) await mongod.stop();
    }
})();
