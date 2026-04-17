import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Crown, Truck, Store, TestTube, CheckCircle, ArrowRight } from 'lucide-react';
import './LoginTest.css';

const LoginTest = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const testCredentials = [
        // Admin
        { email: 'govardhan@gmail.com', password: 'govardhan@123', role: 'admin', icon: <Crown size={20} />, label: 'Admin Login' },
        { email: 'admin@codebite.com', password: 'admin123', role: 'admin', icon: <Crown size={20} />, label: 'Admin 2 Login' },
        
        // Riders
        { email: 'rider1', password: 'rider123', role: 'rider', icon: <Truck size={20} />, label: 'Rider 1 Login' },
        { email: 'rider2', password: 'rider123', role: 'rider', icon: <Truck size={20} />, label: 'Rider 2 Login' },
        
        // Merchant
        { email: 'merchant', password: 'merchant123', role: 'merchant', icon: <Store size={20} />, label: 'Merchant Login' },
        
        // Universal Users
        { email: 'user@test.com', password: 'test123', role: 'user', icon: <User size={20} />, label: 'Test User' },
        { email: 'john@example.com', password: 'password', role: 'user', icon: <User size={20} />, label: 'John Doe' },
        { email: 'any@email.com', password: 'anypassword', role: 'user', icon: <TestTube size={20} />, label: 'Universal Test' }
    ];

    const testLogin = async (email, password, expectedRole) => {
        setLoading(true);
        setTestResult(null);
        
        try {
            const result = await login(email, password);
            console.log('Login result:', result);
            
            if (result.ok) {
                setTestResult({
                    success: true,
                    message: `✅ Login successful! Role: ${result.user.role}`,
                    user: result.user
                });
                
                // Navigate based on role after a short delay
                setTimeout(() => {
                    if (result.user.role === 'admin') {
                        navigate('/admin');
                    } else if (result.user.role === 'rider') {
                        navigate('/rider/dashboard');
                    } else if (result.user.role === 'merchant') {
                        navigate('/merchant/dashboard');
                    } else {
                        navigate('/menu');
                    }
                }, 1500);
            } else {
                setTestResult({
                    success: false,
                    message: `❌ Login failed: ${result.error}`
                });
            }
        } catch (error) {
            setTestResult({
                success: false,
                message: `❌ Error: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-test-container">
            <div className="test-header glass">
                <h1>🧪 Login Testing Panel</h1>
                <p>Test all login credentials instantly</p>
            </div>

            <div className="credentials-grid">
                {testCredentials.map((cred, index) => (
                    <motion.div
                        key={index}
                        className="credential-card glass"
                        whileHover={{ y: -5 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="card-header">
                            <div className="role-icon" style={{ color: getRoleColor(cred.role) }}>
                                {cred.icon}
                            </div>
                            <div className="role-info">
                                <h3>{cred.label}</h3>
                                <span className="role-badge" style={{ backgroundColor: getRoleColor(cred.role) }}>
                                    {cred.role}
                                </span>
                            </div>
                        </div>
                        
                        <div className="credentials">
                            <div className="cred-field">
                                <User size={14} />
                                <span>{cred.email}</span>
                            </div>
                            <div className="cred-field">
                                <Lock size={14} />
                                <span>{cred.password}</span>
                            </div>
                        </div>
                        
                        <button
                            className="test-btn"
                            onClick={() => testLogin(cred.email, cred.password, cred.role)}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    Test Login
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </motion.div>
                ))}
            </div>

            {testResult && (
                <motion.div
                    className={`result-card glass ${testResult.success ? 'success' : 'error'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="result-content">
                        <CheckCircle size={24} />
                        <div>
                            <h3>{testResult.success ? 'Success!' : 'Failed!'}</h3>
                            <p>{testResult.message}</p>
                            {testResult.user && (
                                <div className="user-details">
                                    <p><strong>User:</strong> {testResult.user.name}</p>
                                    <p><strong>Email:</strong> {testResult.user.email}</p>
                                    <p><strong>Role:</strong> {testResult.user.role}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="instructions glass">
                <h3>📋 How to Use</h3>
                <ol>
                    <li>Click any "Test Login" button above</li>
                    <li>Watch the result below</li>
                    <li>Successful login will auto-navigate to the appropriate dashboard</li>
                    <li>Test different roles to explore all features</li>
                </ol>
                
                <div className="role-colors">
                    <div className="color-item">
                        <div className="color-dot" style={{ backgroundColor: '#ef4444' }}></div>
                        <span>Admin - Full access</span>
                    </div>
                    <div className="color-item">
                        <div className="color-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                        <span>Rider - Delivery access</span>
                    </div>
                    <div className="color-item">
                        <div className="color-dot" style={{ backgroundColor: '#8b5cf6' }}></div>
                        <span>Merchant - Restaurant access</span>
                    </div>
                    <div className="color-item">
                        <div className="color-dot" style={{ backgroundColor: '#3b82f6' }}></div>
                        <span>User - Basic access</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getRoleColor = (role) => {
    const colors = {
        admin: '#ef4444',
        rider: '#f59e0b',
        merchant: '#8b5cf6',
        user: '#3b82f6'
    };
    return colors[role] || '#6b7280';
};

export default LoginTest;
