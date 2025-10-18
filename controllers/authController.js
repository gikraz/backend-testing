const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const postModel = require("../models/post.model");
const { upload, deleteFromCloudinary } = require("../config/clodinary.config");

const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Register failed" });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

userRouter.get("/", async (req, res) => {
  const users = await User.find().sort({ _id: -1 });
  res.status(200).json(users);
});

userRouter.put("/", upload.single("avatar"), async (req, res) => {
  const id = req.userId;
  const { email } = req.body;
  const filePath = req.file?.path;

  const user = await User.findById(id);

  if (filePath && user.avatar) {
    const deleteId = user.avatar.split("uploads/")[1];
    const cloudinaryId = deleteId.split(".")[0];
    await deleteFromCloudinary(`uploads/${cloudinaryId}`);
  }

  await User.findByIdAndUpdate(id, { email, avatar: filePath || user.avatar });
  res.status(200).json({ message: "user updated successfully" });
});

userRouter.delete("/:id", async (req, res) => {
  const targetUserId = req.params.id;
  const userId = req.userId;

  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (user.role !== "admin" && targetUserId !== userId) {
    return res.status(403).json({ error: "You don't have permission" });
  }

  await User.findByIdAndDelete(targetUserId);
  await postModel.deleteMany({ author: targetUserId });

  res.json({ message: "user deleted successfully" });
});

module.exports = userRouter;
