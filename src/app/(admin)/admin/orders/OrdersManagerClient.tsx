'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle, ShieldAlert } from 'lucide-react';

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
    if (type === 'PLAN_LIFETIME_VIP_200K') return '👑 Gói VIP Trọn Đời (200k)';
    if (type === 'PLAN_ANNUAL_50K') return '⚡ Gói 1 Năm (50k)';
    if (type === 'SINGLE_TEMPLATE_VIP') return '🎨 Mua Lẻ Template VIP';
    return type;
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-stone-900/80 rounded-xl border border-stone-800">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Tất Cả ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Đã Thanh Toán ({orders.filter((o) => o.status === 'PAID').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Chờ Thanh Toán ({orders.filter((o) => o.status === 'PENDING').length})
          </button>
        </div>

        <div className="text-xs text-stone-400">
          Tổng tiền đã nhận:{' '}
          <span className="font-bold text-emerald-400">
            {orders
              .filter((o) => o.status === 'PAID')
              .reduce((sum, o) => sum + o.amount, 0)
              .toLocaleString('vi-VN')}{' '}
            đ
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-2xl bg-stone-900/60 border border-stone-800/80 overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            Không có đơn hàng nào trong danh mục này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/40 text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Mã Đơn</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Gói / Dịch Vụ</th>
                  <th className="py-3 px-4">Số Tiền</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4 text-right">Tác Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50">
                {filteredOrders.map((o) => {
                  const isBusy = loadingId === o.id;
                  return (
                    <tr key={o.id} className="hover:bg-stone-800/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">
                        {o.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-200">{o.user.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{o.user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-stone-300">{getTypeName(o.type)}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {o.amount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4">
                        {o.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> ĐÃ THANH TOÁN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> CHỜ CHUYỂN TIỀN
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-stone-400">
                        <div>Tạo: {new Date(o.createdAt).toLocaleString('vi-VN')}</div>
                        {o.paidAt && (
                          <div className="text-emerald-400/80">
                            Thanh toán: {new Date(o.paidAt).toLocaleTimeString('vi-VN')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {o.status === 'PENDING' ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleApprove(o.id, o.code)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-xs"
                            title="Bấm duyệt khi khách đã chuyển khoản mà webhook chưa bắn kịp"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Duyệt Thủ Công</span>
                          </button>
                        ) : (
                          <span className="text-emerald-400/80 text-[11px] font-medium">✓ Hoàn tất</span>
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
