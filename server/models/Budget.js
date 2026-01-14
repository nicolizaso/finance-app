const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    category: { type: String, required: true },
    limitAmount: { type: Number, required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true }
});

// Compound index to ensure unique budget per user, category, month, and year
BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
