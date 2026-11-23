export type CanvasElementType = 'text' | 'image' | 'graphic' | 'shape' | 'widget';

export type ImageFilterPreset =
  | 'none'
  | 'pastel'
  | 'vintage'
  | 'sunset'
  | 'noir'
  | 'warm'
  | 'cool'
  | 'bnw'
  | 'romance'
  | 'golden'
  | 'film';

export interface ImageFilterConfig {
  preset?: ImageFilterPreset;
  brightness?: number; // 50 to 150, default 100
  contrast?: number;   // 50 to 150, default 100
  saturate?: number;   // 0 to 200, default 100
  sepia?: number;      // 0 to 100, default 0
}

export interface ContinuousAnimation {
  type:
    | 'none'
    | 'floating'
    | 'heartbeat'
    | 'wobble'
    | 'spin'
    | 'pulse'
    | 'glow'
    | 'sway'
    | 'bounce-slow'
    | 'rotate-slow';
  duration: number; // seconds, e.g. 2.0
  delay: number;    // seconds, e.g. 0.0
}

export interface EntranceAnimation {
  type:
    | 'none'
    | 'fade-in'
    | 'slide-left'
    | 'slide-right'
    | 'slide-up'
    | 'slide-down'
    | 'zoom-in'
    | 'zoom-out'
    | 'rotate-in'
    | 'bounce-in'
    | 'bounce'
    | 'flip';
  duration: number;
  delay: number;
}

export interface ShadowSettings {
  enabled: boolean;
  textShadowEnabled?: boolean;
  color?: string;
  blur?: number;
  x?: number;
  y?: number;
}

export interface ClickAction {
  type: 'none' | 'link' | 'scroll' | 'phone';
  value?: string;
}

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  // Specific for text
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  padding?: number;
  isCurved?: boolean;
  curvature?: number; // -100 to 100, default 40
  // Specific for image & graphic
  src?: string;
  alt?: string;
  borderRadius?: number;
  objectFit?: 'cover' | 'contain';
  filter?: ImageFilterConfig;
  isCutout?: boolean;
  // Specific for shape
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  shapeType?: 'line' | 'square' | 'rectangle' | 'circle' | 'triangle';
  // Flip / Mirror
  flipX?: boolean;
  flipY?: boolean;
  // Shadow
  shadow?: ShadowSettings;
  // Click action
  clickAction?: ClickAction;
  // Specific for widget
  widgetType?:
    | 'calendar'
    | 'countdown'
    | 'map'
    | 'rsvp'
    | 'giftbox'
    | 'call'
    | 'reminder'
    | 'custom_form'
    | 'guest_name'
    | 'album'
    | 'slideshow'
    | 'wishes'
    | 'music_player'
    | 'story_timeline'
    | 'dresscode'
    | 'family_info'
    | 'video';
  widgetConfig?: Record<string, any>;
  // Grouping & animations
  groupId?: string;
  animation?: EntranceAnimation;
  continuousAnimation?: ContinuousAnimation;
}

export type FallingEffectType =
  | 'snow'
  | 'hearts'
  | 'petals'
  | 'stars'
  | 'confetti'
  | 'butterfly'
  | 'heart-snow';

export interface FallingEffectConfig {
  enabled: boolean;
  type: FallingEffectType;
}

export interface EnvelopeCoverConfig {
  enabled: boolean;
  coverId: string; // 'default' | 'pink_clouds' | 'green_envelope' | 'white_envelope' | 'rose_garden' | 'red_garden' | 'pastel_garden' | 'blue_garden'
  coverName?: string;
  rememberOpened?: boolean;
  autoOpen?: boolean;
}

export interface WeddingCeremony {
  id: string;
  name: string; // 'Lễ ăn hỏi' | 'Lễ vu quy' | 'Lễ thành hôn' | 'Tiệc cưới nhà gái' | 'Tiệc cưới nhà trai' | 'Tiệc cưới' | 'Lễ khác'
  isMain?: boolean;
  date?: string; // YYYY-MM-DD or DD/MM/YYYY
  time?: string; // HH:mm
  lunarDate?: string;
  venue?: string;
  address?: string;
  mapUrl?: string;
}

export interface WeddingProfilePerson {
  fullName: string;
  shortName?: string;
  orderInFamily?: string;
  fatherName?: string;
  motherName?: string;
  phone?: string;
  bankId?: string;
  bankName?: string;
  accountNo?: string;
  accountName?: string;
}

export interface WeddingProfileData {
  id?: string;
  isLinked: boolean;
  profileName?: string; // e.g. "Đám cưới Bảo & Vy"
  groomName?: string;
  brideName?: string;
  ceremonies: WeddingCeremony[];
  groom: WeddingProfilePerson;
  bride: WeddingProfilePerson;
}

export interface CanvasConfig {
  width: number;
  height: number;
  background: string;
  title: string;
  category?: string;
  status?: 'draft' | 'published';
  audioTitle?: string;
  audioUrl?: string;
  audioIcon?: string;
  fallingEffect?: FallingEffectConfig;
  envelopeCover?: EnvelopeCoverConfig;
  weddingProfile?: WeddingProfileData;
}

export type SidebarTab =
  | 'text'
  | 'image'
  | 'graphic'
  | 'shape'
  | 'background'
  | 'music'
  | 'widget'
  | 'block'
  | 'template'
  | 'effect'
  | 'pages';
