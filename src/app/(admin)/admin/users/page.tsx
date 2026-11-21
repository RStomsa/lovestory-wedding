import React from 'react';
import prisma from '@/lib/prisma';
import UsersManagerClient from './UsersManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      sites: {
        select: { id: true, title: true, slug: true, status: true, viewCount: true },
      },
      purchasedTemplates: {
        select: { templateId: true },
      },
      sessions: {
        select: {
          id: true,
          createdAt: true,
          expiresAt: true,
          ipAddress: true,
          userAgent: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
          Quản Lý Thành Viên
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Xem danh sách tài khoản, nâng cấp gói dịch vụ (Free / 50k / 200k), và phân quyền quản trị.
        </p>
      </div>

      <UsersManagerClient initialUsers={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}
