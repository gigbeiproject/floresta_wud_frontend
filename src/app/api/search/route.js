import { NextResponse } from 'next/server';
import db from '../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    // Search in product name and optionally description
    const [products] = await db.execute(
      `SELECT id, name, price, stock, isDiscounted 
       FROM product 
       WHERE isArchived = 0 AND (name LIKE ? OR description LIKE ?)
       LIMIT 50`,
      [`%${query}%`, `%${query}%`]
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 });
  }
}
