import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate("cart.productId");
  res.json(user.cart);
});

router.post("/", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user.id);
  const itemIndex = user.cart.findIndex(item => item.productId.equals(productId));
  if (itemIndex > -1) user.cart[itemIndex].quantity += quantity;
  else user.cart.push({ productId, quantity });
  await user.save();
  res.json(user.cart);
});

router.put("/", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.user.id);
  const itemIndex = user.cart.findIndex(item => item.productId.equals(productId));
  if (itemIndex > -1) {
    if (quantity <= 0) user.cart.splice(itemIndex, 1);
    else user.cart[itemIndex].quantity = quantity;
    await user.save();
  }
  res.json(user.cart);
});

export default router;
