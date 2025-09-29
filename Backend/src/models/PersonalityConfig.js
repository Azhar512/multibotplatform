import mongoose from 'mongoose';

const personalityConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  behaviorSliders: {
    empathy: { type: Number, default: 50 },
    professionalism: { type: Number, default: 50 },
    enthusiasm: { type: Number, default: 50 },
    patience: { type: Number, default: 50 },
    creativity: { type: Number, default: 50 }
  },
  tone: {
    type: String,
    enum: ['friendly', 'professional', 'casual', 'humorous', 'formal'],
    default: 'friendly'
  },
  messages: {
    greeting: String,
    farewell: String,
    error: String
  },
  features: {
    useEmojis: { type: Boolean, default: false },
    useSlang: { type: Boolean, default: false },
    showTypingIndicator: { type: Boolean, default: true }
  },
  responseLength: {
    type: String,
    enum: ['short', 'medium', 'long'],
    default: 'medium'
  }
}, { timestamps: true });

export default mongoose.model('PersonalityConfig', personalityConfigSchema);