const express = require("express");
const connectdb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "https://dev-tinder-navy.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    // origin is undefined for same-origin requests or some tools (Postman)
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("CORS: Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
};

app.use(cors(corsOptions));
// Make sure preflight requests are answered using same options
app.options("*", cors(corsOptions));

// ... your routers and error handler as before



// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ Import routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

// ✅ Use routers
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: err.message });
});

// ✅ Connect to DB and start server
connectdb()
  .then(() => {
    console.log("Database connected successfully");
    const PORT = process.env.PORT || 3000; // ✅ Render port handling
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
