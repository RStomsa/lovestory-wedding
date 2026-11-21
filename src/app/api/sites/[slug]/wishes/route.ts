import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { author, content } = body;

    if (!author || !content) {
      return NextResponse.json({ error: 'Vui lòng nhập tên và lời chúc mừng' }, { status: 400 });
    }

    const site = await prisma.site.findUnique({
      where: { slug },
    });

    if (!site) {
      return NextResponse.json({ error: 'Không tìm thấy thiệp cưới' }, { status: 404 });
    }

    const wish = await prisma.wishMessage.create({
      data: {
        siteId: site.id,
        author: author.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, wish });
  } catch (error) {
    console.error('Wish submit error:', error);
    return NextResponse.json({ error: 'Lỗi gửi lời chúc' }, { status: 500 });
  }
}
