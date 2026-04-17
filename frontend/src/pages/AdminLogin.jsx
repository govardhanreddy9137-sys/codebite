import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, LogIn, Crown, Sparkles, ShieldCheck, AlertTriangle, Eye, EyeOff, Fingerprint, Key, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const normalizedEmail = email.trim().toLowerCase();

        const res = await login('admin', normalizedEmail, password);
        if (res.ok) {
            const role = res.user?.role;
            showToast(`Welcome ${role?.charAt(0).toUpperCase() + role?.slice(1)}! 🛡️`, 'success');
            
            if (role === 'admin') navigate('/admin');
            else if (role === 'merchant') navigate('/merchant/dashboard');
            else if (role === 'rider') navigate('/rider/dashboard');
            else navigate('/menu');
            return;
        }

        if (res.error) {
            setError(res.error);
            setIsLoading(false);
            return;
        }

        setError('Authentication failed.');
        setIsLoading(false);
    };

    return (
        <div className="admin-login-container">
            {/* Animated Background */}
            <div className="admin-bg-animation">
                <div className="bg-gradient-orb orb-1"></div>
                <div className="bg-gradient-orb orb-2"></div>
                <div className="bg-gradient-orb orb-3"></div>
                <div className="floating-shapes">
                    <motion.div
                        className="shape shape-1"
                        animate={{
                            y: [0, -30, 0],
                            rotate: [0, 180, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Shield size={40} />
                    </motion.div>
                    <motion.div
                        className="shape shape-2"
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -20, 0],
                            rotate: [0, -180, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    >
                        <Key size={30} />
                    </motion.div>
                    <motion.div
                        className="shape shape-3"
                        animate={{
                            x: [0, -40, 0],
                            y: [0, 30, 0],
                            rotate: [0, 360, 0]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    >
                        <Crown size={35} />
                    </motion.div>
                </div>
            </div>

            {/* Main Login Card */}
            <motion.div 
                className="admin-login-card"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Card Header */}
                <div className="admin-card-header">
                    <motion.div 
                        className="admin-logo"
                        initial={{ rotate: -180 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="logo-bg">
                            <ShieldCheck size={32} />
                        </div>
                        <div className="logo-glow">
                            <Sparkles size={20} />
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1>Admin <span>Portal</span></h1>
                        <p className="admin-subtitle">Secure System Access</p>
                    </motion.div>
                </div>

                {/* Security Badge */}
                <motion.div
                    className="security-badge"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Fingerprint size={16} />
                    <span>Military-Grade Encryption</span>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="admin-error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AlertTriangle size={18} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="admin-login-form">
                    <motion.div
                        className="admin-input-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <label className="admin-label">Administrator Email</label>
                        <div className={`admin-input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                            <div className="input-icon">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                className="admin-input"
                                placeholder="govardhan@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField('')}
                                required
                            />
                            <div className="input-glow"></div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="admin-input-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <label className="admin-label">Security Password</label>
                        <div className={`admin-input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                            <div className="input-icon">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="admin-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField('')}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <div className="input-glow"></div>
                        </div>
                    </motion.div>

                    <motion.button
                        type="submit"
                        className="admin-login-btn"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        {isLoading ? (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <span>Authenticating...</span>
                            </div>
                        ) : (
                            <>
                                <span>Access Dashboard</span>
                                <LogIn size={20} />
                                <div className="btn-glow"></div>
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <motion.div
                    className="admin-login-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <div className="footer-security">
                        <Shield size={14} />
                        <span>256-bit SSL Encrypted</span>
                    </div>
                    <div className="footer-divider">•</div>
                    <div className="footer-version">
                        <span>v2.0.1</span>
                    </div>
                </motion.div>

                {/* Return to Normal Login */}
                <motion.div
                    className="admin-login-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'center' }}
                >
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-btn"
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: '#FF3008', 
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <UserCircle size={16} />
                        Not an Admin? Employee Login
                    </button>
                </motion.div>

                {/* Decorative Elements */}
                <div className="card-decoration">
                    <div className="decoration-line line-1"></div>
                    <div className="decoration-line line-2"></div>
                    <div className="decoration-dot dot-1"></div>
                    <div className="decoration-dot dot-2"></div>
                </div>
            </motion.div>

            {/* Side Panel */}
            <motion.div
                className="admin-side-panel"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                <div className="side-content">
                    <motion.div
                        className="side-icon"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <Crown size={48} />
                    </motion.div>
                    <h3>Administrator Control</h3>
                    <p>Full system management with advanced analytics and real-time monitoring capabilities.</p>
                    <div className="side-features">
                        <div className="feature-item">
                            <ShieldCheck size={16} />
                            <span>Enhanced Security</span>
                        </div>
                        <div className="feature-item">
                            <Key size={16} />
                            <span>Role-Based Access</span>
                        </div>
                        <div className="feature-item">
                            <Sparkles size={16} />
                            <span>Real-time Analytics</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
