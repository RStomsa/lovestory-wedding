import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    let email = 'chure@lovestory.me';
    if (role === 'codau') {
      email = 'codau@lovestory.me';
    } else if (role === 'admin') {
      email = 'admin@lovestory.me';
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const bcrypt = (await import('bcryptjs')).default;
      const pwd = role === 'admin' ? 'Admin@LoveStory2026' : '123456';
      const passwordHash = await bcrypt.hash(pwd, 10);
      user = await prisma.user.create({
        data: {
          email,
          name: role === 'admin' ? 'Quản Trị Viên' : role === 'codau' ? 'Thùy Dương' : 'Anh Tuấn',
          role: role === 'admin' ? 'ADMIN' : 'USER',
          plan: role === 'admin' ? 'LIFETIME_VIP_200K' : role === 'codau' ? 'ANNUAL_50K' : 'FREE',
          passwordHash,
        },
      });
    }

    // Create real server session
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const { token, expiresAt } = await createSession(user.id, userAgent, ipAddress);

    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Đăng nhập demo thất bại' },
      { status: 500 }
    );
  }
}
