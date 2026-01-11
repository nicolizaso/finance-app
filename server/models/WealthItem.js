const mongoose = require('mongoose');

const WealthItemSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['DEBT', 'RECEIVABLE', 'CASH']
    },
    title: { type: String, required: true },
    totalAmount: { type: Number, required: true }, // For DEBT/RECEIVABLE: Original amount. For CASH: can be same as current or 0.
    currentAmount: { type: Number, required: true },
    currency: { type: String, default: 'ARS', enum: ['ARS', 'USD'] },
    dueDate: { type: Date } // Optional
}, {
    timestamps: true
});

module.exports = mongoose.models.WealthItem || mongoose.model('WealthItem', WealthItemSchema);
