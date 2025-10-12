const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');


const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};


router.post('/', authMiddleware, async (req, res) => {
  const { title, price, description, sellerId } = req.body;
  try {
    const product = await Product.create({ title, price, description, sellerId });
    res.status(201).json(product);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('sellerId', 'username email');
    res.json(products);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
