const mongoose = require("mongoose");
const { Schema } = mongoose; 

const connectionRequestSchema = new Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",  // ✅ use proper casing
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",  // ✅ use proper casing
        required: true,
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

// Ensure no duplicate request to same user and prevent self-request
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre('save', function(next) {
    const connectionRequest = this;
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        return next(new Error("Cannot send connection request to yourself!"));
    }
    next();
});

const ConnectionRequestModel = mongoose.model("ConnectionRequestModel", connectionRequestSchema);

module.exports = ConnectionRequestModel;
