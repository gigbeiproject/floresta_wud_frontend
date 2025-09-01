// File: app/api/addresses/route.js
import { NextResponse } from "next/server";
import { verifyToken, getTokenHash } from "../../../lib/auth";
import db from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, city, state, pincode, isDefault = false } = body;

    // Validation
    if (!name || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Please enter a valid 10-digit phone number" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: "Please enter a valid 6-digit pincode" }, { status: 400 });
    }

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Validate session
    const tokenHash = getTokenHash(token);
    const [sessions] = await db.execute(
      "SELECT * FROM user_sessions WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()",
      [decoded.userId, tokenHash]
    );

    if (sessions.length === 0) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const userId = decoded.userId;

    // Generate unique address ID
    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // If this is set as default, clear existing defaults
    if (isDefault) {
      await db.execute("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [userId]);
    }

    // If no addresses exist, make this one default
    const [countRows] = await db.execute(
      "SELECT COUNT(*) as count FROM addresses WHERE user_id = ?",
      [userId]
    );
    const shouldBeDefault = isDefault || countRows[0].count === 0;

    // Insert new address
    await db.execute(
      `INSERT INTO addresses 
        (id, user_id, name, phone, address, city, state, pincode, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        addressId,
        userId,
        name.trim(),
        phone.trim(),
        address.trim(),
        city.trim(),
        state.trim(),
        pincode.trim(),
        shouldBeDefault,
      ]
    );

    // Fetch newly created address
    const [rows] = await db.execute("SELECT * FROM addresses WHERE id = ?", [addressId]);

    return NextResponse.json(
      {
        success: true,
        message: "Address added successfully",
        address: rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add address error:", error);
    return NextResponse.json(
      { error: "Failed to add address", details: error.message },
      { status: 500 }
    );
  }
}
