import React from 'react';
import prisma from '@/lib/prisma';
import SessionsManagerClient from './SessionsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminSessionsPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          plan: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SessionsManagerClient initialSessions={JSON.parse(JSON.stringify(sessions))} />
    </div>
  );
}
