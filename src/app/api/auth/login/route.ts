import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Auto-provision standard admin/demo accounts if database is fresh
    if (!user) {
      if (cleanEmail === 'admin@lovestory.me' && password === 'Admin@LoveStory2026') {
        const bcrypt = (await import('bcryptjs')).default;
        const passwordHash = await bcrypt.hash('Admin@LoveStory2026', 10);
        user = await prisma.user.create({
          data: {
            email: 'admin@lovestory.me',
            name: 'Quản Trị Viên',
            role: 'ADMIN',
            plan: 'LIFETIME_VIP_200K',
            passwordHash,
          },
        });
      } else if ((cleanEmail === 'chure@lovestory.me' || cleanEmail === 'codau@lovestory.me') && password === '123456') {
        const bcrypt = (await import('bcryptjs')).default;
        const passwordHash = await bcrypt.hash('123456', 10);
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: cleanEmail === 'chure@lovestory.me' ? 'Anh Tuấn' : 'Thùy Dương',
            role: 'USER',
            plan: cleanEmail === 'chure@lovestory.me' ? 'FREE' : 'ANNUAL_50K',
            passwordHash,
          },
        });
      }
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // Create session
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Đăng nhập thất bại. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
