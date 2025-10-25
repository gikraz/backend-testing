// routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    const product = new Product({ name, description, price, imageUrl });
    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
