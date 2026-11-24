import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { moveToTrash, updateCatalogTemplate } from '@/lib/templatesService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, tier, price, badge, category, longThumbnail, description, isActive, displayOrder, isPublished, code, subtitle } = body;

    // 1. Update in Catalog templates (customTemplates.json / CATALOG_TEMPLATES overrides)
    const updatedCatalog = updateCatalogTemplate(id, {
      ...(name ? { name: String(name).trim() } : {}),
      ...(code ? { code: String(code).trim() } : {}),
      ...(subtitle ? { subtitle: String(subtitle).trim() } : {}),
      ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
      ...(tier ? { tier } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(badge !== undefined ? { badge: String(badge).trim() as 'Miễn phí' | 'Basic' | 'Premium' } : {}),
      ...(category ? { category } : {}),
      ...(longThumbnail ? { longThumbnail: String(longThumbnail).trim() } : {}),
      ...(description !== undefined ? { description: String(description).trim() } : {}),
    });

    // 2. Also try updating Prisma SQLite DB Template table if matching record exists
    let updatedDbTemplate = null;
    try {
      updatedDbTemplate = await prisma.template.update({
        where: { id },
        data: {
          ...(name ? { name: String(name).trim() } : {}),
          ...(tier !== undefined ? { tier } : {}),
          ...(price !== undefined ? { price: Number(price) } : {}),
          ...(badge !== undefined ? { badge: String(badge).trim() } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : (isPublished !== undefined ? { isActive: Boolean(isPublished) } : {})),
          ...(displayOrder !== undefined ? { displayOrder: Number(displayOrder) } : {}),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      template: updatedCatalog || updatedDbTemplate,
      message: 'Đã cập nhật mẫu thiệp thành công',
    });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json({ error: 'Cập nhật template thất bại' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { id } = await params;
    const result = moveToTrash(id);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      template: result.template,
    }, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: 'Lỗi khi bỏ template vào thùng rác' }, { status: 500 });
  }
}
