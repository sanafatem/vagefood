const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const port = 3019;

const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Middleware to parse JSON request bodies

mongoose.connect('mongodb://127.0.0.1:27017/vegefoods');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to the database!');
  
  // Check if carts collection exists
  const collections = await mongoose.connection.db.listCollections().toArray();
  const cartCollectionExists = collections.some(collection => collection.name === 'carts');
  
//   if (!cartCollectionExists) {
//     console.log('"carts" collection does not exist. It will be created when the first cart item is added.');
//   } else {
//     console.log('"carts" collection exists.');
//   }
});

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original file name
    }
});

const upload = multer({ storage: storage });

app.get('/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await categoryadd.findById(categoryId);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.json(category);
    } catch (error) {
        console.error('Error fetching category by ID:', error);
        res.status(500).send('Error fetching category. Please try again later.');
    }
});

// Define schema and model for category
const categorySchema = new mongoose.Schema({
  Name: { type: String, required: true, unique: true, trim: true },
});

const categoryadd = mongoose.model('category_master', categorySchema);

// Serve the categoryadd page from the admin directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'categoryadd.html'));
});

app.post('/post', async (req, res) => {
  console.log('Received data:', req.body); // Log the received data

  const { Name } = req.body;

  try {
    const user = new categoryadd({ Name });
    await user.save();
    console.log('categoryadd saved:', user);
    res.send('category added successfully!');
  } catch (error) {
    console.error('Error saving categoryadd:', error);
    res.status(500).send('Error saving categoryadd data. Please try again later.');
  }
});

// Define schema and model for item
const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true, trim: true },
  itemDescription: { type: String, required: true, unique: true, trim: true },
  itemPrice: { type: Number, required: true, trim: true },
  discPrice: { type: Number, required: true, trim: true },
  itemCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'category_master', required: true }, // Updated to reference category
  itemImage: { type: String, required: true, trim: true },
});
const item = mongoose.model('item_master', itemSchema);

app.get('/items', async (req, res) => {
    try {
        const items = await item.find({}).populate('itemCategory', 'Name');
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items. Please try again later.');
    }
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
        // Check if the item already exists in the cart
        const existingCartItem = await Cart.findOne({ itemName: cartItem.itemName });
        if (existingCartItem) {
            // If it exists, update the quantity
            existingCartItem.quantity += cartItem.quantity;
            await existingCartItem.save();
            return res.status(200).send('Item quantity updated in cart successfully!');
        }

        // If it does not exist, create a new cart item
        const cart = new Cart(cartItem);
        await cart.save();
        res.status(201).send('Item added to cart successfully!');
    } catch (error) {
        console.error('Error adding item to cart:', error); // Log the error details
        res.status(500).send('Error adding item to cart. Please try again later.');
    }
});

// New GET endpoint to fetch cart items
app.get('/cart', async (req, res) => {
    try {
        const cartItems = await Cart.find({});
        console.log('Cart Items:', cartItems); // Log the cart items being sent
        res.json(cartItems.map(item => ({
            _id: item._id,
            itemName: item.itemName,
            itemPrice: item.itemPrice,
            quantity: item.quantity,
            itemImage: item.itemImage,
        })));
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).send('Error fetching cart items. Please try again later.');
    }
});

// New route to update item by ID
app.put('/items/:id', upload.single('itemImage'), async (req, res) => {
    const itemId = req.params.id;
    const { itemName, itemPrice, discPrice } = req.body;
    const itemImage = req.file ? req.file.filename : undefined; // Check if a new file is uploaded

    try {
        const updatedItem = await item.findByIdAndUpdate(itemId, {
            itemName,
            itemPrice,
            discPrice,
            itemImage: itemImage || undefined // Only update if a new image is provided
        }, { new: true });

        if (!updatedItem) {
            return res.status(404).send('Item not found');
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).send('Error updating item. Please try again later.');
    }
});

// New route to delete item by ID
app.delete('/items/:id', async (req, res) => {
    const itemId = req.params.id;

    try {
        const deletedItem = await item.findByIdAndDelete(itemId);
        if (!deletedItem) {
            return res.status(404).send('Item not found');
        }
        res.send('Item deleted successfully!');
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send('Error deleting item. Please try again later.');
    }
});

// Serve the order page
app.get('/itemadd', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'itemadd.html'));
});

// Handle order form submissions
app.post('/item', upload.single('itemImage'), async (req, res) => {
    console.log('Received item data:', req.body);
    
    const { itemName, itemDescription, itemPrice, discPrice, itemCategory } = req.body;
    const itemImage = req.file.filename; // Get the path of the uploaded file

    try {
        // Check for existing item with the same name or description
        const existingItem = await item.findOne({ $or: [{ itemName }, { itemDescription }] });
        if (existingItem) {
            return res.status(400).send('Item with the same name or description already exists.');
        }

        const users = new item({ itemName, itemDescription, itemPrice, discPrice, itemCategory, itemImage });
        await users.save();
        console.log('itemadd saved:', users);
        res.send('item added successfully!');
    } catch (error) {
        console.error('Error saving itemadd:', error);
        res.status(500).send('Error saving itemadd data. Please try again later.');
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await categoryadd.find({});
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories. Please try again later.');
    }
});

app.put('/edit/:id', async (req, res) => {
    const categoryId = req.params.id;
    const { name } = req.body;

    try {
        const updatedCategory = await categoryadd.findByIdAndUpdate(categoryId, { Name: name }, { new: true });
        if (!updatedCategory) {
            return res.status(404).send('Category not found');
        }
        res.json({ success: true, updatedCategory });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Error updating category. Please try again later.');
    }
});

app.delete('/delete/:id', async (req, res) => {
    const categoryId = req.params.id;

    try {
        const deletedCategory = await categoryadd.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).send('Category not found');
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Error deleting category. Please try again later.');
    }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
