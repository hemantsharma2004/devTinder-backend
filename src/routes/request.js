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



  requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
   try {
       const loggedInUser = req.user;
       const { status, requestId } = req.params;

    
       const allowedStatus = ["accepted", "rejected"];
       if (!allowedStatus.includes(status)) {
           return res.status(400).send("This status is not allowed");
       }

       const connection = await ConnectionRequestModel.findOne({
         _id: requestId,
         toUserId: loggedInUser._id,
         status:"interested",
     });
    
     if (!connection) {
        console.log("Connection request not found:", { requestId, toUserId: loggedInUser._id });
        return res.status(404).json("Connection request not found");
    }
        connection.status= status;

       const updatedConnection = await connection.save();
        res.send({ message: `Connection request ${status}`, data: updatedConnection });
   } catch (err) {
    console.error("Error:", err);
        res.status(500).send("Something went wrong");
     
   }
});


module.exports = requestRouter;