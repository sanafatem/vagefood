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

const Item = mongoose.model('item_master', itemSchema);

Item.find({})
  .populate('itemCategory', 'Name')
  .then(items => {
    console.log('Items in the database:', items);
    mongoose.connection.close();
  })
  .catch(error => {
    console.error('Error fetching items:', error);
    mongoose.connection.close();
  });
