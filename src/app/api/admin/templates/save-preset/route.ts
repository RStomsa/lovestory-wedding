import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth/session';
import prisma from '@/lib/prisma';
import { saveCustomStudioPreset } from '@/lib/studioPresetsService';
import { addCustomTemplate } from '@/lib/templatesService';
import { StudioTemplatePreset } from '@/data/studioTemplatePresets';
import { broadcastSyncEvent } from '@/lib/realtimeSync';

export const dynamic = 'force-dynamic';

async function persistThumbnailToDisk(thumb: string, slug: string): Promise<string> {
  if (!thumb || !thumb.startsWith('data:image/')) return thumb;
  try {
    const matches = thumb.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) return thumb;
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    let buffer = Buffer.from(matches[2], 'base64');
    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'uploads', 'thumbnails');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Auto-crop to Screen 1 if buffer is full-height
    try {
      const sharp = (await import('sharp')).default;
      const meta = await sharp(buffer).metadata();
      if (meta.width && meta.height && meta.height > meta.width * 1.8) {
        const cropH = Math.min(meta.height, Math.round(meta.width * 1.6));
        buffer = await sharp(buffer)
          .extract({ left: 0, top: 0, width: meta.width, height: cropH })
          .toBuffer();
      }
    } catch (cropErr) {
      console.warn('Sharp thumbnail auto-crop skipped:', cropErr);
    }

    const filename = `${slug.replace(/[^a-z0-9-]/gi, '-')}-${Date.now()}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    return `/assets/uploads/thumbnails/${filename}`;
  } catch (err) {
    console.error('Failed to persist thumbnail to disk:', err);
    return thumb;
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Chỉ Quản trị viên (Admin) mới có quyền lưu mẫu vào kho hệ thống' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      slug,
      category,
      tier,
      price,
      badge,
      description,
      thumbnail,
      elements,
      config,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên mẫu thiệp' },
        { status: 400 }
      );
    }

    // Auto generate clean slug
    const cleanSlug = (
      slug?.trim() ||
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    ) || `template-${Date.now().toString(36)}`;

    const id = `studio-preset-${cleanSlug}`;
    const safeTier = tier === 'FREE' ? 'FREE' : tier === 'BASIC' ? 'BASIC' : 'PREMIUM';
    // Comply with project pricing: FREE = 0, BASIC = 50000, PREMIUM (VIP) = 30000 single
    const safePrice = safeTier === 'FREE' ? 0 : Number(price) || (safeTier === 'BASIC' ? 50000 : 30000);
    const safeBadge = badge?.trim() || (safeTier === 'PREMIUM' ? 'VIP' : safeTier === 'BASIC' ? '50k' : 'Miễn Phí');
    let rawThumbnail = thumbnail?.trim();
    if (!rawThumbnail || rawThumbnail.startsWith('[') || (!rawThumbnail.startsWith('http') && !rawThumbnail.startsWith('/') && !rawThumbnail.startsWith('data:'))) {
      rawThumbnail = '/assets/wedding/samples/sample_01.jpg';
    }
    const safeThumbnail = await persistThumbnailToDisk(rawThumbnail, cleanSlug);
    const safeDesc = description?.trim() || 'Mẫu thiệp cao cấp được thiết kế bởi LoveStory Studio.';

    const safeElements = Array.isArray(elements) ? elements : [];
    const imagesCount = safeElements.filter(
      (e: any) => e.type === 'image' || e.type === 'photo'
    ).length;

    // 1. Build & Save Studio Preset
    const presetData: StudioTemplatePreset = {
      id,
      slug: cleanSlug,
      name: name.trim(),
      category: category || 'wedding',
      tier: safeTier,
      thumbnail: safeThumbnail,
      imagesCount,
      description: safeDesc,
      config: config || {},
      elements: safeElements,
    };

    saveCustomStudioPreset(presetData);

    // 2. Register into Custom Catalog Templates (with strictly 0 views & 0 likes per Zero-Mock policy)
    addCustomTemplate({
      id: cleanSlug,
      name: name.trim(),
      slug: cleanSlug,
      category: category || 'wedding',
      tier: safeTier,
      price: safePrice,
      badge: safeBadge,
      longThumbnail: safeThumbnail,
      baseTemplateId: cleanSlug,
      description: safeDesc,
      isCustom: true,
      views: 0,
      likes: 0,
    });

    // 3. Upsert into Prisma SQLite DB Template Table so relations remain consistent
    try {
      await prisma.template.upsert({
        where: { id: cleanSlug },
        update: {
          name: name.trim(),
          description: safeDesc,
          tier: safeTier === 'PREMIUM' ? 'VIP' : 'BASIC',
          price: safePrice,
          badge: safeBadge,
          thumbnail: safeThumbnail,
          isActive: true,
        },
        create: {
          id: cleanSlug,
          name: name.trim(),
          slug: cleanSlug,
          description: safeDesc,
          tier: safeTier === 'PREMIUM' ? 'VIP' : 'BASIC',
          price: safePrice,
          badge: safeBadge,
          thumbnail: safeThumbnail,
          isActive: true,
          displayOrder: 0,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma template sync note:', dbErr);
    }

    // Broadcast realtime sync event to Desktop App and all Web clients
    try {
      broadcastSyncEvent({
        source: 'web',
        clientId: 'admin_server',
        entityType: 'template',
        action: 'create',
        id: cleanSlug,
        data: {
          id: cleanSlug,
          slug: cleanSlug,
          name: name.trim(),
          category: category || 'wedding',
          tier: safeTier,
          price: safePrice,
          badge: safeBadge,
          thumbnail: safeThumbnail,
          description: safeDesc,
          elements: presetData.elements,
          config: presetData.config,
          updatedAt: new Date().toISOString(),
        },
        timestamp: Date.now(),
      });
    } catch (broadcastErr) {
      console.warn('Realtime broadcast error on save preset:', broadcastErr);
    }

    return NextResponse.json({
      success: true,
      message: `Đã lưu mẫu "${presetData.name}" vào kho mẫu thiệp thành công!`,
      preset: presetData,
    });
  } catch (error) {
    console.error('Save preset error:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi lưu mẫu thiệp' },
      { status: 500 }
    );
  }
}
