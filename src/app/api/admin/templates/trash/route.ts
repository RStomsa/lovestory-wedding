import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getTrashedTemplates,
  restoreFromTrash,
  moveToTrash,
  permanentlyDeleteFromTrash,
  emptyTrash,
} from '@/lib/templatesService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const templates = getTrashedTemplates();
    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('Fetch trashed templates error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách thùng rác' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const body = await request.json();
    const { action, id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID mẫu thiệp' }, { status: 400 });
    }

    if (action === 'restore') {
      const result = restoreFromTrash(id);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (action === 'trash') {
      const result = moveToTrash(id);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error) {
    console.error('Trash action error:', error);
    return NextResponse.json({ error: 'Lỗi xử lý thùng rác' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const isAll = url.searchParams.get('all') === 'true';

    if (isAll) {
      const emptied = emptyTrash();
      return NextResponse.json({
        success: emptied,
        message: emptied ? 'Đã dọn sạch toàn bộ mẫu trong thùng rác!' : 'Không thể dọn sạch thùng rác.',
      });
    }

    if (!id) {
      return NextResponse.json({ error: 'Vui lòng cung cấp ID mẫu cần xóa vĩnh viễn' }, { status: 400 });
    }

    const deleted = permanentlyDeleteFromTrash(id);
    return NextResponse.json({
      success: deleted,
      message: deleted
        ? 'Đã xóa vĩnh viễn mẫu thiệp khỏi hệ thống!'
        : 'Không tìm thấy mẫu thiệp trong thùng rác để xóa.',
    });
  } catch (error) {
    console.error('Permanent delete error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa vĩnh viễn mẫu thiệp' }, { status: 500 });
  }
}
