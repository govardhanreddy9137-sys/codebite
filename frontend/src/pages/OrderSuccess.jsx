import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, Zap, Share2, Home, Sparkles, ChefHat, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [points, setPoints] = useState(0);

    useEffect(() => {
        // High-end confetti burst
        const end = Date.now() + 3 * 1000;
        const colors = ['#FF3008', '#fbbf24', '#10b981', '#3b82f6'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        setPoints(Math.floor(Math.random() * 50) + 15);
    }, []);

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <div className="order-success-page">
            <div className="success-bg-blob" />
            <div className="splash-grid-overlay" style={{ opacity: 0.2 }} />

            <motion.div 
                className="success-content-box"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="success-check-wrapper">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                    >
                        <CheckCircle2 size={64} color="#10b981" strokeWidth={2.5} />
                    </motion.div>
                </div>

                <motion.div className="success-content" variants={itemVariants} initial="hidden" animate="visible">
                    <h1>Order Confirmed</h1>
                    <div className="order-badge-premium">
                        <ChefHat size={16} /> 
                        Preparation Protocol Initialized
                    </div>
                    
                    <p className="order-id-display">
                        REFERENCE: <strong>#{(id || '').toString().slice(-8).toUpperCase()}</strong>
                    </p>

                    <motion.div 
                        className="rewards-card-premium"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                    >
                        <div className="reward-icon-box">
                            <Zap size={28} />
                        </div>
                        <div className="reward-info">
                            <div className="reward-label">Culinary Credits Earned</div>
                            <div className="reward-value">+{points} BitePoints</div>
                        </div>
                        <motion.div 
                            style={{ position: 'absolute', right: '20px', top: '20px', color: 'rgba(251, 191, 36, 0.2)' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        >
                            <Sparkles size={40} />
                        </motion.div>
                    </motion.div>

                    <div className="action-grid">
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                            <Link to={`/orders/${id}`} className="btn-track-premium">
                                <Package size={22} /> Live Kitchen Tracking <ArrowRight size={20} />
                            </Link>
                        </motion.div>

                        <motion.div className="secondary-actions" variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} style={{ marginTop: '1rem' }}>
                            <Link to="/" className="btn btn-secondary glass-premium" style={{ borderRadius: '20px', padding: '1.2rem', display: 'flex', gap: '0.75rem' }}>
                                <Home size={18} /> Dashboard
                            </Link>
                            <button className="btn btn-secondary glass-premium" style={{ borderRadius: '20px', padding: '1.2rem', display: 'flex', gap: '0.75rem' }}>
                                <Share2 size={18} /> Share Joy
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
