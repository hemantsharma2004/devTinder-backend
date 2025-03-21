const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Signup
authRouter.post("/signup", async (req, res) => {
    try {
        // Ensure you validate all input data
        validateSignUpData(req);

        // Destructure all necessary fields from req.body, including `age`
        const { firstName, lastName, emailId, password, gender, age } = req.body;
        console.log(req.body)

        // Check if required fields are provided
        if (!emailId || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Validate the `age` field
        if (!age || typeof age !== "number" || age <= 0) {
            return res.status(400).json({ message: "Invalid age provided." });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create a new user object
        const user = new User({
            firstName,
            lastName,
            emailId,
            gender,
            age,  
            password: passwordHash,
        });

        // Save the user to the database
        const savedUser = await user.save();

        // Generate a JWT token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Set the token in a secure HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Respond with a success message and the saved user
        res.status(201).json({
            message: "User added successfully",
            user: savedUser,
            token: token,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});


// Login
authRouter.post("/login", async (req, res, next) => {
    try {
        const { emailId, password } = req.body;
        console.log(emailId, password )

        if (!emailId || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(401).json({ error: "Email is not valid" }); // ✅ Fix: Proper error handling
        }

        const isValidpassword = await bcrypt.compare(password, user.Password); // ✅ Fix: Ensure correct field

        if (!isValidpassword) {
            return res.status(401).json({ error: "password is not valid" });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true, // ✅ More secure
            secure: true,   // ✅ Required for HTTPS
            sameSite: "None" // ✅ Required for cross-origin requests
        });

        res.json({ message: "Login successful", user });
    } catch (error) {
        console.error("Login error:", error);
        next(error);
    }
});



// Logout
authRouter.post("/logout", (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.json({ message: "Logout successful" });
});

module.exports = authRouter;
