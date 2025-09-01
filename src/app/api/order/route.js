import { NextResponse } from 'next/server';
import db from '../../lib/db';
import { verifyToken } from '../../lib/auth';

export async function GET(req) {
  try {
    // --- Auth ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decoded.userId;

    // --- Fetch Orders ---
    const ordersQuery = `
      SELECT 
        o.id,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.created_at,
        o.updated_at,
        a.name AS delivery_name,
        a.address AS delivery_address,
        a.city,
        a.state,
        a.pincode,
        a.phone AS delivery_phone
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    const [orders] = await db.execute(ordersQuery, [userId]);

    // --- Fetch Items for each Order ---
    const formattedOrders = [];
    for (const order of orders) {
      const itemsQuery = `
        SELECT 
          oi.id,
          oi.product_id,
          oi.product_name,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
          (SELECT i.url FROM image i WHERE i.productId = oi.product_id LIMIT 1) AS image
        FROM order_items oi
        WHERE oi.order_id = ?
      `;
      const [items] = await db.execute(itemsQuery, [order.id]);

      formattedOrders.push({
        ...order,
        items: items.map(item => ({
          id: item.id,
          productId: item.product_id,
          name: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          image: item.image || null
        }))
      });
    }

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}
