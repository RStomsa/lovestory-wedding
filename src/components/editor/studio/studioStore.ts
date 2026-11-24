import { create } from 'zustand';
import {
  CanvasElement,
  CanvasConfig,
  SidebarTab,
  WeddingProfileData,
} from './studioTypes';
import { mergeTemplateElements } from '@/lib/realtimeSync';

interface StudioState {
  canvas: CanvasConfig;
  elements: CanvasElement[];
  selectedId: string | null;
  selectedIds: string[];
  isMultiSelectMode: boolean;
  toggleMultiSelectMode: (force?: boolean) => void;
  activeTab: SidebarTab;
  zoom: number;
  hasUnsavedChanges: boolean;
  
  // Undo/Redo stacks
  past: CanvasElement[][];
  future: CanvasElement[][];

  // Actions
  setActiveTab: (tab: SidebarTab) => void;
  setZoom: (zoom: number) => void;
  setCanvasHeight: (height: number) => void;
  setCanvasBackground: (bg: string) => void;
  setCanvasTitle: (title: string) => void;
  setFallingEffect: (effect: { enabled: boolean; type: 'snow' | 'hearts' | 'petals' | 'stars' | 'confetti' | 'butterfly' | 'heart-snow' }) => void;
  setEnvelopeCover: (cover: { enabled: boolean; coverId: string; rememberOpened?: boolean; autoOpen?: boolean }) => void;
  
  // Push-Down & Spacing Engine
  autoPushDown: boolean;
  setAutoPushDown: (enabled: boolean) => void;
  pushElementsBelow: (referenceY: number, amount: number, recordHistory?: boolean) => void;
  addElementWithPush: (el: Omit<CanvasElement, 'id' | 'zIndex'>, options?: { push?: boolean; gap?: number }) => void;

  selectElement: (id: string | null) => void;
  toggleSelectElement: (id: string) => void;
  selectMultipleElements: (ids: string[]) => void;
  removeSelectedElements: () => void;
  duplicateSelectedElements: () => void;
  updateElementsBatch: (updates: { id: string; updates: Partial<CanvasElement> }[], recordHistory?: boolean) => void;
  alignSelectedElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  pushSelectedElements: (dy: number) => void;
  addElement: (el: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>, recordHistory?: boolean) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  loadTemplateData: (
    elements: CanvasElement[],
    config?: Partial<CanvasConfig>,
    templateName?: string,
    templateSlug?: string
  ) => void;

  // Mobile Bottom Sheet Action & Drawer
  activeMobileSheet: string | null;
  setActiveMobileSheet: (sheet: string | null) => void;

  // Inspector Panel Collapse / Expand (Desktop)
  isInspectorOpen: boolean;
  toggleInspector: () => void;
  setIsInspectorOpen: (open: boolean) => void;

  // Wedding Profile Wizard
  isProfileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  weddingProfile: WeddingProfileData;
  setWeddingProfile: (profile: Partial<WeddingProfileData>) => void;
  applyWeddingProfileToCanvas: (profile: WeddingProfileData) => void;

  // Animation Replay Trigger
  previewAnimKey: number;
  triggerPreviewAnim: () => void;

  // Mobile Touch Mode
  isMobileView: boolean;
  setIsMobileView: (isMobile: boolean) => void;
  desktopModeOnMobile: boolean;
  setDesktopModeOnMobile: (force: boolean) => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  textEditModalElementId: string | null;
  setTextEditModalElementId: (id: string | null) => void;
  photoPickerModalElementId: string | null;
  setPhotoPickerModalElementId: (id: string | null) => void;
  photoQuality: '1920' | '1200' | '900';
  setPhotoQuality: (q: '1920' | '1200' | '900') => void;
  showOnboardingGuide: boolean;
  setShowOnboardingGuide: (show: boolean) => void;
  hiddenElementIds: string[];
  toggleElementVisibility: (id: string) => void;

  // Realtime Sync Engine (Web <-> Desktop App)
  realtimeStatus: 'connected' | 'syncing' | 'offline';
  lastSyncedFrom: 'web' | 'desktop' | null;
  lastSyncedAt: number | null;
  clientId: string;
  currentTemplateSlug: string | null;
  setCurrentTemplateSlug: (slug: string | null) => void;
  initRealtimeSync: (templateSlug?: string) => () => void;
  dispatchRealtimeUpdate: (action?: 'update' | 'create', extraData?: any) => Promise<void>;
}

export const DEFAULT_WEDDING_PROFILE: WeddingProfileData = {
  isLinked: false,
  profileName: 'Đám cưới Bảo & Vy',
  ceremonies: [
    {
      id: 'ceremony-main',
      name: 'Lễ thành hôn',
      isMain: true,
      date: '2026-11-28',
      time: '11:00',
      venue: 'Trung tâm tiệc cưới Trống Đồng Palace',
      address: '489 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
    },
  ],
  groom: {
    fullName: 'Đặng Quốc Bảo',
    shortName: 'Quốc Bảo',
    orderInFamily: 'Trưởng nam',
    fatherName: 'Đặng Văn Hùng',
    motherName: 'Nguyễn Thị Hoa',
    phone: '0901234567',
    bankName: 'MBBank (Quân Đội)',
    accountNo: '090123456789',
    accountName: 'DANG QUOC BAO',
  },
  bride: {
    fullName: 'Nguyễn Thảo Vy',
    shortName: 'Thảo Vy',
    orderInFamily: 'Ái nữ',
    fatherName: 'Nguyễn Văn Minh',
    motherName: 'Lê Thị Mai',
    phone: '0987654321',
    bankName: 'Vietcombank',
    accountNo: '1023456789',
    accountName: 'NGUYEN THAO VY',
  },
};

const DEFAULT_ELEMENTS: CanvasElement[] = [
  // 1. Cover
  {
    id: 'photo-01-cover',
    type: 'image',
    x: 40,
    y: 280,
    width: 420,
    height: 520,
    rotation: 0,
    zIndex: 2,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_01.webp',
    borderRadius: 24,
    objectFit: 'cover',
  },
  {
    id: 'text-save',
    type: 'text',
    x: 90,
    y: 40,
    width: 320,
    height: 90,
    rotation: 0,
    zIndex: 10,
    opacity: 1,
    text: 'Save',
    fontFamily: 'Pinyon Script',
    fontSize: 90,
    color: '#8C7355',
    textAlign: 'center',
    continuousAnimation: { type: 'floating', duration: 2.0, delay: 0 },
  },
  {
    id: 'text-the',
    type: 'text',
    x: 150,
    y: 135,
    width: 200,
    height: 30,
    rotation: 0,
    zIndex: 10,
    opacity: 1,
    text: 'THE',
    fontFamily: 'Playfair Display',
    fontSize: 22,
    color: '#63554D',
    textAlign: 'center',
    letterSpacing: 8,
  },
  {
    id: 'text-date',
    type: 'text',
    x: 90,
    y: 170,
    width: 320,
    height: 90,
    rotation: 0,
    zIndex: 10,
    opacity: 1,
    text: 'Date',
    fontFamily: 'Pinyon Script',
    fontSize: 90,
    color: '#8C7355',
    textAlign: 'center',
  },
  // Countdown widget block (Screenshot 1)
  {
    id: 'countdown-box',
    type: 'widget',
    widgetType: 'countdown',
    x: 50,
    y: 800,
    width: 400,
    height: 100,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
  },
  // Couple photo 2 & 3
  {
    id: 'photo-02-groom',
    type: 'image',
    x: 40,
    y: 950,
    width: 200,
    height: 260,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_02.jpg',
    borderRadius: 16,
    objectFit: 'cover',
  },
  {
    id: 'photo-03-bride',
    type: 'image',
    x: 260,
    y: 950,
    width: 200,
    height: 260,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_03.jpg',
    borderRadius: 16,
    objectFit: 'cover',
  },
  // Contact buttons & portrait (Screenshot 4)
  {
    id: 'photo-04-portrait',
    type: 'image',
    x: 50,
    y: 1300,
    width: 400,
    height: 480,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_04.png',
    borderRadius: 20,
    objectFit: 'cover',
  },
  {
    id: 'photo-05-gallery',
    type: 'image',
    x: 40,
    y: 1840,
    width: 420,
    height: 300,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_05.jpg',
    borderRadius: 16,
    objectFit: 'cover',
  },
  {
    id: 'photo-06-gallery',
    type: 'image',
    x: 40,
    y: 2180,
    width: 200,
    height: 260,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_06.jpg',
    borderRadius: 16,
    objectFit: 'cover',
  },
  {
    id: 'photo-07-gallery',
    type: 'image',
    x: 260,
    y: 2180,
    width: 200,
    height: 260,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_07.png',
    borderRadius: 16,
    objectFit: 'cover',
  },
  {
    id: 'photo-08-gallery',
    type: 'image',
    x: 40,
    y: 2480,
    width: 130,
    height: 130,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_08.jpg',
    borderRadius: 12,
    objectFit: 'cover',
  },
  {
    id: 'photo-09-gallery',
    type: 'image',
    x: 185,
    y: 2480,
    width: 130,
    height: 130,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_09.jpg',
    borderRadius: 12,
    objectFit: 'cover',
  },
  {
    id: 'photo-10-gallery',
    type: 'image',
    x: 330,
    y: 2480,
    width: 130,
    height: 130,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_10.jpg',
    borderRadius: 12,
    objectFit: 'cover',
  },
  {
    id: 'photo-11-gallery',
    type: 'image',
    x: 40,
    y: 2650,
    width: 200,
    height: 260,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_02.jpg',
    borderRadius: 16,
    objectFit: 'cover',
  },
  {
    id: 'photo-12-gallery',
    type: 'image',
    x: 260,
    y: 2650,
    width: 200,
    height: 260,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_03.jpg',
    borderRadius: 16,
    objectFit: 'cover',
  },
  {
    id: 'photo-13-gallery',
    type: 'image',
    x: 40,
    y: 2950,
    width: 200,
    height: 260,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_05.jpg',
    borderRadius: 16,
    objectFit: 'cover',
  },
  {
    id: 'photo-14-gallery',
    type: 'image',
    x: 260,
    y: 2950,
    width: 200,
    height: 260,
    rotation: 0,
    zIndex: 5,
    opacity: 1,
    src: '/assets/wedding/templates/c165/photo_06.jpg',
    borderRadius: 16,
    objectFit: 'cover',
  },
  // Dedicated RSVP block below photo gallery (clean spacing, no overlap)
  {
    id: 'widget-rsvp-c165',
    type: 'widget',
    widgetType: 'rsvp',
    x: 40,
    y: 3300,
    width: 420,
    height: 420,
    rotation: 0,
    zIndex: 10,
    opacity: 1,
  },
  // Gift box VietQR
  {
    id: 'widget-giftbox-c165',
    type: 'widget',
    widgetType: 'giftbox',
    x: 40,
    y: 3780,
    width: 420,
    height: 340,
    rotation: 0,
    zIndex: 10,
    opacity: 1,
  },
  // Wax seal graphic sticker
  {
    id: 'sticker-wax-seal',
    type: 'graphic',
    x: 200,
    y: 4180,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: 20,
    opacity: 1,
    src: '/assets/wedding/plugins/wax-seal.webp',
    objectFit: 'contain',
    continuousAnimation: { type: 'floating', duration: 2.5, delay: 0 },
  },
];

export const useStudioStore = create<StudioState>((set, get) => ({
  canvas: {
    width: 500,
    height: 4500,
    background: '#FAF7F2',
    title: 'Thiệp Cưới Kem Chữ Vàng Save The Date (C165)',
    status: 'draft',
    audioTitle: 'Until You',
    audioUrl: '/assets/wedding/mp3/ee11a985-5e0e-4eb0-b6da-28fa39c9946f.mp3',
    envelopeCover: {
      enabled: true,
      coverId: 'default',
      rememberOpened: false,
      autoOpen: false,
    },
  },
  elements: DEFAULT_ELEMENTS,
  selectedId: null,
  selectedIds: [],
  isMultiSelectMode: false,
  toggleMultiSelectMode: (force) =>
    set((state) => ({
      isMultiSelectMode: force !== undefined ? force : !state.isMultiSelectMode,
    })),
  activeTab: 'text',
  zoom: 1,
  hasUnsavedChanges: false,
  past: [],
  future: [],
  activeMobileSheet: null,
  setActiveMobileSheet: (sheet) => set({ activeMobileSheet: sheet }),

  isInspectorOpen: true,
  toggleInspector: () => set((state) => ({ isInspectorOpen: !state.isInspectorOpen })),
  setIsInspectorOpen: (open) => set({ isInspectorOpen: open }),

  isProfileModalOpen: false,
  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
  weddingProfile: DEFAULT_WEDDING_PROFILE,
  setWeddingProfile: (profile) =>
    set((state) => ({
      weddingProfile: { ...state.weddingProfile, ...profile },
    })),
  applyWeddingProfileToCanvas: (profile) => {
    const { elements, canvas, past } = get();
    const mainCeremony =
      profile.ceremonies.find((c) => c.isMain) || profile.ceremonies[0] || {
        id: 'c-main',
        name: 'Lễ thành hôn',
        isMain: true,
        date: '2026-11-28',
        time: '11:00',
        venue: 'Trung tâm tiệc cưới Trống Đồng Palace',
        address: '489 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
      };

    const groomShort = profile.groom.shortName || profile.groom.fullName || 'Quốc Bảo';
    const brideShort = profile.bride.shortName || profile.bride.fullName || 'Thảo Vy';
    const groomFull = profile.groom.fullName || groomShort;
    const brideFull = profile.bride.fullName || brideShort;
    const coupleNames = `${groomShort} & ${brideShort}`;
    const weddingTitle = profile.profileName || `Đám cưới ${coupleNames}`;

    // Parse wedding date parts: YYYY-MM-DD
    let d = '28', m = '11', y = '2026';
    if (mainCeremony.date) {
      const parts = mainCeremony.date.split('-');
      if (parts.length === 3) {
        y = parts[0];
        m = parts[1];
        d = parts[2];
      }
    }
    const slashDate = `${d}/${m}/${y}`;
    const dotDate = `${d}.${m}.${y}`;
    const spacedDotDate = `${d} . ${m} . ${y}`;

    const nextElements = elements.map((el) => {
      // 1. Text elements
      if (el.type === 'text' && el.text) {
        let text = el.text;
        const trimmed = text.trim();
        const idLower = el.id.toLowerCase();

        // 1. COUPLE NAMES: Detect couple name texts (contains '&', '♥', '❤', 'and' or ID matches)
        const isCoupleName =
          idLower.includes('name') ||
          idLower.includes('couple') ||
          (trimmed.includes('&') &&
            trimmed.length < 55 &&
            !trimmed.includes('Ông') &&
            !trimmed.includes('Bà') &&
            !trimmed.includes('Lễ') &&
            !trimmed.includes('lễ') &&
            !trimmed.includes('Kính') &&
            !trimmed.includes('Designed'));

        if (isCoupleName) {
          if (trimmed === trimmed.toUpperCase()) {
            text = `${groomShort.toUpperCase()} & ${brideShort.toUpperCase()}`;
          } else {
            text = coupleNames;
          }
        }
        // 2. GROOM NAME ONLY
        else if (
          idLower.includes('groom') ||
          trimmed === 'Hoàng Long' ||
          trimmed === 'Vĩnh Tài' ||
          trimmed === 'Phạm Công Vinh' ||
          trimmed === 'Văn Minh' ||
          trimmed === 'Minh Thành' ||
          trimmed === 'Đặng Quốc Bảo' ||
          trimmed === 'Quốc Bảo' ||
          trimmed === 'Chú rể' ||
          trimmed === 'CHÚ RỂ'
        ) {
          if (trimmed === 'Chú rể' || trimmed === 'CHÚ RỂ') {
            text = trimmed;
          } else if (trimmed === trimmed.toUpperCase()) {
            text = groomShort.toUpperCase();
          } else {
            text = groomShort;
          }
        }
        // 3. BRIDE NAME ONLY
        else if (
          idLower.includes('bride') ||
          trimmed === 'Mai Chi' ||
          trimmed === 'Hiếu Ngân' ||
          trimmed === 'Nguyễn Hải Yến' ||
          trimmed === 'Minh An' ||
          trimmed === 'Bảo Ngọc' ||
          trimmed === 'Nguyễn Thảo Vy' ||
          trimmed === 'Thảo Vy' ||
          trimmed === 'Cô dâu' ||
          trimmed === 'CÔ DÂU'
        ) {
          if (trimmed === 'Cô dâu' || trimmed === 'CÔ DÂU') {
            text = trimmed;
          } else if (trimmed === trimmed.toUpperCase()) {
            text = brideShort.toUpperCase();
          } else {
            text = brideShort;
          }
        }
        // 4. Order In Family Patterns: e.g. "Trưởng nam : Nguyễn Văn A", "Út nữ : Trần Thị B"
        else if (/^(Trưởng nam|Thứ nam|Quý nam|Út nam|Chú rể)\s*[:：]/i.test(trimmed)) {
          const prefix = trimmed.match(/^(Trưởng nam|Thứ nam|Quý nam|Út nam|Chú rể)\s*[:：]/i)![0];
          text = `${prefix} ${groomFull}`;
        } else if (/^(Trưởng nữ|Thứ nữ|Ái nữ|Út nữ|Cô dâu)\s*[:：]/i.test(trimmed)) {
          const prefix = trimmed.match(/^(Trưởng nữ|Thứ nữ|Ái nữ|Út nữ|Cô dâu)\s*[:：]/i)![0];
          text = `${prefix} ${brideFull}`;
        }
        // 5. Parents Patterns:
        else if (trimmed.includes('Nhà Trai') || trimmed.includes('Họ Nhà Trai') || trimmed.includes('NHÀ TRAI')) {
          if (profile.groom.fatherName && profile.groom.motherName) {
            text = `Nhà Trai\nÔng: ${profile.groom.fatherName}\nBà: ${profile.groom.motherName}`;
          }
        } else if (trimmed.includes('Nhà Gái') || trimmed.includes('Họ Nhà Gái') || trimmed.includes('NHÀ GÁI')) {
          if (profile.bride.fatherName && profile.bride.motherName) {
            text = `Nhà Gái\nÔng: ${profile.bride.fatherName}\nBà: ${profile.bride.motherName}`;
          }
        } else if (/^Ông\s*[:：].*Bà\s*[:：]/i.test(trimmed.replace(/\s+/g, ' '))) {
          if (profile.bride.fatherName && profile.bride.motherName) {
            text = `Ông: ${profile.bride.fatherName} - Bà: ${profile.bride.motherName}`;
          } else if (profile.groom.fatherName && profile.groom.motherName) {
            text = `Ông: ${profile.groom.fatherName} - Bà: ${profile.groom.motherName}`;
          }
        } else if (/^Bà\s*[:：]/i.test(trimmed)) {
          if (profile.groom.motherName) {
            text = `Bà: ${profile.groom.motherName}`;
          }
        } else if (/^Ông\s*[:：]/i.test(trimmed)) {
          if (profile.groom.fatherName) {
            text = `Ông: ${profile.groom.fatherName}`;
          }
        }

        // 6. DATE & TIME PATTERNS
        // Spaced date: "27 . 12 . 2026"
        if (/\b\d{1,2}\s*\.\s*\d{1,2}\s*\.\s*\d{4}\b/.test(text)) {
          text = text.replace(/\b\d{1,2}\s*\.\s*\d{1,2}\s*\.\s*\d{4}\b/, spacedDotDate);
        }
        // Dot date: "28.12.2025"
        else if (/\b\d{1,2}\.\d{1,2}\.\d{4}\b/.test(text)) {
          text = text.replace(/\b\d{1,2}\.\d{1,2}\.\d{4}\b/, dotDate);
        }
        // Slash date: "28/11/2026"
        else if (/\b\d{1,2}\/\d{1,2}\/\d{4}\b/.test(text)) {
          text = text.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/, slashDate);
        }

        // Month: "THÁNG 11" or "THÁNG 06"
        if (/THÁNG\s+\d{1,2}/.test(text)) {
          text = text.replace(/THÁNG\s+\d{1,2}/, `THÁNG ${m}`);
        } else if (/Tháng\s+\d{1,2}/i.test(text)) {
          text = text.replace(/Tháng\s+\d{1,2}/i, `Tháng ${m}`);
        }

        // Time: "VÀO LÚC 07:39" or "VÀO LÚC 08:00"
        if (/VÀO LÚC\s+\d{1,2}[:h]\d{2}/i.test(text)) {
          text = text.replace(/VÀO LÚC\s+\d{1,2}[:h]\d{2}/i, `VÀO LÚC ${mainCeremony.time || '11:00'}`);
        } else if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
          text = mainCeremony.time || '11:00';
        }

        // 7. VENUE & ADDRESS PATTERNS
        if (/^Địa chỉ\s*[:：]/i.test(trimmed)) {
          text = `Địa chỉ: ${mainCeremony.address || 'Hà Nội'}`;
        } else if (
          trimmed.includes('Trống Đồng') ||
          trimmed.includes('Palace') ||
          trimmed.includes('Tiệc cưới') ||
          trimmed.includes('tiệc cưới') ||
          trimmed.includes('Trung tâm tiệc cưới')
        ) {
          text = mainCeremony.venue || text;
        } else if (trimmed === 'Hoàng Mai - Hà Nội' || trimmed === '171 Nguyễn Trãi, Hà Nội') {
          text = mainCeremony.address || text;
        }

        return { ...el, text };
      }

      // 2. Widget elements
      if (el.type === 'widget' && el.widgetType) {
        const nextCfg = { ...(el.widgetConfig || {}) };
        if (el.widgetType === 'countdown') {
          nextCfg.targetDate = `${mainCeremony.date || '2026-11-28'}T${mainCeremony.time || '11:00'}:00`;
          nextCfg.title = `Đếm ngược ${mainCeremony.name || 'Ngày Cưới'}`;
        } else if (el.widgetType === 'calendar') {
          nextCfg.date = mainCeremony.date || '2026-11-28';
        } else if (el.widgetType === 'map') {
          nextCfg.locationName = mainCeremony.venue;
          nextCfg.address = mainCeremony.address;
        } else if (el.widgetType === 'call') {
          nextCfg.groomPhone = profile.groom.phone;
          nextCfg.bridePhone = profile.bride.phone;
          nextCfg.groomName = groomShort;
          nextCfg.brideName = brideShort;
        } else if (el.widgetType === 'giftbox') {
          nextCfg.groomBank = {
            bankName: profile.groom.bankName,
            accountNo: profile.groom.accountNo,
            accountName: profile.groom.accountName || profile.groom.fullName,
          };
          nextCfg.brideBank = {
            bankName: profile.bride.bankName,
            accountNo: profile.bride.accountNo,
            accountName: profile.bride.accountName || profile.bride.fullName,
          };
        }
        return { ...el, widgetConfig: nextCfg };
      }

      return el;
    });

    set({
      past: [...past, elements],
      future: [],
      elements: nextElements,
      weddingProfile: { ...profile, isLinked: true },
      canvas: {
        ...canvas,
        title: weddingTitle,
        weddingProfile: { ...profile, isLinked: true },
      },
      hasUnsavedChanges: true,
    });
  },

  previewAnimKey: 0,
  triggerPreviewAnim: () => set((state) => ({ previewAnimKey: state.previewAnimKey + 1 })),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.4), 2.0) }),

  setCanvasHeight: (height) =>
    set((state) => ({
      canvas: { ...state.canvas, height: Math.max(1000, height) },
      hasUnsavedChanges: true,
    })),

  setCanvasBackground: (bg) =>
    set((state) => ({
      canvas: { ...state.canvas, background: bg },
      hasUnsavedChanges: true,
    })),

  setCanvasTitle: (title) =>
    set((state) => ({
      canvas: { ...state.canvas, title },
      hasUnsavedChanges: true,
    })),

  setFallingEffect: (effect) =>
    set((state) => ({
      canvas: { ...state.canvas, fallingEffect: effect },
      hasUnsavedChanges: true,
    })),

  setEnvelopeCover: (cover) =>
    set((state) => ({
      canvas: { ...state.canvas, envelopeCover: cover },
      hasUnsavedChanges: true,
    })),

  selectElement: (id) =>
    set((state) => ({
      selectedId: id,
      selectedIds: id ? [id] : [],
      activeMobileSheet: id ? state.activeMobileSheet : null,
      isInspectorOpen: id ? true : state.isInspectorOpen,
    })),

  toggleSelectElement: (id) =>
    set((state) => {
      const exists = state.selectedIds.includes(id);
      const nextIds = exists
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id];
      return {
        selectedIds: nextIds,
        selectedId: nextIds.length > 0 ? nextIds[nextIds.length - 1] : null,
        activeMobileSheet: nextIds.length > 0 ? state.activeMobileSheet : null,
        isInspectorOpen: nextIds.length > 0 ? true : state.isInspectorOpen,
      };
    }),

  selectMultipleElements: (ids) =>
    set((state) => ({
      selectedIds: ids,
      selectedId: ids.length > 0 ? ids[0] : null,
      activeMobileSheet: ids.length > 0 ? state.activeMobileSheet : null,
      isInspectorOpen: ids.length > 0 ? true : state.isInspectorOpen,
    })),

  removeSelectedElements: () => {
    const { elements, past, selectedIds } = get();
    if (!selectedIds.length) return;
    const idsSet = new Set(selectedIds);
    set({
      past: [...past, elements],
      future: [],
      elements: elements.filter((e) => !idsSet.has(e.id)),
      selectedId: null,
      selectedIds: [],
      hasUnsavedChanges: true,
    });
  },

  duplicateSelectedElements: () => {
    const { elements, past, selectedIds } = get();
    if (!selectedIds.length) return;
    const targets = elements.filter((e) => selectedIds.includes(e.id));
    if (!targets.length) return;

    let maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const newElements: CanvasElement[] = [];
    const newIds: string[] = [];

    targets.forEach((target) => {
      maxZ += 1;
      const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      newIds.push(newId);
      newElements.push({
        ...JSON.parse(JSON.stringify(target)),
        id: newId,
        x: target.x + 20,
        y: target.y + 20,
        zIndex: maxZ,
      });
    });

    set({
      past: [...past, elements],
      future: [],
      elements: [...elements, ...newElements],
      selectedIds: newIds,
      selectedId: newIds[0] || null,
      hasUnsavedChanges: true,
    });
  },

  updateElementsBatch: (updates, recordHistory = false) => {
    const { elements, past } = get();
    const updateMap = new Map(updates.map((u) => [u.id, u.updates]));
    const nextElements = elements.map((e) => {
      const u = updateMap.get(e.id);
      return u ? { ...e, ...u } : e;
    });
    set({
      past: recordHistory ? [...past, elements] : past,
      future: recordHistory ? [] : get().future,
      elements: nextElements,
      hasUnsavedChanges: true,
    });
  },

  alignSelectedElements: (alignment) => {
    const { elements, selectedIds, canvas } = get();
    if (!selectedIds.length) return;

    const targets = elements.filter((e) => selectedIds.includes(e.id));
    if (!targets.length) return;

    let minX = Math.min(...targets.map((e) => e.x));
    let maxX = Math.max(...targets.map((e) => e.x + e.width));
    let minY = Math.min(...targets.map((e) => e.y));
    let maxY = Math.max(...targets.map((e) => e.y + e.height));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // If only 1 element selected, align relative to canvas
    if (targets.length === 1) {
      minX = 0;
      maxX = canvas.width;
    }

    const updates = targets.map((e) => {
      let nextX = e.x;
      let nextY = e.y;
      if (alignment === 'left') nextX = minX;
      else if (alignment === 'center') {
        nextX = targets.length === 1 ? Math.round((canvas.width - e.width) / 2) : Math.round(centerX - e.width / 2);
      } else if (alignment === 'right') nextX = maxX - e.width;
      else if (alignment === 'top') nextY = minY;
      else if (alignment === 'middle') nextY = Math.round(centerY - e.height / 2);
      else if (alignment === 'bottom') nextY = maxY - e.height;

      return { id: e.id, updates: { x: nextX, y: nextY } };
    });

    const updateMap = new Map(updates.map((u) => [u.id, u.updates]));
    const nextElements = elements.map((e) => {
      const u = updateMap.get(e.id);
      return u ? { ...e, ...u } : e;
    });

    set({
      past: [...get().past, elements],
      future: [],
      elements: nextElements,
      hasUnsavedChanges: true,
    });
  },

  pushSelectedElements: (dy) => {
    const { elements, selectedIds, canvas, past } = get();
    if (!selectedIds.length) return;
    const idsSet = new Set(selectedIds);
    let maxBottom = 0;
    const nextElements = elements.map((e) => {
      if (idsSet.has(e.id)) {
        const nextY = Math.max(0, Math.round(e.y + dy));
        const bottom = nextY + (e.height || 0);
        if (bottom > maxBottom) maxBottom = bottom;
        return { ...e, y: nextY };
      }
      const bottom = e.y + (e.height || 0);
      if (bottom > maxBottom) maxBottom = bottom;
      return e;
    });
    const requiredHeight = Math.max(canvas.height, maxBottom + 200);
    set({
      past: [...past, elements],
      future: [],
      elements: nextElements,
      canvas: { ...canvas, height: requiredHeight },
      hasUnsavedChanges: true,
    });
  },

  // Push-Down & Spacing Engine state
  autoPushDown: true,
  setAutoPushDown: (enabled) => set({ autoPushDown: enabled }),

  pushElementsBelow: (referenceY, amount, recordHistory = true) => {
    const { elements, canvas, past } = get();
    if (amount === 0) return;

    let maxBottom = 0;
    let shiftedCount = 0;
    const nextElements = elements.map((e) => {
      if (e.y >= referenceY) {
        shiftedCount++;
        const nextY = Math.max(0, Math.round(e.y + amount));
        const bottom = nextY + (e.height || 0);
        if (bottom > maxBottom) maxBottom = bottom;
        return { ...e, y: nextY };
      }
      const bottom = e.y + (e.height || 0);
      if (bottom > maxBottom) maxBottom = bottom;
      return e;
    });

    if (shiftedCount === 0) return;

    const requiredHeight = Math.max(canvas.height, maxBottom + 200);

    set({
      past: recordHistory ? [...past, elements] : past,
      future: recordHistory ? [] : get().future,
      elements: nextElements,
      canvas: { ...canvas, height: requiredHeight },
      hasUnsavedChanges: true,
    });
  },

  addElementWithPush: (el, options) => {
    const { elements, canvas, past, autoPushDown } = get();
    const shouldPush = options?.push !== undefined ? options.push : autoPushDown;
    const gap = options?.gap ?? 24;
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newElement: CanvasElement = {
      ...el,
      id: newId,
      zIndex: maxZ + 1,
    };

    let nextElements = [...elements];
    let nextCanvas = { ...canvas };

    if (shouldPush) {
      const pushAmount = el.height + gap;
      // Push elements whose top is at or below this insertion point
      const thresholdY = el.y - 10;
      let maxBottom = el.y + el.height;

      nextElements = nextElements.map((e) => {
        if (e.y >= thresholdY) {
          const nextY = Math.max(0, Math.round(e.y + pushAmount));
          const bottom = nextY + (e.height || 0);
          if (bottom > maxBottom) maxBottom = bottom;
          return { ...e, y: nextY };
        }
        const bottom = e.y + (e.height || 0);
        if (bottom > maxBottom) maxBottom = bottom;
        return e;
      });

      nextElements.push(newElement);

      const requiredHeight = Math.max(canvas.height, maxBottom + 200);
      nextCanvas.height = requiredHeight;
    } else {
      nextElements.push(newElement);
      const bottom = el.y + el.height;
      if (bottom + 200 > nextCanvas.height) {
        nextCanvas.height = bottom + 200;
      }
    }

    set({
      past: [...past, elements],
      future: [],
      elements: nextElements,
      canvas: nextCanvas,
      selectedId: newId,
      selectedIds: [newId],
      hasUnsavedChanges: true,
    });
  },

  addElement: (el) => {
    const { elements, past } = get();
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const newElement: CanvasElement = {
      ...el,
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      zIndex: maxZ + 1,
    };
    set({
      past: [...past, elements],
      future: [],
      elements: [...elements, newElement],
      selectedId: newElement.id,
      selectedIds: [newElement.id],
      hasUnsavedChanges: true,
    });
  },

  updateElement: (id, updates, recordHistory = false) => {
    const { elements, past } = get();
    const nextElements = elements.map((e) => (e.id === id ? { ...e, ...updates } : e));
    set({
      past: recordHistory ? [...past, elements] : past,
      future: recordHistory ? [] : get().future,
      elements: nextElements,
      hasUnsavedChanges: true,
    });
  },

  removeElement: (id) => {
    const { elements, past, selectedId, selectedIds } = get();
    const nextIds = (selectedIds || []).filter((item) => item !== id);
    set({
      past: [...past, elements],
      future: [],
      elements: elements.filter((e) => e.id !== id),
      selectedId: selectedId === id ? (nextIds[0] || null) : selectedId,
      selectedIds: nextIds,
      hasUnsavedChanges: true,
    });
  },

  duplicateElement: (id) => {
    const { elements, past } = get();
    const target = elements.find((e) => e.id === id);
    if (!target) return;

    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const cloned: CanvasElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: target.x + 20,
      y: target.y + 20,
      zIndex: maxZ + 1,
    };

    set({
      past: [...past, elements],
      future: [],
      elements: [...elements, cloned],
      selectedId: cloned.id,
      selectedIds: [cloned.id],
      hasUnsavedChanges: true,
    });
  },

  bringToFront: (id) => {
    const { elements } = get();
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    set({
      elements: elements.map((e) => (e.id === id ? { ...e, zIndex: maxZ + 1 } : e)),
      hasUnsavedChanges: true,
    });
  },

  sendToBack: (id) => {
    const { elements } = get();
    const minZ = elements.reduce((min, e) => Math.min(min, e.zIndex), 1);
    set({
      elements: elements.map((e) => (e.id === id ? { ...e, zIndex: Math.max(0, minZ - 1) } : e)),
      hasUnsavedChanges: true,
    });
  },

  undo: () => {
    const { past, future, elements } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      past: newPast,
      future: [elements, ...future],
      elements: previous,
      selectedId: null,
      selectedIds: [],
      hasUnsavedChanges: true,
    });
  },

  redo: () => {
    const { past, future, elements } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      past: [...past, elements],
      future: newFuture,
      elements: next,
      selectedId: null,
      selectedIds: [],
      hasUnsavedChanges: true,
    });
  },

  markSaved: () => set({ hasUnsavedChanges: false }),

  loadTemplateData: (elements, config, templateName, templateSlug) => {
    set((state) => ({
      past: [],
      future: [],
      elements,
      canvas: {
        ...state.canvas,
        ...config,
        title: templateName || config?.title || state.canvas.title,
      },
      currentTemplateSlug: templateSlug || state.currentTemplateSlug,
      selectedId: null,
      selectedIds: [],
      hasUnsavedChanges: false,
    }));
  },

  // Mobile Touch Mode implementation
  isMobileView: false,
  setIsMobileView: (isMobile) => set({ isMobileView: isMobile }),
  desktopModeOnMobile: false,
  setDesktopModeOnMobile: (force) => set({ desktopModeOnMobile: force }),
  mobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  textEditModalElementId: null,
  setTextEditModalElementId: (id) => set({ textEditModalElementId: id }),
  photoPickerModalElementId: null,
  setPhotoPickerModalElementId: (id) => set({ photoPickerModalElementId: id }),
  photoQuality: '1200',
  setPhotoQuality: (q) => set({ photoQuality: q }),
  showOnboardingGuide: false,
  setShowOnboardingGuide: (show) => set({ showOnboardingGuide: show }),
  hiddenElementIds: [],
  toggleElementVisibility: (id) =>
    set((state) => ({
      hiddenElementIds: state.hiddenElementIds.includes(id)
        ? state.hiddenElementIds.filter((item) => item !== id)
        : [...state.hiddenElementIds, id],
    })),

  // Realtime Sync Engine (Web <-> Desktop App)
  realtimeStatus: 'offline',
  lastSyncedFrom: null,
  lastSyncedAt: null,
  clientId: typeof window !== 'undefined'
    ? (window as any).__TAURI__ ? `client_desktop_${Math.random().toString(36).slice(2, 8)}` : `client_web_${Math.random().toString(36).slice(2, 8)}`
    : 'client_init',
  currentTemplateSlug: null,
  setCurrentTemplateSlug: (slug) => set({ currentTemplateSlug: slug }),

  initRealtimeSync: (templateSlug) => {
    if (typeof window === 'undefined') return () => {};

    if (templateSlug) {
      set({ currentTemplateSlug: templateSlug });
    }

    const { clientId } = get();
    const isDesktop = typeof window !== 'undefined' && Boolean((window as any).__TAURI__);
    const source = isDesktop ? 'desktop' : 'web';

    const sseUrl = `/api/realtime/events?clientId=${encodeURIComponent(clientId)}&source=${source}`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        set({ realtimeStatus: 'connected' });
      };

      eventSource.onerror = () => {
        set({ realtimeStatus: 'offline' });
      };

      eventSource.addEventListener('connected', () => {
        set({ realtimeStatus: 'connected' });
      });

      eventSource.addEventListener('sync', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          // If update came from another client and relates to templates
          if (payload && payload.clientId !== clientId && payload.entityType === 'template') {
            const currentSlug = get().currentTemplateSlug;
            if (!currentSlug || payload.id === currentSlug || payload.id === currentSlug.toLowerCase()) {
              if (payload.data && Array.isArray(payload.data.elements)) {
                const currentElements = get().elements;
                const mergedElements = mergeTemplateElements(currentElements, payload.data.elements);

                set((state) => ({
                  elements: mergedElements,
                  canvas: payload.data.canvasConfig ? { ...state.canvas, ...payload.data.canvasConfig } : state.canvas,
                  lastSyncedFrom: payload.source || 'desktop',
                  lastSyncedAt: Date.now(),
                  realtimeStatus: 'connected',
                  hasUnsavedChanges: false,
                }));
              }
            }
          }
        } catch (err) {
          console.error('Failed to parse realtime sync event:', err);
        }
      });
    } catch (err) {
      console.error('Failed to initialize EventSource:', err);
      set({ realtimeStatus: 'offline' });
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  },

  dispatchRealtimeUpdate: async (action = 'update', extraData = {}) => {
    const { clientId, currentTemplateSlug, elements, canvas } = get();
    const slug = currentTemplateSlug || 'custom-template';
    const isDesktop = typeof window !== 'undefined' && Boolean((window as any).__TAURI__);
    const source = isDesktop ? 'desktop' : 'web';

    set({ realtimeStatus: 'syncing' });

    try {
      await fetch('/api/realtime/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          clientId,
          entityType: 'template',
          action,
          id: slug,
          data: {
            id: slug,
            slug,
            name: canvas.title || `Mẫu thiệp ${slug}`,
            elements,
            canvasConfig: canvas,
            ...extraData,
          },
          timestamp: Date.now(),
        }),
      });

      set({
        realtimeStatus: 'connected',
        lastSyncedAt: Date.now(),
        hasUnsavedChanges: false,
      });
    } catch (err) {
      console.error('Failed to dispatch realtime sync update:', err);
      set({ realtimeStatus: 'offline' });
    }
  },
}));
