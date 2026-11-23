'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    router.push('/login?redirect=/admin');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-200/60 transition-colors shrink-0"
      title="Đăng xuất khỏi hệ thống"
      aria-label="Đăng xuất"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
