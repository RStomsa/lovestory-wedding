import React from 'react';
import prisma from '@/lib/prisma';
import { getAllCatalogTemplates } from '@/lib/templatesService';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Query all database metrics in parallel
  const [
    totalUsers,
    freeUsers,
    annualUsers,
    lifetimeUsers,
    totalOrders,
    paidOrders,
    pendingOrdersCount,
    allSites,
    totalWishes,
    totalRsvps,
    recentUsers,
    recentOrders,
    recentSites,
    recentWishes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: 'FREE' } }),
    prisma.user.count({ where: { plan: 'ANNUAL_50K' } }),
    prisma.user.count({ where: { plan: 'LIFETIME_VIP_200K' } }),
    prisma.order.count(),
    prisma.order.findMany({ where: { status: 'PAID' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.site.findMany({
      select: {
        id: true,
        status: true,
        viewCount: true,
      },
    }),
    prisma.wishMessage.count(),
    prisma.rsvpResponse.count(),
    // Recent lists
    prisma.user.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.site.findMany({
      take: 12,
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: { select: { name: true, email: true, plan: true } },
        template: { select: { name: true, tier: true } },
      },
    }),
    prisma.wishMessage.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        site: { select: { title: true, slug: true } },
      },
    }),
  ]);

  // Compute revenue breakdown
  const totalRevenue = paidOrders.reduce((acc, order) => acc + order.amount, 0);
  const revenue50k = paidOrders
    .filter((o) => o.type === 'PLAN_ANNUAL_50K')
    .reduce((acc, o) => acc + o.amount, 0);
  const revenue200k = paidOrders
    .filter((o) => o.type === 'PLAN_LIFETIME_VIP_200K')
    .reduce((acc, o) => acc + o.amount, 0);
  const revenueTemplates = paidOrders
    .filter((o) => o.type === 'SINGLE_TEMPLATE_VIP')
    .reduce((acc, o) => acc + o.amount, 0);

  // Compute site lifecycle counts
  const totalSites = allSites.length;
  const activeSites = allSites.filter((s) => s.status === 'ACTIVE').length;
  const backupSites = allSites.filter((s) => s.status === 'EXPIRED_BACKUP').length;
  const archivedSites = allSites.filter((s) => s.status === 'ARCHIVED').length;
  const totalViews = allSites.reduce((acc, s) => acc + s.viewCount, 0);

  // Total templates in market
  const catalogTemplates = getAllCatalogTemplates();

  const metrics = {
    totalUsers,
    freeUsers,
    annualUsers,
    lifetimeUsers,
    totalOrders,
    paidOrdersCount: paidOrders.length,
    pendingOrdersCount,
    totalRevenue,
    revenue50k,
    revenue200k,
    revenueTemplates,
    totalSites,
    activeSites,
    backupSites,
    archivedSites,
    totalViews,
    totalWishes,
    totalRsvps,
    catalogTemplatesCount: catalogTemplates.length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <AdminDashboardClient
        metrics={metrics}
        recentUsers={JSON.parse(JSON.stringify(recentUsers))}
        recentOrders={JSON.parse(JSON.stringify(recentOrders))}
        recentSites={JSON.parse(JSON.stringify(recentSites))}
        recentWishes={JSON.parse(JSON.stringify(recentWishes))}
      />
    </div>
  );
}
