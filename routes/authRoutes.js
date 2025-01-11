const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { email, password, roleName } = req.body;

  // Check if all fields are provided
  if (!email || !password || !roleName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if roleName exists in the Role collection
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({ message: "Invalid role name" });
    }

    // Create new user with the found roleId
    const user = new User({
      email,
      password,
      roleId: role._id,  // Save the roleId
    });

    // Save user to the database
    await user.save();

    // Send a success response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        email: user.email,
        roleId: role._id,  // Send roleId in response
        roleName: role.name,  // Send roleName in response
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
