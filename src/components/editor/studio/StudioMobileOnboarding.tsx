'use client';

import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, Hand, Edit3, Image as ImageIcon, Eye, Menu } from 'lucide-react';
import { useStudioStore } from './studioStore';

export default function StudioMobileOnboarding() {
  const { showOnboardingGuide, setShowOnboardingGuide } = useStudioStore();
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = welcome, 1..4 = steps

  if (!showOnboardingGuide) return null;

  const STEPS = [
    {
      step: 1,
      total: 4,
      title: 'Ấn vào chữ để sửa',
      icon: <Edit3 className="w-6 h-6 text-rose-500" />,
      desc: 'Ấn thẳng vào đoạn chữ trên thiệp — hộp công cụ hiện ra ngay để bạn gõ lại tên cô dâu chú rể, ngày cưới, đổi phông và màu chữ.',
      highlight: 'Chạm vào bất kỳ dòng chữ nào trên thiệp',
    },
    {
      step: 2,
      total: 4,
      title: 'Ấn vào ảnh để chỉnh',
      icon: <ImageIcon className="w-6 h-6 text-blue-500" />,
      desc: 'Ấn vào ảnh trên thiệp — thanh công cụ nổi bên dưới xuất hiện để đổi ảnh cưới của bạn, chỉnh sửa bo góc hoặc tách nền AI.',
      highlight: 'Nút Đổi ảnh & Tách nền AI sẵn sàng',
    },
    {
      step: 3,
      total: 4,
      title: 'Ẩn / hiện các phần thiệp',
      icon: <Eye className="w-6 h-6 text-purple-500" />,
      desc: 'Trong menu Chỉnh sửa (nút ☰), mỗi phần đều có biểu tượng 👁️ — ấn để ẩn hoặc bật lại phần Lịch trình, Album ảnh, hoặc Mừng cưới.',
      highlight: 'Bật/tắt linh hoạt theo ý muốn',
    },
    {
      step: 4,
      total: 4,
      title: 'Bảng công cụ tiện ích',
      icon: <Menu className="w-6 h-6 text-amber-500" />,
      desc: 'Bấm nút ☰ góc trái trên cùng để chọn nhạc nền đám cưới, bật hiệu ứng cánh hoa rơi lãng mạn, hoặc quản lý toàn bộ kho ảnh.',
      highlight: 'Âm nhạc & Hiệu ứng hoa rơi',
    },
  ];

  const handleClose = () => {
    setShowOnboardingGuide(false);
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 z-10 animate-in zoom-in-95 duration-200 text-center space-y-5">
        {currentStep === 0 ? (
          /* Welcome Screen (Matches Screenshot 1 & 13) */
          <>
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Hand className="w-8 h-8 stroke-[1.8] animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-white">
                Chào mừng bạn!
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Bạn có muốn xem hướng dẫn 4 bước nhanh cách sử dụng trình chỉnh sửa thiệp trên điện thoại không?
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 text-white font-bold text-xs shadow-lg shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Tôi muốn xem hướng dẫn</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 font-semibold text-xs transition-colors"
              >
                Tôi đã biết làm
              </button>
            </div>
          </>
        ) : (
          /* Step-by-Step Screens (Matches Screenshot 9, 10, 11, 12) */
          <>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                Bước {STEPS[currentStep - 1].step} / {STEPS[currentStep - 1].total}
              </span>
              <button
                onClick={handleClose}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center mx-auto shadow-xs">
              {STEPS[currentStep - 1].icon}
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-base text-stone-900 dark:text-white">
                {STEPS[currentStep - 1].title}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed px-2">
                {STEPS[currentStep - 1].desc}
              </p>
              <div className="inline-block px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-200/50">
                💡 {STEPS[currentStep - 1].highlight}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <span>Tiếp tục</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Tôi đã hiểu & Bắt đầu</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
