const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  month: String,
  sales: Number,
  profit: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Revenue', revenueSchema);