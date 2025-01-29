const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
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

// Define schema and model for category
const categorySchema = new mongoose.Schema({
  Name: { type: String, required: true, unique: true, trim: true },
});

const categoryadd = mongoose.model('category_master', categorySchema);

// Serve the categoryadd page from the admin directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'categoryadd.html'));
});

app.post('/post', async (req, res) => { // Marked as async
  console.log('Received data:', req.body);
  const { Name } = req.body;

  try {
    const user = new categoryadd({
      Name,
    });

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
  itemName: { type: String, required: true, unique: true, trim: true},
  itemDescription: { type: String, required: true, unique: true, trim: true },
  itemPrice: { type: Number, required: true, unique: true, trim: true },
  discPrice: { type: Number, required: true, unique: true, trim: true },
  itemCategory: { type: String, required: true, unique: true, trim: true },
  itemImage: { type: String, required: true, unique: true, trim: true },
});
const item = mongoose.model('item_masters', itemSchema); // Corrected here

// Serve the order page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin','itemadd.html'));
});

// Handle order form submissions
app.post('/item', async (req, res) => {
  console.log('Received item data:', req.body);

  const { itemName, itemDescription, itemPrice, discPrice, itemCategory, itemImage } = req.body;
  const newItem = new item({
    itemName,
    itemDescription,
    itemPrice,
    discPrice,
    itemCategory,
    itemImage,
  });

  try {
    await newItem.save();
    console.log('Item saved:', newItem);
    res.send('Your item has been submitted successfully!');
  } catch (error) {
    console.error('Error saving item:', error); // Log the full error object
    res.status(500).send('Error submitting your item. Please try again later.');
  }
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
