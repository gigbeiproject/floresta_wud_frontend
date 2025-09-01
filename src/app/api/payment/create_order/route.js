import { NextResponse } from 'next/server';
import db from '../../../lib/db'; 
import Razorpay from 'razorpay';
import { verifyToken } from '../../../lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { addressId, productId, quantity = 1 } = body;

    if (!addressId || !productId || !quantity) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // ✅ Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "No token provided" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const userId = decoded.userId;

    // ✅ Verify address
    const [addressCheck] = await db.execute(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );
    if (addressCheck.length === 0) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

    // ✅ Get product
    const [products] = await db.execute(
      "SELECT id, name, price, stock, isDiscounted FROM product WHERE id = ? AND isArchived = 0",
      [productId]
    );
    if (products.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const product = products[0];

    if (product.stock < quantity) return NextResponse.json({ error: `Only ${product.stock} items available` }, { status: 400 });

    // ✅ Calculate price
    let unitPrice = product.price;
    if (product.isDiscounted === "PERCENT_20") unitPrice = product.price * 0.8;
    const totalAmount = unitPrice * quantity;

    // ✅ Razorpay order
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: orderId,
      notes: { orderId, productId, userId, quantity: quantity.toString() },
    });

    // ✅ Get connection from pool for transaction
    const connection = await db.getConnection(); // <-- this is important
    await connection.beginTransaction();

    try {
      await connection.execute(
        `INSERT INTO orders (
          id, user_id, product_id, address_id, quantity, unit_price, total_amount,
          payment_method, payment_status, order_status, razorpay_order_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ONLINE', 'PENDING', 'PENDING', ?, NOW(), NOW())`,
        [orderId, userId, productId, addressId, quantity, unitPrice, totalAmount, razorpayOrder.id]
      );

      const orderItemId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await connection.execute(
        `INSERT INTO order_items (
          id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [orderItemId, orderId, productId, product.name, quantity, unitPrice, totalAmount]
      );

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }

  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
