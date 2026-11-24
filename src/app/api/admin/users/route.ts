import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Returns list of users with sites, orders, and sessions count
 */
export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
        sites: {
          select: { id: true, title: true, slug: true, status: true, viewCount: true },
        },
        purchasedTemplates: {
          select: { templateId: true },
        },
        sessions: {
          select: { id: true, createdAt: true, expiresAt: true, ipAddress: true, userAgent: true },
        },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách người dùng' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Create a new user directly from Admin console
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, phone, role, plan } = body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã tồn tại trong hệ thống LoveStory' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password.trim());

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone?.trim() || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        plan: plan || 'FREE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
        sites: {
          select: { id: true, title: true, slug: true, status: true, viewCount: true },
        },
        purchasedTemplates: {
          select: { templateId: true },
        },
        sessions: {
          select: { id: true, createdAt: true, expiresAt: true, ipAddress: true, userAgent: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo tài khoản thành công cho ${newUser.name}`,
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Lỗi khi tạo tài khoản' }, { status: 500 });
  }
}
