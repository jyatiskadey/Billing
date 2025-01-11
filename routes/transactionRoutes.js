const express = require("express");
const jwt = require("jsonwebtoken");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Middleware to authenticate token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Add a transaction
router.post("/", authenticate, async (req, res) => {
  const { description, type, amount, paymentMethod } = req.body;

  // Validate required fields
  if (!description || !type || !amount || !paymentMethod) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate type field
  if (!["Income", "Expense"].includes(type)) {
    return res.status(400).json({ message: "Invalid type. Must be 'Income' or 'Expense'" });
  }

  // Validate paymentMethod field
  if (!["Cash", "UPI"].includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method. Must be 'Cash' or 'UPI'" });
  }

  try {
    const transaction = new Transaction({
      userId: req.userId,
      description,
      type,
      amount,
      paymentMethod, // Ensure this field is stored
    });

    await transaction.save();
    res.status(201).json({ message: "Transaction added successfully", transaction });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Error adding transaction", error });
  }
});

// Get all transactions for a user
router.get("/", authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 }); // Sort by latest transactions

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions", error });
  }
});

module.exports = router;
