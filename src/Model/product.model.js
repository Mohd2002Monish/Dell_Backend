const mongoose = require('mongoose');

// Define the part schema
const partSchema = new mongoose.Schema({
  part_id: { type: String, required: true },
  part_name: { type: String, required: true },
  part_description: { type: String, required: true },
  compatibility: { type: String, required: true },
  quantity: { type: Number, required: true },
});

// Define the product schema
const productSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  product_name: { type: String, required: true },
  product_type: { type: String, required: true },
  model_number: { type: String, required: true },
  service_tag: { type: String, required: true },
  description: { type: String, required: true },
  parts: { type: [partSchema], required: false },
});

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);
module.exports = Product;