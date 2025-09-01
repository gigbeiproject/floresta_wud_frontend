import { NextResponse } from 'next/server';
import db from '../../lib/db';

export async function GET() {
  try {
    // 1. Get products
    const [products] = await db.execute(`
      SELECT p.*, c.name AS categoryName
      FROM \`product\` p
      JOIN \`category\` c ON p.categoryId = c.id
      WHERE p.isArchived = 0
    `);

    if (products.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // 2. Get all product images for these products
    const productIds = products.map(p => p.id);
    const [images] = await db.execute(
      `SELECT * FROM \`image\` WHERE productId IN (${productIds.map(() => '?').join(',')})`,
      productIds
    );

    // 3. Attach images to products
    const productsWithImages = products.map(product => ({
      ...product,
      images: images.filter(img => img.productId === product.id)
    }));

    return NextResponse.json({ products: productsWithImages });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
