import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  quantity: Number,
  restaurant: String
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  items: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    restaurant: { type: String, default: 'Multiple' }
  }],
  total: { type: Number, required: true, min: 0 },
  amount: { type: Number, min: 0 }, // Alternative to total
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['phonepe', 'netbanking', 'cod', 'upi', 'card', 'wallet', 'phonepe_qr'],
    default: null
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  address: String, // Simple address field
  deliveryAddress: String, // Detailed address
  deliveryRoom: String, // Room/office number
  state: String, // New field
  city: String, // New field
  area: String, // New field
  deliveryPg: String, // PG address
  deliveryHostelRoom: String, // Hostel room details
  groupCode: String, // For group orders
  officeName: String, // User's office or building name
  passApplied: { type: Boolean, default: false },
  passRedemptionDateKey: String,
  originalItemsTotal: Number,
  passAllowanceAmount: Number,
  passDiscountApplied: Number,
  isGift: { type: Boolean, default: false },
  giftRecipient: { type: String, default: '' },
  customerPhone: { type: String, required: true },
  riderId: { type: mongoose.Schema.Types.Mixed }, // Support both ObjectId and plain numeric strings for universal login
  rider: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number }
  },
  assignedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
