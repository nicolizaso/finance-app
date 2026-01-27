const mongoose = require('mongoose');

const WishlistItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  estimatedPrice: { type: Number, required: true },
  isBought: { type: Boolean, default: false },
  link: { type: String },
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
});

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['PROJECT', 'ITEM'], required: true },
  items: [WishlistItemSchema],
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  totalEstimated: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

// Calculate totalEstimated before saving
// Using synchronous logic since no async operations are needed
WishlistSchema.pre('save', function() {
  if (this.items && this.items.length > 0) {
    this.totalEstimated = this.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
  } else {
    this.totalEstimated = 0;
  }
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
