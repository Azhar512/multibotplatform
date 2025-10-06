// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  dateJoined: {
    type: Date,
    default: Date.now
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  interactionCount: {
    type: Number,
    default: 0
  },
  sentiment: {
    type: Number,
    default: 0.5
  },
  status: {
    type: String,
    enum: ['active', 'banned', 'inactive'],
    default: 'active'
  }
});

// Hash password before saving (only if password is not already hashed)
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && !this.password.startsWith('$2a$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Create indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ lastInteraction: -1 });
UserSchema.index({ status: 1 });
UserSchema.index({ dateJoined: -1 });

const User = mongoose.model('User', UserSchema);

// ✅ Default export for ESM
export default User;
