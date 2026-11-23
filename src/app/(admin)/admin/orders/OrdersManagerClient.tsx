'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface OrderData {
  id: string;
  code: string;
  type: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  paidAt?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  transactions: {
    id: string;
    provider: string;
    amount: number;
    transferContent?: string | null;
    receivedAt: string;
  }[];
}

export default function OrdersManagerClient({ initialOrders }: { initialOrders: OrderData[] }) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  const handleApprove = async (orderId: string, orderCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt thủ công cho đơn hàng ${orderCode}?`)) return;

    setLoadingId(orderId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Duyệt đơn thất bại');
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'PAID', paidAt: new Date().toISOString() } : o))
      );
      setMessage({ text: data.message || 'Kích hoạt đơn hàng thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  const getTypeName = (type: string) => {
    if (type === 'PLAN_LIFETIME_VIP_200K') return 'Gói VIP Trọn Đời (200.000 đ)';
    if (type === 'PLAN_ANNUAL_50K') return 'Gói Chuẩn 1 Năm (50.000 đ)';
    if (type === 'SINGLE_TEMPLATE_VIP') return 'Mua Lẻ Template VIP (30.000 đ)';
    return type;
  };

  const totalPaidRevenue = orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              Đối soát giao dịch
            </span>
            <span className="text-xs text-stone-400 font-mono">VietQR / SePay</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            Quản Lý Đơn Hàng &amp; Doanh Thu
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi dòng tiền tự động 24/7 từ ngân hàng qua cổng VietQR SePay, kích hoạt gói và đối soát thủ công khi cần.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 shrink-0 text-right">
          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">
            Doanh thu thực tế
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 font-mono mt-0.5">
            {totalPaidRevenue.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            {orders.filter((o) => o.status === 'PAID').length} đơn hoàn tất
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-stone-100 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'ALL'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'PAID'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Đã thanh toán ({orders.filter((o) => o.status === 'PAID').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'PENDING'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Chờ thanh toán ({orders.filter((o) => o.status === 'PENDING').length})
          </button>
        </div>

        <div className="text-xs text-stone-500">
          Hiển thị <span className="font-semibold text-stone-900">{filteredOrders.length}</span> đơn hàng
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            Không có đơn hàng nào trong danh mục này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200/90 bg-stone-50/70 text-stone-600 font-medium text-[11px]">
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Gói / Dịch vụ</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((o) => {
                  const isBusy = loadingId === o.id;
                  return (
                    <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                        {o.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-900">{o.user.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{o.user.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-800">{getTypeName(o.type)}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-stone-900">
                        {o.amount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3.5 px-4">
                        {o.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                            <Clock className="w-3 h-3 text-amber-600" /> Chờ chuyển tiền
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-stone-500">
                        <div>Tạo: {new Date(o.createdAt).toLocaleString('vi-VN')}</div>
                        {o.paidAt && (
                          <div className="text-stone-700 font-medium">
                            Thanh toán: {new Date(o.paidAt).toLocaleTimeString('vi-VN')}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {o.status === 'PENDING' ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleApprove(o.id, o.code)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                            title="Bấm duyệt khi khách đã chuyển khoản mà webhook chưa bắn kịp"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                            <span>Duyệt thủ công</span>
                          </button>
                        ) : (
                          <span className="text-stone-500 text-[11px] font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hoàn tất
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
