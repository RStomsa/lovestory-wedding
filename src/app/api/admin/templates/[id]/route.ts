import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { deleteCustomTemplate, updateCatalogTemplate } from '@/lib/templatesService';

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
    const { name, tier, price, badge, category, longThumbnail, description, isActive, displayOrder } = body;

    // 1. Update in Catalog templates (customTemplates.json / CATALOG_TEMPLATES overrides)
    const updatedCatalog = updateCatalogTemplate(id, {
      ...(name ? { name: String(name).trim() } : {}),
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
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
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
    const deleted = deleteCustomTemplate(id);

    return NextResponse.json({
      success: true,
      message: deleted ? 'Đã xóa mẫu thiệp thành công' : 'Mẫu thiệp mặc định không thể xóa khỏi hệ thống',
      deleted,
    });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa template' }, { status: 500 });
  }
}

