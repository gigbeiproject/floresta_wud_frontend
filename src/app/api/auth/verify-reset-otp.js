// File: pages/api/auth/verify-reset-otp.js
import db from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone, otp } = req.body;

    // Validation
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' });
    }

    // Find valid OTP
    const [otps] = await db.execute(
      'SELECT * FROM password_reset_otps WHERE phone = ? AND otp = ? AND expires_at > NOW() AND is_used = FALSE',
      [phone, otp]
    );

    if (otps.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    res.status(200).json({
      message: 'Reset code verified successfully'
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}