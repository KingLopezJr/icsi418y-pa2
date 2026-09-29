require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());


// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is running");
});


// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    // Check for empty fields
    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Check for existing username
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists.",
      });
    }

    // Create user
    const newUser = new User({
      f_name,
      l_name,
      username,
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: "User successfully created!",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for empty fields
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    // Search for username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Username does not exist.",
      });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    res.status(200).json({
      message: "Login successful!",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error.",
    });
  }
});


// CONNECT TO MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });