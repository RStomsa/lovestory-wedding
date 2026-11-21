import React from 'react';
import { requireAuth } from '@/lib/auth/guard';
import prisma from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await requireAuth();

  // Query 100% real data from SQLite via Prisma
  const [sites, orders, fullUser] = await Promise.all([
    prisma.site.findMany({
      where: { ownerId: user.id },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
            tier: true,
            thumbnail: true,
          },
        },
        rsvps: {
          orderBy: { createdAt: 'desc' },
        },
        wishes: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <DashboardClient
      initialUser={fullUser || user}
      initialSites={sites}
      initialOrders={orders}
    />
  );
}
