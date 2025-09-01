// File: app/api/orders/cod/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';               // MySQL2 pool
import { verifyToken } from '../../../lib/auth'; // must return { userId }

export async function POST(request) {
  try {
    const body = await request.json();
    const { addressId, productId, quantity = 1 } = body;

    // ✅ Validation
    if (!addressId || !productId || !quantity) {
      return NextResponse.json(
        { error: 'Address ID, Product ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // ✅ Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token); // should return { userId }
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

    // ✅ Get product details
    const [products] = await db.execute(
      `SELECT id, name, price, stock, isDiscounted
       FROM product 
       WHERE id = ? AND isArchived = 0`,
      [productId]
    );

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    const product = products[0];

    // ✅ Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      );
    }

    // ✅ Calculate price with discount
    let unitPrice = product.price;
    if (product.isDiscounted === 'PERCENT_20') {
      unitPrice = product.price * 0.8;
    }

    const totalAmount = unitPrice * quantity;

    // ✅ Generate IDs
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderItemId = `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ✅ Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insert into orders
      const orderQuery = `
        INSERT INTO orders (
          id, user_id, product_id, address_id, quantity, unit_price, total_amount,
          payment_method, payment_status, order_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'COD', 'PENDING', 'CONFIRMED', NOW(), NOW())
      `;
      await connection.execute(orderQuery, [
        orderId, userId, productId, addressId, quantity, unitPrice, totalAmount
      ]);

      // Insert into order_items
      const orderItemQuery = `
        INSERT INTO order_items (
          id, order_id, product_id, product_name, quantity, unit_price, total_price, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      await connection.execute(orderItemQuery, [
        orderItemId, orderId, productId, product.name, quantity, unitPrice, totalAmount
      ]);

      // Update stock
      await connection.execute(
        'UPDATE product SET stock = stock - ? WHERE id = ?',
        [quantity, productId]
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Order placed successfully! You will pay on delivery.',
        order: {
          orderId,
          totalAmount,
          paymentMethod: 'COD',
          status: 'CONFIRMED'
        }
      }, { status: 201 });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('COD order error:', error);
    return NextResponse.json(
      { error: 'Failed to place order', details: error.message },
      { status: 500 }
    );
  }
}
