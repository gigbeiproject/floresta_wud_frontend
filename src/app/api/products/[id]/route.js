import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function GET(req, { params }) {
  const { id } = params; // product ID

  if (!id) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  try {
    // ✅ Fetch product with category
    const [products] = await db.execute(
      `SELECT p.*, c.name AS categoryName
       FROM product p
       JOIN category c ON p.categoryId = c.id
       WHERE p.id = ? AND p.isArchived = FALSE`,
      [id]
    );

    if (products.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    // ✅ Fetch related images
    const [images] = await db.execute(
      `SELECT id, url 
       FROM image 
       WHERE productId = ?`,
      [id]
    );

    // ✅ Attach images to product response
    product.images = images;

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
