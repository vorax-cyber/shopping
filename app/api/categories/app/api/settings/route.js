import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM settings');
    const settingsObj = {};
    rows.forEach(r => { settingsObj[r.key] = r.value; });
    return NextResponse.json(settingsObj);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
