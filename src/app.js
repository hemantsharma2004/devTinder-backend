const express = require("express");
const connectdb = require("./config/database");
const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middleware/user");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());

// ✅ Properly configure CORS for all requests
app.use(cors({
  origin: "https://dev-tinder-navy.vercel.app", // Frontend domain
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,  // Allows cookies and authentication headers
}));

// ✅ Ensure CORS headers are included in all responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://dev-tinder-navy.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

connectdb().then(() => {
  console.log("Database connected successfully");
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}).catch((err) => {
  console.log("Database connection failed:", err);
});
