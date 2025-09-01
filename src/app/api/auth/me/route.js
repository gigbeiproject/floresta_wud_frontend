// File: app/api/auth/me/route.js
import { verifyToken, getTokenHash } from "../../../lib/auth";
import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Check session in DB
    const tokenHash = getTokenHash(token);
    const [sessions] = await db.execute(
      "SELECT * FROM user_sessions WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()",
      [decoded.userId, tokenHash]
    );

    if (sessions.length === 0) {
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }

    // Get user details
    const [users] = await db.execute(
      "SELECT id, name, phone, email, is_verified, is_active FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return NextResponse.json({ message: "User not found or inactive" }, { status: 401 });
    }

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.error("Auth route error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
