'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Copy,
  ExternalLink,
  Download,
  Check,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';

interface SiteOption {
  id: string;
  slug: string;
  title: string;
  owner: { name: string };
}

interface GuestItem {
  id: string;
  name: string;
  group: string;
  url: string;
  zaloMessage: string;
}

export default function GuestsManagerClient({ initialSites }: { initialSites: SiteOption[] }) {
  const [selectedSlug, setSelectedSlug] = useState(initialSites[0]?.slug || 'thiep-cuoi-165');
  const [customSlugInput, setCustomSlugInput] = useState('');
  const [inputNamesText, setInputNamesText] = useState(
    'Anh Nam\nChị Lan (Phòng Kế Toán)\nBạn Hùng (Cấp 3)\nChú Ba & Thím Ba\nEm Thảo'
  );
  const [defaultGroup, setDefaultGroup] = useState('Bạn Bè');
  const [withEnvelope, setWithEnvelope] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const activeSlug = customSlugInput.trim() || selectedSlug;

  // Generate Guest Items
  const guestList: GuestItem[] = useMemo(() => {
    const rawLines = inputNamesText.split('\n').map((l) => l.trim()).filter(Boolean);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    return rawLines.map((name, idx) => {
      const envelopeParam = withEnvelope ? '&envelope=1' : '';
      const url = `${origin}/${activeSlug}?to=${encodeURIComponent(name)}${envelopeParam}`;
      const zaloMessage = `Thân gửi ${name}! Vợ chồng em trân trọng gửi thiệp mời thành hôn tới bạn. Rất mong bạn đến chung vui cùng gia đình chúng em tại: ${url}`;
      return {
        id: `guest-${idx}`,
        name,
        group: defaultGroup,
        url,
        zaloMessage,
      };
    });
  }, [inputNamesText, activeSlug, withEnvelope, defaultGroup]);

  // Filtered
  const filteredGuests = useMemo(() => {
    if (!search.trim()) return guestList;
    const q = search.toLowerCase().trim();
    return guestList.filter((g) => g.name.toLowerCase().includes(q) || g.group.toLowerCase().includes(q));
  }, [guestList, search]);

  const copyToClipboard = (text: string, id: string, type: 'url' | 'msg') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['STT', 'Tên Khách Mời', 'Phân Nhóm', 'Đường Link Cá Nhân Hóa', 'Tin Nhắn Mẫu'];
    const rows = guestList.map((g, idx) => [
      idx + 1,
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.group}"`,
      `"${g.url}"`,
      `"${g.zaloMessage.replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh-sach-khach-moi-${activeSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              Cá nhân hóa khách mời
            </span>
            <span className="text-xs text-stone-400 font-mono">Tự động sinh link kèm tên khách</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Cá Nhân Hóa Khách Mời &amp; Chia Sẻ Zalo
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Tạo hàng loạt thiệp cưới mang tên từng người bạn, đồng nghiệp hoặc họ hàng. Khi khách mở thiệp sẽ có lời chào trang trọng và nắp phong bì 3D nứt con dấu sáp.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất CSV ({guestList.length})</span>
        </button>
      </div>

      {/* Main Grid: Left Config Panel & Right Table Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Input & Setup Form */}
        <div className="space-y-4 p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
          <h3 className="font-semibold text-xs text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-stone-600" />
            <span>1. Cấu hình thiệp &amp; danh sách</span>
          </h3>

          {/* Select Wedding Site */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-700 block">
              Chọn thiệp cưới đích
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => {
                setSelectedSlug(e.target.value);
                setCustomSlugInput('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
            >
              <option value="thiep-cuoi-165">Mẫu Demo C165 (Kem Chữ Vàng)</option>
              <option value="thiep-cuoi-61">Mẫu Demo C61 (Tạp Chí Our Love Begins)</option>
              <option value="thiep-cuoi-39">Mẫu Demo C39 (Hoa Hồng Đỏ)</option>
              {initialSites.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.title} ({s.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Slug Input if needed */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-stone-500 block">
              Hoặc nhập mã slug tùy ý:
            </label>
            <input
              type="text"
              placeholder="VD: thiep-cuoi-105"
              value={customSlugInput}
              onChange={(e) => setCustomSlugInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-900 font-mono placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* Group Tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-700 block">
              Phân nhóm khách mặc định
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {['Bạn Bè', 'Đồng Nghiệp', 'Họ Hàng', 'Nhà Trai', 'Nhà Gái', 'Khách VIP'].map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setDefaultGroup(grp)}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-colors ${
                    defaultGroup === grp
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          </div>

          {/* Envelope Opening Toggle */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-stone-900 block">
                Bật phong bì 3D
              </span>
              <span className="text-[11px] text-stone-500 block">
                Khách chạm con dấu sáp để mở thiệp
              </span>
            </div>
            <input
              type="checkbox"
              checked={withEnvelope}
              onChange={(e) => setWithEnvelope(e.target.checked)}
              className="w-4 h-4 accent-stone-900 rounded cursor-pointer"
            />
          </div>

          {/* Bulk Paste Names */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-700">
                Dán danh sách khách (mỗi người 1 dòng)
              </label>
              <span className="text-[11px] text-stone-500 font-mono">
                {guestList.length} khách
              </span>
            </div>
            <textarea
              rows={8}
              value={inputNamesText}
              onChange={(e) => setInputNamesText(e.target.value)}
              placeholder="Anh Nam&#10;Chị Lan&#10;Bạn Hùng&#10;Cô Út..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900 leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Right: Table of Generated Links */}
        <div className="lg:col-span-2 space-y-4 p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
            <div>
              <h3 className="font-semibold text-xs text-stone-900">
                2. Danh sách link cá nhân hóa ({filteredGuests.length})
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Sao chép link hoặc tin nhắn mẫu để gửi qua Zalo, Messenger
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredGuests.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-xs">
                Chưa có tên khách mời nào. Hãy nhập tên ở cột bên trái.
              </div>
            ) : (
              filteredGuests.map((item, idx) => {
                const isCopied = copiedId === item.id;
                const isCopiedMsg = copiedMsgId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-stone-50/60 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-200/80 text-stone-700 text-[10px] font-mono flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-medium text-xs text-stone-900 truncate">
                          {item.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-medium">
                          {item.group}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono truncate pl-7">
                        <span className="truncate">{item.url}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-7 sm:pl-0">
                      {/* Copy Link */}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.url, item.id, 'url')}
                        title="Sao chép đường link"
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Đã chép link' : 'Chép link'}</span>
                      </button>

                      {/* Copy Polite Zalo Message */}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.zaloMessage, item.id, 'msg')}
                        title="Sao chép toàn bộ tin nhắn Zalo"
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors ${
                          isCopiedMsg
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-900 hover:bg-stone-800 text-white'
                        }`}
                      >
                        {isCopiedMsg ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{isCopiedMsg ? 'Đã chép tin' : 'Tin Zalo'}</span>
                      </button>

                      {/* Open Link */}
                      <Link
                        href={item.url}
                        target="_blank"
                        title="Mở xem thử thiệp mời với tư cách khách này"
                        className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
