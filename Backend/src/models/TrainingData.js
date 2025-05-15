const trainingDataSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    faqs: [{
      question: String,
      answer: String
    }],
    businessData: [{
      fileName: String,
      fileType: String,
      fileUrl: String,
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      }
    }],
    lastTrainingDate: Date
  });