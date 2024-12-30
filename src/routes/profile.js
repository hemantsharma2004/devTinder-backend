const express=require("express");
const profileRouter=express.Router();
const{ userAuth }= require("../middleware/user")
const { validateEditProfileData } = require("../utils/validation")



profileRouter.get("/profile/view",userAuth, async (req, res)=>{
    try{
     const user=req.user;

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

     res.send(user);
    }
    catch (err) {
        res.status(400).send("Something went wrong");
    }
});




profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    
    console.log("User from auth middleware:", req.user);

    const user = req.user;

    
    Object.keys(req.body).forEach((key) => {
      if (user[key] !== undefined) {
        user[key] = req.body[key];
      }
    });

    console.log("Updated User Data: ", user);

    
    await user.save();

    res.json({ message: `${user.firstName}, your profile updated successfully.` });

  }
   catch (error) { 
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      console.error("Validation Errors:", validationErrors);
      return res.status(400).json({ message: "Validation Error", errors: validationErrors });
    }

    console.error("Error updating profile:", error);  // Use 'error' here
    res.status(500).json({ message: "Something went wrong while updating the profile." });
  }
});


module.exports = profileRouter;