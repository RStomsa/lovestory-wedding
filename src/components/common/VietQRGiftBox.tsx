'use client';

import React, { useState } from 'react';
import { PersonInfo } from '@/types/wedding';
import { generateVietQRUrl } from '@/lib/utils';
import { Gift, Copy, Check, CreditCard, HeartHandshake } from 'lucide-react';

interface Props {
  groom: PersonInfo;
  bride: PersonInfo;
  accentColor?: string;
}

export default function VietQRGiftBox({ groom, bride }: Props) {
  const [selectedSide, setSelectedSide] = useState<'groom' | 'bride'>('groom');
  const [copied, setCopied] = useState(false);

  const currentPerson = selectedSide === 'groom' ? groom : bride;
  const bank = currentPerson.bankAccount;
  const qrUrl = generateVietQRUrl(
    bank.bankId,
    bank.accountNo,
    bank.accountName,
    `Mung cuoi ${groom.shortName} va ${bride.shortName}`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(bank.accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/50 dark:border-stone-800 text-stone-900 dark:text-stone-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mb-3">
          <Gift className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold">Hộp Mừng Cưới</h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Dành cho những người bạn, người thân ở xa không thể tham dự trực tiếp
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl mb-6">
        <button
          onClick={() => setSelectedSide('groom')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
            selectedSide === 'groom'
              ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-900 dark:text-white font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <span>🤵 Mừng Chú Rể</span>
        </button>
        <button
          onClick={() => setSelectedSide('bride')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
            selectedSide === 'bride'
              ? 'bg-white dark:bg-stone-900 shadow-sm text-stone-900 dark:text-white font-semibold'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <span>👰 Mừng Cô Dâu</span>
        </button>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center">
        <div className="relative p-4 bg-white rounded-2xl shadow-inner border border-stone-200 mb-5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt={`Mã QR mừng cưới ${currentPerson.name}`}
            className="w-56 h-56 object-contain rounded-xl"
            loading="lazy"
          />
          <div className="text-[10px] text-center text-stone-400 mt-2 flex items-center justify-center gap-1">
            <HeartHandshake className="w-3 h-3 text-rose-500" /> Quét mã qua bất kỳ App Ngân Hàng
          </div>
        </div>

        {/* Bank Account Details Card */}
        <div className="w-full bg-stone-50 dark:bg-stone-800/60 rounded-xl p-4 border border-stone-200/60 dark:border-stone-700/60 text-xs sm:text-sm space-y-2">
          <div className="flex justify-between items-center text-stone-500 dark:text-stone-400">
            <span>Ngân hàng:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{bank.bankName}</span>
          </div>
          <div className="flex justify-between items-center text-stone-500 dark:text-stone-400">
            <span>Chủ tài khoản:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">{bank.accountName}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-stone-200/50 dark:border-stone-700/50">
            <span>Số tài khoản:</span>
            <div className="flex items-center gap-2 font-mono font-bold text-stone-900 dark:text-stone-100">
              <span className="text-base text-rose-600 dark:text-rose-400">{bank.accountNo}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 transition-colors"
                title="Sao chép số tài khoản"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {copied && (
          <p className="text-xs text-emerald-600 font-medium mt-2 animate-fade-in">
            ✓ Đã sao chép số tài khoản vào bộ nhớ tạm!
          </p>
        )}
      </div>
    </div>
  );
}
