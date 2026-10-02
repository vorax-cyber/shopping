import { createToken } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();
  if (password === (process.env.ADMIN_PASSWORD || 'admin123')) {
    const token = await createToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_token', token, { httpOnly: true, path: '/' });
    return res;
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
