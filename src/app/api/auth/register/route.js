// File: app/api/auth/register/route.js
import db from '../../../lib/db';
import { NextResponse } from 'next/server';
import { hashPassword, generateToken, getTokenHash } from '../../../lib/auth';

export async function POST(request) {
  try {
    const { name, phone, email, password, otp } = await request.json();

    if (!name || !phone || !password || !otp) {
      return NextResponse.json(
        { message: 'All fields (name, phone, password, otp) are required' },
        { status: 400 }
      );
    }

    // Validate phone
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }

    // Check OTP
    const [otpRows] = await db.execute(
      'SELECT * FROM otp_verifications WHERE phone = ? AND otp = ? AND expires_at > NOW() AND verified = 0',
      [phone, otp]
    );

    if (otpRows.length === 0) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark OTP as verified
    await db.execute('UPDATE otp_verifications SET verified = 1 WHERE id = ?', [otpRows[0].id]);

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email = ?)',
      [phone, email || '']
    );

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (name, phone, email, password_hash, is_verified) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email || null, passwordHash, true]
    );

    const userId = result.insertId;

    // Create session
    const token = generateToken(userId);
    const tokenHash = getTokenHash(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.execute(
      'INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        tokenHash,
        request.headers.get('user-agent') || '',
        request.headers.get('x-forwarded-for') || '',
        expiresAt
      ]
    );

    return NextResponse.json(
      {
        message: 'User registered successfully',
        token,
        user: { id: userId, name, phone, email }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Server error during registration', error: error.message },
      { status: 500 }
    );
  }
}
