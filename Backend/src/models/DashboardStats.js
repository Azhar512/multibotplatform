// models/DashboardStats.js
const mongoose = require('mongoose');

const dashboardStatsSchema = new mongoose.Schema({
  totalInteractions: Number,
  interactionsByType: {
    chat: Number,
    email: Number,
    voice: Number,
    appointment: Number
  },
  averageResponseTime: Number,
  successRate: Number,
  averageUserRating: Number,
  activeUsers: Number,
  personalityMetrics: {
    averageFriendliness: Number,
    averageFormality: Number,
    averageCreativity: Number,
    averageExpertise: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DashboardStats', dashboardStatsSchema);