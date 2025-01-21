const express = require("express");
const  userRouter =express.Router();
const{ userAuth }= require("../middleware/user");
const User= require("../models/user")
const ConnectionRequestModel = require("../models/connectionRequest");


userRouter.get("/user/requests/recieved", userAuth,async (req, res)=>{
    try{
     const loggedInUser=req.user;

     const connection= await ConnectionRequestModel.find({
         toUserId : loggedInUser._id,
         status:"interested",
     }).populate("fromUserId", ["firstName", "lastName"]);

      res.json({message: " data sent successfully ", data: connection })
    }
    catch(err){
        console.error(err); 
        res.status(500).json({ message: "Something went wrong", error: err });
    }
})


userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // Fetch connections where the user is either the sender or the receiver
        const connections = await ConnectionRequestModel.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" },
            ],
        })
            .populate("fromUserId", [
                "firstName",
                "lastName",
                "photoUrl",
                "age",
                "gender",
                "about",
            ])
            .populate("toUserId", [
                "firstName",
                "lastName",
                "photoUrl",
                "age",
                "gender",
                "about",
            ]);

        if (!connections || connections.length === 0) {
            return res.status(200).json({
                message: "No connections found",
                data: [],
            });
        }

        // Map to return the connected user details
        const data = connections.map((connection) => {
            // Check if the logged-in user is the sender or receiver
            if (
                connection.fromUserId &&
                connection.fromUserId._id.toString() === loggedInUser._id.toString()
            ) {
                return connection.toUserId; // Return the receiver's details
            } else {
                return connection.fromUserId; // Return the sender's details
            }
        });

        res.status(200).json({
            message: "Connections retrieved successfully",
            data,
        });
    } catch (err) {
        console.error("Error in fetching connections:", err);
        res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        });
    }
});




 userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        if (!loggedInUser) {
            return res.status(401).json({ error: "Unauthorized" });
        }

         const page=parseInt(req.query.page) || 1;
         let limit=parseInt(req.query.limit) || 10;
          limit = limit > 50 ? 50 : limit;
         const skip=(page - 1) * limit;


        const connection = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId")

           console.log("connection",connection);

        const hideUserFromFeed = new Set();
        
         connection.forEach((req) => {
            if (req.fromUserId) {
                hideUserFromFeed.add(req.fromUserId.toString());
            }
            if (req.toUserId) {
                hideUserFromFeed.add(req.toUserId.toString());
            }
        });


        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUserFromFeed) } },
                { _id: { $ne: loggedInUser._id } },
            ],
        })
        .select("firstName lastName skills age emailId photoUrl  gender about")
        .skip(skip)
        .limit(limit);
        
        res.send(users);
        console.log(hideUserFromFeed);

        
    } catch (err) {
        console.error("Error occurred while fetching feed:", err); 
        res.status(404).json("something went wrong");
    }
});

module.exports= userRouter;



