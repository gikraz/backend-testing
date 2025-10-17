const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: "https://ressttyle-qajh.vercel.app",
  methods: ["GET","POST","PUT","DELETE"]
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["buyer","seller"] }
});
const User = mongoose.model("User", UserSchema);

app.get("/", (req,res) => {
  res.send("Backend is running!");
});

app.post("/api/auth/register", async (req,res)=>{
  const { name,email,password,role } = req.body;
  if(!name || !email || !password || !role)
    return res.status(400).json({ msg: "ყველა ველი აუცილებელია" });
  const existingUser = await User.findOne({ email });
  if(existingUser) return res.status(400).json({ msg: "Email უკვე გამოყენებულია" });

  const hashed = await bcrypt.hash(password,10);
  const user = new User({name,email,password:hashed,role});
  await user.save();
  res.json({ msg: "User created" });
});

app.post("/api/auth/login", async (req,res)=>{
  const { email,password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({ msg:"User not found" });
  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.status(400).json({ msg:"Wrong password" });
  const token = jwt.sign({ id:user._id,role:user.role },process.env.JWT_SECRET,{expiresIn:"1d"});
  res.json({ token, user:{ id:user._id, name:user.name, role:user.role }});
});

app.use((req,res) => {
  res.status(404).json({ msg:"Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log("Server started on port "+PORT));
