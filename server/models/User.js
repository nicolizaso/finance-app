const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    pin: { type: String, required: true }, // Guardaremos el PIN en texto plano por simplicidad ahora
    name: { type: String, required: true },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastLogDate: { type: Date, default: null },
    badges: [{
        id: String,
        unlockedAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);