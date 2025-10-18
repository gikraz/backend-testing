import connectToDatabase from "./_db.js";
import { verifyTokenFromReq } from "./_auth.js";
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 },
  total: Number,
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({}, { strict: false });
let Order;
try {
  Order = mongoose.model("Order");
} catch {
  Order = mongoose.model("Order", orderSchema);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  await connectToDatabase();

  const decoded = verifyTokenFromReq(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });
  if (decoded.role !== "buyer") return res.status(403).json({ message: "Only buyers can create orders" });

  if (req.method === "POST") {
    const { productId, quantity } = req.body || {};
    if (!productId) return res.status(400).json({ message: "productId required" });
    const qty = Number(quantity) || 1;

    const Product = mongoose.models.Product;
    if (!Product) return res.status(500).json({ message: "Product model not initialized" });

    const prod = await Product.findById(productId);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    if (prod.stock < qty) return res.status(400).json({ message: "Not enough stock" });

    prod.stock = prod.stock - qty;
    await prod.save();

    const total = (prod.price || 0) * qty;
    const order = new Order({ buyer: decoded.id, product: prod._id, quantity: qty, total });
    await order.save();

    return res.status(201).json({ success: true, order });
  }

  if (req.method === "GET") {
    const buyerId = decoded.id;
    const orders = await Order.find({ buyer: buyerId }).populate("product").lean();
    return res.json(orders);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
