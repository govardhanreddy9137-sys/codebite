import jwt from 'jsonwebtoken';

export const generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('verifyToken: token =', token);
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('verifyToken: decoded =', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};