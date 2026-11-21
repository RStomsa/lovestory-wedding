import React from 'react';
import prisma from '@/lib/prisma';
import RsvpsManagerClient from './RsvpsManagerClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Quản Lý Cỗ Cưới & RSVP — LoveStory Admin',
};

export default async function AdminRsvpsPage() {
  const rsvps = await prisma.rsvpResponse.findMany({
    include: {
      site: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const sites = await prisma.site.findMany({
    select: { id: true, slug: true, title: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <RsvpsManagerClient
        initialRsvps={JSON.parse(JSON.stringify(rsvps))}
        sites={sites}
      />
    </div>
  );
}
