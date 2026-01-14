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

// @desc    Obtener perfil del usuario (con gamificación)
// @route   GET /api/users/profile
router.get('/profile', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ success: false, error: 'No autorizado' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });

        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Buscar usuarios (autocompletado)
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) return res.json({ success: true, data: [] });

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        }).select('username name _id').limit(5);

        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;