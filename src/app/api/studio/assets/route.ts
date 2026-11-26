import { NextResponse } from 'next/server';
import {
  getAllSystemFonts,
  getAllSystemGraphics,
  getGraphicFolders,
  getAllSystemMusic,
} from '@/lib/systemAssetsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [fonts, graphics, folders] = await Promise.all([
      getAllSystemFonts(),
      getAllSystemGraphics(),
      getGraphicFolders(),
    ]);
    const music = getAllSystemMusic();

    return NextResponse.json({
      success: true,
      fonts,
      graphics,
      folders,
      music,
    });
  } catch (error) {
    console.error('Error fetching studio assets:', error);
    return NextResponse.json({ error: 'Lỗi tải tài nguyên studio' }, { status: 500 });
  }
}
