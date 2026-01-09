const mongoose = require('mongoose');

const FixedExpenseSchema = new mongoose.Schema({
    userId: { type: String, default: 'user_default_123' },
    title: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, default: 0 }, 
    dayOfMonth: { type: Number, required: true, min: 1, max: 31 },
    paymentLink: { type: String, default: '' } // <--- NUEVO CAMPO
});

module.exports = mongoose.models.FixedExpense || mongoose.model('FixedExpense', FixedExpenseSchema);