const express = require("express");
const requestRouter=express.Router();
const{ userAuth }= require("../middleware/user")
 const ConnectionRequestModel= require("../models/connectionRequest");
 const User=require("../models/user")


requestRouter.post("/request/send/:status/:toUserId", userAuth,async (req, res)=>{
    try{
             const fromUserId=req.user._id;
             const toUserId=req.params.toUserId;
             const status=req.params.status;

              const allowedStatus=["ignored", "interested"];
              if(!allowedStatus.includes(status)){
                 return res.status(400).send("invalid status request");
              }

              const toUser=await User.findById(toUserId);
              if(! toUser){
                 return res.status(400).send("user not found");
              }

              const existingConnectionRequest= await ConnectionRequestModel.findOne({
                 $or: [
                     {fromUserId, toUserId},
                     {fromUserId: toUserId, toUserId: fromUserId},
                 ],
              });

              if(existingConnectionRequest){
                 return res.status(400).send("connection request already exists");
              }

            
             const connection = new ConnectionRequestModel({
                 fromUserId,
                 toUserId,
                 status
             })

             const data=await connection.save();
             res.send(data);
          }
           catch(err){
        res.status(400).send("error; " + err.message);
    }
})





      requestRouter.post(
    "/request/review/:status/:requestId",
    userAuth,
    async (req, res) => {
        try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        //Validate Status
        const allowedStatuses = ["accepted", "rejected"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
            message: "Invalid Status or Status not allowed",
            success: false,
            });
        }

        //validating the request
        const connectionRequest = await ConnectionRequestModel.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectionRequest) {
            return res.status(404).json({
            message: "request not found ",
            success: false,
            });
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.status(200).json({
            message: "Connection request " + status,
            data,
            success: true,
        });
        } catch (error) {
        res.status(400).send("ERROR:" + error.message);
        }
    }
    );


module.exports = requestRouter;