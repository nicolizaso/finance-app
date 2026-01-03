const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        default: 'user_default_123' // MVP: Hardcodeado por ahora hasta tener Login
    },
    description: {
        type: String,
        required: [true, 'Por favor agrega una descripción'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Por favor agrega un monto'],
        // REGLA DE VECTOR: Siempre guardamos centavos (Integers)
        // Ejemplo: $10.50 se guarda como 1050
    },
    type: {
        type: String,
        enum: ['EXPENSE', 'INCOME'], // Solo permitimos estos dos valores
        required: true
    },
    category: {
        type: String, // MVP: Usaremos texto simple por ahora ("Comida", "Casa")
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING'],
        default: 'COMPLETED'
    }
}, {
    timestamps: true // Esto crea automáticamente createdAt y updatedAt
});

module.exports = mongoose.model('Transaction', TransactionSchema);