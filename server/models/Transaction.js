const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, default: 'user_default_123' },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['INCOME', 'EXPENSE'] },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'COMPLETED', enum: ['PENDING', 'COMPLETED'] },
    paymentLink: { type: String, default: '' } // <--- NUEVO CAMPO
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);