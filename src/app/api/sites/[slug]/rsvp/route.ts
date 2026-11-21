import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { guestName, phone, attending, partySize, eventTarget } = body;

    if (!guestName) {
      return NextResponse.json({ error: 'Vui lòng nhập tên khách mời' }, { status: 400 });
    }

    const site = await prisma.site.findUnique({
      where: { slug },
    });

    if (!site) {
      return NextResponse.json({ error: 'Không tìm thấy thiệp cưới' }, { status: 404 });
    }

    const rsvp = await prisma.rsvpResponse.create({
      data: {
        siteId: site.id,
        guestName: guestName.trim(),
        phone: phone?.trim() || null,
        attending: Boolean(attending),
        partySize: Number(partySize) || 1,
        eventTarget: eventTarget || null,
      },
    });

    return NextResponse.json({ success: true, rsvp });
  } catch (error) {
    console.error('RSVP submit error:', error);
    return NextResponse.json({ error: 'Lỗi gửi xác nhận tham dự' }, { status: 500 });
  }
}
