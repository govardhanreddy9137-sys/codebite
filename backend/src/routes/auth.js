import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/bcrypt.js';
import { sendOTP } from '../utils/mailer.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes operational' });
});

// Check user status - helps frontend decide the next step (OTP vs Password)
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ ok: false, error: 'Email is required' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // New user
      return res.json({ ok: true, exists: false, role: 'employee' });
    }

    const hasPassword = user.password && !user.password.startsWith('temp_password_');
    res.json({ ok: true, exists: true, hasPassword, role: user.role });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to check user status' });
  }
});

// Main Login Route for all roles
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }
    
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Hardcoded / Special Logins for Admins and Staff
    
    // ADMIN (Govardhan)
    if (normalizedEmail === 'govardhan@gmail.com' && password === 'govardhan@123') {
      const token = generateToken({ id: '000000000000000000000002', email: normalizedEmail, role: 'admin' });
      return res.json({ ok: true, token, user: { id: '000000000000000000000002', email: normalizedEmail, name: 'Govardhan Reddy', role: 'admin' } });
    }

    // RAIDERS (Riders)
    if ((normalizedEmail === 'raider@gmail.com' || normalizedEmail === 'rider@gmail.com') && password === 'password@123') {
      const token = generateToken({ id: '000000000000000000000004', email: normalizedEmail, role: 'rider' });
      return res.json({ ok: true, token, user: { id: '000000000000000000000004', email: normalizedEmail, name: 'Standard Raider', role: 'rider' } });
    }

    // GENERAL STAFF / RESTAURANTS (Hotels) 
    // Format: name@gmail.com with password@123
    if (normalizedEmail.endsWith('@gmail.com') && password === 'password@123') {
        const prefix = normalizedEmail.split('@')[0];
        // Check if prefix is likely a restaurant name
        const isCommonEmail = ['test', 'user', 'example', 'govardhan', 'raider'].includes(prefix);
        
        if (!isCommonEmail) {
            const restaurantName = prefix.charAt(0).toUpperCase() + prefix.slice(1); // Capitalize
            const token = generateToken({ id: `temp_id_${prefix}`, email: normalizedEmail, role: 'merchant' });
            return res.json({ 
                ok: true, 
                token, 
                user: { 
                    id: `temp_id_${prefix}`, 
                    email: normalizedEmail, 
                    name: restaurantName, 
                    role: 'merchant',
                    restaurantName: restaurantName
                } 
            });
        }
    }

    // Standard hardcoded for reference (optional)
    if (normalizedEmail === 'admin@codebite.com' && password === 'admin123') {
        const token = generateToken({ id: '000000000000000000000003', email: normalizedEmail, role: 'admin' });
        return res.json({ ok: true, token, user: { id: '000000000000000000000003', email: normalizedEmail, name: 'Admin User', role: 'admin' } });
    }

    // 2. Database Lookup
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        console.warn(`Login attempt for non-existent user: ${normalizedEmail}`);
        return res.status(401).json({ ok: false, error: 'User not found. Please register first.' });
    }

    if (!user.password || typeof user.password !== 'string' || user.password.startsWith('temp_password_')) {
        console.warn(`Attempted login to unverified account: ${normalizedEmail}`);
        return res.status(401).json({ ok: false, error: 'Account not set up. Please verify via OTP first.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        console.warn(`Invalid password attempt for: ${normalizedEmail}`);
        return res.status(401).json({ ok: false, error: 'Incorrect password.' });
    }

    // Explicitly cast ID to string for JWT safety
    const userIdStr = user._id.toString();
    const token = generateToken({ id: userIdStr, email: user.email, role: user.role });
    
    console.log(`User authenticated successfully: ${normalizedEmail} (${user.role})`);
    
    res.json({ 
        ok: true, 
        token, 
        user: { 
            id: userIdStr, 
            email: user.email, 
            name: user.name, 
            role: user.role,
            restaurantName: user.role === 'merchant' ? user.name : undefined 
        } 
    });

  } catch (err) {
    console.error('CRITICAL LOGIN ERROR:', err);
    console.error('Stack Trace:', err.stack);
    res.status(500).json({ ok: false, error: 'Server error during login. Please try again later.' });
  }
});

// Send OTP for Register or Forgot Password
router.post('/send-otp', async (req, res) => {
  try {
    const { email, type = 'register' } = req.body; // type: 'register' or 'forgot'
    if (!email) return res.status(400).json({ ok: false, error: 'Email is required' });

    const normalizedEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let user = await User.findOne({ email: normalizedEmail });
    
    if (type === 'register' && user && user.password && !user.password.startsWith('temp_password_')) {
        return res.status(400).json({ ok: false, error: 'User already exists. Please login.' });
    }

    if (type === 'forgot' && !user) {
        return res.status(404).json({ ok: false, error: 'No account found with this email.' });
    }

    if (!user) {
        // Create skeleton for new user
        user = new User({
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            password: 'temp_password_' + Date.now(),
            role: 'employee'
        });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const mailRes = await sendOTP(normalizedEmail, otp);
    res.json({ ok: true, message: mailRes.message || 'OTP sent successfully!' });
  } catch (err) {
    console.error('Send OTP Critical Error:', err);
    res.status(500).json({ 
        ok: false, 
        error: `System Error: ${err.message || 'Verification service failed'}` 
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ ok: false, error: 'Email and OTP are required' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ ok: false, error: 'Invalid or expired OTP' });
    }

    // Clear OTP after verification but don't clear role or name
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ 
        ok: true, 
        message: 'OTP verified successfully',
        needsPassword: true // Always true for the flow we are building
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Verification error' });
  }
});

// Final Password Set (Register / Forgot Password completion)
router.post('/set-password', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

        user.password = password; // Hashed by pre-save
        await user.save();

        res.json({ ok: true, message: 'Password updated successfully. Please login.' });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Failed to update password' });
    }
});

export default router;
