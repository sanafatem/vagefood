const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const port = 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/vegefoods');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to the database!');
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
  console.log('Received data:', req.body);
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
  itemName: { type: String, required: true,  trim: true },
  itemDescription: { type: String, required: true,  trim: true },
  itemPrice: { type: Number, required: true, trim: true },
  discPrice: { type: Number, required: true, trim: true },
  itemCategory: { type: String, required: true, trim: true },
  itemImage: { type: String, required: true, trim: true },
});
const item = mongoose.model('item_master', itemSchema);

app.get('/items', async (req, res) => {
    try {
        const items = await item.find({});
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items. Please try again later.');
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

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});