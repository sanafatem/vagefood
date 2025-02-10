const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/vegefoods', { useNewUrlParser: true, useUnifiedTopology: true });

const categorySchema = new mongoose.Schema({
  Name: { type: String, required: true, unique: true, trim: true },
});

const categoryadd = mongoose.model('category_master', categorySchema);

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true, trim: true },
  itemDescription: { type: String, required: true, unique: true, trim: true },
  itemPrice: { type: Number, required: true, trim: true },
  discPrice: { type: Number, required: true, trim: true },
  itemCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'category_master', required: true },
  itemImage: { type: String, required: true, trim: true },
});

const Cart = mongoose.model('cart', new mongoose.Schema({
    itemName: { type: String, required: true },
    itemPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    itemImage: { type: String, required: true },
}));

app.post('/add-to-cart', async (req, res) => {
    const cartItem = req.body; // Get the item data from the request body
    console.log('Adding item to cart:', cartItem); // Log the cart item being added
    try {
        const existingItem = await Cart.findOne({ itemName: cartItem.itemName });
        if (existingItem) {
            // If the item already exists, update the quantity
            existingItem.quantity += cartItem.quantity;
            await existingItem.save();
            res.status(200).send('Item quantity updated in cart successfully!');
        } else {
            const cart = new Cart(cartItem);
            await cart.save();
            res.status(201).send('Item added to cart successfully!');

        }
    } catch (error) {
        console.error('Error adding item to cart:', error); // Log the error details
        if (error.code === 11000) {
            res.status(400).send('Item already exists in the cart.'); // Specific error message for duplicates
        } else {
            res.status(500).send('Error adding item to cart. Please try again later.');
        }

    }




});

Item.find({}) 
  .populate('itemCategory', 'Name')
  .then(items => {
    console.log('Items in the database:', items);
    renderItems(items); // Call the render function
    mongoose.connection.close();
  })
  .catch(error => {
    console.error('Error fetching items:', error);
    mongoose.connection.close();
  });
