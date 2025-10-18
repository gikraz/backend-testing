import connectToDatabase from "./_db.js";
import { verifyTokenFromReq } from "./_auth.js";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  stock: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

let Product;
try {
  Product = mongoose.model("Product");
} catch {
  Product = mongoose.model("Product", productSchema);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  await connectToDatabase();

  if (req.method === "GET") {
    const products = await Product.find().lean();
    return res.json(products);
  }

  const decoded = verifyTokenFromReq(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const userId = decoded.id;
  const role = decoded.role;

  if (req.method === "POST") {
    if (role !== "seller") return res.status(403).json({ message: "Only sellers can create products" });
    const { title, description, price, stock } = req.body || {};
    if (!title || price == null) return res.status(400).json({ message: "title and price required" });

    const p = new Product({ title, description, price, stock: stock || 1, owner: userId });
    await p.save();
    return res.status(201).json(p);
  }

  if (req.method === "PUT") {
    if (role !== "seller") return res.status(403).json({ message: "Only sellers can update products" });
    const { id, title, description, price, stock } = req.body || {};
    if (!id) return res.status(400).json({ message: "Product id required" });

    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    if (String(prod.owner) !== String(userId)) return res.status(403).json({ message: "Not product owner" });

    if (title !== undefined) prod.title = title;
    if (description !== undefined) prod.description = description;
    if (price !== undefined) prod.price = price;
    if (stock !== undefined) prod.stock = stock;
    await prod.save();
    return res.json(prod);
  }


  if (req.method === "DELETE") {
    if (role !== "seller") return res.status(403).json({ message: "Only sellers can delete products" });
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ message: "Product id required" });

    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    if (String(prod.owner) !== String(userId)) return res.status(403).json({ message: "Not product owner" });

    await prod.remove();
    return res.json({ success: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
