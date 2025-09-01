// File: app/api/payment/cart_payment/route.js
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
    const { addressId, items } = body;

    if (!addressId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Address and items are required' }, { status: 400 });
    }

    // ✅ Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "No token provided" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const userId = decoded.userId;

    // ✅ Verify address belongs to user
    const [addressCheck] = await db.execute(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );
    if (addressCheck.length === 0) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

    // ✅ Generate orderId
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ✅ Open transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let totalAmount = 0;
      const orderItems = [];

      // Calculate total and prepare order_items
      for (const item of items) {
        const { productId, quantity } = item;

        // Fetch product
        const [products] = await connection.execute(
          "SELECT id, name, price, stock, isDiscounted FROM product WHERE id = ? AND isArchived = 0",
          [productId]
        );

        if (products.length === 0) throw new Error(`Product ${productId} not found`);
        const product = products[0];

        if (product.stock < quantity) throw new Error(`Only ${product.stock} units available for ${product.name}`);

        // Calculate price
        let unitPrice = product.price;
        if (product.isDiscounted === "PERCENT_20") unitPrice = product.price * 0.8;
        else if (product.isDiscounted === "PERCENT_30") unitPrice = product.price * 0.7;
        else if (product.isDiscounted === "PERCENT_40") unitPrice = product.price * 0.6;
        else if (product.isDiscounted === "PERCENT_50") unitPrice = product.price * 0.5;

        const totalPrice = unitPrice * quantity;
        totalAmount += totalPrice;

        orderItems.push({ product, quantity, unitPrice, totalPrice });
      }

      // ✅ Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
  amount: Math.round(totalAmount * 100), // paise
  currency: "INR",
  receipt: orderId,
  notes: { orderId, userId },
});


      // ✅ Insert order (parent)
      await connection.execute(
        `INSERT INTO orders
        (id, user_id, address_id, total_amount, payment_method, payment_status, order_status, razorpay_order_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'ONLINE', 'PENDING', 'PENDING', ?, NOW(), NOW())`,
        [orderId, userId, addressId, totalAmount, razorpayOrder.id]
      );

      // ✅ Insert order_items and update stock
      for (const item of orderItems) {
        const orderItemId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await connection.execute(
          `INSERT INTO order_items
          (id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [orderItemId, orderId, item.product.id, item.product.name, item.quantity, item.unitPrice, item.totalPrice]
        );

        await connection.execute(
          `UPDATE product SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.product.id]
        );
      }

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
