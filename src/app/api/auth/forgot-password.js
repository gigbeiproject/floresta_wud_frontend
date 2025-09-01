// File: pages/api/auth/forgot-password.js
import db from '../../../lib/db';
import { generateOTP } from '../../../lib/auth';
import { sendSMS } from '../../../lib/sms';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone } = req.body;

    // Validation
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Valid phone number is required' });
    }

    // Check if user exists
    const [users] = await db.execute(
      'SELECT id, name FROM users WHERE phone = ? AND is_active = TRUE',
      [phone]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found with this phone number' });
    }

    const user = users[0];

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Delete any existing OTPs for this user
    await db.execute(
      'DELETE FROM password_reset_otps WHERE user_id = ?',
      [user.id]
    );

    // Store OTP
    await db.execute(
      'INSERT INTO password_reset_otps (user_id, phone, otp, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, phone, otp, expiresAt]
    );

    // Send SMS
    const message = `Your WoodenStreet password reset code is: ${otp}. This code expires in 10 minutes.`;
    const smsResult = await sendSMS(phone, message);

    if (!smsResult.success) {
      console.error('SMS sending failed:', smsResult.error);
      return res.status(500).json({ message: 'Failed to send reset code' });
    }

    res.status(200).json({
      message: 'Password reset code sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}