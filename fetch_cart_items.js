const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/vegefoods', { useNewUrlParser: true, useUnifiedTopology: true });

const Cart = mongoose.model('cart', new mongoose.Schema({
    itemName: { type: String, required: true },
    itemPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    itemImage: { type: String, required: true },
}));

app.get('/cart', async (req, res) => {
    try {
        const cartItems = await Cart.find({});
        console.log('Cart Items:', cartItems);
        // Send cart items to the front-end
        res.json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).send('Error fetching cart items. Please try again later.');
    }
});