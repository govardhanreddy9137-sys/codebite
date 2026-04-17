import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Mail, Lock, LogIn, Shield, Info, LogOut, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import './Login.css'; // We'll keep Login.css for Employee for now or rename it later

const EmployeeLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login, logout, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        console.log('User logged out successfully');
    };

    const handleWhatsAppSupport = () => {
        const phoneNumber = '9023865544';
        const message = 'Test';
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const normalizedEmail = email.trim().toLowerCase();

        // Pass 'employee' role explicitly
        const res = await login('employee', normalizedEmail, password);
        if (res.ok) {
            showToast(`Welcome back, ${res.user?.name || 'User'}! 🍕`, 'success');
            navigate('/menu');
            return;
        }

        if (res.error) {
            setError(res.error);
            setIsLoading(false);
            return;
        }

        setError('Login failed. Please try again.');
        setIsLoading(false);
    };

    return (
        <div className="login-container employee-theme">
            <div className="login-bg-circles">
                <motion.div 
                    className="circle circle-1"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                    className="circle circle-2"
                    animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
            </div>

            <motion.div 
                className="login-card-container"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="login-card">
                    <div className="login-logo">
                        <div className="logo-icon-wrapper">
                            <Utensils color="white" size={24} />
                        </div>
                        <h1>Code<span style={{color: '#FF3008'}}>Bite</span></h1>
                    </div>

                    <div className="login-header">
                        <h2>Employee Login</h2>
                        <p>Fuel your productivity with great food</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <Info size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-field-wrapper">
                                <Mail size={20} />
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="employee@codebite.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-field-wrapper">
                                <Lock size={20} />
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <motion.button 
                            type="submit" 
                            className="login-btn"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                    <Utensils size={20} />
                                </motion.div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="login-footer">
                        <div className="hint-badge">
                            <Shield size={14} />
                            <span>Safe & Secure login</span>
                        </div>
                        
                        <button onClick={handleWhatsAppSupport} className="whatsapp-support-btn">
                            <MessageCircle size={16} />
                            Need Help? Chat on WhatsApp
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmployeeLogin;
