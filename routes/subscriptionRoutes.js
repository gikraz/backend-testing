const express = require("express");
const router = express.Router();
const User = require("../validations/Users");
const checkRole = require("../middlewares/checkRole");


router.post("/buy", checkRole("businessOwner"), async (req, res) => {
  const { plan, durationDays } = req.body;

  if (!plan || !durationDays) {
    return res.status(400).json({ message: "Plan and duration required" });
  }

  try {
  
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });


    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    user.subscription = {
      active: true,
      plan,
      expiresAt
    };

    await user.save();

    res.status(200).json({ message: "Subscription purchased!", subscription: user.subscription });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;