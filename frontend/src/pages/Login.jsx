import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Mail, Lock, LogIn, Shield, Info, LogOut, MessageCircle, Heart, KeyRound, MoveRight, CheckCircle2, UserCircle, RefreshCcw, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import './Login.css';

const LOGIN_STEPS = {
    EMAIL: 'EMAIL',
    REGISTER: 'REGISTER',
    OTP: 'OTP',
    SET_PASSWORD: 'SET_PASSWORD',
    PASSWORD: 'PASSWORD'
};

const Login = () => {
    const [step, setStep] = useState(LOGIN_STEPS.EMAIL);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [userRole, setUserRole] = useState('employee');
    const [showStaffPortals, setShowStaffPortals] = useState(false);
    
    const { login, logout, user, sendOTP, verifyOTP, setPassword: apiSetPassword, checkUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Clear error on step or mode change
    useEffect(() => {
        setError('');
    }, [step, showStaffPortals]);

    const handleLogout = () => {
        logout();
        setStep(LOGIN_STEPS.EMAIL);
        showToast('Logged out successfully', 'info');
    };

    const handleWhatsAppSupport = () => {
        const phoneNumber = '9023865544';
        const message = encodeURIComponent('Hello! I need help with CodeBite Login.');
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    // Step 1: Submit Email & Check Status
    const handleEmailSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setIsLoading(true);
        setError('');
        const normalizedEmail = email.trim().toLowerCase();

        try {
            const staffEmails = [
                'govardhan@gmail.com', 'raider@gmail.com', 'raider1@gmail.com',
                'rider@gmail.com', 'rider1@gmail.com',
                'ammachettivanta@gmail.com', 'kalpanahouse@gmail.com', 'homemadefood@gmail.com',
                'andhrameals@gmail.com', 'ammamagarriillu@gmail.com', 'tasteofpunjab@gmail.com'
            ];

            if (staffEmails.includes(normalizedEmail)) {
                setStep(LOGIN_STEPS.PASSWORD);
                setIsLoading(false);
                return;
            }

            const status = await checkUser(normalizedEmail);
            console.log('User status check:', status);

            if (status.ok) {
                if (status.exists && status.hasPassword) {
                    setStep(LOGIN_STEPS.PASSWORD);
                    setUserRole(status.role || 'employee');
                } else {
                    // New user or no password: Go to register flow
                    if (step !== LOGIN_STEPS.REGISTER) {
                        setStep(LOGIN_STEPS.REGISTER);
                        setName(normalizedEmail.split('@')[0]);
                    } else {
                        // Already in register mode: send OTP
                        const res = await sendOTP(normalizedEmail);
                        if (res.ok) {
                            showToast(res.message || 'Verification code sent! Check your inbox. 📧', 'success');
                            setStep(LOGIN_STEPS.OTP);
                        } else {
                            setError(res.error || 'Could not send verification code.');
                        }
                    }
                }
            } else {
                setError(status.error || 'Service temporarily unavailable');
            }
        } catch (err) {
            setError('Connection failed. Database timeout.');
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger Forgot Password flow
    const handleForgotPassword = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await sendOTP(email, 'forgot');
            if (res.ok) {
                showToast('Reset code sent! 🔑', 'success');
                setIsResettingPassword(true);
                setStep(LOGIN_STEPS.OTP);
            } else {
                setError(res.error || 'Failed to send reset code.');
            }
        } catch (err) {
            setError('Error requesting reset.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Handle OTP Verification
    const handleOTPVerify = async (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            setError('Enter the full 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await verifyOTP(email, otp);
            if (res.ok) {
                showToast(isResettingPassword ? 'Security verified. Choose a new password.' : 'Email verified! 🛡️', 'success');
                setStep(LOGIN_STEPS.SET_PASSWORD);
            } else {
                setError(res.error || 'Invalid or expired code. Please try again.');
            }
        } catch (err) {
            setError('Verification service error');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Set / Reset Password
    const handleSetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords must match exactly');
            return;
        }
        if (password.length < 6) {
            setError('Security tip: Use at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await apiSetPassword(email, password);
            if (res.ok) {
                showToast('Password secured! Redirecting to login...', 'success');
                setStep(LOGIN_STEPS.PASSWORD); // Direct to password entry for final login
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(res.error || 'Failed to update security credentials.');
            }
        } catch (err) {
            setError('Credential update failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 4: Final Password Login
    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await login(userRole, email, password);
            if (res.ok) {
                showToast(`Authenticated as ${res.user?.role || 'user'}. Welcome! 🍕`, 'success');
                redirectToDashboard(res.user?.role);
            } else {
                setError(res.error || 'Access denied. Incorrect password.');
            }
        } catch (err) {
            setError('Authentication service timed out');
        } finally {
            setIsLoading(false);
        }
    };

    const staffPortals = [
        { name: 'Admin', icon: <Shield size={16} />, color: '#EF4444' },
        { name: 'Merchant', icon: <Utensils size={16} />, color: '#F59E0B' },
        { name: 'Rider', icon: <MoveRight size={16} />, color: '#10B981' }
    ];

    const redirectToDashboard = (role) => {
        const routes = {
            admin: '/admin',
            rider: '/rider/dashboard',
            merchant: '/merchant/dashboard',
            employee: '/menu'
        };
        navigate(routes[role] || '/menu');
    };

    return (
        <div className="login-container">
            <div className="login-bg-circles">
                <motion.div className="circle circle-1" animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
                <motion.div className="circle circle-2" animate={{ scale: [1, 1.3, 1], x: [0, 30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
            </div>

            <motion.div 
                className="login-card-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="login-card">
                    <div className="login-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                        <div className="logo-icon-wrapper">
                            <Utensils color="white" size={24} />
                        </div>
                        <h1>Code<span style={{color: 'var(--primary)'}}>Bite</span></h1>
                    </div>

                    <div className="login-header">
                        <h2>
                            {step === LOGIN_STEPS.EMAIL && 'Welcome Back'}
                            {step === LOGIN_STEPS.REGISTER && 'Join CodeBite'}
                            {step === LOGIN_STEPS.OTP && 'Verify Identity'}
                            {step === LOGIN_STEPS.SET_PASSWORD && (isResettingPassword ? 'Reset Password' : 'Create Credentials')}
                            {step === LOGIN_STEPS.PASSWORD && 'Enter Password'}
                        </h2>
                        <p>
                            {step === LOGIN_STEPS.EMAIL && 'Elite culinary experiences for professionals.'}
                            {step === LOGIN_STEPS.REGISTER && 'Create your account to start your journey.'}
                            {step === LOGIN_STEPS.OTP && `Enter the 6-digit code sent to ${email}`}
                            {step === LOGIN_STEPS.SET_PASSWORD && 'Choose a strong password to protect your account.'}
                            {step === LOGIN_STEPS.PASSWORD && `Login to your ${userRole} account.`}
                        </p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="error-message">
                            <Info size={16} />
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === LOGIN_STEPS.EMAIL && !showStaffPortals && (
                            <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleEmailSubmit} className="login-form">
                                <div className="input-group">
                                    <label className="input-label">Corporate Email</label>
                                    <div className="input-field-wrapper">
                                        <Mail size={20} />
                                        <input type="email" className="input-field" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <motion.button type="submit" className="login-btn" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCcw size={20} /></motion.div> : <><span>Continue</span><MoveRight size={20} /></>}
                                </motion.button>
                            </motion.form>
                        )}
                        {step === LOGIN_STEPS.REGISTER && (
                            <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleEmailSubmit} className="login-form">
                                <div className="input-group">
                                    <label className="input-label">Full Name</label>
                                    <div className="input-field-wrapper">
                                        <UserCircle size={20} />
                                        <input type="text" className="input-field" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <div className="input-field-wrapper">
                                        <Mail size={20} />
                                        <input type="email" className="input-field" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <motion.button type="submit" className="login-btn" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCcw size={20} /></motion.div> : <><span>Create My Account</span><CheckCircle2 size={20} /></>}
                                </motion.button>
                                <button type="button" className="text-btn" onClick={() => setStep(LOGIN_STEPS.EMAIL)}>Already have an account? Login</button>
                            </motion.form>
                        )}

                        {step === LOGIN_STEPS.EMAIL && showStaffPortals && (
                            <motion.div key="staff-login" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="staff-login-view">
                                <div className="staff-role-indicator">
                                    <div className="role-dots">
                                        {staffPortals.map(p => (
                                            <div key={p.name} className="role-dot-item" style={{'--dot-color': p.color}}>
                                                <div className="dot"></div>
                                                <span>{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <h3>Staff Portal Login</h3>
                                </div>
                                
                                <form onSubmit={handlePasswordLogin} className="login-form">
                                    <div className="input-group">
                                        <label className="input-label">Staff Email</label>
                                        <div className="input-field-wrapper">
                                            <Mail size={20} />
                                            <input type="email" className="input-field" placeholder="staff@codebite.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Staff Password</label>
                                        <div className="input-field-wrapper">
                                            <Lock size={20} />
                                            <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        </div>
                                    </div>
                                    <motion.button type="submit" className="login-btn" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCcw size={20} /></motion.div> : <><span>Authorize Access</span><Shield size={20} /></>}
                                    </motion.button>
                                </form>

                                <button type="button" className="text-btn" onClick={() => setShowStaffPortals(false)}>
                                    Back to Employee Login
                                </button>
                            </motion.div>
                        )}

                        {step === LOGIN_STEPS.OTP && (
                            <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleOTPVerify} className="login-form">
                                <div className="input-group">
                                    <label className="input-label">One Time Password</label>
                                    <div className="input-field-wrapper">
                                        <KeyRound size={20} />
                                        <input type="text" className="input-field otp-input" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
                                    </div>
                                </div>
                                <motion.button type="submit" className="login-btn" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCcw size={20} /></motion.div> : <><span>Confirm Access</span><CheckCircle2 size={20} /></>}
                                </motion.button>
                                <button type="button" className="text-btn" onClick={() => setStep(LOGIN_STEPS.EMAIL)}>Incorrect Email?</button>
                            </motion.form>
                        )}

                        {step === LOGIN_STEPS.SET_PASSWORD && (
                            <motion.form key="set-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSetPassword} className="login-form">
                                <div className="input-group">
                                    <label className="input-label">New Password</label>
                                    <div className="input-field-wrapper">
                                        <Lock size={20} />
                                        <input type="password" className="input-field" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Re-enter Password</label>
                                    <div className="input-field-wrapper">
                                        <Lock size={20} />
                                        <input type="password" className="input-field" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <motion.button type="submit" className="login-btn" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCcw size={20} /></motion.div> : <><span>Finalize Security</span><Shield size={20} /></>}
                                </motion.button>
                            </motion.form>
                        )}

                        {step === LOGIN_STEPS.PASSWORD && (
                            <motion.form key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handlePasswordLogin} className="login-form">
                                <div className="input-group">
                                    <label className="input-label">Secret Token (Password)</label>
                                    <div className="input-field-wrapper">
                                        <Lock size={20} />
                                        <input type="password" className="input-field" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
                                    </div>
                                </div>
                                <motion.button type="submit" className="login-btn" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCcw size={20} /></motion.div> : <><span>Log In Now</span><LogIn size={20} /></>}
                                </motion.button>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                                    <button type="button" className="text-btn" onClick={() => setStep(LOGIN_STEPS.EMAIL)}>Not you?</button>
                                    <button type="button" className="text-btn" onClick={handleForgotPassword}>Retrieve Password?</button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="login-footer">
                        {step === LOGIN_STEPS.EMAIL && !showStaffPortals ? (
                            <div className="footer-actions">
                                <span className="register-prompt">
                                    New here? <button type="button" className="text-btn register-link" onClick={() => setStep(LOGIN_STEPS.REGISTER)}>Join Now</button>
                                </span>
                                
                                <button type="button" className="staff-toggle-btn-global" onClick={() => navigate('/menu')}>
                                    <Home size={14} /> Back to Home
                                </button>
                                
                                <button type="button" className="staff-toggle-btn-global" onClick={() => setShowStaffPortals(true)}>
                                    <Shield size={14} /> Staff Access
                                </button>
                            </div>
                        ) : (
                            <button type="button" className="staff-toggle-btn-global" onClick={() => {
                                setShowStaffPortals(false);
                                setStep(LOGIN_STEPS.EMAIL);
                            }}>
                                <UserCircle size={14} /> Back to Entry
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
