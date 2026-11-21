import { WeddingData } from '@/types/wedding';

export const defaultWeddingData: WeddingData = {
  id: 'wed-001',
  slug: 'chu-re-va-co-dau',
  templateId: 'burgundy',
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
      locationName: 'Trung Tâm Hội Nghị & Tiệc Cưới White Palace',
      address: 'Sảnh Grand Ballroom - 194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP.HCM',
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
    },
    {
      id: 'ls-4',
      year: '2026',
      title: 'Ngày Chúng Mình Về Chung Một Nhà',
      description: 'Khởi đầu một chương mới của cuộc đời. Cảm ơn vì đã luôn ở bên, thấu hiểu và cùng nhau xây dựng mái ấm ngọt ngào.',
      image: 'https://images.unsplash.com/photo-1519225429402-127e9e8f6f58?auto=format&fit=crop&w=700&q=80'
    }
  ],

  gallery: [
    {
      id: 'gal-1',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
      caption: 'Khoảnh khắc thiêng liêng'
    },
    {
      id: 'gal-2',
      url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=80',
      caption: 'Nụ cười hạnh phúc'
    },
    {
      id: 'gal-3',
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      caption: 'Dưới ánh hoàng hôn'
    },
    {
      id: 'gal-4',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
      caption: 'Tay trong tay'
    },
    {
      id: 'gal-5',
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
      caption: 'Cùng nhau già đi'
    },
    {
      id: 'gal-6',
      url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
      caption: 'Mãi mãi bên nhau'
    }
  ],

  wishes: [
    {
      id: 'w-1',
      senderName: 'Minh Tuấn',
      relation: 'Bạn thân chú rể',
      message: 'Chúc mừng hai bạn! Trăm năm hạnh phúc, sớm sinh quý tử nhé đôi bạn trẻ!',
      createdAt: '2026-11-15T09:30:00'
    },
    {
      id: 'w-2',
      senderName: 'Thanh Hằng',
      relation: 'Đồng nghiệp cô dâu',
      message: 'Cô dâu xinh đẹp tuyệt trần! Chúc hai vợ chồng luôn ngọt ngào như ngày đầu mới yêu!',
      createdAt: '2026-11-16T14:15:00'
    },
    {
      id: 'w-3',
      senderName: 'Gia đình Bác Hai',
      relation: 'Người thân',
      message: 'Chúc hai cháu trăm năm đầu bạc răng long, gia đình hòa thuận, vạn sự hanh thông!',
      createdAt: '2026-11-17T08:00:00'
    }
  ],

  rsvpList: [
    {
      id: 'r-1',
      guestName: 'Nguyễn Văn Hùng',
      phone: '0912345678',
      attendeesCount: 2,
      attendingEvent: 'Tiệc Cưới Chung Vui',
      notes: 'Sẽ có mặt đúng giờ chung vui cùng hai bạn!',
      createdAt: '2026-11-16T18:00:00'
    }
  ]
};
