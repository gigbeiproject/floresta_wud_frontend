import db from '../../../lib/db';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone, otp, newPassword } = req.body;

    // Validation
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ message: 'Phone, OTP, and new password are required' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find valid OTP
    const [otps] = await db.execute(
      'SELECT user_id FROM password_reset_otps WHERE phone = ? AND otp = ? AND expires_at > NOW() AND is_used = FALSE',
      [phone, otp]
    );

    if (otps.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    const userId = otps[0].user_id;

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await db.execute(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [passwordHash, userId]
    );

    // Mark OTP as used
    await db.execute(
      'UPDATE password_reset_otps SET is_used = TRUE WHERE phone = ? AND otp = ?',
      [phone, otp]
    );

    // Invalidate all existing sessions for this user
    await db.execute(
      'DELETE FROM user_sessions WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
