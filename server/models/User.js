const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    pin: { type: String, required: true }, // Guardaremos el PIN en texto plano por simplicidad ahora
    name: { type: String, required: true }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);