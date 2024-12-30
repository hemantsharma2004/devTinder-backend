const express= require("express");
const authRouter = express.Router();
const {validateSignUpData}=require("../utils/validation")
const User=require("../models/user")
const bcrypt= require("bcrypt");
const jwt=require("jsonwebtoken");


authRouter.post("/signup", async (req, res) => {
    try {
        validateSignUpData(req);   

        const { firstName, lastName, emailId, Password, gender } = req.body;
        

        const PasswordHash = await bcrypt.hash(Password, 10);
        
        const user = new User({
            firstName,
            lastName,
            emailId,
            gender,
            Password: PasswordHash,
        });
        const savedUser = await user.save();

        const token = await jwt.sign({ _id: user._id }, "DevTinder$790", { expiresIn: "1d" });

        res.cookie("token", token, { httpOnly: true });

        res.status(201).json({
            message: "User added successfully",
            user: savedUser,
            token: token,
        });

    } catch (err) {
        console.log(err);
        res.status(400).send("ERROR: " + err.message);
    }
});


 
 authRouter.post("/login", async (req, res, next) => {
    try {
        const { emailId, Password } = req.body;

        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Email is not valid");
        }

        const isValidPassword = await bcrypt.compare(Password, user.Password);

        if (isValidPassword) {

            const token=await jwt.sign({_id: user._id }, "DevTinder$790", { expiresIn: "1d"});
            
             res.cookie("token", token, {httpOnly : true});
             
            res.send(user);

        } else {
            throw new Error("Password is not valid");
        }
    } catch (error) {
        next(error);
    }
});



authRouter.post("/logout", (req, res)=>{
    res.cookie("token", null, {
         expires:new Date(Date.now())
    })
     res.send("logout successful")
})



module.exports = authRouter;
