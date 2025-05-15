// models/BotInteraction.js
const mongoose = require('mongoose');

const botInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: String,
  interactionType: {
    type: String,
    enum: ['chat', 'email', 'voice', 'appointment'],
    required: true
  },
  personalitySettings: {
    friendliness: Number,
    formality: Number,
    creativity: Number,
    expertise: Number
  },
  responseTime: Number, // in milliseconds
  successful: Boolean,
  feedback: {
    rating: Number,
    comment: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BotInteraction', botInteractionSchema);