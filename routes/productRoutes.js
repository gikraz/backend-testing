const express = require("express");
const router = express.Router();
const Product = require("../validations/Products");
const User = require("../validations/Users");
const checkRole = require("../middlewares/checkRole");
const { upload, uploadToCloudinary, deleteFromCloudinary } = require("../cloudinary/cloudinary.config");


router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error });
  }
});


router.post("/create", checkRole("businessOwner"), upload.single("image"), uploadToCloudinary, async (req, res) => {
    try {
      const { name, price } = req.body;

      if (!name || !price)
        return res.status(400).json({ message: "Name and price required" });

      if (!req.file || !req.file.path || !req.file.filename)
        return res.status(400).json({ message: "Product image is required" });

      const newProduct = new Product({
        name,
        price,
        ownerId: req.user._id,
        imageUrl: req.file.path,     
        imagePublicId: req.file.filename, 
      });

      await newProduct.save();
      res.status(201).json({ message: "Product created", product: newProduct });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating product", error: error.message });
    }
  }
);
router.delete("/:id", checkRole("manager", "businessOwner"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (req.user.role === "businessOwner" && product.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own products" });
    }

    if (product.imagePublicId) {
      await deleteFromCloudinary(product.imagePublicId);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
});

module.exports = router;