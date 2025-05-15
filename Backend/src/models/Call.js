import mongoose from 'mongoose';

const CallSchema = new mongoose.Schema({
  callSid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    default: 'outbound'
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer'],
    default: 'initiated'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number
  },
  recordingUrl: {
    type: String
  },
  transcription: {
    type: String
  },
  aiModel: {
    type: String
  },
  voiceType: {
    type: String
  },
  personalitySettings: {
    type: Object
  },
  insights: {
    summary: String,
    sentimentScore: Number,
    keyTopics: [String],
    actionItems: [String],
    followUpNeeded: Boolean
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  notes: {
    type: String
  },
  tags: [String]
}, {
  timestamps: true
});

// Calculate duration when the call ends
CallSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000); // Duration in seconds
  }
  next();
});

// Create indexes for common queries
CallSchema.index({ userId: 1, startTime: -1 });
CallSchema.index({ customerId: 1 });
CallSchema.index({ status: 1 });

const Call = mongoose.model('Call', CallSchema);

export default Call;