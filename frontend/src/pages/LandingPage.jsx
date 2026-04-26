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

                <div className="landing-features" style={{ marginTop: '4rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                    <div className="feature">
                        <Sparkles size={20} color="var(--primary)" />
                        <span>Smart Recommendations</span>
                    </div>
                    <div className="feature">
                        <Clock size={20} color="#3b82f6" />
                        <span>Real-time Tracking</span>
                    </div>
                    <div className="feature">
                        <Shield size={20} color="#10b981" />
                        <span>Secure Payments</span>
                    </div>
                </div>

                {/* Statistics Section */}
                <motion.div 
                    className="landing-stats glass"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ 
                        marginTop: '6rem', 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '3rem',
                        padding: '3rem',
                        borderRadius: '40px',
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    <div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: '#FF3008' }}>15k+</div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>MEALS DELIVERED</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: '#3b82f6' }}>4.9/5</div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>USER RATING</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981' }}>20+</div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>PREMIUM KITCHENS</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fbbf24' }}>12m</div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>AVG. DELIVERY</div>
                    </div>
                </motion.div>

                {/* Premium Trust Section */}
                <div style={{ marginTop: '8rem', textAlign: 'center', width: '100%' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem' }}>Why Professional Choice <span style={{ color: '#FF3008' }}>CodeBite</span>?</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: 'Corporate Standards', desc: 'Compliant with office protocols and bulk ordering requirements.', icon: <Crown size={32} /> },
                            { title: 'Flash Delivery', desc: 'Our riders use optimized routes to ensure heat retention.', icon: <Clock size={32} /> },
                            { title: 'Curated Menus', desc: 'Only the highest-rated kitchens pass our quality audit.', icon: <Utensils size={32} /> }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -10 }}
                                className="glass"
                                style={{ padding: '3rem 2rem', borderRadius: '32px', textAlign: 'left' }}
                            >
                                <div style={{ color: '#FF3008', marginBottom: '1.5rem' }}>{item.icon}</div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>{item.title}</h4>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>


        </div>
    );
};

export default LandingPage;

