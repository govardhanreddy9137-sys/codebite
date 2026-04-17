import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, ArrowRight, Sparkles, Clock, Shield, Crown, Heart, History, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FoodGallery from '../components/FoodGallery';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const quickLinks = [
        { title: 'Home', icon: <Utensils />, path: '/menu', color: '#FF3008' },
        { title: 'Passes', icon: <Crown />, path: '/passes', color: '#FFD700' },
        { title: 'Wishlist', icon: <Heart />, path: '/wishlist', color: '#ff4b81' },
        { title: 'Orders', icon: <History />, path: '/orders', color: '#3b82f6' }
    ];

    return (
        <div className="landing-page">


            <div className="hero-section">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="landing-logo">
                        <Utensils size={48} className="logo-icon" />
                        <h1>Code<span style={{color: '#FF3008'}}>Bite</span></h1>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        Elevate Your Office <br/>Dining Experience
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                    >
                        Premium meals from the city's finest kitchens, delivered with surgical precision to your workspace.
                    </motion.p>
                    
                    {user ? (
                        <motion.div 
                            className="quick-access-grid" 
                            style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                                gap: '2rem', 
                                marginTop: '4rem',
                                width: '100%',
                                maxWidth: '900px'
                            }}
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                        >
                            {quickLinks.map((link) => (
                                <motion.div
                                    key={link.title}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    className="quick-tile"
                                    whileHover={{ 
                                        y: -10, 
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                        borderColor: link.color + '44',
                                        scale: 1.02
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(link.path)}
                                    style={{
                                        padding: '2.5rem 1.5rem',
                                        borderRadius: '32px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '1.25rem',
                                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                >
                                    <div style={{ 
                                        color: link.color,
                                        transform: 'scale(1.8)',
                                        marginBottom: '0.75rem',
                                        filter: `drop-shadow(0 0 15px ${link.color}44)`
                                    }}>
                                        {link.icon}
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>{link.title}</span>
                                </motion.div>
                            ))}
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="quick-tile"
                                whileHover={{ y: -10, backgroundColor: 'rgba(255,255,255,0.08)', scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { logout(); navigate('/'); }}
                                style={{
                                    padding: '2.5rem 1.5rem',
                                    borderRadius: '32px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                            >
                                <div style={{ color: '#94a3b8', transform: 'scale(1.8)', marginBottom: '0.75rem' }}>
                                    <LogOut />
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.5px' }}>Logout</span>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '3rem' }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                        >
                            <button 
                                className="btn btn-primary" 
                                onClick={() => navigate('/menu')}
                                style={{ padding: '1.25rem 2.5rem', borderRadius: '40px', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 10px 30px rgba(255,48,8,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                            >
                                 Explore Menu <ArrowRight size={24} />
                            </button>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => navigate('/login')}
                                style={{ padding: '1.25rem 2.5rem', borderRadius: '40px', fontWeight: 800, fontSize: '1.2rem' }}
                            >
                                Sign In
                            </button>
                        </motion.div>
                    )}
                </motion.div>

                <div style={{ marginTop: '5rem', width: '100%', maxWidth: '1200px', margin: '5rem auto 0' }}>
                    <FoodGallery />
                </div>

                <div className="landing-features" style={{ marginTop: '4rem' }}>
                    <div className="feature">
                        <Sparkles size={20} />
                        <span>Smart Recommendations</span>
                    </div>
                    <div className="feature">
                        <Clock size={20} />
                        <span>Real-time Tracking</span>
                    </div>
                    <div className="feature">
                        <Shield size={20} />
                        <span>Secure Payments</span>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default LandingPage;

