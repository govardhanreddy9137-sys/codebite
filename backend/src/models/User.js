import mongoose from 'mongoose';
import { hashPassword } from '../utils/bcrypt.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'employee', 'rider', 'merchant'], default: 'employee' },
  bitePoints: { type: Number, default: 150 },
  subscription: {
    planId: String,
    name: String,
    startDate: String,
    endDate: String,
    allowanceAmount: Number,
    durationDays: Number,
    status: String
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

export default mongoose.model('User', userSchema);
