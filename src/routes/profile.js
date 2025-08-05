const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/user");
const { validateEditProfileData } = require("../utils/validation");


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



profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      throw new Error("Request body is missing or invalid");
    }

    if (!validateEditProfileData(req.body)) {
      throw new Error("Invalid Edit request");
    }

    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});





module.exports = profileRouter;
