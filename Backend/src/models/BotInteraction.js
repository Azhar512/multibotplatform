// models/BotInteraction.js
import mongoose from 'mongoose';

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

// Create indexes for performance
botInteractionSchema.index({ userId: 1, createdAt: -1 });
botInteractionSchema.index({ interactionType: 1 });
botInteractionSchema.index({ successful: 1 });
botInteractionSchema.index({ createdAt: -1 });

const BotInteraction = mongoose.model('BotInteraction', botInteractionSchema);
export default BotInteraction;
