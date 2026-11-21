import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import path from 'path';
import { uploadAsset } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để tải tệp lên' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy tệp tải lên' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate size (max 20MB)
    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dung lượng tệp tối đa là 20MB' }, { status: 400 });
    }

    const originalName = file.name || 'upload.png';
    const ext = path.extname(originalName).toLowerCase();
    const fontExts = ['.ttf', '.otf', '.woff', '.woff2'];
    const imageExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
    const audioExts = ['.mp3', '.wav', '.m4a'];
    const allowedExts = [...imageExts, ...audioExts, ...fontExts];

    if (!allowedExts.includes(ext)) {
      return NextResponse.json(
        { error: `Định dạng tệp ${ext} không được hỗ trợ. Vui lòng chọn ảnh (PNG, SVG, JPG, WebP), phông chữ (TTF, OTF, WOFF, WOFF2) hoặc nhạc (MP3).` },
        { status: 400 }
      );
    }

    // Determine subfolder based on file type
    let subfolder: 'fonts' | 'graphics' | 'music' = 'graphics';
    if (fontExts.includes(ext)) {
      subfolder = 'fonts';
    } else if (audioExts.includes(ext)) {
      subfolder = 'music';
    }

    const result = await uploadAsset(buffer, originalName, subfolder);

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      fileType: fontExts.includes(ext) ? 'font' : imageExts.includes(ext) ? 'image' : 'audio',
      size: result.size,
      storageType: result.storageType,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Lỗi tải tệp lên máy chủ' }, { status: 500 });
  }
}
