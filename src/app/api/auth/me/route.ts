import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        user: null,
        purchasedTemplateIds: [],
      });
    }

    // Fetch purchased template IDs for this user
    const purchases = await prisma.userPurchasedTemplate.findMany({
      where: { userId: user.id },
      select: { templateId: true },
    });

    const purchasedTemplateIds = purchases.map((p) => p.templateId);

    return NextResponse.json({
      success: true,
      user,
      purchasedTemplateIds,
    });
  } catch (error) {
    console.error('Fetch current user error:', error);
    return NextResponse.json(
      { error: 'Lỗi kiểm tra phiên đăng nhập' },
      { status: 500 }
    );
  }
}
