import { NextResponse } from 'next/server';
import { getAllCatalogTemplates } from '@/lib/templatesService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const templates = getAllCatalogTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Fetch public templates error:', error);
    return NextResponse.json({ error: 'Lỗi nạp templates' }, { status: 500 });
  }
}
