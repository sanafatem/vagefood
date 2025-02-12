const express = require('express');
const router = express.Router();
const Cart = require('./models/Cart'); // Assuming you have a Cart model

// Add item to cart
router.post('/add-to-cart', (req, res) => {
  const item = req.body;
  // Logic to add item to cart
  Cart.findOneAndUpdate(
    { userId: item.userId }, // Assuming you have userId to identify the cart
    { $addToSet: { items: item } }, // Add item to cart
    { new: true, upsert: true } // Create cart if it doesn't exist
  )
    .then(cart => res.status(200).json(cart))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Update item quantity and optionally item price in cart
router.put('/update-cart', (req, res) => {
  const { userId, itemId, quantity, itemPrice } = req.body; // Include itemPrice again

  Cart.findOne({ userId: userId, 'items.itemId': itemId })
    .then(cart => {
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const item = cart.items.find(item => item.itemId === itemId);
      if (!item) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      // Update the quantity and price if provided
      return Cart.findOneAndUpdate(
        { userId: userId, 'items.itemId': itemId },
        { 
          $set: { 
            'items.$.quantity': quantity, 
            'items.$.itemPrice': itemPrice !== undefined ? itemPrice : item.itemPrice // Use the provided itemPrice or keep the original
          } 
        },
        { new: true }
      );
    })
    .then(cart => res.status(200).json(cart))
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;