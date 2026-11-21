import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, invalidateSession, deleteSessionCookie } from '@/lib/auth/session';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await invalidateSession(token);
    }

    await deleteSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Đăng xuất thất bại' },
      { status: 500 }
    );
  }
}
