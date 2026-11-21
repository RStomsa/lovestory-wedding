'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  Lock,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  Sparkles,
  Phone,
  CreditCard,
} from 'lucide-react';
import { useStudioStore } from './studioStore';
import { WeddingCeremony, WeddingProfileData } from './studioTypes';

const POPULAR_BANKS = [
  'MBBank (Quân Đội)',
  'Vietcombank',
  'Techcombank',
  'VPBank',
  'ACB',
  'BIDV',
  'Agribank',
  'TPBank',
  'Sacombank',
  'HDBank',
  'VIB',
  'MSB',
  'OCB',
  'SHB',
  'SeABank',
];

const CEREMONY_PRESETS = [
  'Lễ ăn hỏi',
  'Lễ vu quy',
  'Lễ thành hôn',
  'Tiệc cưới nhà gái',
  'Tiệc cưới nhà trai',
  'Tiệc cưới',
  'Lễ khác',
];

const GROOM_ORDER_OPTIONS = ['Trưởng nam', 'Thứ nam', 'Út nam', 'Quý nam'];
const BRIDE_ORDER_OPTIONS = ['Trưởng nữ', 'Thứ nữ', 'Út nữ', 'Ái nữ'];

export default function WeddingProfileModal() {
  const {
    isProfileModalOpen,
    setProfileModalOpen,
    weddingProfile,
    applyWeddingProfileToCanvas,
  } = useStudioStore();

  const [activeTab, setActiveTab] = useState<'ceremonies' | 'groom' | 'bride'>('ceremonies');

  // Form State
  const [profileName, setProfileName] = useState('');
  const [ceremonies, setCeremonies] = useState<WeddingCeremony[]>([]);
  const [groom, setGroom] = useState({
    fullName: '',
    shortName: '',
    orderInFamily: 'Trưởng nam',
    fatherName: '',
    motherName: '',
    phone: '',
    bankName: 'MBBank (Quân Đội)',
    accountNo: '',
    accountName: '',
  });
  const [bride, setBride] = useState({
    fullName: '',
    shortName: '',
    orderInFamily: 'Ái nữ',
    fatherName: '',
    motherName: '',
    phone: '',
    bankName: 'Vietcombank',
    accountNo: '',
    accountName: '',
  });

  // Sync state when modal opens or weddingProfile in store changes
  useEffect(() => {
    if (isProfileModalOpen && weddingProfile) {
      queueMicrotask(() => {
        setProfileName(weddingProfile.profileName || '');
        setCeremonies(
          weddingProfile.ceremonies && weddingProfile.ceremonies.length > 0
            ? [...weddingProfile.ceremonies]
            : []
        );
        if (weddingProfile.groom) {
          setGroom({
            fullName: weddingProfile.groom.fullName || '',
            shortName: weddingProfile.groom.shortName || '',
            orderInFamily: weddingProfile.groom.orderInFamily || 'Trưởng nam',
            fatherName: weddingProfile.groom.fatherName || '',
            motherName: weddingProfile.groom.motherName || '',
            phone: weddingProfile.groom.phone || '',
            bankName: weddingProfile.groom.bankName || 'MBBank (Quân Đội)',
            accountNo: weddingProfile.groom.accountNo || '',
            accountName: weddingProfile.groom.accountName || '',
          });
        }
        if (weddingProfile.bride) {
          setBride({
            fullName: weddingProfile.bride.fullName || '',
            shortName: weddingProfile.bride.shortName || '',
            orderInFamily: weddingProfile.bride.orderInFamily || 'Ái nữ',
            fatherName: weddingProfile.bride.fatherName || '',
            motherName: weddingProfile.bride.motherName || '',
            phone: weddingProfile.bride.phone || '',
            bankName: weddingProfile.bride.bankName || 'Vietcombank',
            accountNo: weddingProfile.bride.accountNo || '',
            accountName: weddingProfile.bride.accountName || '',
          });
        }
      });
    }
  }, [isProfileModalOpen, weddingProfile]);

  if (!isProfileModalOpen) return null;

  const handleClose = () => {
    setProfileModalOpen(false);
  };

  const handleBack = () => {
    if (activeTab === 'bride') setActiveTab('groom');
    else if (activeTab === 'groom') setActiveTab('ceremonies');
    else handleClose();
  };

  // Add Ceremony from quick pill buttons
  const handleAddCeremony = (name: string) => {
    const isFirst = ceremonies.length === 0;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');
    const newCeremony: WeddingCeremony = {
      id: `ceremony-${ceremonies.length + 1}-${slug}`,
      name,
      isMain: isFirst,
      date: '2026-11-28',
      time: name.includes('ăn hỏi') ? '08:30' : name.includes('vu quy') ? '09:30' : '11:00',
      venue: name.includes('nhà gái')
        ? 'Tư gia Nhà Gái'
        : name.includes('nhà trai')
        ? 'Tư gia Nhà Trai'
        : 'Trung tâm tiệc cưới Trống Đồng Palace',
      address: 'Hà Nội',
    };
    setCeremonies((prev) => [...prev, newCeremony]);
  };

  // Remove Ceremony
  const handleRemoveCeremony = (id: string) => {
    const next = ceremonies.filter((c) => c.id !== id);
    if (next.length > 0 && !next.some((c) => c.isMain)) {
      next[0].isMain = true;
    }
    setCeremonies(next);
  };

  // Set Ceremony as Main
  const handleSetMainCeremony = (id: string) => {
    setCeremonies(
      ceremonies.map((c) => ({
        ...c,
        isMain: c.id === id,
      }))
    );
  };

  // Update Ceremony Field
  const handleUpdateCeremony = (id: string, updates: Partial<WeddingCeremony>) => {
    setCeremonies(
      ceremonies.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Submit and apply to canvas
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalProfile: WeddingProfileData = {
      isLinked: true,
      profileName: profileName.trim() || `${groom.shortName || groom.fullName || 'Bảo'} & ${bride.shortName || bride.fullName || 'Vy'}`,
      ceremonies: ceremonies.length > 0 ? ceremonies : [
        {
          id: 'ceremony-default',
          name: 'Lễ thành hôn',
          isMain: true,
          date: '2026-11-28',
          time: '11:00',
          venue: 'Trung tâm tiệc cưới Trống Đồng Palace',
          address: '489 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
        },
      ],
      groom: {
        ...groom,
        fullName: groom.fullName || 'Đặng Quốc Bảo',
        shortName: groom.shortName || 'Quốc Bảo',
      },
      bride: {
        ...bride,
        fullName: bride.fullName || 'Nguyễn Thảo Vy',
        shortName: bride.shortName || 'Thảo Vy',
      },
    };

    applyWeddingProfileToCanvas(finalProfile);

    // Save active profile to localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lovestory_active_wedding_profile', JSON.stringify(finalProfile));
      } catch (err) {
        console.warn('Failed to cache wedding profile in localStorage:', err);
      }
    }

    setProfileModalOpen(false);
  };

  // Quick fill sample data for fast testing
  const handleQuickFillSample = () => {
    setProfileName('Đám cưới Quốc Bảo & Thảo Vy');
    setCeremonies([
      {
        id: 'c-1',
        name: 'Lễ ăn hỏi',
        isMain: false,
        date: '2026-11-26',
        time: '09:00',
        venue: 'Tư gia Nhà Gái',
        address: 'Phố Cổ, Hoàn Kiếm, Hà Nội',
      },
      {
        id: 'c-2',
        name: 'Lễ thành hôn',
        isMain: true,
        date: '2026-11-28',
        time: '11:00',
        venue: 'Trung tâm tiệc cưới Trống Đồng Palace',
        address: '489 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
      },
    ]);
    setGroom({
      fullName: 'Đặng Quốc Bảo',
      shortName: 'Quốc Bảo',
      orderInFamily: 'Trưởng nam',
      fatherName: 'Đặng Văn Hùng',
      motherName: 'Nguyễn Thị Hoa',
      phone: '0901234567',
      bankName: 'MBBank (Quân Đội)',
      accountNo: '090123456789',
      accountName: 'DANG QUOC BAO',
    });
    setBride({
      fullName: 'Nguyễn Thảo Vy',
      shortName: 'Thảo Vy',
      orderInFamily: 'Ái nữ',
      fatherName: 'Nguyễn Văn Minh',
      motherName: 'Lê Thị Mai',
      phone: '0987654321',
      bankName: 'Vietcombank',
      accountNo: '1023456789',
      accountName: 'NGUYEN THAO VY',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl w-full max-w-xl my-auto overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 select-none">
        {/* ======================================================== */}
        {/* HEADER */}
        {/* ======================================================== */}
        <div className="px-6 pt-5 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
              Tạo hồ sơ cưới
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickFillSample}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold hover:bg-rose-100 transition-colors"
                title="Điền nhanh dữ liệu mẫu để thử thiệp cưới"
              >
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>Mẫu nhanh</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-header breadcrumb / Back action */}
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 font-medium cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          </div>

          {/* Segmented Tabs Control */}
          <div className="bg-stone-100 dark:bg-stone-800/80 p-1 rounded-full flex items-center gap-1 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('ceremonies')}
              className={`flex-1 py-2 text-xs rounded-full font-semibold transition-all ${
                activeTab === 'ceremonies'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              Các lễ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('groom')}
              className={`flex-1 py-2 text-xs rounded-full font-semibold transition-all ${
                activeTab === 'groom'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              Chú rể
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bride')}
              className={`flex-1 py-2 text-xs rounded-full font-semibold transition-all ${
                activeTab === 'bride'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              Cô dâu
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* BODY (SCROLLABLE) */}
        {/* ======================================================== */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-5 text-xs">
            {/* ---------------------------------------------------- */}
            {/* TAB 1: CÁC LỄ */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'ceremonies' && (
              <div className="space-y-4">
                {/* Tên hồ sơ */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                    Tên hồ sơ
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="VD: Đám cưới Bảo & Vy"
                    className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2.5 text-xs text-stone-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950 transition-all font-medium"
                  />
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Bỏ trống thì dùng tên cô dâu chú rể.
                  </p>
                </div>

                {/* Ngày giờ, địa điểm từng lễ */}
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Ngày giờ, địa điểm từng lễ
                    </label>
                    <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                      Mỗi lễ điền vào đúng mục của nó trên thiệp. Lễ chính dùng cho lịch, đếm ngược và ngày giờ ở hiệu ứng mở màn.
                    </p>
                  </div>

                  {/* Empty state container (matching image when 0 ceremonies) */}
                  {ceremonies.length === 0 ? (
                    <div className="border border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-4 text-center text-xs text-stone-500 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-800/20 leading-relaxed">
                      Chưa có lễ nào. Thêm lễ thành hôn hoặc tiệc cưới để điền ngày giờ, địa điểm lên thiệp.
                    </div>
                  ) : (
                    /* List of added ceremonies */
                    <div className="space-y-3">
                      {ceremonies.map((ceremony) => (
                        <div
                          key={ceremony.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            ceremony.isMain
                              ? 'border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 shadow-xs'
                              : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-700/60 mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 dark:text-white text-xs">
                                {ceremony.name}
                              </span>
                              {ceremony.isMain ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>Lễ chính</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetMainCeremony(ceremony.id)}
                                  className="text-[10px] text-stone-400 hover:text-purple-600 font-medium underline"
                                >
                                  Đặt làm lễ chính
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCeremony(ceremony.id)}
                              className="p-1 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Xóa lễ này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[10px] text-stone-500 block mb-1">
                                Ngày tổ chức *
                              </label>
                              <div className="relative">
                                <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                                <input
                                  type="date"
                                  value={ceremony.date || ''}
                                  onChange={(e) => handleUpdateCeremony(ceremony.id, { date: e.target.value })}
                                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-stone-500 block mb-1">
                                Giờ tổ chức *
                              </label>
                              <div className="relative">
                                <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                                <input
                                  type="time"
                                  value={ceremony.time || ''}
                                  onChange={(e) => handleUpdateCeremony(ceremony.id, { time: e.target.value })}
                                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-[10px] text-stone-500 block mb-1">
                                Tên địa điểm (Trung tâm tiệc cưới / Tư gia)
                              </label>
                              <div className="relative">
                                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                                <input
                                  type="text"
                                  value={ceremony.venue || ''}
                                  onChange={(e) => handleUpdateCeremony(ceremony.id, { venue: e.target.value })}
                                  placeholder="VD: Trung tâm tiệc cưới Trống Đồng Palace"
                                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-[10px] text-stone-500 block mb-1">
                                Địa chỉ cụ thể
                              </label>
                              <input
                                type="text"
                                value={ceremony.address || ''}
                                onChange={(e) => handleUpdateCeremony(ceremony.id, { address: e.target.value })}
                                placeholder="VD: Số 489 Hoàng Quốc Việt, Cầu Giấy, Hà Nội"
                                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Add Pills (Exact pills from screenshot) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {CEREMONY_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddCeremony(preset)}
                        className="px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                      >
                        <Plus className="w-3 h-3 text-stone-400" />
                        <span>{preset}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: CHÚ RỂ */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'groom' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Họ và tên chú rể *
                    </label>
                    <input
                      type="text"
                      value={groom.fullName}
                      onChange={(e) => setGroom({ ...groom, fullName: e.target.value })}
                      placeholder="VD: Đặng Quốc Bảo"
                      className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Tên thường gọi / Thân mật
                    </label>
                    <input
                      type="text"
                      value={groom.shortName}
                      onChange={(e) => setGroom({ ...groom, shortName: e.target.value })}
                      placeholder="VD: Quốc Bảo"
                      className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>
                </div>

                {/* Thứ bậc trong gia đình */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                    Thứ bậc trong gia đình
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {GROOM_ORDER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setGroom({ ...groom, orderInFamily: opt })}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          groom.orderInFamily === opt
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Họ tên Bố Mẹ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block">
                      Họ tên Bố chú rể
                    </label>
                    <input
                      type="text"
                      value={groom.fatherName}
                      onChange={(e) => setGroom({ ...groom, fatherName: e.target.value })}
                      placeholder="VD: Đặng Văn Hùng"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block">
                      Họ tên Mẹ chú rể
                    </label>
                    <input
                      type="text"
                      value={groom.motherName}
                      onChange={(e) => setGroom({ ...groom, motherName: e.target.value })}
                      placeholder="VD: Nguyễn Thị Hoa"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>
                </div>

                {/* Số điện thoại liên hệ */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                    Số điện thoại chú rể (gắn vào nút Gọi trên thiệp)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={groom.phone}
                      onChange={(e) => setGroom({ ...groom, phone: e.target.value })}
                      placeholder="VD: 0901234567"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                {/* Tài khoản nhận mừng cưới (Hộp mừng) */}
                <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/20 space-y-2.5">
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Tài khoản mừng cưới chú rể</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-stone-500 block mb-1">Ngân hàng</label>
                      <select
                        value={groom.bankName}
                        onChange={(e) => setGroom({ ...groom, bankName: e.target.value })}
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 text-xs text-stone-900 dark:text-white outline-none font-medium"
                      >
                        {POPULAR_BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 block mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        value={groom.accountNo}
                        onChange={(e) => setGroom({ ...groom, accountNo: e.target.value })}
                        placeholder="Số tài khoản ngân hàng"
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 text-xs text-stone-900 dark:text-white outline-none font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-stone-500 block mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        value={groom.accountName}
                        onChange={(e) => setGroom({ ...groom, accountName: e.target.value.toUpperCase() })}
                        placeholder="VD: DANG QUOC BAO"
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 text-xs text-stone-900 dark:text-white outline-none uppercase font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 3: CÔ DÂU */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'bride' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Họ và tên cô dâu *
                    </label>
                    <input
                      type="text"
                      value={bride.fullName}
                      onChange={(e) => setBride({ ...bride, fullName: e.target.value })}
                      placeholder="VD: Nguyễn Thảo Vy"
                      className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      Tên thường gọi / Thân mật
                    </label>
                    <input
                      type="text"
                      value={bride.shortName}
                      onChange={(e) => setBride({ ...bride, shortName: e.target.value })}
                      placeholder="VD: Thảo Vy"
                      className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                    />
                  </div>
                </div>

                {/* Thứ bậc trong gia đình */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                    Thứ bậc trong gia đình
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {BRIDE_ORDER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBride({ ...bride, orderInFamily: opt })}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          bride.orderInFamily === opt
                            ? 'bg-rose-500 text-white border-rose-500'
                            : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Họ tên Bố Mẹ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block">
                      Họ tên Bố cô dâu
                    </label>
                    <input
                      type="text"
                      value={bride.fatherName}
                      onChange={(e) => setBride({ ...bride, fatherName: e.target.value })}
                      placeholder="VD: Nguyễn Văn Minh"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block">
                      Họ tên Mẹ cô dâu
                    </label>
                    <input
                      type="text"
                      value={bride.motherName}
                      onChange={(e) => setBride({ ...bride, motherName: e.target.value })}
                      placeholder="VD: Lê Thị Mai"
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-rose-500 font-medium"
                    />
                  </div>
                </div>

                {/* Số điện thoại liên hệ */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                    Số điện thoại cô dâu (gắn vào nút Gọi trên thiệp)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={bride.phone}
                      onChange={(e) => setBride({ ...bride, phone: e.target.value })}
                      placeholder="VD: 0987654321"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                    />
                  </div>
                </div>

                {/* Tài khoản nhận mừng cưới (Hộp mừng) */}
                <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/20 space-y-2.5">
                  <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Tài khoản mừng cưới cô dâu</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-stone-500 block mb-1">Ngân hàng</label>
                      <select
                        value={bride.bankName}
                        onChange={(e) => setBride({ ...bride, bankName: e.target.value })}
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 text-xs text-stone-900 dark:text-white outline-none font-medium"
                      >
                        {POPULAR_BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 block mb-1">Số tài khoản</label>
                      <input
                        type="text"
                        value={bride.accountNo}
                        onChange={(e) => setBride({ ...bride, accountNo: e.target.value })}
                        placeholder="Số tài khoản ngân hàng"
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 text-xs text-stone-900 dark:text-white outline-none font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-stone-500 block mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        value={bride.accountName}
                        onChange={(e) => setBride({ ...bride, accountName: e.target.value.toUpperCase() })}
                        placeholder="VD: NGUYEN THAO VY"
                        className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 text-xs text-stone-900 dark:text-white outline-none uppercase font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* FOOTER */}
          {/* ======================================================== */}
          <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 space-y-3">
            {/* Lock Security Note (Matching Screenshot exactly) */}
            <div className="flex items-start gap-2 text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              <Lock className="w-3.5 h-3.5 shrink-0 text-stone-400 mt-0.5" />
              <span>
                Hồ sơ chỉ bạn thấy. Khách xem thiệp chỉ thấy những gì đã điền lên thiệp (tên, ngày cưới, địa điểm, số điện thoại ở nút gọi, tài khoản ở hộp mừng cưới).
              </span>
            </div>

            {/* Actions (Matching Screenshot exactly) */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold text-xs transition-colors"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Tạo và dùng cho thiệp</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
