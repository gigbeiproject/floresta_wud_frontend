// File: src/app/api/auth/login/route.js
import db from '../../../lib/db';
import { comparePassword, generateToken, getTokenHash } from '../../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, password } = body;
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Validation
    if (!phone || !password) {
      return NextResponse.json({ message: 'Phone and password are required' }, { status: 400 });
    }

    // Check rate limiting
    const [attempts] = await db.execute(
      'SELECT COUNT(*) as count FROM login_attempts WHERE phone = ? AND ip_address = ? AND is_successful = FALSE AND attempted_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      [phone, clientIp]
    );

    if (attempts[0].count >= 5) {
      return NextResponse.json({ message: 'Too many failed login attempts. Please try again later.' }, { status: 429 });
    }

    // Find user
    const [users] = await db.execute(
      'SELECT id, name, phone, email, password_hash, is_verified, is_active FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      await db.execute(
        'INSERT INTO login_attempts (phone, ip_address, is_successful) VALUES (?, ?, FALSE)',
        [phone, clientIp]
      );
      return NextResponse.json({ message: 'Invalid phone or password' }, { status: 401 });
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json({ message: 'Account is deactivated' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      await db.execute(
        'INSERT INTO login_attempts (phone, ip_address, is_successful) VALUES (?, ?, FALSE)',
        [phone, clientIp]
      );
      return NextResponse.json({ message: 'Invalid phone or password' }, { status: 401 });
    }

    // Log success
    await db.execute(
      'INSERT INTO login_attempts (phone, ip_address, is_successful) VALUES (?, ?, TRUE)',
      [phone, clientIp]
    );

    // Generate token
    const token = generateToken(user.id);
    const tokenHash = getTokenHash(token);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.execute(
      'INSERT INTO user_sessions (user_id, token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)',
      [user.id, tokenHash, req.headers.get('user-agent') || '', clientIp, expiresAt]
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isVerified: user.is_verified
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error during login' }, { status: 500 });
  }
}
