const express = require("express");
const Product = require("../Model/product.model");
const app = express();
app.use(express.json());
app.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
   
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/products", async (req, res) => {
  var query = {};
  let { q } = req.query;
  
  if (q !== "") {
    query = { $or: [{ model_number: q }, { service_tag: q }] };
  } else {
    query = {};
  }
  try {
    const products = await Product.find(query);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/products/:product_id/addPart", async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const newPart = req.body;
  
    const updatedProduct = await Product.findOneAndUpdate(
      { product_id },
      { $push: { parts: newPart } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(updatedProduct);
  } catch (error) {
    console.error("Error adding part:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/products/:product_id/removePart/:part_id", async (req, res) => {
  
  try {
    const product_id = req.params.product_id;
    const part_id = req.params.part_id;


    const updatedProduct = await Product.findOneAndUpdate(
      { product_id },
      { $pull: { parts: { part_id } } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(updatedProduct);
  } catch (error) {
    console.error("Error removing part:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = app;
