import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Crown, Star, Clock, Percent, Smartphone, 
    CreditCard, CheckCircle, ArrowRight, Gift,
    TrendingUp, Users, Zap, Shield, Calendar,
    DollarSign, ShoppingCart, Ticket, X
} from 'lucide-react';
import Payment from '../components/Payment';
import './Passes.css';

const Passes = () => {
    const { user, updateUser } = useAuth();
    const { addToCart, cart, placeOrder, showPayment, currentOrder, handlePaymentSuccess, handlePaymentCancel } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [selectedPass, setSelectedPass] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [userPasses, setUserPasses] = useState([]);

    const passes = [
        {
            id: 'basic',
            name: 'Weekly Meal Pass',
            price: 599,
            duration: '7 days',
            discount: '10% off',
            benefits: ['10% discount on all orders', 'Free delivery', 'Priority support'],
            icon: <Star size={24} />,
            color: '#3b82f6',
            popular: false
        },
        {
            id: 'premium',
            name: 'Monthly Meal Pass',
            price: 1999,
            duration: '30 days',
            discount: '20% off',
            benefits: ['20% discount on all orders', 'Free delivery', 'Exclusive deals', 'Birthday treat'],
            icon: <Crown size={24} />,
            color: '#8b5cf6',
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise Pass',
            price: 4999,
            duration: '90 days',
            discount: '30% off',
            benefits: ['30% discount on all orders', 'Free delivery', 'VIP support', 'Catering discounts', 'Team meals'],
            icon: <Shield size={24} />,
            color: '#10b981',
            popular: false
        }
    ];

    useEffect(() => {
        // Load user's active passes
        if (user?.subscription) {
            setUserPasses([user.subscription]);
        }
    }, [user]);

    const handlePurchasePass = async (pass) => {
        if (!user) {
            alert('Please login to purchase passes');
            return;
        }

        setProcessing(true);
        
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update user subscription
            const subscription = {
                type: pass.id,
                name: pass.name,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + (pass.duration === '7 days' ? 7 : pass.duration === '30 days' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString(),
                discount: parseInt(pass.discount),
                benefits: pass.benefits,
                price: pass.price,
                isActive: true
            };

            await updateUser({ subscription });
            setUserPasses([subscription]);
            
            alert(`🎉 Successfully purchased ${pass.name}! You now have ${pass.discount} discount on all orders.`);
            setSelectedPass(null);
        } catch (error) {
            alert('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleUsePassForOrder = () => {
        if (cart.length === 0) {
            alert('Please add items to cart first');
            return;
        }

        const activePass = userPasses.find(pass => pass.isActive);
        if (!activePass) {
            alert('No active pass found');
            return;
        }

        // Apply pass discount to cart
        const discount = activePass.discount;
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountedTotal = total * (1 - discount / 100);

        alert(`🎁 Pass Applied! You saved ₹${(Number(total || 0) - Number(discountedTotal || 0)).toFixed(2)} with ${activePass.discount}% discount!`);
        
        // Proceed to checkout with discounted price
        // This would integrate with your existing checkout system
    };

    const isPassActive = (pass) => {
        return userPasses.some(userPass => userPass.type === pass.id && userPass.isActive);
    };

    const getDaysRemaining = (pass) => {
        const userPass = userPasses.find(p => p.type === pass.id && p.isActive);
        if (!userPass) return 0;
        
        const endDate = new Date(userPass.endDate);
        const now = new Date();
        const diffTime = Math.abs(endDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="passes-container">
            <div className="passes-header">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="header-content"
                >
                    <div className="header-icon">
                        <Ticket size={32} />
                    </div>
                    <div>
                        <h1>Meal Passes</h1>
                        <p>Get exclusive discounts and benefits with our meal passes</p>
                    </div>
                </motion.div>

                {/* Active Pass Display */}
                {userPasses.some(pass => pass.isActive) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="active-pass-display glass"
                    >
                        <div className="active-pass-content">
                            <div className="active-pass-info">
                                <h3>🎉 Active Pass</h3>
                                <p>{userPasses.find(pass => pass.isActive)?.name}</p>
                                <p>Valid until: {new Date(userPasses.find(pass => pass.isActive)?.endDate).toLocaleDateString()}</p>
                            </div>
                            <button 
                                className="use-pass-btn btn btn-primary"
                                onClick={handleUsePassForOrder}
                            >
                                <ShoppingCart size={18} />
                                Use Pass for Order
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Pass Cards */}
            <div className="passes-grid">
                {passes.map((pass, index) => {
                    const isActive = isPassActive(pass);
                    const daysRemaining = getDaysRemaining(pass);
                    
                    return (
                        <motion.div
                            key={pass.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`pass-card ${isActive ? 'active' : ''} ${pass.popular ? 'popular' : ''} glass`}
                            whileHover={{ y: -5 }}
                        >
                            {pass.popular && (
                                <div className="popular-badge">
                                    <TrendingUp size={16} />
                                    Most Popular
                                </div>
                            )}

                            {isActive && (
                                <div className="active-badge">
                                    <CheckCircle size={16} />
                                    Active ({daysRemaining} days left)
                                </div>
                            )}

                            <div className="pass-header">
                                <div className="pass-icon" style={{ color: pass.color }}>
                                    {pass.icon}
                                </div>
                                <div className="pass-duration">
                                    <Clock size={16} />
                                    {pass.duration}
                                </div>
                            </div>

                            <div className="pass-content">
                                <h3>{pass.name}</h3>
                                <div className="pass-price">
                                    <span className="currency">₹</span>
                                    <span className="amount">{pass.price}</span>
                                    <span className="period">/{pass.duration.split(' ')[0]}</span>
                                </div>
                                <div className="pass-discount">
                                    <Percent size={16} />
                                    {pass.discount}
                                </div>
                            </div>

                            <div className="pass-benefits">
                                <h4>Benefits:</h4>
                                <ul>
                                    {pass.benefits.map((benefit, idx) => (
                                        <li key={idx}>
                                            <CheckCircle size={14} />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pass-actions">
                                {isActive ? (
                                    <div className="active-info">
                                        <Shield size={16} />
                                        <span>Active - {daysRemaining} days remaining</span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <button
                                            className="purchase-btn btn btn-outline"
                                            onClick={() => {
                                                addToCart({ 
                                                    ...pass, 
                                                    _id: `pass_${pass.id}`,
                                                    isPass: true, 
                                                    category: 'Passes',
                                                    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop'
                                                });
                                                showToast(`${pass.name} added to cart!`, 'success');
                                            }}
                                            disabled={cart.some(item => item._id === `pass_${pass.id}`)}
                                        >
                                            <ShoppingCart size={18} />
                                            {cart.some(item => item._id === `pass_${pass.id}`) ? 'IN CART' : 'ADD TO CART'}
                                        </button>
                                        <button
                                            className="purchase-btn btn btn-primary"
                                            onClick={async () => {
                                                if (!user) {
                                                    navigate('/login');
                                                    return;
                                                }
                                                // Quick Buy: Add to cart and immediately place order
                                                const passItem = { 
                                                    ...pass, 
                                                    _id: `pass_${pass.id}`,
                                                    isPass: true, 
                                                    category: 'Passes',
                                                    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop'
                                                };
                                                
                                                addToCart(passItem);
                                                navigate('/cart?checkout=true');
                                            }}
                                        >
                                            <Zap size={18} />
                                            BUY NOW
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Purchase Modal */}
            {selectedPass && (
                <div className="modal-overlay">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content glass"
                    >
                        <div className="modal-header">
                            <h3>Purchase {selectedPass.name}</h3>
                            <button 
                                className="close-btn"
                                onClick={() => setSelectedPass(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="pass-summary">
                                <div className="pass-icon-large" style={{ color: selectedPass.color }}>
                                    {selectedPass.icon}
                                </div>
                                <h4>{selectedPass.name}</h4>
                                <p className="pass-price-large">₹{selectedPass.price}</p>
                                <p>Valid for {selectedPass.duration}</p>
                            </div>

                            <button
                                className="confirm-purchase-btn btn btn-primary"
                                onClick={async () => {
                                    if (!user) {
                                        navigate('/login');
                                        return;
                                    }
                                    const passItem = { 
                                        ...selectedPass, 
                                        _id: `pass_${selectedPass.id}`,
                                        isPass: true, 
                                        category: 'Passes',
                                        image: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop'
                                    };
                                    addToCart(passItem);
                                    setSelectedPass(null);
                                    navigate('/cart?checkout=true');
                                }}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {showPayment && currentOrder && (
                <div className="payment-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="payment-modal glass-premium"
                    >
                        <button className="close-payment" onClick={handlePaymentCancel}><X size={24}/></button>
                        <Payment 
                            order={currentOrder}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentCancel={handlePaymentCancel}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Passes;
