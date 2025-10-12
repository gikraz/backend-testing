export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
  
    if (req.method === "POST") {
      const { username, email, password, role } = req.body;
  
      if (!email || !password || !username) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
  
      const newUser = {
        id: Date.now(),
        username,
        email,
        role,
      };
  
      return res.status(201).json({
        success: true,
        token: "fake-jwt-token",
        user: newUser,
      });
    }
  
    return res.status(405).json({ message: "Method not allowed" });
  }