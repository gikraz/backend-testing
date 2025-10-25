// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   username: String,
//   email: { type: String, unique: true },
//   password: String,
//   role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
//   googleId: String,
//   cart: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//       quantity: { type: Number, default: 1 },
//     },
//   ],
// });

// export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
    googleId: String,
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

export default mongoose.model("User", userSchema);
