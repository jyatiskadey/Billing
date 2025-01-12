const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Create new user
    const user = new User({
      email,
      password, // Password will be hashed before saving (handled in the User model)
    });

    // Save user to the database
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});



// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
  
      // Generate the JWT token
      console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error.message); // Debugging
      res.status(500).json({ message: "Error during login", error: error.message });
    }
  });
  
  router.get("/logout", (req, res) => {
    try {
      // Create a token that is already expired
      const expiredToken = jwt.sign(
        { userId: "testUserId" }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: "-1s" } // Already expired
      );
  
      res.status(200).json({
        message: "Generated an expired token.",
        expiredToken,
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating expired token", error });
    }
  });
  

module.exports = router;
