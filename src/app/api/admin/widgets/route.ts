import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getAllSystemWidgets,
  updateSystemWidget,
  addOrUpdateWidgetStyle,
  deleteWidgetStyle,
  createCustomWidget,
} from '@/lib/widgetsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const widgets = await getAllSystemWidgets();
    return NextResponse.json({ success: true, widgets });
  } catch (error) {
    console.error('Fetch system widgets error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách tiện ích hệ thống' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền sửa tiện ích' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, defaultConfig, name, description, availableStyles } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID tiện ích cần cập nhật' }, { status: 400 });
    }

    const updated = await updateSystemWidget(id, {
      ...(status ? { status } : {}),
      ...(defaultConfig ? { defaultConfig } : {}),
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
      ...(availableStyles ? { availableStyles } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy tiện ích' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật tiện ích "${updated.name}" thành công!`,
      widget: updated,
    });
  } catch (error: any) {
    console.error('Update widget error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi cập nhật tiện ích' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền thực hiện thao tác này' }, { status: 403 });
    }

    const body = await request.json();
    const { action, widgetId, style, styleId, widget } = body;

    // 1. Thêm hoặc cập nhật kiểu hiển thị / mẫu cho một tiện ích
    if (action === 'add_style' || action === 'edit_style') {
      if (!widgetId || !style || !style.id || !style.name) {
        return NextResponse.json({ error: 'Vui lòng điền đầy đủ mã và tên kiểu mẫu' }, { status: 400 });
      }

      const updated = await addOrUpdateWidgetStyle(widgetId, {
        id: style.id.trim().toLowerCase().replace(/\s+/g, '-'),
        name: style.name.trim(),
        desc: style.desc ? style.desc.trim() : 'Kiểu hiển thị thiết kế tuỳ chỉnh',
        defaultConfig: style.defaultConfig || {},
      });

      if (!updated) {
        return NextResponse.json({ error: 'Không tìm thấy tiện ích' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Đã lưu mẫu "${style.name}" vào tiện ích thành công!`,
        widget: updated,
      });
    }

    // 2. Xoá kiểu hiển thị / mẫu
    if (action === 'delete_style') {
      if (!widgetId || !styleId) {
        return NextResponse.json({ error: 'Thiếu thông tin kiểu mẫu cần xoá' }, { status: 400 });
      }

      const updated = await deleteWidgetStyle(widgetId, styleId);
      if (!updated) {
        return NextResponse.json({ error: 'Không tìm thấy tiện ích' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Đã xoá kiểu mẫu thành công!',
        widget: updated,
      });
    }

    // 3. Tạo một tiện ích tuỳ chỉnh mới
    if (action === 'create_widget') {
      if (!widget || !widget.name || !widget.type) {
        return NextResponse.json({ error: 'Thiếu thông tin tên hoặc loại tiện ích' }, { status: 400 });
      }

      const created = await createCustomWidget(widget);
      return NextResponse.json({
        success: true,
        message: `Đã tạo tiện ích "${created.name}" thành công!`,
        widget: created,
      });
    }

    return NextResponse.json({ error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Widget POST error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý yêu cầu tiện ích' }, { status: 500 });
  }
}
