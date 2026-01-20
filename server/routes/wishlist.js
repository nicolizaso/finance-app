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
    // We use findOne to get the document, modify it, and save it.
    // This ensures that the pre('save') hook runs to recalculate totalEstimated.
    // findOneAndUpdate with { new: true } does NOT trigger pre('save') middleware.

    const wishlist = await Wishlist.findOne({ _id: req.params.id, userId });

    if (!wishlist) {
        return res.status(404).json({ success: false, error: 'Wishlist not found' });
    }

    // Explicitly update fields
    if (req.body.title) wishlist.title = req.body.title;
    if (req.body.items) wishlist.items = req.body.items;

    // We do NOT update type usually, but if needed:
    if (req.body.type) wishlist.type = req.body.type;

    const savedWishlist = await wishlist.save();

    res.json({ success: true, data: savedWishlist });

  } catch (err) {
    console.error("Error updating wishlist:", err);
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

        await wishlist.save();
        res.json({ success: true, data: wishlist });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
