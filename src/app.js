const express = require("express");
const connectdb = require("./config/database");
const app = express();
const User = require("./models/user")
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser")
const { userAuth } = require("./middleware/user")
const cors = require("cors");
require('dotenv').config()


app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "https://dev-tinder-navy.vercel.app",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true,
  
})
);

app.options('/profile/edit', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Origin', 'https://dev-tinder-navy.vercel.app');
  res.setHeader('Access-Control-Allow-Origin', 'https://dev-tinder-navy.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.get("/", (req, res) => {
  res.send("Hello World")
})

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
  console.log("database connected successfully")
  app.listen(process.env.PORT, () => {
    console.log("successfully loged in the 3000 port number")
  })
})
  .catch((err) => {
    console.log("database connection failed");
  })
