import React from 'react';
import { requireAdmin } from '@/lib/auth/guard';
import StudioEditor from '@/components/editor/studio/StudioEditor';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Master Studio — Soạn & Xuất Bản Mẫu Thiệp Mới — LoveStory Admin',
  description: 'Trang thiết kế mẫu thiệp cưới và sự kiện dành riêng cho Quản trị viên LoveStory.',
};

export default async function AdminStudioPage() {
  await requireAdmin();

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col overflow-hidden">
      <StudioEditor mode="admin" />
    </div>
  );
}
