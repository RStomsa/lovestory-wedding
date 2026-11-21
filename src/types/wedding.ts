export type TemplateId = 'burgundy' | 'pastel' | 'floral' | 'retro' | 'our-love-begins' | 'our-love-story-rose' | 'save-the-date-cream-gold';

export interface BankAccount {
  bankId: string; // e.g. 'MB', 'VCB', 'ACB', 'TPB'
  bankName: string;
  accountNo: string;
  accountName: string;
  branch?: string;
  qrUrl?: string;
}

export interface PersonInfo {
  name: string;
  shortName: string;
  role: 'Chú rể' | 'Cô dâu';
  parents: string; // e.g. "Ông: Nguyễn Văn A & Bà: Trần Thị B"
  avatar: string;
  phone?: string;
  bankAccount: BankAccount;
}

export interface WeddingEvent {
  id: string;
  title: string; // e.g. "Lễ Vu Quy", "Lễ Thành Hôn", "Tiệc Cưới Nhà Trai"
  date: string; // e.g. "2026-12-25"
  time: string; // e.g. "11:30"
  locationName: string; // e.g. "Trung Tâm Hội Nghị White Palace"
  address: string; // e.g. "194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP.HCM"
  mapUrl?: string; // Google Maps URL
}

export interface LoveStoryMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface WishMessage {
  id: string;
  senderName: string;
  relation: string; // e.g. "Bạn Chú Rể", "Đồng Nghiệp", "Người Thân"
  message: string;
  createdAt: string;
}

export interface RSVPResponse {
  id: string;
  guestName: string;
  phone: string;
  attendeesCount: number;
  attendingEvent: string;
  notes?: string;
  createdAt: string;
}

export interface WeddingData {
  id: string;
  slug: string;
  templateId: TemplateId;
  groom: PersonInfo;
  bride: PersonInfo;
  mainDate: string; // "2026-12-25T11:00:00"
  quote: string;
  subQuote: string;
  coverImage: string;
  coverImageMobile?: string;
  music: {
    title: string;
    artist: string;
    url: string;
  };
  events: WeddingEvent[];
  loveStory: LoveStoryMilestone[];
  gallery: GalleryPhoto[];
  wishes: WishMessage[];
  rsvpList: RSVPResponse[];
}
