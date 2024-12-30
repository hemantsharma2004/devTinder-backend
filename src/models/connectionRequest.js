const mongoose = require("mongoose");
const { Schema } = mongoose; 


const connectionRequestSchema = new Schema({
    fromUserId: {
        required: true,
        ref: "user",
        type: mongoose.Schema.Types.ObjectId, 
    },
    toUserId: {
        required: true,
        ref: "user",
        type: mongoose.Schema.Types.ObjectId, 
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is an incorrect status type`, 
        },
    },
}, {
    timestamps: true, 
});

   connectionRequestSchema.index({fromUserId: 1 , toUserId: 1 });

 connectionRequestSchema.pre('save', function(next) {
    const connectionRequest = this;
     if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
         throw new Error("cannot sent connection request to yourself !!")
     }
  next();
});

const ConnectionRequestModel = mongoose.model("ConnectionRequestModel", connectionRequestSchema); 

module.exports = ConnectionRequestModel;
