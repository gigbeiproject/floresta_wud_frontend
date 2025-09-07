import { NextResponse } from "next/server";
import db from "../../lib/db"; // adjust path if needed

// ✅ GET all categories
export async function GET() {
  try {
    const [rows] = await db.execute("SELECT * FROM category ORDER BY createdAt DESC");

    return NextResponse.json({
      success: true,
      categories: rows,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories", details: error.message },
      { status: 500 }
    );
  }
}
