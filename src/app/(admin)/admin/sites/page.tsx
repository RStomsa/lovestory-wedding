import React from 'react';
import prisma from '@/lib/prisma';
import SitesManagerClient from './SitesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSitesPage() {
  const sites = await prisma.site.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      owner: {
        select: { id: true, name: true, email: true, plan: true },
      },
      template: {
        select: { id: true, name: true, tier: true },
      },
      rsvps: {
        select: { id: true },
      },
      wishes: {
        select: { id: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
          Quản Lý Thiệp Cưới &amp; Vòng Đời Dữ Liệu
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Theo dõi số lượt xem (hạn mức 300 views cho gói Free), thời hạn xem 30 ngày / 365 ngày và thời gian lưu trữ sao lưu backup 1 tháng trong database.
        </p>
      </div>

      <SitesManagerClient initialSites={JSON.parse(JSON.stringify(sites))} />
    </div>
  );
}
