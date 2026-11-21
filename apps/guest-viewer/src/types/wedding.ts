export interface BankAccount {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  branch?: string;
  qrCodeUrl?: string;
}

export interface Person {
  name: string;
  shortName: string;
  role: string;
  parents: string;
  avatar: string;
  phone: string;
  bankAccount: BankAccount;
}

export interface WeddingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  locationName: string;
  address: string;
  mapUrl?: string;
}

export interface LoveStoryItem {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface WeddingData {
  id?: string;
  slug?: string;
  templateId?: string;
  title?: string;
  mainDate?: string;
  quote?: string;
  subQuote?: string;
  coverImage?: string;
  coverImageMobile?: string;
  groom: Person;
  bride: Person;
  music: {
    title: string;
    artist: string;
    url: string;
  };
  events: WeddingEvent[];
  loveStory?: LoveStoryItem[];
  gallery?: GalleryPhoto[];
}

export const defaultWeddingData: WeddingData = {
  id: 'wed-001',
  slug: 'chu-re-va-co-dau',
  templateId: 'save-the-date-cream-gold',
  mainDate: '2026-12-25T11:00:00',
  quote: 'Tình yêu không phải là tìm một người hoàn hảo, mà là học cách nhìn thấy những điều tuyệt vời từ một người không hoàn hảo.',
  subQuote: 'Hạnh phúc lớn nhất đời người là tìm được một nửa mảnh ghép, cùng nhau bước qua giông bão để mỉm cười đón bình minh.',
  coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
  coverImageMobile: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
  groom: {
    name: 'Chú Rể',
    shortName: 'Chú Rể',
    role: 'Chú rể',
    parents: 'Nhà Trai: Đại diện Gia đình Nhà Trai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    phone: '0901234567',
    bankAccount: {
      bankId: 'MB',
      bankName: 'MB Bank (Quân Đội)',
      accountNo: '090123456789',
      accountName: 'CHU RE',
      branch: 'Chi nhánh Sài Gòn'
    }
  },
  bride: {
    name: 'Cô Dâu',
    shortName: 'Cô Dâu',
    role: 'Cô dâu',
    parents: 'Nhà Gái: Đại diện Gia đình Nhà Gái',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    phone: '0987654321',
    bankAccount: {
      bankId: 'VCB',
      bankName: 'Vietcombank',
      accountNo: '1023456789',
      accountName: 'CO DAU',
      branch: 'Chi nhánh TP.HCM'
    }
  },
  music: {
    title: 'Until I Found You (Acoustic)',
    artist: 'LoveStory Studio',
    url: '/assets/wedding/audio/wedding-melody-01.mp3'
  },
  events: [
    {
      id: 'ev-1',
      title: 'Lễ Vu Quy (Nhà Gái)',
      date: '2026-12-25',
      time: '08:00 AM',
      locationName: 'Tư Gia Nhà Gái',
      address: 'Số 45 Lê Duẩn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      mapUrl: 'https://maps.google.com'
    },
    {
      id: 'ev-2',
      title: 'Lễ Thành Hôn (Nhà Trai)',
      date: '2026-12-25',
      time: '10:00 AM',
      locationName: 'Tư Gia Nhà Trai',
      address: 'Số 128 Nguyễn Đình Chiểu, Phường 6, Quận 3, TP. Hồ Chí Minh',
      mapUrl: 'https://maps.google.com'
    },
    {
      id: 'ev-3',
      title: 'Tiệc Cưới Chung Vui',
      date: '2026-12-25',
      time: '11:30 AM',
      locationName: 'Trung Tâm Hội Nghị & Tiệc Cưới LoveStory',
      address: 'Sảnh Grand Ballroom - 194 Hoàng Văn Thụ, Phú Nhuận, TP.HCM',
      mapUrl: 'https://maps.google.com'
    }
  ],
  loveStory: [
    {
      id: 'ls-1',
      year: '2021',
      title: 'Lần Đầu Gặp Gỡ',
      description: 'Một buổi chiều mưa bất chợt tại quán cà phê quen thuộc. Ánh mắt chạm nhau chỉ một giây nhưng đủ để thắp lên tình yêu kéo dài mãi mãi.',
      image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'ls-2',
      year: '2023',
      title: 'Chuyến Đi Xa Cùng Nhau',
      description: 'Chuyến đi Đà Lạt đầu tiên dưới sương mù se lạnh. Nắm tay nhau đi qua thung lũng tình yêu, chúng mình nhận ra không thể thiếu nhau trong đời.',
      image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'ls-3',
      year: '2025',
      title: 'Lời Cầu Hôn Dưới Hoàng Hôn',
      description: 'Tại bãi biển Nha Trang lộng gió khi hoàng hôn buông xuống, chiếc nhẫn được trao cùng lời hẹn ước trọn đời: "Em đồng ý làm vợ anh nhé?".',
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=700&q=80'
    }
  ],
  gallery: [
    { id: 'g-1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', caption: 'Khoảnh khắc ngọt ngào' },
    { id: 'g-2', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80', caption: 'Nụ cười hạnh phúc' },
    { id: 'g-3', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80', caption: 'Tay trong tay' },
    { id: 'g-4', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80', caption: 'Lễ thành hôn' }
  ]
};
