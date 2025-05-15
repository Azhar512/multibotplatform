const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['sale', 'refund', 'expense']
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);