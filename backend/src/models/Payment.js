import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['phonepe', 'netbanking', 'cod', 'upi', 'card'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending' 
  },
  transactionId: { type: String }, // For PhonePe/NetBanking transaction IDs
  upiId: { type: String }, // UPI transaction ID
  bankName: { type: String }, // For NetBanking
  accountLast4: { type: String }, // Last 4 digits of card/bank account
  phone: { type: String }, // PhonePe registered number
  paymentDetails: { type: mongoose.Schema.Types.Mixed }, // Store flexible method-specific details
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  failureReason: { type: String },
  refundAmount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
