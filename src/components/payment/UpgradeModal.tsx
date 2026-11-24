'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';
import {
  X,
  Crown,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Palette,
} from 'lucide-react';

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'PLAN_LIFETIME_VIP_200K' | 'PLAN_ANNUAL_50K' | 'SINGLE_TEMPLATE_VIP';
  templateId?: string;
  templateName?: string;
  templatePrice?: number;
}

interface OrderInfo {
  id: string;
  code: string;
  amount: number;
  type: string;
  qrUrl: string;
  bankInfo: {
    bankId: string;
    bankAccount: string;
    bankName: string;
    transferContent: string;
  };
}

export default function UpgradeModal({
  isOpen,
  onClose,
  defaultType = 'PLAN_LIFETIME_VIP_200K',
  templateId,
  templateName,
  templatePrice = 30000,
}: UpgradeModalProps) {
  const { user, refreshUser, openAuthModal } = useAuth();

  const [selectedType, setSelectedType] = useState<
    'PLAN_LIFETIME_VIP_200K' | 'PLAN_ANNUAL_50K' | 'SINGLE_TEMPLATE_VIP'
  >(defaultType);

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedType(defaultType);
      setOrder(null);
      setIsPaid(false);
      setTimeLeft(900);
    }
  }, [isOpen, defaultType]);

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Create Order API
  const handleCreateOrder = async (typeToOrder = selectedType) => {
    if (!user) {
      onClose();
      openAuthModal('login');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: typeToOrder,
          targetItemId: typeToOrder === 'SINGLE_TEMPLATE_VIP' ? templateId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.order);
      } else {
        alert(data.error || 'Không thể tạo đơn hàng');
      }
    } catch (err) {
      console.error('Create order error:', err);
      alert('Lỗi kết nối khi tạo đơn');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Check Order Status Polling
  const checkOrderStatus = useCallback(async () => {
    if (!order || isPaid) return;

    try {
      const res = await fetch(`/api/payments/check-order/${order.code}`);
      const data = await res.json();

      if (res.ok && data.success && data.status === 'PAID') {
        setIsPaid(true);
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        await refreshUser();
      }
    } catch (err) {
      console.error('Polling order status error:', err);
    }
  }, [order, isPaid, refreshUser]);

  // Polling Interval
  useEffect(() => {
    if (!order || isPaid) return;

    const interval = setInterval(() => {
      checkOrderStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [order, isPaid, checkOrderStatus]);

  // Timer countdown
  useEffect(() => {
    if (!order || isPaid) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [order, isPaid]);

  // Simulate Payment Handler for Test/Dev
  const handleSimulatePayment = async () => {
    if (!order) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/payments/simulate-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: order.code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await checkOrderStatus();
      } else {
        alert(data.error || 'Lỗi giả lập thanh toán');
      }
    } catch {
      alert('Lỗi kết nối');
    } finally {
      setIsSimulating(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-2xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white text-stone-900 rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 z-10 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* SUCCESS SCREEN */}
          {isPaid ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Thanh Toán Thành Công! 🎉
              </h2>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                Cảm ơn bạn đã tin tưởng LoveStory! Gói dịch vụ đã được kích hoạt tự động vào tài khoản của bạn.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30"
                >
                  Bắt Đầu Sử Dụng Ngay
                </button>
              </div>
            </div>
          ) : !order ? (
            /* PLAN SELECTION SCREEN */
            <div className="space-y-6">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Nâng Cấp Thiệp Cưới Của Bạn
                </span>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  Chọn Gói Dịch Vụ Phù Hợp
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Mở khóa tính năng cao cấp, xóa watermark và lưu giữ thiệp cưới trọn đời.
                </p>
              </div>

              {/* Tiers List */}
              <div className="space-y-3">
                {/* 1. VIP LIFETIME 200K (Highlighted) */}
                <div
                  onClick={() => setSelectedType('PLAN_LIFETIME_VIP_200K')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                    selectedType === 'PLAN_LIFETIME_VIP_200K'
                      ? 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-stone-50/70 border-stone-200 hover:border-amber-300 hover:bg-white'
                  }`}
                >
                  <div className="absolute top-0 right-0 px-3 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider rounded-bl-xl">
                    Được khuyên dùng
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 shrink-0 mt-0.5">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-stone-900">VIP Trọn Đời (Lifetime)</h3>
                          <span className="text-[11px] text-amber-700 font-bold">• Dùng Tất Cả Mẫu</span>
                        </div>
                        <ul className="text-[11px] text-stone-600 space-y-1 mt-1.5">
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span><strong>Mở khóa toàn bộ</strong> các template VIP (Không cần mua lẻ)</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Lưu trữ <strong>vĩnh viễn trọn đời</strong>, không giới hạn lượt xem</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Không watermark • Hỗ trợ tên miền riêng</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold font-serif text-amber-700">200.000 đ</div>
                      <span className="text-[10px] text-stone-500">Trả 1 lần duy nhất</span>
                    </div>
                  </div>
                </div>

                {/* 2. ANNUAL 50K */}
                <div
                  onClick={() => setSelectedType('PLAN_ANNUAL_50K')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedType === 'PLAN_ANNUAL_50K'
                      ? 'bg-blue-50/70 border-blue-400 shadow-md ring-2 ring-blue-400/40'
                      : 'bg-stone-50/70 border-stone-200 hover:border-blue-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-blue-100 border border-blue-300 text-blue-700 shrink-0 mt-0.5">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-900">Gói Tiêu Chuẩn 1 Năm</h3>
                        <ul className="text-[11px] text-stone-600 space-y-1 mt-1.5">
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Thời hạn <strong>1 năm (365 ngày)</strong>, không giới hạn views</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Không watermark • Thêm 1 tháng lưu trữ backup DB</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold font-serif text-blue-700">50.000 đ</div>
                      <span className="text-[10px] text-stone-500">Thời hạn 1 năm</span>
                    </div>
                  </div>
                </div>

                {/* 3. SINGLE TEMPLATE (Optional if templateId is provided) */}
                {templateId && (
                  <div
                    onClick={() => setSelectedType('SINGLE_TEMPLATE_VIP')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedType === 'SINGLE_TEMPLATE_VIP'
                        ? 'bg-purple-50/70 border-purple-400 shadow-md ring-2 ring-purple-400/40'
                        : 'bg-stone-50/70 border-stone-200 hover:border-purple-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-purple-100 border border-purple-300 text-purple-700 shrink-0 mt-0.5">
                          <Palette className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-stone-900">
                            Mua Lẻ Mẫu {templateName || 'VIP'}
                          </h3>
                          <p className="text-[11px] text-stone-500 mt-1">
                            Sử dụng riêng mẫu VIP này cho thiệp cưới của bạn.
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold font-serif text-purple-700">
                          {templatePrice.toLocaleString('vi-VN')} đ
                        </div>
                        <span className="text-[10px] text-stone-500">Mua lẻ 1 mẫu</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                disabled={isCreatingOrder}
                onClick={() => handleCreateOrder()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
              >
                {isCreatingOrder ? (
                  <span>Đang khởi tạo mã VietQR...</span>
                ) : (
                  <>
                    <span>Tiến Hành Thanh Toán VietQR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* VIETQR PAYMENT SCREEN */
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h3 className="font-bold text-sm text-stone-900">Quét Mã VietQR Thanh Toán</h3>
                  <p className="text-[11px] text-stone-500">
                    Mở app ngân hàng bất kỳ để quét mã Napas 24/7
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                {/* QR Code Frame */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col items-center justify-center shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.qrUrl}
                    alt={`VietQR ${order.code}`}
                    className="w-full aspect-square object-contain rounded-lg bg-white p-2"
                  />
                  <span className="text-[10px] text-stone-600 font-semibold mt-1">
                    Quét để tự động điền số tiền &amp; nội dung
                  </span>
                </div>

                {/* Bank Info & Transfer Details */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <div>
                      <span className="text-stone-500 text-[10px] block">Số tiền cần thanh toán</span>
                      <span className="text-lg font-bold font-serif text-emerald-600">
                        {order.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-500 text-[10px] block">Nội dung chuyển khoản (Bắt buộc)</span>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <span className="font-mono font-black text-rose-600 text-sm tracking-wide">
                          {order.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.code, 'code')}
                          className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-[10px] font-medium flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          {copiedField === 'code' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedField === 'code' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-stone-500 text-[10px] block">Ngân hàng thụ hưởng</span>
                      <span className="font-semibold text-stone-900">
                        {order.bankInfo.bankId} • {order.bankInfo.bankAccount}
                      </span>
                      <span className="block text-[11px] text-stone-600 uppercase mt-0.5">
                        {order.bankInfo.bankName}
                      </span>
                    </div>
                  </div>

                  {/* Polling Notice */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <RefreshCw className="w-3.5 h-3.5 text-rose-500 animate-spin shrink-0" />
                    <span>Hệ thống đang chờ SePay bắt biến động số dư và kích hoạt tự động...</span>
                  </div>

                  {/* Dev Simulation Button */}
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={handleSimulatePayment}
                    className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
                    title="Bấm để kích hoạt thanh toán ngay lập tức phục vụ kiểm thử"
                  >
                    <span>⚡ Giả Lập Thanh Toán Thành Công (Test Dev)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
