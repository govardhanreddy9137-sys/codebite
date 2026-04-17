import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Sparkles, ChefHat, Coffee, Pizza, ArrowRight, ShieldCheck, Database, Server } from 'lucide-react';
import { useSplashScreen } from '../hooks/useSplashScreen';
import './SplashScreen.css';

/**
 * @COB_SYSTEM_STRUCT
 * -------------------
 * This section represents the virtual "Backend Structure" requested.
 * In a production environment, these values would be fetched during the splash sequence.
 */
const SYSTEM_CONFIG = {
    version: "2.1.0-PREMIUM",
    environment: "production",
    encryption: "AES-256-GCM",
    services: [
        { id: "core-api", status: "online", latency: "24ms" },
        { id: "auth-gateway", status: "online", latency: "12ms" },
        { id: "asset-cdn", status: "online", latency: "8ms" },
        { id: "db-cluster", status: "online", node: "IN-SOUTH-1" }
    ],
    init_sequence: [
        "KERN_INIT",
        "SEC_HANDSHAKE",
        "ASSET_PREFETCH",
        "AUTH_VERIFY",
        "UI_MOUNT"
    ]
};

const SplashScreen = ({ onFinish }) => {
    const { 
        isVisible, 
        loadingProgress, 
        currentStage, 
        isReady, 
        handleFinish 
    } = useSplashScreen(onFinish);

    const stageMessages = {
        init: 'Synchronizing Core Systems...',
        loading: 'Fetching Gourmet Assets...',
        preparing: 'Optimizing Culinary Logic...',
        ready: 'System Ready for Service.'
    };

    const containerVariants = {
        exit: { 
            opacity: 0,
            scale: 1.05,
            filter: "blur(40px)",
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    className="splash-screen"
                    variants={containerVariants}
                    exit="exit"
                >
                    {/* Premium Mesh Background */}
                    <div className="splash-mesh-bg" />
                    <div className="splash-grid-overlay" />
                    
                    <div className="splash-particles">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="particle"
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ 
                                    opacity: [0, 0.5, 0],
                                    y: -200,
                                    x: Math.random() * 100 - 50 
                                }}
                                transition={{ 
                                    duration: 4 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 5
                                }}
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    bottom: '0',
                                    width: '2px',
                                    height: '40px',
                                    background: 'linear-gradient(to top, var(--primary), transparent)'
                                }}
                            />
                        ))}
                    </div>

                    <div className="splash-content">
                        {/* Logo & Identity */}
                        <div className="logo-section">
                            <motion.div 
                                className="premium-logo-box"
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <div className="logo-inner-glow" />
                                <Utensils size={70} className="logo-icon" style={{ filter: 'drop-shadow(0 0 20px var(--primary-glow))' }} />
                                <motion.div
                                    style={{ position: 'absolute', top: -10, right: -10, color: '#FFB800' }}
                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <Sparkles size={32} />
                                </motion.div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ letterSpacing: "20px", opacity: 0 }}
                                animate={{ letterSpacing: "-3px", opacity: 1 }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <h1 className="splash-title">
                                    CODE<span>BITE</span>
                                </h1>
                            </motion.div>

                            <motion.div 
                                className="system-status"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                            >
                                <div className="status-dot" />
                                <span>SECURE ACCESS • v{SYSTEM_CONFIG.version}</span>
                                <div className="info-separator" />
                                <ShieldCheck size={14} />
                            </motion.div>
                        </div>
                        
                        {/* Interactive UI Zone */}
                        <div className="interactive-container">
                            <AnimatePresence mode="wait">
                                {!isReady ? (
                                    <motion.div 
                                        key="loader"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="loader-wrapper"
                                    >
                                        <div className="surgical-loader">
                                            <motion.div 
                                                className="loader-progress"
                                                animate={{ width: `${loadingProgress}%` }}
                                            />
                                        </div>
                                        
                                        <div className="loader-meta">
                                            <motion.span 
                                                key={currentStage}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="stage-text"
                                            >
                                                {stageMessages[currentStage]}
                                            </motion.span>
                                            <span className="percent-text">{Math.round(loadingProgress)}%</span>
                                        </div>

                                        {/* Backend Simulation Tags */}
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', opacity: 0.2 }}>
                                            <Database size={12} />
                                            <Server size={12} />
                                            <span style={{ fontSize: '10px' }}>HANDSHAKE_OK</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key="enter-btn"
                                        className="enter-btn-premium"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleFinish}
                                    >
                                        <span>Initialize Experience</span>
                                        <ArrowRight size={22} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
