import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import './BaseLogin.css';

const BaseLogin = ({ 
  role, 
  title, 
  subtitle, 
  icon: Icon, 
  primaryColor, 
  secondaryColor, 
  gradientColors,
  loginPath,
  dashboardPath,
  welcomeMessage,
  buttonText,
  placeholderEmail = "your@email.com",
  placeholderPassword = "••••••••"
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const normalizedEmail = email.trim().toLowerCase();

    try {
      console.log('BaseLogin: Attempting login for role:', role, 'email:', normalizedEmail);
      const res = await login(role, normalizedEmail, password);
      console.log('BaseLogin: Login response:', res);
      
      if (res.ok) {
        // Role validation - more lenient for development
        if (role && res.user?.role !== role) {
          console.warn('Role mismatch:', { expected: role, actual: res.user?.role });
          // For development, allow login if user exists but has different role
          // In production, you might want to be stricter
          if (res.user?.role) {
            showToast(`Logged in as ${res.user.role}. Redirecting...`, 'info');
            // Redirect to appropriate dashboard based on actual role
            const roleDashboardMap = {
              'admin': '/admin/dashboard',
              'merchant': '/merchant/dashboard', 
              'rider': '/raider/dashboard',
              'user': '/'
            };
            const actualDashboard = roleDashboardMap[res.user.role] || '/';
            navigate(actualDashboard);
            setIsLoading(false);
            return;
          }
          setError(`Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)} account required.`);
          setIsLoading(false);
          return;
        }
        
        showToast(welcomeMessage || `Welcome back, ${res.user?.name || 'User'}!`, 'success');
        navigate(dashboardPath);
        return;
      }

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
        return;
      }

      setError('Authentication failed.');
    } catch (err) {
      console.error('BaseLogin: Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="base-login-container" style={{ '--primary-color': primaryColor, '--secondary-color': secondaryColor }}>
      {/* Animated Background */}
      <div className="base-login-bg">
        <div className="bg-orb orb-1" style={{ background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})` }}></div>
        <div className="bg-orb orb-2" style={{ background: `linear-gradient(135deg, ${gradientColors[1]}, ${gradientColors[2]})` }}></div>
        <div className="bg-orb orb-3" style={{ background: `linear-gradient(135deg, ${gradientColors[2]}, ${gradientColors[0]})` }}></div>
      </div>

      <motion.div 
        className="base-login-card"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Card Header */}
        <div className="base-login-header">
          <motion.div 
            className="base-login-icon"
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="icon-bg" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
              <Icon size={32} />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1>{title}</h1>
            <p className="base-login-subtitle">{subtitle}</p>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="base-login-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="base-login-form">
          <div className="base-input-group">
            <label className="base-input-label">Email Address</label>
            <div className="base-input-wrapper">
              <div className="input-icon">
                <Mail size={20} />
              </div>
              <input
                type="text"
                className="base-input"
                placeholder={placeholderEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="input-glow"></div>
            </div>
          </div>

          <div className="base-input-group">
            <label className="base-input-label">Password</label>
            <div className="base-input-wrapper">
              <div className="input-icon">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="base-input"
                placeholder={placeholderPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <motion.button
            type="submit"
            className="base-login-btn"
            disabled={isLoading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>{buttonText || "Sign In"}</span>
                <LogIn size={20} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          className="base-login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="footer-security">
            <Lock size={14} />
            <span>Secure Connection</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BaseLogin;
