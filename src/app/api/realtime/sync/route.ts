import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { broadcastSyncEvent, SyncPayload } from '@/lib/realtimeSync';
import { saveCustomStudioPreset } from '@/lib/studioPresetsService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload: SyncPayload = await req.json();

    if (!payload || !payload.entityType || !payload.action || !payload.id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu dữ liệu bắt buộc trong SyncPayload' },
        { status: 400 }
      );
    }

    const timestamp = payload.timestamp || Date.now();
    payload.timestamp = timestamp;

    // 1. Persist Template Changes to customStudioPresets.json
    if (payload.entityType === 'template') {
      try {
        if (payload.action === 'delete') {
          const presetsPath = path.join(process.cwd(), 'src', 'data', 'customStudioPresets.json');
          if (fs.existsSync(presetsPath)) {
            const list = JSON.parse(fs.readFileSync(presetsPath, 'utf-8'));
            if (Array.isArray(list)) {
              const filtered = list.filter((p: any) => p.slug !== payload.id && p.id !== payload.id);
              fs.writeFileSync(presetsPath, JSON.stringify(filtered, null, 2), 'utf-8');
            }
          }
        } else if (payload.data) {
          saveCustomStudioPreset({
            id: payload.data.id || `studio-preset-${payload.id}`,
            slug: payload.data.slug || payload.id,
            name: payload.data.name || payload.id,
            category: payload.data.category || 'wedding',
            tier: payload.data.tier || 'PREMIUM',
            thumbnail: payload.data.thumbnail || '',
            imagesCount: payload.data.elements?.filter((e: any) => e.type === 'image').length || 10,
            description: payload.data.description || 'Mẫu thiết kế LoveStory Studio',
            config: payload.data.canvasConfig || payload.data.config || {},
            elements: payload.data.elements || [],
          });
        }
      } catch (err) {
        console.error('Failed to persist template to customStudioPresets.json:', err);
      }
    }

    // 2. Persist Graphic Sticker Changes to customGraphics.json
    if (payload.entityType === 'graphic') {
      try {
        const graphicsPath = path.join(process.cwd(), 'src', 'data', 'customGraphics.json');
        let graphics: any[] = [];

        if (fs.existsSync(graphicsPath)) {
          graphics = JSON.parse(fs.readFileSync(graphicsPath, 'utf-8'));
        }

        if (payload.action === 'delete') {
          graphics = graphics.filter((g) => g.id !== payload.id);
        } else if (payload.data) {
          const idx = graphics.findIndex((g) => g.id === payload.id);
          if (idx >= 0) {
            graphics[idx] = { ...graphics[idx], ...payload.data };
          } else {
            graphics.unshift(payload.data);
          }
        }

        fs.writeFileSync(graphicsPath, JSON.stringify(graphics, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to persist graphic to customGraphics.json:', err);
      }
    }

    // 3. Persist Component Blocks to componentBlocks.json
    if (payload.entityType === 'block') {
      try {
        const blocksPath = path.join(process.cwd(), 'src', 'data', 'componentBlocks.json');
        let blocks: any[] = [];

        if (fs.existsSync(blocksPath)) {
          blocks = JSON.parse(fs.readFileSync(blocksPath, 'utf-8'));
        }

        if (payload.action === 'delete') {
          blocks = blocks.filter((b) => b.id !== payload.id);
        } else if (payload.data) {
          const idx = blocks.findIndex((b) => b.id === payload.id);
          if (idx >= 0) {
            blocks[idx] = { ...blocks[idx], ...payload.data };
          } else {
            blocks.unshift(payload.data);
          }
        }

        fs.writeFileSync(blocksPath, JSON.stringify(blocks, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to persist block to componentBlocks.json:', err);
      }
    }

    // 4. Broadcast to all active Web and Desktop clients
    broadcastSyncEvent(payload);

    return NextResponse.json({
      success: true,
      message: 'Đồng bộ realtime thành công!',
      timestamp,
      version: payload.version,
    });
  } catch (err: any) {
    console.error('Realtime sync API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi xử lý đồng bộ realtime' },
      { status: 500 }
    );
  }
}
