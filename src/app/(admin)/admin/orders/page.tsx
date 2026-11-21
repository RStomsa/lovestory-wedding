import React from 'react';
import prisma from '@/lib/prisma';
import OrdersManagerClient from './OrdersManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      transactions: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
          Quản Lý Đơn Hàng & Thanh Toán VietQR
        </h1>
        <p className="text-xs text-stone-400 mt-1">
          Theo dõi lịch sử đơn hàng, đối soát biến động số dư ngân hàng SePay, và kích hoạt gói Pro thủ công khi cần.
        </p>
      </div>

      <OrdersManagerClient initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
