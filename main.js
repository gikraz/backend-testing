const express = require("express");
require("dotenv").config();
const connectToDb = require("./db/connectToDB");
const productRoutes = require("./routes/productRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

const app = express();


app.use(express.json());
app.use("/products", productRoutes);
app.use("/subscription", subscriptionRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
// app.all("*", (req, res) => {
//   res
//     .status(200)
//     .json({ message: "Route exists, but logic not implemented yet." });
// });



const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectToDb(); 
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
