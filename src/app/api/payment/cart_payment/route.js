// File: app/api/orders/cod/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
     console.log("📥 Incoming body:", body);

    const { addressId, items } = body;

    // ✅ Validate
    if (!addressId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Address ID and items are required' },
        { status: 400 }
      );
    }

    // ✅ Get token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = decoded.userId;

    // ✅ Verify address belongs to user
    const [addressCheck] = await db.execute(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );
    if (addressCheck.length === 0) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
    }

    // ✅ Generate orderId
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ✅ Open transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let totalAmount = 0;
      const orderItems = [];

      // ✅ Insert order first (with total = 0)
      await connection.execute(
        `INSERT INTO orders 
         (id, user_id, address_id, total_amount, payment_method, payment_status, order_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'COD', 'PENDING', 'CONFIRMED', NOW(), NOW())`,
        [orderId, userId, addressId, 0]
      );

      // ✅ Loop items
      for (const item of items) {
        const { productId, quantity } = item;

        // Fetch product
        const [products] = await connection.execute(
          `SELECT id, name, price, stock, isDiscounted 
           FROM product 
           WHERE id = ? AND isArchived = 0`,
          [productId]
        );

        if (products.length === 0) {
          throw new Error(`Product ${productId} not found`);
        }

        const product = products[0];

        // Stock check
        if (product.stock < quantity) {
          throw new Error(`Only ${product.stock} units available for ${product.name}`);
        }

        // Pricing
        let unitPrice = product.price;
        if (product.isDiscounted === 'PERCENT_20') {
          unitPrice = product.price * 0.8;
        } else if (product.isDiscounted === 'PERCENT_30') {
          unitPrice = product.price * 0.7;
        } else if (product.isDiscounted === 'PERCENT_40') {
          unitPrice = product.price * 0.6;
        } else if (product.isDiscounted === 'PERCENT_50') {
          unitPrice = product.price * 0.5;
        }

        const itemTotal = unitPrice * quantity;
        totalAmount += itemTotal;

        const orderItemId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        orderItems.push({
          id: orderItemId,
          productId,
          name: product.name,
          quantity,
          unitPrice,
          total: itemTotal
        });

        // Insert into order_items
        await connection.execute(
          `INSERT INTO order_items 
           (id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [orderItemId, orderId, productId, product.name, quantity, unitPrice, itemTotal]
        );

        // Update stock
        await connection.execute(
          'UPDATE product SET stock = stock - ? WHERE id = ?',
          [quantity, productId]
        );
      }

      // ✅ Update total_amount in orders
      await connection.execute(
        'UPDATE orders SET total_amount = ? WHERE id = ?',
        [totalAmount, orderId]
      );

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: 'Order placed successfully (COD)',
        order: {
          orderId,
          totalAmount,
          items: orderItems,
          paymentMethod: 'COD',
          status: 'CONFIRMED'
        }
      }, { status: 201 });

    } catch (err) {
      await connection.rollback();
      connection.release();
      console.error("Transaction error:", err);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

  } catch (error) {
    console.error('COD order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
