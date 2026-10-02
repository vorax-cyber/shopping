import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer_name, phone, wilaya, commune, address, total_price, items } = body;
    const { rows } = await pool.query(
      'INSERT INTO orders (customer_name, phone, wilaya, commune, address, total_price, items) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [customer_name, phone, wilaya, commune, address, total_price, JSON.stringify(items)]
    );
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
