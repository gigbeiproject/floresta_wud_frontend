// File: lib/middleware.js
import { verifyToken, getTokenHash } from './auth';
import db from './db';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if session exists in database
    const tokenHash = getTokenHash(token);
    const [sessions] = await db.execute(
      'SELECT * FROM user_sessions WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()',
      [decoded.userId, tokenHash]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ message: 'Session expired' });
    }

    // Get user details
    const [users] = await db.execute(
      'SELECT id, name, phone, email, is_verified, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};