const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middleware/user");
const User = require("../models/user");
const ConnectionRequestModel = require("../models/connectionRequest");


const USER_SAFE_DATA = "firstName lastName emailId";

// 1. Received Requests
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    const response = connectionRequests.map((req) => ({
      requestId: req._id,
      fromUser: req.fromUserId
        ? {
            firstName: req.fromUserId.firstName,
            lastName: req.fromUserId.lastName,
            emailId: req.fromUserId.emailId,
          }
        : null,
      status: req.status,
    }));

    res.json({ message: "Data sent successfully", data: response });
  } catch (err) {
    console.error("Error fetching received requests:", err);
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
});



// 2. Connections List
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const ALL_FIELDS = "firstName lastName emailId age gender skills photoUrl about";

    const connectionRequests = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    }).populate("fromUserId toUserId", ALL_FIELDS);

    const data = connectionRequests.map((row) => {
      // Return the "other" user in the connection (not the logged-in user)
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(400).send("ERROR: " + error.message);
  }
});






// 3. Feed
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).json({ error: "Unauthorized" });

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;

    const connections = await ConnectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id },
      ],
    }).select("fromUserId toUserId");

    const hideUserFromFeed = new Set();
    connections.forEach((conn) => {
      if (conn.fromUserId) hideUserFromFeed.add(conn.fromUserId.toString());
      if (conn.toUserId) hideUserFromFeed.add(conn.toUserId.toString());
    });

    hideUserFromFeed.add(loggedInUser._id.toString());

    const users = await User.find({
      _id: { $nin: Array.from(hideUserFromFeed) },
    })
      .select("firstName lastName skills age emailId photoUrl gender about")
      .skip(skip)
      .limit(limit);

    res.status(200).json(users);
  } catch (err) {
    console.error("Error occurred while fetching feed:", err);
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

module.exports = userRouter;
