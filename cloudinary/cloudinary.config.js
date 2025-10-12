const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (req, res, next) => {
  if (!req.file) return next();

  cloudinary.uploader
    .upload_stream(
      { folder: "restyle_uploads", allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"] },
      (err, result) => {
        if (err) return next(err);
        req.file.path = result.secure_url;  
        req.file.filename = result.public_id; 
        next();
      }
    )
    .end(req.file.buffer);
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary delete result:", result);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };