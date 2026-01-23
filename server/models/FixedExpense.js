const mongoose = require('mongoose');

const FixedExpenseSchema = new mongoose.Schema({
    userId: { type: String, default: 'user_default_123', index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, default: 0 }, 
    dayOfMonth: { type: Number, required: true, min: 1, max: 31 },
    
    // --- SUSCRIPTION RADAR ---
    isSubscription: { type: Boolean, default: false },
    lastAmount: { type: Number, default: 0 },

    // --- NUEVOS CAMPOS DE PAGO ---
    paymentMethod: { 
        type: String, 
        enum: ['ONLINE', 'TRANSFER', 'CASH', 'DEBIT'], 
        default: 'ONLINE' 
    },
    paymentLink: { type: String, default: '' },       // Para ONLINE
    cbuAlias: { type: String, default: '' },          // Para TRANSFER
    currency: { type: String, default: 'ARS' },       // Para CASH ($ o USD)
    autoDebitCard: { type: String, default: '' },     // Para DEBIT

    // --- GASTOS COMPARTIDOS ---
    isShared: { type: Boolean, default: false },
    sharedWith: { type: String, default: '' },
    sharedStatus: { type: String, default: 'NONE' },
    otherShare: { type: Number, default: 0 }
});

module.exports = mongoose.models.FixedExpense || mongoose.model('FixedExpense', FixedExpenseSchema);