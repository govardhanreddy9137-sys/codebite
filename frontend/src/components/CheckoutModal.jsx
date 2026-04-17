import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Wallet, Check, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, onConfirm, totalAmount }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState('selection'); // selection, processing, success, error
    const [method, setMethod] = useState('cod');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep('selection');
            setIsProcessing(false);
            setErrorMessage('');
            setMethod('cod');
        }
    }, [isOpen]);

    const handlePayment = async () => {
        setIsProcessing(true);
        setStep('processing');
        
        try {
            const result = await onConfirm();
            if (result && !result.ok) {
                setErrorMessage(result.error || 'Payment failed.');
                setStep('error');
            } else {
                setStep('success');
            }
        } catch (err) {
            setErrorMessage(err.message || 'Payment failed.');
            setStep('error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <motion.div 
                className="checkout-modal glass"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                <div className="modal-header">
                    <h2>Secure Checkout</h2>
                    <button className="close-btn" onClick={onClose} disabled={step === 'processing'}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <AnimatePresence mode="wait">
                        {step === 'selection' && (
                            <motion.div 
                                key="selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="payment-selection"
                            >
                                <div className="amount-display">
                                    <span>Total Payable</span>
                                    <h3>₹{Number(totalAmount || 0).toFixed(2)}</h3>
                                </div>

                                    <label className={`payment-option active`}>
                                        <input type="radio" name="method" value="cod" checked={true} readOnly />
                                        <div className="option-content">
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'rgba(255, 90, 54, 0.2)', borderRadius: '4px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff5a36' }}>₹</span>
                                            </div>
                                            <div>
                                                <p>Cash on Delivery</p>
                                                <span>Pay at your doorstep</span>
                                            </div>
                                        </div>
                                        <Check className="check-icon" size={16} color="#ff5a36" />
                                    </label>

                                <div className="security-note">
                                    <Lock size={14} />
                                    <span>End-to-end encrypted payment</span>
                                </div>

                                <button className="pay-now-btn" onClick={handlePayment}>
                                    Place Order (COD)
                                </button>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div 
                                key="processing"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="processing-state"
                            >
                                <div className="loader-wrapper">
                                    <Loader2 className="spinner" size={48} />
                                </div>
                                <h3>Processing Payment</h3>
                                <p>Please do not refresh the page or close the window.</p>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="success-state"
                                style={{ textAlign: 'center' }}
                            >
                                <div className="success-icon-wrapper" style={{ margin: '0 auto 1.5rem auto' }}>
                                    <Check size={48} color="white" />
                                </div>
                                <h3>Order Placed Successfully!</h3>
                                <p>Your payment was processed and your order is confirmed.</p>
                                <button className="btn btn-primary" onClick={() => navigate('/orders')} style={{ marginTop: '2rem', padding: '1rem', width: '100%', borderRadius: '15px' }}>
                                    View History
                                </button>
                                <div className="security-seal" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
                                    <ShieldCheck size={16} color="#10b981" />
                                    <span>Verified by CodeBite Security</span>
                                </div>
                            </motion.div>
                        )}

                        {step === 'error' && (
                            <motion.div 
                                key="error"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="error-state"
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{ display: 'inline-flex', background: 'rgba(255,75,75,0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                    <X size={48} color="#ff4b4b" />
                                </div>
                                <h3>Something went wrong</h3>
                                <p style={{ color: '#ff4b4b' }}>{errorMessage}</p>
                                <button className="btn btn-secondary" onClick={() => setStep('selection')} style={{ marginTop: '1.5rem' }}>
                                    Go Back
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutModal;
