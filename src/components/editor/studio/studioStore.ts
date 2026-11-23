import { create } from 'zustand';
import {
  CanvasElement,
  CanvasConfig,
  SidebarTab,
  WeddingProfileData,
} from './studioTypes';

interface StudioState {
  canvas: CanvasConfig;
  elements: CanvasElement[];
  selectedId: string | null;
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
  addElement: (el: Omit<CanvasElement, 'id' | 'zIndex'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>, recordHistory?: boolean) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  loadTemplateData: (elements: CanvasElement[], config?: Partial<CanvasConfig>) => void;

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
    x: 0,
    y: 40,
    width: 500,
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
    x: 0,
    y: 135,
    width: 500,
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
    x: 0,
    y: 170,
    width: 500,
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

    const groomName = profile.groom.shortName || profile.groom.fullName || 'Quốc Bảo';
    const brideName = profile.bride.shortName || profile.bride.fullName || 'Thảo Vy';
    const coupleNames = `${groomName} & ${brideName}`;
    const weddingTitle = profile.profileName || `Đám cưới ${coupleNames}`;

    // Format wedding date: YYYY-MM-DD -> DD/MM/YYYY
    let formattedDate = '28/11/2026';
    if (mainCeremony.date) {
      const parts = mainCeremony.date.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        formattedDate = mainCeremony.date;
      }
    }

    const nextElements = elements.map((el) => {
      // 1. Text elements
      if (el.type === 'text' && el.text) {
        let text = el.text;
        // Couple names replacement
        if (
          text.includes('&') &&
          (text.includes('Long') ||
            text.includes('Chi') ||
            text.includes('Bảo') ||
            text.includes('Vy') ||
            text.includes('Tiểu Mai') ||
            text.includes('Mạn'))
        ) {
          text = coupleNames;
        } else if (text === 'Hoàng Long' || text === 'Chú rể' || text === 'Đặng Quốc Bảo') {
          text = profile.groom.fullName || groomName;
        } else if (text === 'Mai Chi' || text === 'Cô dâu' || text === 'Nguyễn Thảo Vy') {
          text = profile.bride.fullName || brideName;
        }
        // Date replacement
        if (/\b\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4}\b/.test(text)) {
          text = text.replace(/\b\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4}\b/, formattedDate);
        }
        // Venue replacement
        if (
          text.toLowerCase().includes('trống đồng') ||
          text.toLowerCase().includes('palace') ||
          text.toLowerCase().includes('tiệc cưới')
        ) {
          text = mainCeremony.venue || text;
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
          nextCfg.groomName = groomName;
          nextCfg.brideName = brideName;
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
      activeMobileSheet: id ? state.activeMobileSheet : null,
      isInspectorOpen: id ? true : state.isInspectorOpen,
    })),

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
    const { elements, past, selectedId } = get();
    set({
      past: [...past, elements],
      future: [],
      elements: elements.filter((e) => e.id !== id),
      selectedId: selectedId === id ? null : selectedId,
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
      hasUnsavedChanges: true,
    });
  },

  markSaved: () => set({ hasUnsavedChanges: false }),

  loadTemplateData: (elements, config) => {
    set((state) => ({
      past: [],
      future: [],
      elements,
      canvas: { ...state.canvas, ...config },
      selectedId: null,
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
}));
