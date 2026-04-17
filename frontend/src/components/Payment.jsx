import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Building, Wallet, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Clock, Zap, Download, Search, Copy } from 'lucide-react';
import { paymentsAPI } from '../api.js';
import { useCart } from '../context/CartContext';
import './Payment.css';

const Payment = ({ order: propOrder, onPaymentSuccess, onPaymentCancel }) => {
  const { currentOrder, handlePaymentSuccess: cartHandlePaymentSuccess, handlePaymentCancel: cartHandlePaymentCancel } = useCart();
  const order = propOrder || currentOrder;
  
  const [selectedMethod, setSelectedMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [errors, setErrors] = useState({});
  const [showQR, setShowQR] = useState(true);
  const [qrError, setQRError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    console.log('Payment component mounted');
    console.log('Order from props:', propOrder);
    console.log('Order from CartContext:', currentOrder);
    console.log('Final order being used:', order);
    
    if (!order) {
      console.error('No order available for payment');
      alert('No order found. Please place an order first.');
      window.location.href = '/cart';
    }
  }, []);

  useEffect(() => {
    console.log('Payment state changed:', { selectedMethod });
  }, [selectedMethod]);

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: CheckCircle, description: 'Pay at your doorstep', color: '#ff5a36', fields: [] }
  ];

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    if (field === 'cardNumber') formattedValue = value.replace(/[^0-9]/g, '').replace(/(\d{4})/g, '$1 ').trim();
    if (field === 'expiry') {
      formattedValue = value.replace(/[^0-9]/g, '');
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    }
    if (['cardNumber', 'cvv', 'phone', 'accountNumber'].includes(field)) formattedValue = value.replace(/[^0-9]/g, '');
    if (field === 'cardNumber') formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
    
    setPaymentDetails(prev => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleMethodSelect = (methodId) => {
    console.log('Payment method selected:', methodId);
    setSelectedMethod(methodId);
    setErrors(prev => ({ ...prev, submit: '' })); // Clear submit errors when changing method
    if (methodId === 'phonepe') {
        setShowQR(true);
        console.log('PhonePe selected, showQR set to true');
    } else {
        setShowQR(false);
    }
  };

  const handleGoBack = () => {
    setSelectedMethod('');
    setShowQR(false);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (selectedMethod === 'card') {
      if (!paymentDetails.cardNumber || paymentDetails.cardNumber.length < 16) newErrors.cardNumber = 'Valid 16-digit card required';
      if (!paymentDetails.cardName) newErrors.cardName = 'Cardholder name required';
      if (!paymentDetails.expiry || paymentDetails.expiry.length < 5) newErrors.expiry = 'MM/YY required';
      if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) newErrors.cvv = '3-digit CVV required';
    }
    if (selectedMethod === 'phonepe' && !paymentDetails.phone) newErrors.phone = 'UPI Phone Number required';
    if (selectedMethod === 'upi' && !paymentDetails.phone) newErrors.phone = 'UPI Phone Number required';
    if (selectedMethod === 'wallet' && !paymentDetails.walletName) newErrors.submit = 'Please select a wallet to proceed';
    if (selectedMethod === 'netbanking') {
      if (!paymentDetails.accountNumber) newErrors.accountNumber = 'Account Number required';
      if (!paymentDetails.ifscCode) newErrors.ifscCode = 'IFSC Code required';
      if (!paymentDetails.bankName) newErrors.bankName = 'Bank Name required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      console.log('=== PAYMENT DEBUG START ===');
      console.log('Order object:', JSON.stringify(order, null, 2));
      console.log('Order exists:', !!order);
      console.log('Order ID:', order._id || order.id);
      console.log('Order total:', order.total);
      console.log('Order items:', order.items);
      console.log('Selected method:', selectedMethod);
      console.log('Payment details:', paymentDetails);
      
      if (!order) {
        throw new Error('Order object is null or undefined. Please place a new order.');
      }
      
      if (!order._id && !order.id) {
        throw new Error('Order ID is missing. Please place a new order.');
      }
      
      if (!order.total && order.total !== 0) {
        throw new Error('Order total is missing. Please place a new order.');
      }
      
      // Validate payment method
      const validMethods = ['phonepe', 'netbanking', 'cod', 'upi', 'card'];
      if (!validMethods.includes(selectedMethod)) {
        throw new Error(`Invalid payment method: ${selectedMethod}. Valid methods are: ${validMethods.join(', ')}`);
      }
      
      const sanitizedDetails = { ...paymentDetails };
      if (sanitizedDetails.cardNumber) sanitizedDetails.cardNumber = sanitizedDetails.cardNumber.replace(/\s/g, '');
      
      const finalAmount = order.total || 0;
      const requestData = {
        orderId: order._id || order.id,
        amount: finalAmount,
        method: selectedMethod,
        paymentDetails: { ...sanitizedDetails, phone: sanitizedDetails.phone || '9999999999' }
      };
      
      console.log('Final amount:', finalAmount);
      console.log('Final request data:', JSON.stringify(requestData, null, 2));
      console.log('=== PAYMENT DEBUG END ===');
      
      let response;
      try {
        response = await paymentsAPI.create(requestData);
      } catch (mainError) {
        console.error('Main payment endpoint failed, trying legacy endpoint:', mainError);
        // Try legacy endpoint without amount field
        const legacyRequestData = {
          orderId: order._id || order.id,
          method: selectedMethod,
          paymentDetails: { ...sanitizedDetails, phone: sanitizedDetails.phone || '9999999999' }
        };
        response = await paymentsAPI.createLegacy(legacyRequestData);
      }
      
      console.log('Payment response:', response);
      
      if (response.success || response.ok) {
        setIsSuccess(true);
        // Delay the callback so user can see the beautiful success screen
        setTimeout(() => {
            (onPaymentSuccess || cartHandlePaymentSuccess)(response);
        }, 3000);
      }
      else throw new Error(response.error || response.message || 'Gateway Timeout');
    } catch (err) {
      console.error('=== PAYMENT ERROR DEBUG ===');
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('=== PAYMENT ERROR DEBUG END ===');
      
      let errorMessage = 'Payment failed';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.log('Final error message:', errorMessage);
      setErrors({ submit: errorMessage });
      
      // Show alert with error details for debugging
      alert(`Payment Error: ${errorMessage}\n\nPlease check browser console (F12) for detailed debug logs.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    (onPaymentCancel || cartHandlePaymentCancel)();
  };

  if (!order) {
    return (
      <div className="premium-payment-engine" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column' }}>
        <AlertCircle size={64} color="#ff5a36" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>No Order Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>Please place an order first before proceeding to payment.</p>
        <button 
            onClick={() => window.location.href = '/cart'}
            style={{
                background: '#ff5a36',
                color: '#fff',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
            }}
        >
            Go to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="premium-payment-engine">
      <div className="payment-header-redesign">
        <div className="total-payable-box">
            <label>TOTAL PAYABLE</label>
            <div className="amount-hero">₹{Number(order.total || 0).toFixed(2)}</div>
        </div>
      </div>

        <div className="payment-grid-selection-v2">
            {[
                paymentMethods.find(m => m.id === 'phonepe'),
                paymentMethods.find(m => m.id === 'netbanking'),
                paymentMethods.find(m => m.id === 'upi'),
                paymentMethods.find(m => m.id === 'cod')
            ].map(m => m && (
                <div 
                    key={m.id} 
                    className={`payment-method-card-v2 ${selectedMethod === m.id ? 'active' : ''} ${m.id === 'cod' ? 'full-width' : ''}`}
                    onClick={() => handleMethodSelect(m.id)}
                >
                    <div className="card-top">
                        <m.icon size={28} strokeWidth={1.5} />
                    </div>
                    <div className="card-bottom">
                        <h4>{m.name}</h4>
                        <p>{m.description}</p>
                    </div>
                    {selectedMethod === m.id && <div className="selected-indicator"><CheckCircle size={16} /></div>}
                </div>
            ))}
        </div>

      <div className="payment-body">
        {/* Order Summary */}
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Order Summary</h3>
            {order?.items && order.items.length > 0 ? (
                <>
                    {order?.items?.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                            <span>{item?.name} x {item?.quantity}</span>
                            <span>₹{((Number(item?.price) || 0) * (Number(item?.quantity) || 0)).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                            <span>Subtotal</span>
                            <span>₹{Number(order?.total || 0).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                            <span>Delivery Charge</span>
                            <span>{(order.deliveryCharge || 0) > 0 ? `₹${Number(order.deliveryCharge).toFixed(2)}` : 'FREE'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: '#fff', fontSize: '1.2rem', fontWeight: 950 }}>
                            <span>Total Payable</span>
                            <span style={{ color: '#ff5a36' }}>₹{Number(order?.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>No items in order</div>
            )}
        </div>

          {selectedMethod === 'cod' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="cod-premium-view" style={{ textAlign: 'center', padding: '3rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'rgba(255, 90, 54, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <CheckCircle size={48} color="#ff5a36" strokeWidth={1.5} />
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>Cash on Delivery</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto 2rem', lineHeight: 1.6 }}>Pay for your order at your doorstep. Please keep <span style={{ color: '#fff', fontWeight: 800 }}>₹{Number(order?.total || 0).toFixed(2)}</span> ready.</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#ff5a36', fontSize: '0.9rem', fontWeight: 700 }}>
                    <Clock size={16} /> EXPRESS DELIVERY ACTIVE
                </div>
            </motion.div>
          )}
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="payment-success-overlay"
          >
            <div className="success-card glass-premium">
              <div className="confetti-container"></div>
              <div className="success-icon-wrapper">
                <CheckCircle size={100} color="#10b981" strokeWidth={3} />
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', margin: '1rem 0' }}>ORDER CONFIRMED!</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem' }}>Hello Govardhan Reddy, your feast is being prepared.</p>
              <div className="order-summary-mini">
                <div className="summary-row">
                  <span>Merchant</span>
                  <span>CodeBite Smart Office</span>
                </div>
                <div className="summary-row">
                    <span>Amount Paid</span>
                    <span className="success-amount">₹{Number(order?.total || 0).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Transaction ID</span>
                  <span>TXN{Math.floor(Math.random() * 1000000000)}</span>
                </div>
              </div>
              <div className="redirect-timer">
                Redirecting to orders in 3s...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="payment-footer" style={{ padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
        {errors.submit && <div className="error-toast" style={{ background: '#ef4444', padding: '10px', borderRadius: '10px', marginBottom: '1rem', textAlign: 'center', fontWeight: 800 }}>{errors.submit}</div>}
        <div className="footer-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', opacity: 0.5, fontSize: '0.7rem', fontWeight: 700 }}>
            <span><ShieldCheck size={12} style={{ verticalAlign: 'middle' }} /> PCI-DSS COMPLIANT</span>
            <span>PROCESSED BY CODEBITE SECURE</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
                className="btn-cancel" 
                onClick={handleCancel}
                disabled={loading || isSuccess}
                style={{ 
                    flex: 1, 
                    padding: '1.25rem', 
                    fontSize: '1.1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                CANCEL
            </button>
            <button 
                className={`btn-pay-premium ${isSuccess ? 'success' : ''}`} 
                onClick={handlePayment} 
                disabled={loading || !selectedMethod || isSuccess}
                style={{ 
                    flex: 1, 
                    padding: '1.5rem', 
                    fontSize: '1.2rem',
                    background: 'linear-gradient(135deg, #ff5a36 0%, #ff3008 100%)',
                    borderRadius: '24px',
                    color: '#fff',
                    fontWeight: 900,
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(255, 90, 54, 0.4)',
                    cursor: 'pointer',
                    letterSpacing: '0.5px'
                }}
            >
                {loading ? 'PROCESSING...' : isSuccess ? 'VERIFIED ✓' : showQR ? 'I HAVE PAID (VERIFY)' : `AUTHORIZE ₹${Number(order?.total || 0).toFixed(2)}`}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
