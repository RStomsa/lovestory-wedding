'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Users,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Filter,
  ExternalLink,
  UtensilsCrossed,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RsvpItem {
  id: string;
  siteId: string;
  guestName: string;
  phone?: string | null;
  attending: boolean;
  partySize: number;
  eventTarget?: string | null;
  createdAt: string;
  site: {
    id: string;
    slug: string;
    title: string;
  };
}

interface SiteOption {
  id: string;
  slug: string;
  title: string;
}

interface Props {
  initialRsvps: RsvpItem[];
  sites: SiteOption[];
}

export default function RsvpsManagerClient({ initialRsvps, sites }: Props) {
  const [rsvps] = useState<RsvpItem[]>(initialRsvps);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attending' | 'declined'>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');

  // Stats calculation
  const totalResponses = rsvps.length;
  const attendingList = rsvps.filter((r) => r.attending);
  const totalAttendingHeadcount = attendingList.reduce((acc, r) => acc + (r.partySize || 1), 0);
  const declinedList = rsvps.filter((r) => !r.attending);
  const totalTables10 = Math.ceil(totalAttendingHeadcount / 10);
  const totalTables6 = Math.ceil(totalAttendingHeadcount / 6);

  // Filtered List
  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'attending'
          ? r.attending
          : !r.attending;
      const matchSite = siteFilter === 'all' || r.siteId === siteFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.guestName.toLowerCase().includes(q) ||
        (r.phone && r.phone.includes(q)) ||
        r.site.title.toLowerCase().includes(q);
      return matchStatus && matchSite && matchSearch;
    });
  }, [rsvps, statusFilter, siteFilter, search]);

  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Tên Khách Mời',
      'Số Điện Thoại',
      'Trạng Thái',
      'Số Người Dự',
      'Sự Kiện',
      'Thiệp Cưới Đích',
      'Thời Gian Gửi',
    ];

    const rows = filteredRsvps.map((r, idx) => [
      idx + 1,
      `"${r.guestName.replace(/"/g, '""')}"`,
      `"${r.phone || 'Chưa cung cấp'}"`,
      r.attending ? 'Sẽ Tham Dự' : 'Vắng Mặt',
      r.attending ? r.partySize : 0,
      `"${r.eventTarget || 'Tiệc Cưới'}"`,
      `"${r.site.title.replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toLocaleString('vi-VN')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh-sach-co-cuoi-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-stone-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Banquet &amp; RSVP Operations
            </span>
            <span className="text-xs text-stone-400">Dữ liệu thật từ phản hồi khách mời</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Quản Lý Cỗ Cưới &amp; Phản Hồi RSVP
          </h1>
          <p className="text-xs text-stone-400 max-w-2xl">
            Tự động tính toán số mâm cỗ cần đặt cho nhà hàng, phân loại số người đi kèm và xuất danh sách chuẩn bị bàn tiệc chỉ với 1 click.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredRsvps.length === 0}
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Danh Sách Cỗ Cưới (CSV)</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Responses */}
        <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Tổng Phản Hồi</span>
            <CalendarCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-serif font-bold text-white">
            {totalResponses}
          </p>
          <span className="text-[11px] text-stone-500 block">Lượt khách đã phản hồi thiệp</span>
        </div>

        {/* Confirmed Attending Guests */}
        <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Khách Sẽ Tham Dự</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-serif font-bold text-emerald-400">
            {totalAttendingHeadcount} <span className="text-sm font-sans font-normal text-stone-400">người</span>
          </p>
          <span className="text-[11px] text-emerald-500/80 block">
            {attendingList.length} lượt đồng ý (gồm người đi cùng)
          </span>
        </div>

        {/* Estimated Banquet Tables (Mâm Cỗ) */}
        <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Số Mâm Cỗ Cần Đặt</span>
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-serif font-bold text-amber-400">
            {totalTables10} <span className="text-sm font-sans font-normal text-stone-400">bàn (10 người)</span>
          </p>
          <span className="text-[11px] text-stone-500 block">
            Hoặc {totalTables6} bàn (loại 6 người)
          </span>
        </div>

        {/* Declined Guests */}
        <div className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Báo Vắng Mặt</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-serif font-bold text-rose-400">
            {declinedList.length} <span className="text-sm font-sans font-normal text-stone-400">người</span>
          </p>
          <span className="text-[11px] text-stone-500 block">Gửi lời chúc mừng từ xa</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-stone-900/70 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên khách hoặc SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'attending', label: 'Tham dự' },
              { id: 'declined', label: 'Vắng mặt' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === f.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Site Filter */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-stone-400 whitespace-nowrap">Lọc theo thiệp:</span>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="w-full sm:w-60 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả thiệp cưới ({sites.length})</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of RSVPs */}
      <div className="p-5 rounded-3xl bg-stone-900/70 border border-stone-800 space-y-4">
        <h3 className="font-bold text-sm text-white">
          Danh Sách Chi Tiết Khách Mời Phản Hồi ({filteredRsvps.length})
        </h3>

        {filteredRsvps.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <UtensilsCrossed className="w-12 h-12 text-stone-600 mx-auto" />
            <h4 className="text-sm font-semibold text-stone-400">
              Chưa có phản hồi RSVP nào trong cơ sở dữ liệu
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Khi khách mời nhận được thiệp và bấm gửi phản hồi qua biểu mẫu RSVP, thông tin sẽ lập tức hiển thị tại đây để bạn tiện sắp xếp cỗ cưới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/80 text-stone-400 font-semibold border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Khách Mời</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Số Người</th>
                  <th className="py-3 px-4">Sự Kiện</th>
                  <th className="py-3 px-4">Thiệp Cưới</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredRsvps.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {r.guestName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-300">
                      {r.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>{r.phone}</span>
                        </span>
                      ) : (
                        <span className="text-stone-600 italic">Không có</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.attending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Tham dự</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold text-[11px]">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>Vắng mặt</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-300">
                      {r.attending ? r.partySize : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">
                      {r.eventTarget || 'Tiệc Cưới'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/${r.site.slug}`}
                        target="_blank"
                        className="text-stone-300 hover:text-amber-400 transition-colors flex items-center gap-1"
                      >
                        <span className="truncate max-w-[150px]">{r.site.title}</span>
                        <ExternalLink className="w-3 h-3 text-stone-500 shrink-0" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right text-stone-500 font-mono text-[11px]">
                      {new Date(r.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
