const mongoose = require("mongoose");
require("dotenv").config();

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected successfully to MongoDB");
  } catch (e) {
    console.error("Couldn't connect to MongoDB:", e.message);
    process.exit(1); 
  }
};

module.exports = connectToDb;
