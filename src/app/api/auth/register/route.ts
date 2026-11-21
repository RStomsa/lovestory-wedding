import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone?.trim() || null,
        passwordHash,
        role: 'USER',
        plan: 'FREE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
      },
    });

    // Create session
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const { token, expiresAt } = await createSession(user.id, userAgent, ipAddress);

    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Đăng ký thất bại. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
