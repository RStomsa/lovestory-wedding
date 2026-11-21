import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const now = new Date();

    // 1. Check FREE sites that reached view limit (>= 300) or expired active period (30 days)
    const activeFreeSites = await prisma.site.findMany({
      where: {
        status: 'ACTIVE',
        owner: {
          plan: 'FREE',
        },
      },
      select: {
        id: true,
        viewCount: true,
        maxViews: true,
        activeExpiresAt: true,
        title: true,
      },
    });

    let sweptToBackup = 0;
    const backupExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days backup in DB

    for (const site of activeFreeSites) {
      const isOverViews = site.viewCount >= 300;
      const isPastActive = site.activeExpiresAt && new Date(site.activeExpiresAt) <= now;

      if (isOverViews || isPastActive) {
        await prisma.site.update({
          where: { id: site.id },
          data: {
            status: 'EXPIRED_BACKUP',
            backupExpiresAt: backupExpiry,
          },
        });
        sweptToBackup++;
      }
    }

    // 2. Check sites currently in EXPIRED_BACKUP whose backup period (+30 days) has passed
    const backupSites = await prisma.site.findMany({
      where: {
        status: 'EXPIRED_BACKUP',
        backupExpiresAt: {
          lte: now,
        },
      },
      select: { id: true },
    });

    let sweptToArchive = 0;
    for (const site of backupSites) {
      await prisma.site.update({
        where: { id: site.id },
        data: {
          status: 'ARCHIVED',
        },
      });
      sweptToArchive++;
    }

    return NextResponse.json({
      success: true,
      message: `Đã hoàn tất quét vòng đời: Chuyển ${sweptToBackup} thiệp sang lưu trữ Backup 30 ngày, lưu kho lưu trữ (Archive) ${sweptToArchive} thiệp hết hạn backup.`,
      sweptToBackup,
      sweptToArchive,
    });
  } catch (error) {
    console.error('Lifecycle sweep error:', error);
    return NextResponse.json({ error: 'Lỗi thực hiện quét vòng đời' }, { status: 500 });
  }
}
