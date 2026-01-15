const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    icon: { type: String, default: 'PiggyBank' }, // Default icon name
    deadline: { type: Date },
    color: { type: String, default: '#10b981' } // Default neon green
}, {
    timestamps: true
});

module.exports = mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', savingsGoalSchema);
