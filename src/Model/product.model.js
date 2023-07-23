const mongoose = require("mongoose");

const partSchema = new mongoose.Schema({
  part_id: { type: String },
  part_name: { type: String },
  part_description: { type: String },
  compatibility: { type: String },
  quantity: { type: Number },
});

const productSchema = new mongoose.Schema({
  product_id: { type: String },
  img: { type: String },
  product_name: { type: String },
  product_type: { type: String },
  model_number: { type: String },
  service_tag: { type: String },
  description: { type: String },
  parts: { type: [partSchema] },
});

// Create and export the Product model
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
