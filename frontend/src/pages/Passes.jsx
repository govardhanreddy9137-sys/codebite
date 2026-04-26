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

    const passes = [
        {
            id: 'basic',
            name: 'Weekly Meal Pass',
            price: 599,
            duration: '7 days',
            discount: '10%',
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
            discount: '20%',
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
            discount: '30%',
            benefits: ['30% discount on all orders', 'Free delivery', 'VIP support', 'Catering discounts', 'Team meals'],
            icon: <Shield size={24} />,
            color: '#10b981',
            popular: false
        }
    ];

    const isPassActive = (pass) => {
        return user?.subscription?.planId === pass.id && user?.subscription?.status === 'active';
    };

    const hasAnyActivePass = () => {
        return user?.subscription?.status === 'active';
    };

    const getActivePassPrice = () => {
        if (!hasAnyActivePass()) return 0;
        const activePass = passes.find(p => p.id === user.subscription.planId);
        return activePass ? activePass.price : 0;
    };

    const getDaysRemaining = () => {
        if (!user?.subscription?.endDate) return 0;
        
        const endDate = new Date(user.subscription.endDate);
        const now = new Date();
        const diffTime = endDate - now;
        if (diffTime <= 0) return 0;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleUpgradePass = (pass) => {
        // Simple upgrade logic: just buy the new pass
        // In a real app, you might prorate the price
        const passItem = { 
            ...pass, 
            _id: `pass_${pass.id}`,
            isPass: true, 
            category: 'Passes',
            isUpgrade: true,
            oldPassId: user.subscription.planId,
            image: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop'
        };
        
        addToCart(passItem);
        showToast(`Upgrading to ${pass.name}!`, 'info');
        navigate('/cart?checkout=true');
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
                        <h1>Meal Passes (Subscriptions)</h1>
                        <p>Get exclusive discounts and benefits with our premium meal passes</p>
                    </div>
                </motion.div>

                {/* Active Pass Display - More Prominent */}
                {hasAnyActivePass() && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="active-pass-display-premium glass-premium"
                    >
                        <div className="active-pass-glow"></div>
                        <div className="active-pass-content-premium">
                            <div className="active-pass-main">
                                <div className="pass-status-icon">
                                    <Zap size={32} fill="var(--primary)" />
                                </div>
                                <div className="active-pass-info-premium">
                                    <h3>🎉 You are a Premium Member!</h3>
                                    <h2>{user.subscription.name}</h2>
                                    <div className="pass-stats-mini">
                                        <span className="stat-item"><Clock size={14}/> {getDaysRemaining()} days left</span>
                                        <span className="stat-item"><Percent size={14}/> {passes.find(p => p.id === user.subscription.planId)?.discount} Discount</span>
                                    </div>
                                    {passes.some(p => p.price > getActivePassPrice()) && (
                                        <p style={{ margin: '1rem 0 0', color: '#fbbf24', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Zap size={14} fill="#fbbf24" />
                                            UPGRADE AVAILABLE: Get even more benefits below!
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="active-pass-actions">
                                <button 
                                    className="use-pass-btn-premium"
                                    onClick={() => navigate('/menu')}
                                >
                                    <ShoppingCart size={18} />
                                    Order Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Pass Cards */}
            <div className="passes-grid">
                {passes.map((pass, index) => {
                    const isActive = isPassActive(pass);
                    const daysRemaining = getDaysRemaining();
                    const canUpgrade = hasAnyActivePass() && !isActive && pass.price > getActivePassPrice();
                    
                    return (
                        <motion.div
                            key={pass.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`pass-card ${isActive ? 'active' : ''} ${pass.popular ? 'popular' : ''} ${canUpgrade ? 'upgrade-available' : ''} glass`}
                            whileHover={{ y: -10 }}
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
                                    ACTIVE: YOU ARE CURRENTLY WORKING WITH THIS PASS
                                </div>
                            )}

                            {canUpgrade && (
                                <div className="upgrade-badge">
                                    <Zap size={16} />
                                    UPGRADE
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
                                    <div className="active-info" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <Zap size={18} fill="#10b981" />
                                        <span style={{ fontWeight: 800 }}>YOU ARE CURRENTLY WORKING WITH THIS PASS</span>
                                    </div>
                                ) : canUpgrade ? (
                                    <button
                                        className="purchase-btn upgrade-btn"
                                        onClick={() => handleUpgradePass(pass)}
                                    >
                                        <TrendingUp size={18} />
                                        UPGRADE NOW
                                    </button>
                                ) : hasAnyActivePass() ? (
                                    <div className="active-info" style={{ opacity: 0.5, background: 'rgba(255,255,255,0.05)' }}>
                                        <Shield size={16} />
                                        <span>Higher Tier Active</span>
                                    </div>
                                ) : (
                                    <div className="action-buttons-grid">
                                        <button
                                            className="purchase-btn btn-outline"
                                            onClick={() => {
                                                if (!user) {
                                                    navigate('/login');
                                                    return;
                                                }
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
                                            className="purchase-btn btn-primary"
                                            onClick={async () => {
                                                if (!user) {
                                                    navigate('/login');
                                                    return;
                                                }
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
