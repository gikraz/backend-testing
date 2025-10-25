// import express from "express";
// import User from "../models/User.js";
// import { verifyToken } from "../middleware/auth.js";

// const router = express.Router();

// const isAdmin = (req, res, next) => {
//   if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
//   next();
// };a

// // Get all users
// router.get("/users", verifyToken, isAdmin, async (req, res) => {
//   try {
//     const users = await User.find({}, "username email role").lean();
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Change user role
// router.patch("/users/:id/role", verifyToken, isAdmin, async (req, res) => {
//   const { role } = req.body;
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Admin stats
// router.get("/stats", verifyToken, isAdmin, async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const buyers = await User.countDocuments({ role: "buyer" });
//     const sellers = await User.countDocuments({ role: "seller" });
//     const admins = await User.countDocuments({ role: "admin" });
//     res.json({ totalUsers, buyers, sellers, admins });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Delete user
// router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// export default router;

import express from "express";
import User from "../models/User.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all users
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username email role createdAt").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change user role
router.patch("/users/:id/role", verifyToken, isAdmin, async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stats route
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: "buyer" });
    const sellers = await User.countDocuments({ role: "seller" });
    const admins = await User.countDocuments({ role: "admin" });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    const recentUsers = await User.find({}, "username email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({ totalUsers, buyers, sellers, admins, newThisMonth, recentUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
