'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Play,
  Sparkles,
  ArrowDownToLine,
  ArrowUpToLine,
  MoveVertical,
  Maximize2,
  Lock,
  Unlock,
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import { resolveFontFamily } from '@/lib/studioFonts';
import StudioFontPicker from './StudioFontPicker';

export default function StudioRightInspector() {
  const {
    canvas,
    elements,
    selectedId,
    updateElement,
    removeElement,
    duplicateElement,
    setCanvasTitle,
    triggerPreviewAnim,
    toggleInspector,
    weddingProfile,
    setProfileModalOpen,
    setEnvelopeCover,
    setFallingEffect,
    setActiveTab,
    pushElementsBelow,
    autoPushDown,
    setAutoPushDown,
  } = useStudioStore();

  const selectedElement = elements.find((e) => e.id === selectedId);
  const [lockRatio, setLockRatio] = useState(false);

  // Keep track of committed font for live preview rollbacks
  const committedFontRef = useRef(selectedElement?.fontFamily || 'sans-serif');
  useEffect(() => {
    if (selectedElement?.fontFamily) {
      committedFontRef.current = selectedElement.fontFamily;
    }
  }, [selectedElement?.id]);

  // Accordion open/close states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    symmetry: false,
    border: false,
    shadow: false,
    clickAction: false,
    entranceAnim: false,
    continuousAnim: true, // open by default as in screenshot 3 & 4
    padding: false,
    display: false,
    interaction: false,
    other: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="relative w-80 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex flex-col h-full overflow-y-auto select-none shadow-sm z-20 text-stone-800 dark:text-stone-200 text-xs">
      {/* Pill Collapse Button on left edge */}
      <button
        onClick={toggleInspector}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-l-full shadow-md flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-all cursor-pointer"
        title="Thu gọn thanh thuộc tính"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* =========================================================================
          CASE 1: NO ELEMENT SELECTED -> GENERAL INVITATION SETTINGS (SCREENSHOT 1)
      ========================================================================= */}
      {!selectedElement ? (
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 block uppercase font-medium">Thiết lập chung</span>
              <h3 className="text-base font-bold text-stone-900 dark:text-white mt-0.5">Cài đặt thiệp</h3>
            </div>
            <button
              onClick={toggleInspector}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Thu gọn bảng công cụ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Invitation Card Info */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider block">
              | Thông tin thiệp
            </span>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-sm flex items-center justify-center">
              <Image
                src="/assets/wedding/templates/c165/photo_01.webp"
                alt="Thiệp cưới cover"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                <span className="font-serif italic text-lg tracking-wide">LoveStory</span>
                <span className="text-[10px] text-stone-300">Make your love story.</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                {canvas.title || 'Thiết kế chưa đặt tên'}
              </h4>
              <button
                onClick={() => {
                  const newTitle = prompt('Nhập tên thiệp cưới:', canvas.title);
                  if (newTitle) setCanvasTitle(newTitle);
                }}
                className="text-[11px] text-rose-500 hover:underline mt-0.5 font-medium"
              >
                Sửa tên và ảnh
              </button>
            </div>

            {/* Wedding Profile Quick Manager */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Hồ sơ cưới</span>
                {weddingProfile.isLinked ? (
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Đã gắn
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-1.5 py-0.5 rounded-full">
                    Chưa gắn
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                {weddingProfile.isLinked
                  ? `${weddingProfile.groom.fullName || 'Chú rể'} & ${weddingProfile.bride.fullName || 'Cô dâu'}`
                  : 'Chưa gắn hồ sơ cô dâu chú rể'}
              </p>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="w-full py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>{weddingProfile.isLinked ? 'Sửa hồ sơ cưới' : 'Tạo hồ sơ cưới nhanh'}</span>
              </button>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
              Danh mục *
            </label>
            <select
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-500"
              defaultValue="Thiệp cưới"
            >
              <option value="Thiệp cưới">Thiệp cưới</option>
              <option value="Sinh nhật">Sinh nhật</option>
              <option value="Sự kiện">Sự kiện</option>
              <option value="Kỷ niệm">Kỷ niệm</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-stone-600 dark:text-stone-400">
              Trạng thái
            </label>
            <select
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-rose-500"
              defaultValue="Công khai"
            >
              <option value="Công khai">Công khai</option>
              <option value="Bản nháp">Bản nháp</option>
              <option value="Riêng tư">Riêng tư (Chỉ khách mời có link)</option>
            </select>
          </div>

          {/* General Accordions */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            {/* Hiển thị */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('display')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Hiển thị</span>
                {openSections.display ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.display && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-3 border-t border-stone-200 dark:border-stone-700">
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-medium">Mở màn phong bì</span>
                      <input
                        type="checkbox"
                        checked={canvas.envelopeCover?.enabled ?? true}
                        onChange={(e) =>
                          setEnvelopeCover({
                            enabled: e.target.checked,
                            coverId: canvas.envelopeCover?.coverId || 'default',
                            rememberOpened: canvas.envelopeCover?.rememberOpened ?? false,
                            autoOpen: canvas.envelopeCover?.autoOpen ?? false,
                          })
                        }
                        className="rounded text-rose-500 focus:ring-rose-500"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('effect')}
                      className="w-full py-1 px-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-100 transition-colors flex items-center justify-between"
                    >
                      <span>Mẫu bìa: {canvas.envelopeCover?.coverId || 'Mặc định'}</span>
                      <span className="underline">Đổi mẫu ➔</span>
                    </button>
                  </div>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-medium">Hiệu ứng hoa rơi</span>
                    <input
                      type="checkbox"
                      checked={canvas.fallingEffect?.enabled ?? true}
                      onChange={(e) =>
                        setFallingEffect({
                          enabled: e.target.checked,
                          type: canvas.fallingEffect?.type || 'snow',
                        })
                      }
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-medium">Trình phát nhạc nền</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Tương tác */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('interaction')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Tương tác</span>
                {openSections.interaction ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.interaction && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-2 border-t border-stone-200 dark:border-stone-700">
                  <label className="flex items-center justify-between">
                    <span>Xác nhận tham dự (RSVP)</span>
                    <input type="checkbox" defaultChecked className="rounded text-rose-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Hộp mừng cưới VietQR</span>
                    <input type="checkbox" defaultChecked className="rounded text-rose-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Sổ lời chúc online</span>
                    <input type="checkbox" defaultChecked className="rounded text-rose-500" />
                  </label>
                </div>
              )}
            </div>

            {/* Tùy chọn khác */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('other')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Tùy chọn khác</span>
                {openSections.other ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.other && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-2 border-t border-stone-200 dark:border-stone-700">
                  <label className="flex items-center justify-between">
                    <span>Đặt mật khẩu thiệp</span>
                    <input type="checkbox" className="rounded text-rose-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Ẩn tên trên Google tìm kiếm</span>
                    <input type="checkbox" className="rounded text-rose-500" />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            CASE 2: ELEMENT SELECTED (SCREENSHOTS 3 & 4)
        ========================================================================= */
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div>
              <span className="text-[10px] text-stone-400 block uppercase font-medium">Đang chỉnh sửa</span>
              <h3 className="text-sm font-bold capitalize text-stone-900 dark:text-white mt-0.5">
                {selectedElement.type === 'text'
                  ? 'Văn bản'
                  : selectedElement.type === 'image'
                  ? 'Hình ảnh'
                  : selectedElement.type === 'graphic'
                  ? 'Đồ họa'
                  : selectedElement.type === 'shape'
                  ? 'Hình dạng'
                  : 'Tiện ích'}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900"
                title="Nhân bản"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeElement(selectedElement.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                title="Xóa phần tử"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleInspector}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-1 border-l border-stone-200 dark:border-stone-800 pl-2"
                title="Thu gọn bảng công cụ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Push-Down & Vertical Spacing Control (Chế độ đẩy chèn mục vào giữa) */}
          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-semibold text-xs">
                <MoveVertical className="w-3.5 h-3.5 text-blue-600" />
                <span>Khoảng cách &amp; Đẩy vị trí</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoPushDown(!autoPushDown)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  autoPushDown
                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/60 dark:border-blue-800'
                    : 'bg-stone-100 text-stone-400 border-stone-200 dark:bg-stone-800 dark:border-stone-700'
                }`}
                title="Tự động dãn cách khi chèn mục mới vào giữa"
              >
                Tự đẩy: {autoPushDown ? 'BẬT' : 'TẮT'}
              </button>
            </div>

            <p className="text-[10px] text-stone-500 leading-tight">
              Đẩy các mục bên dưới xuống để tạo khoảng trống chèn nội dung vào giữa không bị đè lên nhau.
            </p>

            <button
              type="button"
              onClick={() => {
                const pushAmount = (selectedElement.height || 100) + 24;
                pushElementsBelow(selectedElement.y + selectedElement.height - 10, pushAmount, true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Đẩy các mục dưới xuống (+{(selectedElement.height || 100) + 24}px)</span>
            </button>

            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => pushElementsBelow(selectedElement.y + selectedElement.height - 10, 50, true)}
                className="py-1 px-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 hover:border-blue-400 transition-colors"
                title="Đẩy các mục dưới xuống thêm 50px"
              >
                +50px
              </button>
              <button
                type="button"
                onClick={() => pushElementsBelow(selectedElement.y + selectedElement.height - 10, 100, true)}
                className="py-1 px-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 hover:border-blue-400 transition-colors"
                title="Đẩy các mục dưới xuống thêm 100px"
              >
                +100px
              </button>
              <button
                type="button"
                onClick={() => pushElementsBelow(selectedElement.y + selectedElement.height - 10, 200, true)}
                className="py-1 px-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 hover:border-blue-400 transition-colors"
                title="Đẩy các mục dưới xuống thêm 200px"
              >
                +200px
              </button>
              <button
                type="button"
                onClick={() => pushElementsBelow(selectedElement.y + selectedElement.height - 10, -50, true)}
                className="py-1 px-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-500 hover:text-stone-800 hover:border-stone-400 transition-colors flex items-center justify-center gap-0.5"
                title="Kéo các mục dưới lên bớt 50px"
              >
                <ArrowUpToLine className="w-2.5 h-2.5" />
                <span>-50px</span>
              </button>
            </div>
          </div>

          {/* Kích thước & Vị trí (Dimensions, Resizing & Positioning) */}
          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-semibold text-xs">
                <Maximize2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Kích thước &amp; Vị trí</span>
              </div>
              <button
                type="button"
                onClick={() => setLockRatio(!lockRatio)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                  lockRatio
                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:border-rose-800'
                    : 'bg-white text-stone-400 border-stone-200 dark:bg-stone-800 dark:border-stone-700'
                }`}
                title="Khóa tỉ lệ khung hình khi kéo dãn"
              >
                {lockRatio ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                <span>{lockRatio ? 'Khóa tỉ lệ' : 'Tự do'}</span>
              </button>
            </div>

            {/* Width & Height inputs */}
            <div className="grid grid-cols-2 gap-2">
              {/* Width */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                  <span>Rộng (W)</span>
                  <span className="font-mono">{Math.round(selectedElement.width)}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newW = Math.max(20, Math.round(selectedElement.width - 20));
                      const updates: any = { width: newW };
                      if (lockRatio && selectedElement.width > 0) {
                        updates.height = Math.max(20, Math.round(selectedElement.height * (newW / selectedElement.width)));
                      }
                      updateElement(selectedElement.id, updates, true);
                    }}
                    className="w-6 h-7 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-bold text-xs hover:bg-stone-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 10) {
                        const updates: any = { width: val };
                        if (lockRatio && selectedElement.width > 0) {
                          updates.height = Math.max(20, Math.round(selectedElement.height * (val / selectedElement.width)));
                        }
                        updateElement(selectedElement.id, updates, true);
                      }
                    }}
                    className="w-full text-center py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newW = Math.min(canvas.width, Math.round(selectedElement.width + 20));
                      const updates: any = { width: newW };
                      if (lockRatio && selectedElement.width > 0) {
                        updates.height = Math.max(20, Math.round(selectedElement.height * (newW / selectedElement.width)));
                      }
                      updateElement(selectedElement.id, updates, true);
                    }}
                    className="w-6 h-7 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-bold text-xs hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Height */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                  <span>Cao (H)</span>
                  <span className="font-mono">{Math.round(selectedElement.height)}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newH = Math.max(20, Math.round(selectedElement.height - 20));
                      const updates: any = { height: newH };
                      if (lockRatio && selectedElement.height > 0) {
                        updates.width = Math.max(20, Math.round(selectedElement.width * (newH / selectedElement.height)));
                      }
                      updateElement(selectedElement.id, updates, true);
                    }}
                    className="w-6 h-7 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-bold text-xs hover:bg-stone-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 10) {
                        const updates: any = { height: val };
                        if (lockRatio && selectedElement.height > 0) {
                          updates.width = Math.max(20, Math.round(selectedElement.width * (val / selectedElement.height)));
                        }
                        updateElement(selectedElement.id, updates, true);
                      }
                    }}
                    className="w-full text-center py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newH = Math.round(selectedElement.height + 20);
                      const updates: any = { height: newH };
                      if (lockRatio && selectedElement.height > 0) {
                        updates.width = Math.max(20, Math.round(selectedElement.width * (newH / selectedElement.height)));
                      }
                      updateElement(selectedElement.id, updates, true);
                    }}
                    className="w-6 h-7 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center font-bold text-xs hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Width Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {[
                { label: '500px', w: 500, x: 0 },
                { label: '420px', w: 420, x: 40 },
                { label: '300px', w: 300, x: 100 },
                { label: '200px', w: 200, x: 150 },
              ].map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const updates: any = { width: btn.w, x: btn.x };
                    if (lockRatio && selectedElement.width > 0) {
                      updates.height = Math.max(20, Math.round(selectedElement.height * (btn.w / selectedElement.width)));
                    }
                    updateElement(selectedElement.id, updates, true);
                  }}
                  className="flex-1 py-1 px-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-600 dark:text-stone-300 hover:border-rose-400 hover:text-rose-600 text-center transition-colors"
                >
                  {btn.w}px
                </button>
              ))}
            </div>

            {/* Position X, Y and Center */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-200 dark:border-stone-700/60 gap-2">
              <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                <span>X: <strong className="text-stone-700 dark:text-stone-200">{Math.round(selectedElement.x)}</strong></span>
                <span>Y: <strong className="text-stone-700 dark:text-stone-200">{Math.round(selectedElement.y)}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const centeredX = Math.round((canvas.width - selectedElement.width) / 2);
                  updateElement(selectedElement.id, { x: Math.max(0, centeredX) }, true);
                }}
                className="py-1 px-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold text-stone-700 dark:text-stone-300 hover:border-rose-400 transition-colors flex items-center gap-1"
                title="Căn giữa phần tử theo chiều ngang"
              >
                <AlignCenter className="w-3 h-3 text-rose-500" />
                <span>Căn giữa trang</span>
              </button>
            </div>
          </div>

          {/* Graphic / Image Preview, AI Cutout & Color Grading */}
          {(selectedElement.type === 'graphic' || selectedElement.type === 'image') && selectedElement.src && (
            <div className="space-y-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div className="relative w-full h-32 flex items-center justify-center rounded-xl overflow-hidden bg-stone-200/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedElement.src}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                  style={{
                    filter: selectedElement.filter
                      ? `brightness(${selectedElement.filter.brightness ?? 100}%) contrast(${selectedElement.filter.contrast ?? 100}%) saturate(${selectedElement.filter.saturate ?? 100}%) sepia(${selectedElement.filter.sepia ?? 0}%)`
                      : undefined,
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newUrl = prompt('Nhập URL hình ảnh/đồ họa mới:', selectedElement.src);
                    if (newUrl) updateElement(selectedElement.id, { src: newUrl }, true);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-black text-[11px] font-medium transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Thay đổi ảnh</span>
                </button>

                <button
                  onClick={() => {
                    updateElement(
                      selectedElement.id,
                      {
                        isCutout: !selectedElement.isCutout,
                        borderRadius: 16,
                      },
                      true
                    );
                    alert('✨ Đã áp dụng hiệu ứng tách nền AI (AI Cutout) cho ảnh!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-rose-500 text-white text-[11px] font-semibold hover:opacity-90 shadow-xs flex items-center gap-1"
                  title="Tự động nhận diện và tách nền chủ thể"
                >
                  <span>✨ Tách nền AI</span>
                </button>
              </div>

              {/* Color Grading Presets */}
              <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Bộ Lọc Màu (Color Grading)
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {[
                    { id: 'none', label: 'Gốc', b: 100, c: 100, s: 100, sep: 0 },
                    { id: 'pastel', label: 'Pastel Hàn', b: 108, c: 92, s: 115, sep: 0 },
                    { id: 'vintage', label: 'Film 35mm', b: 95, c: 110, s: 120, sep: 35 },
                    { id: 'sunset', label: 'Hoàng Hôn', b: 105, c: 105, s: 140, sep: 25 },
                    { id: 'noir', label: 'Đen Trắng', b: 95, c: 125, s: 0, sep: 0 },
                  ].map((preset) => {
                    const isCurrent = (selectedElement.filter?.preset || 'none') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() =>
                          updateElement(
                            selectedElement.id,
                            {
                              filter: {
                                preset: preset.id as 'none' | 'vintage' | 'warm' | 'cool' | 'bnw' | 'romance' | 'golden' | 'film',
                                brightness: preset.b,
                                contrast: preset.c,
                                saturate: preset.s,
                                sepia: preset.sep,
                              },
                            },
                            true
                          )
                        }
                        className={`py-1 px-2 rounded-lg font-medium border transition-all truncate ${
                          isCurrent
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-white dark:bg-stone-900 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Fine-tune Sliders */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500">Độ sáng</span>
                    <span className="font-mono">{selectedElement.filter?.brightness ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={selectedElement.filter?.brightness ?? 100}
                    onChange={(e) =>
                      updateElement(
                        selectedElement.id,
                        {
                          filter: {
                            ...selectedElement.filter,
                            brightness: Number(e.target.value),
                          },
                        },
                        true
                      )
                    }
                    className="w-full accent-rose-500 h-1 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-stone-500">Độ bão hòa màu</span>
                    <span className="font-mono">{selectedElement.filter?.saturate ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={selectedElement.filter?.saturate ?? 100}
                    onChange={(e) =>
                      updateElement(
                        selectedElement.id,
                        {
                          filter: {
                            ...selectedElement.filter,
                            saturate: Number(e.target.value),
                          },
                        },
                        true
                      )
                    }
                    className="w-full accent-rose-500 h-1 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TEXT SPECIFIC CONTROLS */}
          {selectedElement.type === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-stone-500 block mb-1">Nội dung chữ</label>
                <textarea
                  value={selectedElement.text || ''}
                  onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                  onBlur={(e) => updateElement(selectedElement.id, { text: e.target.value }, true)}
                  rows={3}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 font-sans"
                  placeholder="Nhập nội dung văn bản..."
                />
              </div>

              {/* Font Family & Size */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Phông chữ</label>
                    <StudioFontPicker
                      currentFont={selectedElement.fontFamily || 'sans-serif'}
                      onSelect={(font) => {
                        committedFontRef.current = font;
                        updateElement(selectedElement.id, { fontFamily: font }, true);
                      }}
                      onPreview={(font) => {
                        updateElement(selectedElement.id, { fontFamily: font }, false);
                      }}
                      onResetPreview={() => {
                        updateElement(selectedElement.id, { fontFamily: committedFontRef.current }, false);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Cỡ chữ (px)</label>
                    <input
                      type="number"
                      value={selectedElement.fontSize || 16}
                      onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                      onBlur={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) }, true)}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs font-mono font-medium"
                    />
                  </div>
                </div>

                {/* Live Font Typography Preview Box */}
                <div
                  className="p-2.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700/80 text-center select-none"
                  style={{
                    fontFamily: resolveFontFamily(selectedElement.fontFamily),
                    color: selectedElement.color || '#8C7355',
                  }}
                >
                  <span className="text-xl block leading-tight truncate">
                    {selectedElement.text || 'VIPO'}
                  </span>
                  <span className="text-[9px] text-stone-400 font-sans block mt-1 tracking-wide">
                    Xem trước: {selectedElement.fontFamily || 'Mặc định'}
                  </span>
                </div>
              </div>

              {/* Text Styles & Alignment */}
              <div className="flex items-center justify-between gap-1 pt-1">
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                  <button
                    onClick={() => updateElement(selectedElement.id, { textAlign: 'left' }, true)}
                    className={`p-1.5 rounded ${selectedElement.textAlign === 'left' ? 'bg-white shadow-xs' : ''}`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { textAlign: 'center' }, true)}
                    className={`p-1.5 rounded ${selectedElement.textAlign === 'center' ? 'bg-white shadow-xs' : ''}`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { textAlign: 'right' }, true)}
                    className={`p-1.5 rounded ${selectedElement.textAlign === 'right' ? 'bg-white shadow-xs' : ''}`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                  <button
                    onClick={() =>
                      updateElement(
                        selectedElement.id,
                        { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' },
                        true
                      )
                    }
                    className={`p-1.5 rounded ${selectedElement.fontWeight === 'bold' ? 'bg-white shadow-xs' : ''}`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      updateElement(
                        selectedElement.id,
                        { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' },
                        true
                      )
                    }
                    className={`p-1.5 rounded ${selectedElement.fontStyle === 'italic' ? 'bg-white shadow-xs' : ''}`}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Curved Text Toggle & Curvature Slider */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-stone-700 dark:text-stone-300">
                    Uốn cong chữ (Curved Text)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedElement.isCurved || false}
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
                          {
                            isCurved: e.target.checked,
                            curvature: selectedElement.curvature ?? 40,
                          },
                          true
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                {selectedElement.isCurved && (
                  <div className="space-y-1 bg-stone-50 dark:bg-stone-800/60 p-2 rounded-xl">
                    <div className="flex items-center justify-between text-[10px] text-stone-500">
                      <span>Độ cong vòng cung</span>
                      <span className="font-mono">{selectedElement.curvature ?? 40}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="5"
                      value={selectedElement.curvature ?? 40}
                      onChange={(e) =>
                        updateElement(selectedElement.id, { curvature: Number(e.target.value) }, true)
                      }
                      className="w-full accent-rose-500 h-1 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WIDGET SPECIFIC CONTROLS */}
          {selectedElement.type === 'widget' && (
            <div className="space-y-3 p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700">
              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                Cài đặt tiện ích: {selectedElement.widgetType}
              </span>

              {/* 1. Countdown */}
              {selectedElement.widgetType === 'countdown' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Câu đề tựa đếm ngược</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.quote || 'Cùng đếm ngược đến khoảnh khắc trọng đại của chúng mình'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, quote: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, quote: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 2. Calendar */}
              {selectedElement.widgetType === 'calendar' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Tháng / Năm</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.monthYear || 'Tháng 12 / 2026'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, monthYear: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, monthYear: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Ngày cưới (1 - 31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={selectedElement.widgetConfig?.selectedDay ?? 28}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, selectedDay: Number(e.target.value) },
                        }, true)
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* 3. RSVP */}
              {selectedElement.widgetType === 'rsvp' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Tiêu đề xác nhận</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.title || 'Xác Nhận Tham Dự Tiệc Cưới'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, title: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, title: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Mô tả phụ</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.subtitle || 'Để gia đình chuẩn bị đón tiếp quý khách chu đáo nhất'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, subtitle: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, subtitle: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 4. Map */}
              {selectedElement.widgetType === 'map' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Tên địa điểm</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.title || 'Trung Tâm Hội Nghị White Palace'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, title: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, title: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Địa chỉ chi tiết</label>
                    <textarea
                      rows={2}
                      value={selectedElement.widgetConfig?.address || '194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, address: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, address: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 5. Call Buttons */}
              {selectedElement.widgetType === 'call' && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Số đt Nhà Trai</label>
                      <input
                        type="text"
                        value={selectedElement.widgetConfig?.groomPhone || '0988888888'}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            widgetConfig: { ...selectedElement.widgetConfig, groomPhone: e.target.value },
                          })
                        }
                        onBlur={(e) =>
                          updateElement(
                            selectedElement.id,
                            { widgetConfig: { ...selectedElement.widgetConfig, groomPhone: e.target.value } },
                            true
                          )
                        }
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-400 block mb-1">Số đt Nhà Gái</label>
                      <input
                        type="text"
                        value={selectedElement.widgetConfig?.bridePhone || '0977777777'}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            widgetConfig: { ...selectedElement.widgetConfig, bridePhone: e.target.value },
                          })
                        }
                        onBlur={(e) =>
                          updateElement(
                            selectedElement.id,
                            { widgetConfig: { ...selectedElement.widgetConfig, bridePhone: e.target.value } },
                            true
                          )
                        }
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Giftbox / QR Mừng cưới */}
              {selectedElement.widgetType === 'giftbox' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Ngân hàng</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.bankName || 'Ngân hàng Quân Đội (MB Bank)'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, bankName: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, bankName: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Số tài khoản</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.accountNumber || '1903678888'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, accountNumber: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, accountNumber: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Tên chủ tài khoản</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.accountHolder || 'NGUYEN VAN A'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, accountHolder: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, accountHolder: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none uppercase"
                    />
                  </div>
                </div>
              )}

              {/* 7. Wishes / Sổ lưu bút */}
              {selectedElement.widgetType === 'wishes' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Tiêu đề sổ lưu bút</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.title || 'Sổ Lưu Bút & Lời Chúc'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, title: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, title: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 8. Music Player / Đĩa than */}
              {selectedElement.widgetType === 'music_player' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Tên bài hát</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.audioTitle || 'Beautiful In White'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, audioTitle: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, audioTitle: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Ca sĩ / Thông tin nghệ sĩ</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.artist || 'Shane Filan • Nhạc nền LoveStory'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, artist: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, artist: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 9. Video Widget */}
              {selectedElement.widgetType === 'video' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 block mb-1">Tiêu đề video kỷ niệm</label>
                    <input
                      type="text"
                      value={selectedElement.widgetConfig?.videoTitle || 'Hành Trình Tình Yêu • Wedding Trailer (4K)'}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          widgetConfig: { ...selectedElement.widgetConfig, videoTitle: e.target.value },
                        })
                      }
                      onBlur={(e) =>
                        updateElement(
                          selectedElement.id,
                          { widgetConfig: { ...selectedElement.widgetConfig, videoTitle: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Color & Opacity Slider (Screenshots 3 & 4: "Màu sắc & Độ hiển thị 100%") */}
          <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Màu sắc</span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-600 dark:text-stone-400">
                {selectedElement.type === 'text' ? 'Màu chữ' : 'Màu nền'}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    selectedElement.type === 'text'
                      ? selectedElement.color || '#000000'
                      : selectedElement.fillColor || '#FAF7F2'
                  }
                  onChange={(e) => {
                    if (selectedElement.type === 'text') {
                      updateElement(selectedElement.id, { color: e.target.value }, true);
                    } else {
                      updateElement(selectedElement.id, { fillColor: e.target.value }, true);
                    }
                  }}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-stone-200 overflow-hidden"
                />
                <span className="font-mono text-xs uppercase text-stone-500">
                  {selectedElement.type === 'text' ? selectedElement.color || '#000' : selectedElement.fillColor || '#FAF7F2'}
                </span>
              </div>
            </div>

            {/* Opacity slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-400">Độ hiển thị</span>
                <span className="font-mono font-semibold">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedElement.opacity ?? 1}
                onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) }, true)}
                className="w-full accent-rose-500 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* COLLAPSIBLE ACCORDIONS (MATCHING SCREENSHOTS 3 & 4) */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            {/* > Đối xứng (Symmetry / Flip X & Y) */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('symmetry')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Đối xứng</span>
                {openSections.symmetry ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.symmetry && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 flex gap-2 border-t border-stone-200 dark:border-stone-700">
                  <button
                    onClick={() => updateElement(selectedElement.id, { flipX: !selectedElement.flipX }, true)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedElement.flipX
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'border-stone-300 dark:border-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Lật ngang
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { flipY: !selectedElement.flipY }, true)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedElement.flipY
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'border-stone-300 dark:border-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Lật dọc
                  </button>
                </div>
              )}
            </div>

            {/* > Khoảng đệm (Padding - for text) */}
            {selectedElement.type === 'text' && (
              <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection('padding')}
                  className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
                >
                  <span>Khoảng đệm</span>
                  {openSections.padding ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {openSections.padding && (
                  <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-1.5 border-t border-stone-200 dark:border-stone-700">
                    <div className="flex items-center justify-between text-xs">
                      <span>Đệm lề trong (px)</span>
                      <span className="font-mono">{selectedElement.padding || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={selectedElement.padding || 0}
                      onChange={(e) => updateElement(selectedElement.id, { padding: Number(e.target.value) }, true)}
                      className="w-full accent-rose-500 h-1.5"
                    />
                  </div>
                )}
              </div>
            )}

            {/* > Đường viền (Border) */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('border')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Đường viền</span>
                {openSections.border ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.border && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-3 border-t border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between">
                    <span>Độ dày viền (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={selectedElement.borderWidth || 0}
                      onChange={(e) => updateElement(selectedElement.id, { borderWidth: Number(e.target.value) }, true)}
                      className="w-16 bg-white dark:bg-stone-900 border rounded px-2 py-1 font-mono text-center"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Màu viền</span>
                    <input
                      type="color"
                      value={selectedElement.borderColor || '#333333'}
                      onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value }, true)}
                      className="w-7 h-7 rounded cursor-pointer border"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bo tròn góc (px)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedElement.borderRadius || 0}
                      onChange={(e) => updateElement(selectedElement.id, { borderRadius: Number(e.target.value) }, true)}
                      className="w-16 bg-white dark:bg-stone-900 border rounded px-2 py-1 font-mono text-center"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* > Đổ bóng (Shadow - Screenshot 4 shows both Đổ bóng & Đổ bóng chữ) */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('shadow')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Đổ bóng</span>
                {openSections.shadow ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.shadow && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-3 border-t border-stone-200 dark:border-stone-700">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Đổ bóng khối</span>
                    <input
                      type="checkbox"
                      checked={selectedElement.shadow?.enabled || false}
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
                          {
                            shadow: {
                              ...selectedElement.shadow,
                              enabled: e.target.checked,
                              color: selectedElement.shadow?.color || 'rgba(0,0,0,0.25)',
                              blur: selectedElement.shadow?.blur || 12,
                            },
                          },
                          true
                        )
                      }
                      className="w-4 h-4 rounded text-rose-500 accent-rose-500"
                    />
                  </label>

                  {selectedElement.type === 'text' && (
                    <label className="flex items-center justify-between cursor-pointer">
                      <span>Đổ bóng chữ</span>
                      <input
                        type="checkbox"
                        checked={selectedElement.shadow?.textShadowEnabled || false}
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            {
                              shadow: {
                                ...selectedElement.shadow,
                                enabled: selectedElement.shadow?.enabled || false,
                                textShadowEnabled: e.target.checked,
                                color: selectedElement.shadow?.color || 'rgba(0,0,0,0.35)',
                                blur: selectedElement.shadow?.blur || 4,
                              },
                            },
                            true
                          )
                        }
                        className="w-4 h-4 rounded text-rose-500 accent-rose-500"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* > Hành động khi bấm (Click Action) */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('clickAction')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Hành động khi bấm</span>
                {openSections.clickAction ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.clickAction && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-2 border-t border-stone-200 dark:border-stone-700">
                  <select
                    value={selectedElement.clickAction?.type || 'none'}
                    onChange={(e) =>
                      updateElement(
                        selectedElement.id,
                        { clickAction: { type: e.target.value as 'none' | 'phone' | 'link' | 'scroll', value: selectedElement.clickAction?.value } },
                        true
                      )
                    }
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs"
                  >
                    <option value="none">Không có</option>
                    <option value="phone">Gọi điện thoại (tel:)</option>
                    <option value="link">Mở liên kết web</option>
                    <option value="scroll">Cuộn đến phần tử</option>
                  </select>
                  {selectedElement.clickAction?.type && selectedElement.clickAction.type !== 'none' && (
                    <input
                      type="text"
                      placeholder={selectedElement.clickAction.type === 'phone' ? '0901234567' : 'https://...'}
                      value={selectedElement.clickAction?.value || ''}
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
                          { clickAction: { ...selectedElement.clickAction!, value: e.target.value } },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border rounded-lg p-2 text-xs font-mono"
                    />
                  )}
                </div>
              )}
            </div>

            {/* > Hiệu ứng chuyển động (Entrance Animation) */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('entranceAnim')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Hiệu ứng chuyển động</span>
                {openSections.entranceAnim ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.entranceAnim && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-3 border-t border-stone-200 dark:border-stone-700">
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-medium">Kiểu xuất hiện</label>
                    <select
                      value={selectedElement.animation?.type || 'none'}
                      onChange={(e) => {
                        const newType = e.target.value as 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in' | 'bounce' | 'flip';
                        updateElement(
                          selectedElement.id,
                          {
                            animation: {
                              type: newType,
                              duration: selectedElement.animation?.duration || 1.0,
                              delay: selectedElement.animation?.delay || 0.0,
                            },
                          },
                          true
                        );
                        triggerPreviewAnim();
                      }}
                      className="w-full bg-white dark:bg-stone-900 border rounded-lg p-2 text-xs font-medium"
                    >
                      <option value="none">Không có</option>
                      <option value="slide-up">Trượt lên (Slide Up)</option>
                      <option value="slide-down">Trượt xuống (Slide Down)</option>
                      <option value="slide-left">Trượt từ phải sang (Slide Left)</option>
                      <option value="slide-right">Trượt từ trái sang (Slide Right)</option>
                      <option value="zoom-in">Phóng to (Zoom In)</option>
                      <option value="zoom-out">Thu nhỏ dần (Zoom Out)</option>
                      <option value="fade-in">Mờ dần (Fade In)</option>
                      <option value="rotate-in">Xoay vào (Rotate In)</option>
                      <option value="bounce-in">Nảy vào (Bounce In)</option>
                    </select>
                  </div>

                  {selectedElement.animation?.type && selectedElement.animation.type !== 'none' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-stone-500 font-medium">Thời gian (giây)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.2"
                            max="5"
                            value={selectedElement.animation?.duration ?? 1.0}
                            onChange={(e) => {
                              updateElement(
                                selectedElement.id,
                                {
                                  animation: {
                                    type: selectedElement.animation?.type || 'slide-up',
                                    duration: Number(e.target.value),
                                    delay: selectedElement.animation?.delay || 0.0,
                                  },
                                },
                                true
                              );
                              triggerPreviewAnim();
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-1.5 text-xs font-mono font-medium text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-stone-500 font-medium">Độ trễ (giây)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={selectedElement.animation?.delay ?? 0.0}
                            onChange={(e) => {
                              updateElement(
                                selectedElement.id,
                                {
                                  animation: {
                                    type: selectedElement.animation?.type || 'slide-up',
                                    duration: selectedElement.animation?.duration || 1.0,
                                    delay: Number(e.target.value),
                                  },
                                },
                                true
                              );
                              triggerPreviewAnim();
                            }}
                            className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-1.5 text-xs font-mono font-medium text-center"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => triggerPreviewAnim()}
                        className="w-full py-1.5 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                        <span>Phát thử hiệu ứng xuất hiện</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* v Chuyển động liên tục (Continuous Animation - EXACT MATCH TO SCREENSHOTS 3 & 4) */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('continuousAnim')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/60"
              >
                <span>Chuyển động liên tục</span>
                {openSections.continuousAnim ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              {openSections.continuousAnim && (
                <div className="p-3 bg-stone-50/60 dark:bg-stone-800/40 space-y-3 border-t border-stone-200 dark:border-stone-700">
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500 font-medium">Loại chuyển động</label>
                    <select
                      value={selectedElement.continuousAnimation?.type || 'none'}
                      onChange={(e) =>
                        updateElement(
                          selectedElement.id,
                          {
                            continuousAnimation: {
                              type: e.target.value as 'none' | 'floating' | 'pulse' | 'glow' | 'sway' | 'bounce-slow' | 'rotate-slow',
                              duration: selectedElement.continuousAnimation?.duration || 2.0,
                              delay: selectedElement.continuousAnimation?.delay || 0.0,
                            },
                          },
                          true
                        )
                      }
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-2 text-xs font-medium"
                    >
                      <option value="none">Không có</option>
                      <option value="floating">Bay lơ lửng</option>
                      <option value="heartbeat">Nhịp tim</option>
                      <option value="wobble">Lắc lư</option>
                      <option value="spin">Xoay tròn</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-500 font-medium">Thời gian (giây)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedElement.continuousAnimation?.duration ?? 2.0}
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            {
                              continuousAnimation: {
                                type: selectedElement.continuousAnimation?.type || 'floating',
                                duration: Number(e.target.value),
                                delay: selectedElement.continuousAnimation?.delay || 0.0,
                              },
                            },
                            true
                          )
                        }
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-1.5 text-xs font-mono font-medium text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-500 font-medium">Độ trễ (giây)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedElement.continuousAnimation?.delay ?? 0.0}
                        onChange={(e) =>
                          updateElement(
                            selectedElement.id,
                            {
                              continuousAnimation: {
                                type: selectedElement.continuousAnimation?.type || 'floating',
                                duration: selectedElement.continuousAnimation?.duration || 2.0,
                                delay: Number(e.target.value),
                              },
                            },
                            true
                          )
                        }
                        className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-1.5 text-xs font-mono font-medium text-center"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
