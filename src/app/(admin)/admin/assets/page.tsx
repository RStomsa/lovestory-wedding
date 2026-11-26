import React from 'react';
import { requireAdmin } from '@/lib/auth/guard';
import {
  getAllSystemFonts,
  getAllSystemGraphics,
  getGraphicFolders,
  getAllSystemMusic,
} from '@/lib/systemAssetsService';
import AssetsManagerClient from './AssetsManagerClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Quản Lý Tài Nguyên Studio (Font, Đồ Họa, Thư Mục, Nhạc) — LoveStory Admin',
};

export default async function AdminAssetsPage() {
  await requireAdmin();

  const [fonts, graphics, folders] = await Promise.all([
    getAllSystemFonts(),
    getAllSystemGraphics(),
    getGraphicFolders(),
  ]);
  const music = getAllSystemMusic();

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <AssetsManagerClient
        initialFonts={fonts}
        initialGraphics={graphics}
        initialFolders={folders}
        initialMusic={music}
      />
    </div>
  );
}
