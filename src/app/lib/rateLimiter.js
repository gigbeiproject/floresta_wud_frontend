// File: lib/rateLimiter.js
import db from './db';

class RateLimiter {
  static async checkLoginAttempts(phone, ipAddress) {
    try {
      const [attempts] = await db.execute(
        `SELECT COUNT(*) as count 
         FROM login_attempts 
         WHERE phone = ? AND ip_address = ? 
         AND is_successful = FALSE 
         AND attempted_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [phone, ipAddress]
      );
      
      return attempts[0].count >= 5;
    } catch (error) {
      console.error('Rate limiter error:', error);
      return false;
    }
  }

  static async logLoginAttempt(phone, ipAddress, isSuccessful) {
    try {
      await db.execute(
        'INSERT INTO login_attempts (phone, ip_address, is_successful) VALUES (?, ?, ?)',
        [phone, ipAddress, isSuccessful]
      );
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  }

  static async checkOTPAttempts(phone, ipAddress) {
    try {
      const [attempts] = await db.execute(
        `SELECT COUNT(*) as count 
         FROM password_reset_otps 
         WHERE phone = ? 
         AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [phone]
      );
      
      return attempts[0].count >= 3;
    } catch (error) {
      console.error('OTP rate limiter error:', error);
      return false;
    }
  }
}

export default RateLimiter;