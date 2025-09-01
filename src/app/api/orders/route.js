import pool from '../../lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, addressId, totalAmount, paymentStatus, orderStatus, paymentMethod, address } = body;

    if (!userId || !totalAmount || (!addressId && !address)) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let finalAddressId = addressId;

    // If addressId not provided, create new address
    if (!addressId && address) {
      finalAddressId = crypto.randomUUID();
      const addressQuery = `
        INSERT INTO Address (id, userId, fulladdress, city, state, country, pincode, isShippingAddress)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.execute(addressQuery, [
        finalAddressId,
        userId,
        address.fulladdress,
        address.city,
        address.state,
        address.country,
        address.pincode,
        address.isShippingAddress ? 1 : 0
      ]);
    }

    // Create order
    const orderId = crypto.randomUUID();
    const orderQuery = `
      INSERT INTO Orders (id, userId, addressId, totalAmount, paymentStatus, orderStatus, paymentMethod)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.execute(orderQuery, [
      orderId,
      userId,
      finalAddressId,
      totalAmount,
      paymentStatus || 'pending',
      orderStatus || 'pending',
      paymentMethod || 'COD'
    ]);

    return NextResponse.json({
      message: 'Order created successfully',
      orderId,
      addressId: finalAddressId
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
