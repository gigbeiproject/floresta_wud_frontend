// File: app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import db from '../../lib/db';
import { getTokenHash } from '../../lib/auth';

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 400 });
    }

    const tokenHash = getTokenHash(token);

    // Delete session from DB
    await db.execute(
      'DELETE FROM user_sessions WHERE token_hash = ?',
      [tokenHash]
    );

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
