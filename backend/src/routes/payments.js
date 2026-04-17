import express from 'express';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { verifyToken } from '../utils/jwt.js';

const router = express.Router();

// Process payment (main endpoint)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { orderId, amount, method, paymentDetails } = req.body;
    const userId = req.user.id;

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate payment ID
    const paymentId = 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create payment record
    const payment = new Payment({
      paymentId,
      orderId,
      userId,
      amount: amount || order.total,
      method,
      paymentDetails: {
        ...paymentDetails,
        last4: paymentDetails.cardNumber ? paymentDetails.cardNumber.slice(-4) : null,
        phone: paymentDetails.phone || null
      },
      status: 'completed'
    });

    await payment.save();

    // Update order status
    order.status = 'confirmed';
    order.paymentId = paymentId;
    order.paymentMethod = method;
    await order.save();

    res.json({ 
      success: true, 
      ok: true,
      payment: payment,
      order: order,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment processing failed',
      message: error.message 
    });
  }
});

// Create payment intent (legacy)
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { orderId, method, paymentDetails } = req.body;
    const userId = req.user.id;

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create payment record
    const payment = new Payment({
      orderId,
      userId,
      amount: order.total,
      method,
      paymentDetails,
      status: 'pending'
    });

    await payment.save();
    
    // Generate payment URL based on method
    let paymentUrl = null;
    let transactionData = {};

    switch (method) {
      case 'phonepe':
        paymentUrl = `https://phonepe.com/pay?amount=${order.total}&merchant=codebite&txn=${payment._id}`;
        transactionData = {
          merchantId: 'CODEBITE_MERCHANT',
          transactionId: `TXN_${Date.now()}_${payment._id}`,
          amount: order.total
        };
        break;
      
      case 'netbanking':
        paymentUrl = `https://netbanking.com/pay?amount=${order.total}&merchant=codebite&ref=${payment._id}`;
        transactionData = {
          bankName: paymentDetails?.bankName,
          reference: `NBK_${Date.now()}_${payment._id}`,
          amount: order.total
        };
        break;
      
      case 'upi':
        paymentUrl = `upi://pay?pa=codebite@ybl&pn=CodeBite&am=${order.total}&tn=${payment._id}`;
        transactionData = {
          vpa: paymentDetails?.upiVpa || 'codebite@ybl',
          transactionId: `UPI_${Date.now()}_${payment._id}`,
          amount: order.total
        };
        break;
      
      case 'card':
        paymentUrl = `https://payment-gateway.com/pay?amount=${order.total}&merchant=codebite&token=${payment._id}`;
        transactionData = {
          cardToken: paymentDetails?.cardToken,
          transactionId: `CARD_${Date.now()}_${payment._id}`,
          amount: order.total
        };
        break;
      
      case 'cod':
        paymentUrl = null; // Cash on delivery
        transactionData = { cod: true };
        break;
    }

    res.json({
      success: true,
      paymentId: payment._id,
      paymentUrl,
      transactionData,
      message: `${method} payment initiated`
    });

  } catch (err) {
    console.error('Payment creation error:', err);
    res.status(500).json({ error: 'Payment failed', details: err.message });
  }
});

// Verify payment (webhook for payment gateways)
router.post('/verify', async (req, res) => {
  try {
    const { paymentId, status, transactionId, failureReason } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = status;
    payment.transactionId = transactionId;
    payment.failureReason = failureReason;
    payment.updatedAt = new Date();

    await payment.save();

    // Update order status based on payment
    if (status === 'completed') {
      await Order.findByIdAndUpdate(payment.orderId, { 
        status: 'confirmed',
        paymentStatus: 'paid'
      });
    } else if (status === 'failed') {
      await Order.findByIdAndUpdate(payment.orderId, { 
        status: 'cancelled',
        paymentStatus: 'failed'
      });
    }

    res.json({ success: true, message: 'Payment status updated' });

  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Get payment history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('orderId', 'total status createdAt')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error('Payment history error:', err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Get payment details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('orderId', 'total status items')
      .populate('userId', 'name email');
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(payment);
  } catch (err) {
    console.error('Payment details error:', err);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

// Refund payment
router.post('/:id/refund', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Cannot refund unpaid payment' });
    }

    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.updatedAt = new Date();
    await payment.save();

    // Update order status
    await Order.findByIdAndUpdate(payment.orderId, { 
      status: 'refunded',
      paymentStatus: 'refunded'
    });

    res.json({ success: true, message: 'Refund processed' });

  } catch (err) {
    console.error('Refund error:', err);
    res.status(500).json({ error: 'Refund failed' });
  }
});

// Verify payment
router.get('/:paymentId/verify', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Find payment by paymentId
    const payment = await Payment.findOne({ paymentId: paymentId });
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    // Check authorization
    if (payment.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    res.json({
      success: true,
      payment: {
        id: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        createdAt: payment.createdAt
      }
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment verification failed',
      message: error.message 
    });
  }
});

export default router;
