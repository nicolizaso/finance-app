const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Validar credenciales (Login "Lite")
router.post('/login', async (req, res) => {
    try {
        const { username, pin } = req.body;
        
        // Buscamos usuario (case insensitive)
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        if (user.pin !== pin) {
            return res.status(401).json({ success: false, error: 'PIN Incorrecto' });
        }

        res.json({ success: true, user });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;