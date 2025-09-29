import mongoose from 'mongoose';

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

export default mongoose.model('Transaction', transactionSchema);
