export default async function handler(req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
  
    if (req.method === "POST") {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
      }
  
  
      if (email === "test@example.com" && password === "123456") {
        return res.status(200).json({
          success: true,
          token: "fake-jwt-token",
          user: {
            id: 1,
            username: "TestUser",
            email,
          },
        });
      }
  
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  
    return res.status(405).json({ message: "Method not allowed" });
  }