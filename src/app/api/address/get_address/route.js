// File: app/api/addresses/route.js
import { NextResponse } from "next/server";
import { verifyToken, getTokenHash } from "../../../lib/auth"; // same as in auth/me
import db from "../../../lib/db";

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check session in DB (same as /auth/me route)
    const tokenHash = getTokenHash(token);
    const [sessions] = await db.execute(
      "SELECT * FROM user_sessions WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()",
      [decoded.userId, tokenHash]
    );

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Fetch addresses for this user
    const [addresses] = await db.execute(
      `SELECT 
        id,
        name,
        phone,
        address,
        city,
        state,
        pincode,
        is_default,
        created_at,
        updated_at
       FROM addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, created_at DESC`,
      [decoded.userId]
    );

    return NextResponse.json({
      success: true,
      addresses,
      count: addresses.length,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses", details: error.message },
      { status: 500 }
    );
  }
}
