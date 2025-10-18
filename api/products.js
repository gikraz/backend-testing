export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json([
      { id: 1, name: "Blue Jacket", price: 49.99 },
      { id: 2, name: "White Sneakers", price: 79.99 },
    ]);
  }

  if (req.method === "POST") {
    const { name, price } = req.body;
    return res.status(201).json({ id: Date.now(), name, price });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
