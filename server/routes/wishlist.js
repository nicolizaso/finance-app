const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

// Middleware to get userId from header
const getUserId = (req) => req.headers['x-user-id'];

// GET all wishlists
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

  try {
    const wishlists = await Wishlist.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: wishlists });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create wishlist
router.post('/', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

  try {
    const { title, type, items } = req.body;
    const newWishlist = new Wishlist({
      userId,
      title,
      type,
      items: items || []
    });

    const savedWishlist = await newWishlist.save();
    res.json({ success: true, data: savedWishlist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update wishlist (general update)
router.put('/:id', async (req, res) => {
  const userId = getUserId(req);
  try {
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true } // Returns the updated document
    );

    // Trigger save to run pre-save hook (for totalEstimated calculation)
    if (updatedWishlist) {
        // findOneAndUpdate bypasses pre('save') middleware, so we might need to manually recalc if items changed
        // Or we can retrieve and save.
        // Let's retrieve and save to be safe and clean.
        const doc = await Wishlist.findById(req.params.id);
        doc.set(req.body);
        await doc.save();
        return res.json({ success: true, data: doc });
    }

    if (!updatedWishlist) return res.status(404).json({ success: false, error: 'Wishlist not found' });
    res.json({ success: true, data: updatedWishlist });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE wishlist
router.delete('/:id', async (req, res) => {
  const userId = getUserId(req);
  try {
    const deleted = await Wishlist.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) return res.status(404).json({ success: false, error: 'Wishlist not found' });
    res.json({ success: true, data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update specific item (e.g. toggle isBought)
router.patch('/:id/items/:itemId', async (req, res) => {
    const userId = getUserId(req);
    const { isBought } = req.body;

    try {
        const wishlist = await Wishlist.findOne({ _id: req.params.id, userId });
        if (!wishlist) return res.status(404).json({ success: false, error: 'Wishlist not found' });

        const item = wishlist.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

        if (isBought !== undefined) item.isBought = isBought;

        // If all items are bought, maybe ask user to complete project?
        // For now just save.

        await wishlist.save();
        res.json({ success: true, data: wishlist });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
