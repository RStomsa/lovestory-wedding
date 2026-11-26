import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getGraphicFolders,
  createGraphicFolder,
  deleteGraphicFolder,
} from '@/lib/systemAssetsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const folders = await getGraphicFolders();
    return NextResponse.json({ success: true, folders });
  } catch (error) {
    console.error('Fetch graphic folders error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách thư mục' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền tạo thư mục đồ họa' }, { status: 403 });
    }

    const body = await request.json();
    const { name, icon, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập tên thư mục' }, { status: 400 });
    }

    const folder = await createGraphicFolder({
      name: name.trim(),
      icon: icon?.trim() || '📁',
      description: description?.trim() || '',
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo thư mục "${folder.name}" thành công!`,
      folder,
    });
  } catch (error: any) {
    console.error('Create graphic folder error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi tạo thư mục' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền xóa thư mục' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID hoặc tên thư mục cần xóa' }, { status: 400 });
    }

    const success = await deleteGraphicFolder(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Không thể xóa thư mục mặc định của hệ thống hoặc thư mục không tồn tại' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa thư mục thành công',
    });
  } catch (error) {
    console.error('Delete graphic folder error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa thư mục' }, { status: 500 });
  }
}
