'use client';

import React, { useState } from 'react';
import { WishMessage } from '@/types/wedding';
import confetti from 'canvas-confetti';
import { Heart, MessageSquareHeart, Send, Sparkles } from 'lucide-react';

interface Props {
  initialWishes: WishMessage[];
  onAddWish?: (wish: WishMessage) => void;
}

export default function GuestbookWishes({ initialWishes, onAddWish }: Props) {
  const [wishes, setWishes] = useState<WishMessage[]>(initialWishes);
  const [senderName, setSenderName] = useState('');
  const [relation, setRelation] = useState('Bạn bè');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    setIsSending(true);

    const newWish: WishMessage = {
      id: 'wish-' + Date.now(),
      senderName: senderName.trim(),
      relation: relation.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#fcd34d'],
      });
    } catch {
      // Confetti fallback
    }

    setWishes([newWish, ...wishes]);
    if (onAddWish) onAddWish(newWish);

    setSenderName('');
    setMessage('');
    setIsSending(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mb-3">
          <MessageSquareHeart className="w-6 h-6" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold">Sổ Lưu Bút Chúc Phúc</h3>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">
          Gửi gắm những lời chúc ngọt ngào nhất đến đôi uyên ương
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/60 dark:border-stone-800 mb-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                Tên của bạn *
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="VD: Anh Minh..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                Mối quan hệ
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              >
                <option value="Bạn bè">Bạn bè</option>
                <option value="Bạn Chú Rể">Bạn Chú Rể</option>
                <option value="Bạn Cô Dâu">Bạn Cô Dâu</option>
                <option value="Đồng nghiệp">Đồng nghiệp</option>
                <option value="Người thân">Người thân / Họ hàng</option>
                <option value="Anh em">Anh em thân thiết</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
              Lời chúc của bạn *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Gửi lời chúc tốt đẹp nhất đến cặp đôi..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Gửi Lời Chúc Mừng</span>
          </button>
        </form>
      </div>

      {/* Wishes List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {wishes.map((w) => (
          <div
            key={w.id}
            className="p-5 rounded-2xl bg-white/80 dark:bg-stone-800/80 backdrop-blur-md border border-stone-200/50 dark:border-stone-700/50 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                  {w.senderName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-sm leading-tight">{w.senderName}</h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">{w.relation}</span>
                </div>
              </div>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
            </div>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-10">
              &ldquo;{w.message}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
