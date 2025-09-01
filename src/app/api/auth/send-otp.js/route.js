// File: app/api/auth/send-otp/route.js
import db from '../../../lib/db';
import { NextResponse } from 'next/server';
import twilio from 'twilio';
import dotenv from 'dotenv';

// ✅ Load .env.local in development
dotenv.config();

// ✅ Read from env (no demo values)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Debug logs
console.log("Twilio SID:", TWILIO_ACCOUNT_SID || "missing");
console.log("Twilio Token:", TWILIO_AUTH_TOKEN ? "set" : "missing");
console.log("Twilio From:", TWILIO_PHONE_NUMBER || "missing");

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ message: 'Invalid phone number' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.execute('DELETE FROM otp_verifications WHERE phone = ?', [phone]);
    await db.execute(
      'INSERT INTO otp_verifications (phone, otp, expires_at, verified) VALUES (?, ?, ?, ?)',
      [phone, otp, expiresAt, 0]
    );

    // ✅ Twilio SMS
    const toNumber = `+91${phone}`;
    console.log("Sending OTP:", otp, "to", toNumber);

    const message = await twilioClient.messages.create({
      body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: toNumber,
    });

    console.log("Twilio Message SID:", message.sid);

    return NextResponse.json({ message: 'OTP sent successfully', phone }, { status: 200 });
  } catch (error) {
    console.error('Twilio error:', error.message || error);
    return NextResponse.json({ message: 'Failed to send OTP', error: error.message }, { status: 500 });
  }
}
