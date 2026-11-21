'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WeddingData, TemplateId } from '@/types/wedding';
import { CATALOG_TEMPLATES } from '@/data/templatesCatalog';
import { useAuth } from '@/context/AuthContext';
import {
  Palette,
  Heart,
  Calendar,
  CreditCard,
  Music,
  BookOpen,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Crown,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface Props {
  data: WeddingData;
  onChange: (data: WeddingData) => void;
  guestName: string;
  setGuestName: (name: string) => void;
  guestRole: string;
  setGuestRole: (role: string) => void;
}

const TEMPLATES: { id: TemplateId; name: string; desc: string; color: string; tier: 'BASIC' | 'VIP'; price: number }[] = [
  { id: 'our-love-begins', name: 'Our Love Begins (Tạp chí)', desc: 'Bìa tạp chí Hàn Quốc, chữ vàng kim sang trọng', color: 'from-[#faf7f2] to-[#e8d29b]', tier: 'BASIC', price: 0 },
  { id: 'our-love-story-rose', name: 'Our Love Story (Hoa hồng đỏ)', desc: 'Tone đỏ nhung hoa hồng lãng mạn & Timeline', color: 'from-[#fff5f5] to-[#800f2f]', tier: 'BASIC', price: 0 },
  { id: 'pastel', name: 'Korean Minimalist', desc: 'Tone kem & Xanh Sage thanh lịch kiểu Hàn', color: 'from-[#fcfaf7] to-[#e6e2dd]', tier: 'BASIC', price: 0 },
  { id: 'floral', name: 'Romantic Floral', desc: 'Hồng phấn pastel hoa lá lãng mạn nhẹ nhàng', color: 'from-[#ffebee] to-[#f8bbd0]', tier: 'BASIC', price: 0 },
  { id: 'burgundy', name: 'Burgundy Cinema', desc: 'Đỏ rượu vang & Vàng kim điện ảnh sang trọng', color: 'from-[#590d22] to-[#800f2f]', tier: 'VIP', price: 30000 },
  { id: 'retro', name: 'Vintage Retro Film', desc: 'Màu phim hoài niệm & khung ảnh Polaroid cổ điển', color: 'from-[#292524] to-[#44403c]', tier: 'VIP', price: 30000 },
];

const PRESET_SONGS = [
  { title: 'Until I Found You (Acoustic Piano)', artist: 'Wedding Melody 01', url: '/assets/wedding/audio/wedding-melody-01.mp3' },
  { title: 'A Thousand Years (Romantic Strings)', artist: 'Wedding Melody 02', url: '/assets/wedding/audio/wedding-melody-02.mp3' },
  { title: 'Can\'t Help Falling in Love', artist: 'Wedding Melody 03', url: '/assets/wedding/audio/wedding-melody-03.mp3' },
  { title: 'Perfect In White (Cinematic)', artist: 'Wedding Melody 04', url: '/assets/wedding/audio/wedding-melody-04.mp3' },
  { title: 'Marry Me (Sweet Acoustic Guitar)', artist: 'Wedding Melody 05', url: '/assets/wedding/audio/wedding-melody-05.mp3' },
  { title: 'Beautiful In White (Pure Piano)', artist: 'Wedding Melody 06', url: '/assets/wedding/audio/wedding-melody-06.mp3' },
  { title: 'Everytime We Touch (Gentle Ballad)', artist: 'Wedding Melody 07', url: '/assets/wedding/audio/wedding-melody-07.mp3' },
  { title: 'I Do - Cherish You (Orchestral)', artist: 'Wedding Melody 08', url: '/assets/wedding/audio/wedding-melody-08.mp3' },
];

export default function EditorSidebar({
  data,
  onChange,
  guestName,
  setGuestName,
  guestRole,
  setGuestRole,
}: Props) {
  const { canUseTemplate, openUpgradeModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'template' | 'couple' | 'events' | 'bank' | 'music' | 'story' | 'share'>('template');
  const [copiedLink, setCopiedLink] = useState(false);

  const currentTemplate = TEMPLATES.find((t) => t.id === data.templateId) || TEMPLATES[0];
  const isCurrentTemplateUnlocked = canUseTemplate(currentTemplate.id, currentTemplate.tier);

  const updateField = (path: string, val: unknown) => {
    const clone = JSON.parse(JSON.stringify(data));
    const parts = path.split('.');
    let curr = clone;
    for (let i = 0; i < parts.length - 1; i++) {
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = val;
    onChange(clone);
  };

  const generatedLink = typeof window !== 'undefined'
    ? `${window.location.origin}/${data.slug}?guest=${encodeURIComponent(guestName)}&role=${encodeURIComponent(guestRole)}`
    : `/${data.slug}?guest=${encodeURIComponent(guestName)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <aside className="w-full lg:w-96 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col h-[calc(100vh-4rem)] overflow-hidden shadow-lg">
      {/* Category Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 overflow-x-auto scrollbar-none p-1.5 bg-stone-50 dark:bg-stone-950">
        <button
          onClick={() => setActiveTab('template')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'template' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Giao Diện</span>
        </button>

        <button
          onClick={() => setActiveTab('couple')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'couple' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Uyên Ương</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'events' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Sự Kiện</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'bank' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Mừng Cưới</span>
        </button>

        <button
          onClick={() => setActiveTab('music')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'music' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Nhạc Nền</span>
        </button>

        <button
          onClick={() => setActiveTab('share')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'share' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Gửi Khách</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* 1. TEMPLATE TAB */}
        {activeTab === 'template' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                Phong Cách Thiết Kế
              </h3>
              <Link
                href="/templates"
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <span>Kho 24+ mẫu</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <Link
              href="/templates"
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Xem Thư Viện 24+ Mẫu Mới</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* VIP Warning Alert if current template is locked */}
            {!isCurrentTemplateUnlocked && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Mẫu này thuộc hạng VIP</span>
                </div>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                  Bạn có thể xem trước mẫu này trong Studio. Để xuất bản thiệp gửi khách, vui lòng nâng cấp gói VIP (200k) hoặc mua lẻ mẫu này (30k).
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      openUpgradeModal({
                        defaultType: 'SINGLE_TEMPLATE_VIP',
                        templateId: currentTemplate.id,
                        templateName: currentTemplate.name,
                        templatePrice: currentTemplate.price,
                      })
                    }
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] text-center"
                  >
                    Mua Lẻ (30k)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openUpgradeModal({
                        defaultType: 'PLAN_LIFETIME_VIP_200K',
                      })
                    }
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[10px] text-center"
                  >
                    Gói VIP (200k)
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {TEMPLATES.map((tmpl) => {
                const unlocked = canUseTemplate(tmpl.id, tmpl.tier);
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => onChange({ ...data, templateId: tmpl.id })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                      data.templateId === tmpl.id
                        ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/30 shadow-md scale-[1.02]'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-400'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tmpl.color} shadow-inner flex-shrink-0 flex items-center justify-center text-white relative`}>
                      <Sparkles className="w-5 h-5 opacity-80" />
                      {tmpl.tier === 'VIP' && (
                        <span className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-500 text-stone-950 shadow-xs">
                          <Crown className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5 truncate">
                          <span>{tmpl.name}</span>
                          {tmpl.tier === 'VIP' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                              VIP
                            </span>
                          )}
                        </h4>
                        {data.templateId === tmpl.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-medium shrink-0">
                            Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">{tmpl.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Câu Trích Dẫn Yêu Thích</label>
                <textarea
                  rows={2}
                  value={data.quote}
                  onChange={(e) => updateField('quote', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs bg-stone-50 dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Ảnh Bìa Hero (URL)</label>
                <input
                  type="text"
                  value={data.coverImage}
                  onChange={(e) => updateField('coverImage', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs bg-stone-50 dark:bg-stone-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. COUPLE TAB */}
        {activeTab === 'couple' && (
          <div className="space-y-6">
            {/* Groom */}
            <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1">
                🤵 Thông Tin Chú Rể
              </h4>
              <div>
                <label className="block text-xs font-medium mb-1">Họ &amp; Tên Đầy Đủ</label>
                <input
                  type="text"
                  value={data.groom.name}
                  onChange={(e) => updateField('groom.name', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Tên Thân Mật (Hiển thị tiêu đề)</label>
                <input
                  type="text"
                  value={data.groom.shortName}
                  onChange={(e) => updateField('groom.shortName', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Họ Tên Phụ Huynh Nhà Trai</label>
                <input
                  type="text"
                  value={data.groom.parents}
                  onChange={(e) => updateField('groom.parents', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Ảnh Chú Rể (URL)</label>
                <input
                  type="text"
                  value={data.groom.avatar}
                  onChange={(e) => updateField('groom.avatar', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
            </div>

            {/* Bride */}
            <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-1">
                👰 Thông Tin Cô Dâu
              </h4>
              <div>
                <label className="block text-xs font-medium mb-1">Họ &amp; Tên Đầy Đủ</label>
                <input
                  type="text"
                  value={data.bride.name}
                  onChange={(e) => updateField('bride.name', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Tên Thân Mật (Hiển thị tiêu đề)</label>
                <input
                  type="text"
                  value={data.bride.shortName}
                  onChange={(e) => updateField('bride.shortName', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Họ Tên Phụ Huynh Nhà Gái</label>
                <input
                  type="text"
                  value={data.bride.parents}
                  onChange={(e) => updateField('bride.parents', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Ảnh Cô Dâu (URL)</label>
                <input
                  type="text"
                  value={data.bride.avatar}
                  onChange={(e) => updateField('bride.avatar', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Lịch Trình Hôn Lễ
            </h3>
            {data.events.map((ev, idx) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
                  <span>Sự kiện #{idx + 1}</span>
                </div>
                <input
                  type="text"
                  value={ev.title}
                  onChange={(e) => {
                    const events = [...data.events];
                    events[idx].title = e.target.value;
                    onChange({ ...data, events });
                  }}
                  placeholder="Tên sự kiện (VD: Tiệc Cưới)"
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-semibold"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={ev.date}
                    onChange={(e) => {
                      const events = [...data.events];
                      events[idx].date = e.target.value;
                      onChange({ ...data, events });
                    }}
                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                  <input
                    type="text"
                    value={ev.time}
                    onChange={(e) => {
                      const events = [...data.events];
                      events[idx].time = e.target.value;
                      onChange({ ...data, events });
                    }}
                    placeholder="Thời gian (VD: 11:30 AM)"
                    className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <input
                  type="text"
                  value={ev.locationName}
                  onChange={(e) => {
                    const events = [...data.events];
                    events[idx].locationName = e.target.value;
                    onChange({ ...data, events });
                  }}
                  placeholder="Tên nhà hàng/Địa điểm"
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
                <input
                  type="text"
                  value={ev.address}
                  onChange={(e) => {
                    const events = [...data.events];
                    events[idx].address = e.target.value;
                    onChange({ ...data, events });
                  }}
                  placeholder="Địa chỉ cụ thể"
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>
            ))}
          </div>
        )}

        {/* 4. BANK TAB */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Tài Khoản Nhận Mừng Cưới (VietQR)
            </h3>
            {/* Groom Bank */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
              <h4 className="font-bold text-xs uppercase text-amber-700">Ngân Hàng Chú Rể</h4>
              <div>
                <label className="block text-[11px] mb-1">Mã Ngân Hàng (MB, VCB, ACB, TPB, TCB...)</label>
                <input
                  type="text"
                  value={data.groom.bankAccount.bankId}
                  onChange={(e) => updateField('groom.bankAccount.bankId', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] mb-1">Số Tài Khoản</label>
                <input
                  type="text"
                  value={data.groom.bankAccount.accountNo}
                  onChange={(e) => updateField('groom.bankAccount.accountNo', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] mb-1">Tên Chủ Tài Khoản (In hoa không dấu)</label>
                <input
                  type="text"
                  value={data.groom.bankAccount.accountName}
                  onChange={(e) => updateField('groom.bankAccount.accountName', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
            </div>

            {/* Bride Bank */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
              <h4 className="font-bold text-xs uppercase text-rose-700">Ngân Hàng Cô Dâu</h4>
              <div>
                <label className="block text-[11px] mb-1">Mã Ngân Hàng (MB, VCB, ACB, TPB, TCB...)</label>
                <input
                  type="text"
                  value={data.bride.bankAccount.bankId}
                  onChange={(e) => updateField('bride.bankAccount.bankId', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] mb-1">Số Tài Khoản</label>
                <input
                  type="text"
                  value={data.bride.bankAccount.accountNo}
                  onChange={(e) => updateField('bride.bankAccount.accountNo', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] mb-1">Tên Chủ Tài Khoản (In hoa không dấu)</label>
                <input
                  type="text"
                  value={data.bride.bankAccount.accountName}
                  onChange={(e) => updateField('bride.bankAccount.accountName', e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. MUSIC TAB */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Nhạc Nền Thiệp Cưới
            </h3>
            <div className="space-y-2.5">
              {PRESET_SONGS.map((song, i) => (
                <div
                  key={i}
                  onClick={() => onChange({ ...data, music: song })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    data.music.title === song.title
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <p className="text-xs text-stone-900 dark:text-stone-100">{song.title}</p>
                  <p className="text-[11px] text-stone-500">{song.artist}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
              <label className="block text-xs font-semibold">Tùy Chọn Link MP3 Riêng</label>
              <input
                type="text"
                value={data.music.url}
                onChange={(e) => updateField('music.url', e.target.value)}
                placeholder="https://...mp3"
                className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-xs bg-stone-50 dark:bg-stone-800"
              />
            </div>
          </div>
        )}

        {/* 6. SHARE / GUEST PERSONALIZATION TAB */}
        {activeTab === 'share' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Cá Nhân Hóa Link Gửi Khách Mời
            </h3>
            <p className="text-xs text-stone-500">
              Điền tên khách mời để tạo đường link riêng. Khi khách mở link sẽ thấy trang thiệp đề tên chính xác của họ!
            </p>

            <div className="space-y-3 p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <div>
                <label className="block text-xs font-semibold mb-1">Tên Khách Mời</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="VD: Anh Tuấn, Chị Lan, Gia Đình Bác..."
                  className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-700 text-xs bg-white dark:bg-stone-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Danh Xưng / Vai Trò (Tùy chọn)</label>
                <input
                  type="text"
                  value={guestRole}
                  onChange={(e) => setGuestRole(e.target.value)}
                  placeholder="VD: Bạn Chú Rể, Đồng Nghiệp..."
                  className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-rose-700 text-xs bg-white dark:bg-stone-800"
                />
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Link Riêng Dành Cho Khách:</label>
                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-rose-300 font-mono text-[11px] break-all select-all text-rose-700 dark:text-rose-400">
                  {generatedLink}
                </div>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Đã Sao Chép Link Gửi Zalo/FB!' : 'Sao Chép Link'}</span>
              </button>

              <button
                onClick={async () => {
                  try {
                    // Save first
                    await fetch('/api/sites/save', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        slug: data.slug,
                        title: `Lễ Thành Hôn ${data.groom.shortName} & ${data.bride.shortName}`,
                        templateId: data.templateId,
                        data,
                      }),
                    });

                    // Then publish
                    const res = await fetch('/api/sites/publish', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ slug: data.slug }),
                    });

                    const resData = await res.json();
                    if (!res.ok) {
                      if (resData.requiresUpgrade) {
                        openUpgradeModal({
                          defaultType: 'PLAN_LIFETIME_VIP_200K',
                          templateId: resData.templateId,
                          templateName: resData.templateName,
                          templatePrice: resData.templatePrice,
                        });
                        return;
                      }
                      alert(resData.error || 'Lỗi xuất bản thiệp');
                      return;
                    }

                    alert(`🎉 Chúc mừng! Thiệp cưới đã được xuất bản chính thức tại /${data.slug}`);
                  } catch (err) {
                    console.error('Publish error:', err);
                    alert('Lỗi kết nối khi xuất bản');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Xuất Bản Thiệp Lên Đám Mây (Online)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
