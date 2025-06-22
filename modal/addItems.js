const mongoose = require('mongoose');

const addItemsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['shirt', 'pant', 'shoes', 'gear', 'sport'], required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  Images: { type: [String], default: [] }
}, { timestamps: true });

const Item = mongoose.model('Item', addItemsSchema);
module.exports = { Item }; 
