import { NextResponse } from 'next/server';
import {
  getAllSystemFonts,
  getAllSystemGraphics,
  getAllSystemMusic,
} from '@/lib/systemAssetsService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fonts = await getAllSystemFonts();
    const graphics = await getAllSystemGraphics();
    const music = getAllSystemMusic();

    return NextResponse.json({
      success: true,
      fonts,
      graphics,
      music,
    });
  } catch (error) {
    console.error('Error fetching studio assets:', error);
    return NextResponse.json({ error: 'Lỗi tải tài nguyên studio' }, { status: 500 });
  }
}
