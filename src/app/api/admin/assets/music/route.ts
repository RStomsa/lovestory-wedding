import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getAllSystemMusic,
  addCustomMusic,
  deleteCustomMusic,
} from '@/lib/systemAssetsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }

    const music = getAllSystemMusic();
    return NextResponse.json({ success: true, music });
  } catch (error) {
    console.error('Fetch music error:', error);
    return NextResponse.json({ error: 'Lỗi nạp danh sách âm nhạc' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền thêm bài hát' }, { status: 403 });
    }

    const body = await request.json();
    const { title, artist, url } = body;

    if (!title || !title.trim() || !url || !url.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập tên bài hát và đường dẫn âm thanh MP3' }, { status: 400 });
    }

    const track = addCustomMusic({
      title: title.trim(),
      artist: artist?.trim(),
      url: url.trim(),
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm bài hát "${track.title}" thành công!`,
      track,
    });
  } catch (error) {
    console.error('Add music error:', error);
    return NextResponse.json({ error: 'Lỗi khi thêm bài hát' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền xóa bài hát' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID bài hát cần xóa' }, { status: 400 });
    }

    const success = deleteCustomMusic(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Không thể xóa bài hát mặc định hoặc không tìm thấy ID' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bài hát thành công',
    });
  } catch (error) {
    console.error('Delete music error:', error);
    return NextResponse.json({ error: 'Lỗi khi xóa bài hát' }, { status: 500 });
  }
}
