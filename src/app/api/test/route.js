// app/api/test/route.js
import db from '../../lib/db';

export async function GET() {
  try {
    // Test DB connection
    const [rows] = await db.query('SELECT NOW() AS now'); // simple query
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'API is working!', 
        server_time: rows[0].now,
        DB_HOST: process.env.DB_HOST || 'not set'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('DB connection error:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Database connection failed', 
        error: error.message,
        DB_HOST: process.env.DB_HOST || 'not set'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
    