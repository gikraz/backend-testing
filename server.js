import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";
import User from "./models/User.js";
import Product from "./models/products.js";



dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- MONGODB CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- JWT HELPERS ---
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  next();
};

const isSeller = (req, res, next) => {
  if (req.user.role !== "seller" && req.user.role !== "admin")
    return res.status(403).json({ message: "Sellers or admins only" });
  next();
};

// --- AUTH ROUTES ---
app.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: "All fields required" });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role });
    const token = generateToken(user);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GOOGLE LOGIN ---
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
app.post("/google-login", async (req, res) => {
  const { id_token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ username: name, email, googleId, role: "buyer" });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Google login failed" });
  }
});

// --- ADMIN ROUTES ---
app.get("/admin/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username email role").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/admin/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: "buyer" });
    const sellers = await User.countDocuments({ role: "seller" });
    const admins = await User.countDocuments({ role: "admin" });
    res.json({ totalUsers, buyers, sellers, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/admin/users/:id/role", verifyToken, isAdmin, async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/admin/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- SELLER DASHBOARD ---
app.get("/seller/dashboard", verifyToken, isSeller, (req, res) => {
  res.json({ message: `Welcome, ${req.user.role}! You have seller access.` });
});

// --- CART ROUTES ---
app.get("/cart", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.productId");
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/cart", verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const itemIndex = user.cart.findIndex((item) => item.productId.equals(productId));
    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }
    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/cart", verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const itemIndex = user.cart.findIndex((item) => item.productId.equals(productId));
    if (itemIndex > -1) {
      if (quantity <= 0) user.cart.splice(itemIndex, 1);
      else user.cart[itemIndex].quantity = quantity;
      await user.save();
    }
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PRODUCT ROUTES ---
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "username");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/products", verifyToken, isSeller, async (req, res) => {
  const { name, description, price, imageUrl } = req.body;
  if (!name || !price) return res.status(400).json({ message: "Name and price required" });

  try {
    const product = await Product.create({
      name,
      description,
      price,
      imageUrl,
      createdBy: req.user.id
    });
    res.status(201).json({ message: "Product added", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
