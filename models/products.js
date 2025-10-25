import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  imageUrl: String,
  category: String,
  stock: Number,
});

const Product = mongoose.model("Product", productSchema);

export default Product; 
