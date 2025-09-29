// Bot interaction conversation model

import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  messages: [{
    text: String,
    sender: {
      type: String,
      enum: ['user', 'bot']
    },
    timestamp: Date,
    audioUrl: String
  }],
  settings: {
    enableVoice: Boolean,
    enableTextToSpeech: Boolean,
    botTone: String
  }
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);