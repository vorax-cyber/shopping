import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
