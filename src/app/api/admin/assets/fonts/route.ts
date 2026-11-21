import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getAllSystemFonts,
  addCustomFont,
  deleteCustomFont,
} from '@/lib/systemAssetsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const fonts = await getAllSystemFonts();
    return NextResponse.json({ success: true, fonts });
  } catch (error) {
    console.error('Fetch fonts error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách phông chữ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const body = await request.json();
    const { name, googleFont, fileUrl, desc, category } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập tên phông chữ' }, { status: 400 });
    }

    const font = await addCustomFont({
      name: name.trim(),
      googleFont: googleFont?.trim(),
      fileUrl: fileUrl?.trim(),
      desc: desc?.trim(),
      category: category || 'script',
      userId: user?.id,
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm phông chữ "${font.name}" thành công!`,
      font,
    });
  } catch (error) {
    console.error('Add font error:', error);
    return NextResponse.json({ error: 'Lỗi khi thêm phông chữ' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền xóa phông chữ' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID phông chữ cần xóa' }, { status: 400 });
    }

    const success = await deleteCustomFont(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Không thể xóa phông chữ hệ thống mặc định hoặc không tìm thấy ID' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa phông chữ thành công',
    });
  } catch (error) {
    console.error('Delete font error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa phông chữ' }, { status: 500 });
  }
}
