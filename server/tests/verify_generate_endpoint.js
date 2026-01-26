const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const http = require('http');
const FixedExpense = require('../models/FixedExpense');
const Transaction = require('../models/Transaction');

const PORT = 5555;

async function makeRequest(path, method, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data ? Buffer.byteLength(data) : 0,
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        body: JSON.parse(responseBody)
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        body: responseBody
                    });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(data);
        req.end();
    });
}

(async () => {
    let mongod;
    try {
        // 1. Setup DB
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        process.env.MONGO_URI = uri;
        process.env.PORT = PORT;

        // 2. Start Server (it connects to our MONGO_URI)
        console.log('Starting server...');
        // We suppress console.log from the server to keep output clean
        // const originalLog = console.log;
        // console.log = () => {};
        require('../index');
        // console.log = originalLog;

        // Allow some time for server to start and connect
        await new Promise(r => setTimeout(r, 2000));

        // 3. Seed Data
        // Wait for connection
        if (mongoose.connection.readyState !== 1) {
            await new Promise(resolve => mongoose.connection.once('connected', resolve));
        }

        const userId = 'user_test_gen';
        await FixedExpense.create({
            userId,
            title: 'Test Fixed Expense 1',
            category: 'Test',
            amount: 500,
            dayOfMonth: 15
        });
        await FixedExpense.create({
            userId,
            title: 'Test Fixed Expense 2',
            category: 'Test',
            amount: 1000,
            dayOfMonth: 20
        });

        console.log('Seeded 2 Fixed Expenses.');

        // 4. Call Endpoint
        console.log('Calling /generate...');
        const res = await makeRequest('/api/fixed-expenses/generate', 'POST', {
            month: 10,
            year: 2023
        }, {
            'x-user-id': userId
        });

        console.log('Response:', res.body);

        if (res.statusCode !== 200) {
            throw new Error(`Expected 200, got ${res.statusCode}`);
        }

        // 5. Verify Transactions
        const transactions = await Transaction.find({ userId });
        console.log(`Found ${transactions.length} transactions.`);

        if (transactions.length !== 2) {
            throw new Error(`Expected 2 transactions, found ${transactions.length}`);
        }

        const descriptions = transactions.map(t => t.description);
        if (descriptions.includes('Test Fixed Expense 1') && descriptions.includes('Test Fixed Expense 2')) {
             console.log('✅ Transactions created correctly.');
        } else {
            throw new Error('Transaction descriptions do not match.');
        }

        // 6. Test Idempotency (Run again)
        console.log('Calling /generate again (Idempotency check)...');
        const res2 = await makeRequest('/api/fixed-expenses/generate', 'POST', {
            month: 10,
            year: 2023
        }, {
            'x-user-id': userId
        });

        console.log('Response 2:', res2.body);

        const transactions2 = await Transaction.find({ userId });
        if (transactions2.length !== 2) {
             throw new Error(`Expected 2 transactions after second run, found ${transactions2.length}`);
        }
        console.log('✅ Idempotency Verified.');

        process.exit(0);

    } catch (err) {
        console.error('❌ Verification Failed:', err);
        process.exit(1);
    }
})();
