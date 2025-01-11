const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["Income", "Expense"], required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Cash", "UPI"], required: true }, // Add this field
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
