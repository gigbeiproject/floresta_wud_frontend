// File: app/api/payment/verify_payment/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import crypto from 'crypto';
import { verifyToken } from '../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Payment verification data missing' },
        { status: 400 }
      );
    }

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "No token provided" }, { status: 401 });
    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.userId;

    // Fetch order
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orders[0];

    if (order.payment_status === 'PAID') {
      return NextResponse.json(
        { error: 'Payment already verified' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpay_order_id}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      // Mark payment as failed
      await db.execute(
        'UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?',
        ['FAILED', orderId]
      );
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update order status
      await connection.execute(
        `UPDATE orders 
         SET payment_status = 'PAID', order_status = 'CONFIRMED',
             payment_id = ?, payment_signature = ?, updated_at = NOW()
         WHERE id = ?`,
        [paymentId, signature, orderId]
      );

      // Update stock for each order item
      const [items] = await connection.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );

      for (const item of items) {
        await connection.execute(
          'UPDATE product SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      connection.release();

      // Optionally, send order confirmation email/SMS
      await sendOrderConfirmation(userId, orderId, 'ONLINE');

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        order: {
          orderId,
          paymentId,
          status: 'CONFIRMED',
          amount: order.total_amount
        }
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', details: error.message },
      { status: 500 }
    );
  }
}

// Placeholder for sending order confirmation
async function sendOrderConfirmation(userId, orderId, method) {
  console.log(`Send confirmation to user ${userId} for order ${orderId} via ${method}`);
}
