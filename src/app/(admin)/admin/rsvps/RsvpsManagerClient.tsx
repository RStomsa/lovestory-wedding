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
  ExternalLink,
  UtensilsCrossed,
  Phone,
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
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              Quản lý tiệc cưới &amp; RSVP
            </span>
            <span className="text-xs text-stone-400 font-mono">Dữ liệu thật từ khách mời</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Quản Lý Cỗ Cưới &amp; Phản Hồi RSVP
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Tự động tính toán số mâm cỗ cần đặt cho nhà hàng, phân loại số người đi kèm và xuất danh sách chuẩn bị bàn tiệc.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredRsvps.length === 0}
          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất danh sách (CSV)</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Responses */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Tổng phản hồi</span>
            <CalendarCheck className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 font-mono">
            {totalResponses}
          </p>
          <span className="text-[11px] text-stone-500 block">Lượt khách đã phản hồi thiệp</span>
        </div>

        {/* Confirmed Attending Guests */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Khách sẽ tham dự</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 font-mono">
            {totalAttendingHeadcount} <span className="text-sm font-sans font-normal text-stone-500">người</span>
          </p>
          <span className="text-[11px] text-stone-500 block">
            {attendingList.length} lượt đồng ý (gồm người đi cùng)
          </span>
        </div>

        {/* Estimated Banquet Tables (Mâm Cỗ) */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Số mâm cỗ cần đặt</span>
            <UtensilsCrossed className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 font-mono">
            {totalTables10} <span className="text-sm font-sans font-normal text-stone-500">bàn (10 người)</span>
          </p>
          <span className="text-[11px] text-stone-500 block">
            Hoặc {totalTables6} bàn (loại 6 người)
          </span>
        </div>

        {/* Declined Guests */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs">
            <span>Báo vắng mặt</span>
            <XCircle className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 font-mono">
            {declinedList.length} <span className="text-sm font-sans font-normal text-stone-500">người</span>
          </p>
          <span className="text-[11px] text-stone-500 block">Gửi lời chúc mừng từ xa</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên khách hoặc SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* Status Filter */}
          <div className="flex p-1 bg-stone-100 rounded-xl text-xs w-full sm:w-auto">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'attending', label: 'Tham dự' },
              { id: 'declined', label: 'Vắng mặt' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === f.id
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Site Filter */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs text-stone-500 whitespace-nowrap">Lọc theo thiệp:</span>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="w-full sm:w-60 px-3 py-1.5 rounded-xl bg-stone-50/60 border border-stone-200 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
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
      <div className="rounded-2xl bg-white border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200/80 flex items-center justify-between">
          <h3 className="font-semibold text-xs text-stone-900">
            Danh sách chi tiết khách mời phản hồi ({filteredRsvps.length})
          </h3>
        </div>

        {filteredRsvps.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <UtensilsCrossed className="w-8 h-8 text-stone-300 mx-auto" />
            <h4 className="text-xs font-medium text-stone-600">
              Chưa có phản hồi RSVP nào trong cơ sở dữ liệu
            </h4>
            <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
              Khi khách mời nhận được thiệp và gửi phản hồi, thông tin sẽ lập tức hiển thị tại đây để bạn tiện sắp xếp cỗ cưới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/70 border-b border-stone-200/90 text-stone-600 font-medium text-[11px]">
                <tr>
                  <th className="py-3 px-4">Khách mời</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Số người</th>
                  <th className="py-3 px-4">Sự kiện</th>
                  <th className="py-3 px-4">Thiệp cưới</th>
                  <th className="py-3 px-4 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRsvps.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-stone-900">
                      {r.guestName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">
                      {r.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{r.phone}</span>
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">Không có</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.attending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Tham dự</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium text-[10px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Vắng mặt</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-stone-900">
                      {r.attending ? r.partySize : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {r.eventTarget || 'Tiệc Cưới'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/${r.site.slug}`}
                        target="_blank"
                        className="text-stone-700 hover:text-stone-900 hover:underline transition-colors flex items-center gap-1"
                      >
                        <span className="truncate max-w-[150px]">{r.site.title}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-right text-stone-400 font-mono text-[11px]">
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
