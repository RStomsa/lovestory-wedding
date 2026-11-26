import React from 'react';
import { requireAdmin } from '@/lib/auth/guard';
import { getAllSystemWidgets } from '@/lib/widgetsService';
import WidgetsManagerClient from './WidgetsManagerClient';

export const metadata = {
  title: 'Quản Lý Tiện Ích — LoveStory Admin Hub',
  description: 'Quản lý, cấu hình mẫu và bật tắt các tiện ích tương tác cưới (Lịch, Đếm ngược, Bản đồ, RSVP...)',
};

export const dynamic = 'force-dynamic';

export default async function AdminWidgetsPage() {
  await requireAdmin();
  const widgets = await getAllSystemWidgets();

  return <WidgetsManagerClient initialWidgets={widgets} />;
}
