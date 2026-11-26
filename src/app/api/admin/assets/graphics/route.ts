import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getAllSystemGraphics,
  getGraphicFolders,
  addCustomGraphic,
  deleteCustomGraphic,
} from '@/lib/systemAssetsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const [graphics, folders] = await Promise.all([
      getAllSystemGraphics(),
      getGraphicFolders(),
    ]);

    return NextResponse.json({ success: true, graphics, folders });
  } catch (error) {
    console.error('Fetch graphics error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách đồ họa' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const { name, src, category, subCategory, folder, defaultWidth, defaultHeight } = body;

    if (!name || !name.trim() || !src || !src.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập tên đồ họa và đường dẫn hình ảnh/SVG' }, { status: 400 });
    }

    const targetFolder = folder?.trim() || subCategory?.trim() || category || 'Yếu tố đám cưới';

    const graphic = await addCustomGraphic({
      name: name.trim(),
      src: src.trim(),
      category: category || targetFolder,
      subCategory: targetFolder,
      folder: targetFolder,
      defaultWidth: Number(defaultWidth) || 100,
      defaultHeight: Number(defaultHeight) || 100,
      userId: user?.id,
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm đồ họa "${graphic.name}" vào thư mục "${targetFolder}" thành công!`,
      graphic,
    });
  } catch (error) {
    console.error('Add graphic error:', error);
    return NextResponse.json({ error: 'Lỗi khi thêm đồ họa' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền xóa đồ họa' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID đồ họa cần xóa' }, { status: 400 });
    }

    const success = await deleteCustomGraphic(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Không thể xóa đồ họa mặc định hoặc không tìm thấy ID' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa đồ họa thành công',
    });
  } catch (error) {
    console.error('Delete graphic error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa đồ họa' }, { status: 500 });
  }
}
