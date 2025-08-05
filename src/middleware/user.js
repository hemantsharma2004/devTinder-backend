// src/middleware/user.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token; // or Authorization header if you're using Bearer
    if (!token) return res.status(401).send({ error: "Unauthorized: No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return res.status(401).send({ error: "Unauthorized: User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("User auth failed:", err.message);
    res.status(401).send({ error: "Invalid token" });
  }
};

module.exports = { userAuth };
