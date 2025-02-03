const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const { token } = cookies;
    console.log(cookies)
    if (!token) {
      console.log("Please login to continue")
      return res.status(401).send("Please login to continue.");
    }

    console.log("Token received:", token);

    // Verify the token
    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodeData;

    // Find the user by ID
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    req.user = user; // Attach the user to the request
    next(); // Move to the next middleware/route
  } catch (error) {
    console.error("Authentication error:", error); // Log the actual error
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("Token has expired. Please login again.");
    }
    return res.status(401).send("Invalid token.");
  }
};

module.exports = {
  userAuth,
};
