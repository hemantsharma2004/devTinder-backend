const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/user");
// const { validateEditProfileData } = require("../utils/validation");

// ✅ View profile route
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});



// Add this import at the top of your profile router file
const User = require('../models/user'); // Adjust path based on your project structure
// OR if using ES6 modules:
// import User from '../models/user.js';

// Your existing validation function
const validateEditProfileData = (req) => {
  const allowedFields = ["firstName", "lastName", "age", "gender", "about", "photoUrl", "skills"];

  if (!req.body || typeof req.body !== "object") {
    return { isValid: false, error: "Request body is missing or invalid" };
  }

  const isEditAllowed = Object.keys(req.body).every((field) => 
    allowedFields.includes(field)
  );

  if (!isEditAllowed) {
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    return { 
      isValid: false, 
      error: `Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}` 
    };
  }

  const validData = Object.keys(req.body).filter(key => 
    allowedFields.includes(key) && req.body[key] !== undefined
  );

  if (validData.length === 0) {
    return { isValid: false, error: "No valid fields provided for update" };
  }

  return { isValid: true, validFields: validData };
};

// Your profile edit route
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Validate the request
    const validation = validateEditProfileData(req);
    
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Filter the incoming data
    const updateData = {};
    validation.validFields.forEach(key => {
      updateData[key] = req.body[key];
    });

    // Find and update the user - User model is now properly imported
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return success response
    res.json({
      message: `${updatedUser.firstName}, your profile updated successfully`,
      data: updatedUser
    });

  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ 
      error: "Failed to update profile",
      details: err.message 
    });
  }
});



module.exports = profileRouter;
