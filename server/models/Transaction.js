const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: String, default: 'user_default_123' },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['INCOME', 'EXPENSE'] },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'COMPLETED', enum: ['PENDING', 'COMPLETED'] },
    isFixed: { type: Boolean, default: false },
    
    // --- DATOS HEREDADOS DEL GASTO FIJO ---
    paymentMethod: {
        type: String,
        enum: ['ONLINE', 'TRANSFER', 'CASH', 'DEBIT', 'CREDIT'],
        default: 'ONLINE'
    },
    installments: { type: Number, default: 1 },
    installmentId: { type: String, default: '' },
    paymentLink: { type: String, default: '' },
    cbuAlias: { type: String, default: '' },
    currency: { type: String, default: 'ARS' },
    autoDebitCard: { type: String, default: '' },

    // --- GASTOS COMPARTIDOS ---
    isShared: { type: Boolean, default: false },
    sharedWith: { type: String, default: '' }, // ID de usuario o Nombre "Otro"
    sharedStatus: { type: String, default: 'NONE' }, // OWNER (yo pagué/creé), PARTER (soy el invitado)
    otherShare: { type: Number, default: 0 } // La parte del otro (para poder reconstruir el total al editar)
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);