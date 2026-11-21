// Comprehensive Graphics & Stickers Catalog for LoveStory Studio
// Contains crisp vector SVGs and over 110+ curated wedding, cultural, festival & floral assets

export interface GraphicSticker {
  id: string;
  name: string;
  src: string;
  category: 'Yếu tố đám cưới' | 'Văn hóa Việt' | 'Nhân vật' | 'Hoa & Họa tiết' | 'Lễ hội nổi bật' | 'Trái tim' | 'Ngôi sao' | 'Khung viền';
  subCategory?: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

// Crisp inline SVGs matching LoveStory's exact graphics library
const SVG_ICONS = {
  // ==========================================
  // YẾU TỐ ĐÁM CƯỚI (WEDDING ELEMENTS)
  // ==========================================
  // 1. Chân nến cưới 3 ngọn (Candelabra)
  candelabra: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M48 65 L48 85 L35 92 L65 92 L52 85 L52 65 Z" fill="%2393c5fd" stroke="%233b82f6" stroke-width="1.5"/>
    <path d="M25 45 C25 62 48 65 48 65 C48 65 75 62 75 45" fill="none" stroke="%2393c5fd" stroke-width="4" stroke-linecap="round"/>
    <rect x="22" y="32" width="6" height="15" rx="1.5" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="1"/>
    <rect x="47" y="24" width="6" height="25" rx="1.5" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="1"/>
    <rect x="72" y="32" width="6" height="15" rx="1.5" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="1"/>
    <path d="M25 31 C23 27 23 23 25 20 C27 23 27 27 25 31 Z" fill="%23f59e0b"/>
    <path d="M50 23 C48 18 48 13 50 10 C52 13 52 18 50 23 Z" fill="%23f59e0b"/>
    <path d="M75 31 C73 27 73 23 75 20 C77 23 77 27 75 31 Z" fill="%23f59e0b"/>
  </svg>`,

  // 2. Chữ thư pháp "百年好合" (Bách niên hảo hợp)
  weddingBlessing: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="42" fill="%23fce7f3" opacity="0.6"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="%23f43f5e" stroke-dasharray="3,3" stroke-width="1.5"/>
    <text x="50" y="32" font-family="'Songti TC', 'STSong', serif" font-weight="900" font-size="19" fill="%2318181b" text-anchor="middle">百</text>
    <text x="50" y="50" font-family="'Songti TC', 'STSong', serif" font-weight="900" font-size="19" fill="%2318181b" text-anchor="middle">年</text>
    <text x="50" y="68" font-family="'Songti TC', 'STSong', serif" font-weight="900" font-size="19" fill="%2318181b" text-anchor="middle">好</text>
    <text x="50" y="86" font-family="'Songti TC', 'STSong', serif" font-weight="900" font-size="19" fill="%2318181b" text-anchor="middle">合</text>
    <rect x="58" y="24" width="7" height="12" rx="1.5" fill="%23e11d48"/>
    <text x="61.5" y="33" font-size="7" fill="%23ffffff" text-anchor="middle" font-family="sans-serif">囍</text>
  </svg>`,

  // 3. Giỏ hoa hồng pastel
  roseBasket: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M28 46 C28 22 72 22 72 46" fill="none" stroke="%23d97706" stroke-width="3" stroke-linecap="round"/>
    <path d="M25 45 L32 78 L68 78 L75 45 Z" fill="%23fde68a" stroke="%23b45309" stroke-width="2"/>
    <line x1="33" y1="46" x2="38" y2="76" stroke="%23d97706" stroke-width="1.5"/>
    <line x1="44" y1="46" x2="46" y2="76" stroke="%23d97706" stroke-width="1.5"/>
    <line x1="56" y1="46" x2="54" y2="76" stroke="%23d97706" stroke-width="1.5"/>
    <line x1="67" y1="46" x2="62" y2="76" stroke="%23d97706" stroke-width="1.5"/>
    <circle cx="50" cy="40" r="10" fill="%23fb7185"/>
    <circle cx="50" cy="40" r="6" fill="%23fda4af"/>
    <circle cx="36" cy="44" r="8" fill="%23fda4af"/>
    <circle cx="64" cy="43" r="9" fill="%23f43f5e"/>
    <circle cx="64" cy="43" r="5" fill="%23fbcfe8"/>
    <path d="M22 42 Q30 35 34 42 Q26 48 22 42 Z" fill="%2386efac"/>
    <path d="M78 40 Q70 33 66 40 Q74 46 78 40 Z" fill="%2386efac"/>
  </svg>`,

  // 4. Bó hoa cưới hoa vàng lá xanh
  weddingBouquet: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M50 55 L46 85 M50 55 L52 87 M50 55 L58 84" stroke="%2365a30d" stroke-width="3" stroke-linecap="round"/>
    <path d="M43 62 C32 55 35 70 48 66 C61 70 64 55 53 62" fill="%2367e8f9" stroke="%2306b6d4" stroke-width="2"/>
    <path d="M46 66 L42 80 M50 66 L54 81" stroke="%2306b6d4" stroke-width="3" stroke-linecap="round"/>
    <path d="M35 48 C28 35 42 25 45 40" fill="%234ade80"/>
    <path d="M65 48 C72 35 58 25 55 40" fill="%234ade80"/>
    <circle cx="48" cy="38" r="12" fill="%23fef08a" stroke="%23eab308" stroke-width="2"/>
    <circle cx="48" cy="38" r="7" fill="%23facc15"/>
    <circle cx="38" cy="32" r="6" fill="%23fde047"/>
    <circle cx="60" cy="34" r="7" fill="%23fde047"/>
  </svg>`,

  // 5. Trái tim "喜欢你" (Love You)
  loveHeart: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M50 78 C25 60 12 40 22 25 C30 14 44 20 50 30 C56 20 70 14 78 25 C88 40 75 60 50 78 Z" fill="%23eff6ff" stroke="%233b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="50" y="52" font-family="'PingFang SC', 'Microsoft YaHei', sans-serif" font-weight="bold" font-size="16" fill="%236366f1" text-anchor="middle">喜欢你</text>
    <circle cx="28" cy="28" r="2.5" fill="%2360a5fa"/>
    <circle cx="75" cy="65" r="3" fill="%2360a5fa"/>
    <circle cx="79" cy="73" r="1.5" fill="%2393c5fd"/>
  </svg>`,

  // 6. Dải ruy băng hoa hồng
  roseRibbon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M15 50 Q30 38 50 50 Q70 62 85 50 L82 62 Q70 74 50 62 Q30 50 18 62 Z" fill="%23fbcfe8" stroke="%23f43f5e" stroke-width="2"/>
    <circle cx="32" cy="46" r="6" fill="%23f43f5e"/>
    <circle cx="32" cy="46" r="3" fill="%23fecdd3"/>
    <circle cx="68" cy="54" r="6" fill="%23f43f5e"/>
    <circle cx="68" cy="54" r="3" fill="%23fecdd3"/>
    <path d="M24 45 Q20 40 22 48 Z" fill="%2386efac"/>
    <path d="M76 55 Q80 50 78 58 Z" fill="%2386efac"/>
  </svg>`,

  // 7. Cặp nhẫn cưới kim cương vàng
  weddingRings: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="40" cy="56" rx="22" ry="24" fill="none" stroke="%23eab308" stroke-width="6"/>
    <ellipse cx="62" cy="50" rx="20" ry="22" fill="none" stroke="%23facc15" stroke-width="6"/>
    <polygon points="62,18 69,26 62,34 55,26" fill="%2338bdf8" stroke="%230284c7" stroke-width="1.5"/>
    <polygon points="62,18 62,34 69,26" fill="%23bae6fd"/>
  </svg>`,

  // 8. Ly sâm panh giao bôi hạnh phúc
  champagne: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M36 25 L45 54 L45 80 M33 80 L57 80" fill="none" stroke="%23ca8a04" stroke-width="3" stroke-linecap="round"/>
    <path d="M26 25 C26 44 45 48 45 48 C45 48 64 44 64 25 Z" fill="%23fef08a" fill-opacity="0.6" stroke="%23ca8a04" stroke-width="2"/>
    <circle cx="42" cy="33" r="2" fill="%23facc15"/>
    <circle cx="48" cy="27" r="1.5" fill="%23facc15"/>
    <circle cx="38" cy="40" r="1.5" fill="%23facc15"/>
  </svg>`,

  // 9. Bánh cưới hoàng gia 3 tầng
  weddingCake: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="20" y="66" width="60" height="22" rx="4" fill="%23fff1f2" stroke="%23f43f5e" stroke-width="2"/>
    <rect x="28" y="46" width="44" height="20" rx="3" fill="%23fdf2f8" stroke="%23ec4899" stroke-width="2"/>
    <rect x="36" y="28" width="28" height="18" rx="2" fill="%23fef3c7" stroke="%23f59e0b" stroke-width="2"/>
    <path d="M47 18 C47 14 53 14 53 18 C53 22 47 26 50 28" fill="%23f43f5e"/>
    <circle cx="50" cy="18" r="4" fill="%23fb7185"/>
  </svg>`,

  // 10. Chim bồ câu ngậm ruy băng tình yêu
  loveDoves: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M25 45 C35 30 55 35 60 48 C65 42 75 42 80 48 C70 60 50 65 40 55 Z" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
    <path d="M40 52 Q50 65 60 52" fill="none" stroke="%23f43f5e" stroke-width="2"/>
    <circle cx="50" cy="62" r="6" fill="%23f43f5e"/>
  </svg>`,

  // ==========================================
  // VĂN HÓA VIỆT (VIETNAMESE HERITAGE)
  // ==========================================
  // 1. Dinh Độc Lập / Bưu điện trên ngôi sao vàng
  vnLandmarkStar: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%23f59e0b"/>
        <stop offset="50%" stop-color="%23ea580c"/>
        <stop offset="100%" stop-color="%23dc2626"/>
      </linearGradient>
    </defs>
    <polygon points="50,5 64,36 98,36 70,57 81,90 50,70 19,90 30,57 2,36 36,36" fill="url(%23starGrad)" stroke="%23b45309" stroke-width="2"/>
    <polygon points="50,15 61,39 88,39 66,56 74,82 50,66 26,82 34,56 12,39 39,39" fill="%23fef08a" opacity="0.4"/>
    <rect x="34" y="44" width="32" height="28" fill="%23fef3c7" stroke="%2378350f" stroke-width="1.5"/>
    <path d="M30 44 L50 28 L70 44 Z" fill="%23dc2626" stroke="%23991b1b" stroke-width="1.5"/>
    <circle cx="50" cy="38" r="4" fill="%23fef08a"/>
    <rect x="44" y="56" width="12" height="16" fill="%2378350f" rx="6"/>
    <rect x="37" y="48" width="5" height="7" fill="%2338bdf8"/>
    <rect x="58" y="48" width="5" height="7" fill="%2338bdf8"/>
  </svg>`,

  // 2. Chữ 3D vàng "30/4"
  gold304: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
    <defs>
      <linearGradient id="gold3d" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%23fef08a"/>
        <stop offset="35%" stop-color="%23eab308"/>
        <stop offset="70%" stop-color="%23ca8a04"/>
        <stop offset="100%" stop-color="%23713f12"/>
      </linearGradient>
    </defs>
    <text x="63" y="53" font-family="'Arial Black', Impact, sans-serif" font-size="44" font-weight="900" fill="%2378350f" text-anchor="middle">30/4</text>
    <text x="60" y="50" font-family="'Arial Black', Impact, sans-serif" font-size="44" font-weight="900" fill="url(%23gold3d)" stroke="%23fef08a" stroke-width="1" text-anchor="middle">30/4</text>
  </svg>`,

  // 3. Đường viền hoa văn hoàng gia cổ điển
  ornamentDivider: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 30">
    <line x1="5" y1="15" x2="65" y2="15" stroke="%23e8d29b" stroke-width="2" stroke-linecap="round"/>
    <line x1="95" y1="15" x2="155" y2="15" stroke="%23e8d29b" stroke-width="2" stroke-linecap="round"/>
    <circle cx="80" cy="15" r="7" fill="none" stroke="%23d4af37" stroke-width="2"/>
    <polygon points="80,10 83,15 80,20 77,15" fill="%23d4af37"/>
    <circle cx="68" cy="15" r="2" fill="%23d4af37"/>
    <circle cx="92" cy="15" r="2" fill="%23d4af37"/>
  </svg>`,

  // 4. Đoàn thanh niên phất cờ Tổ quốc
  vietnamYouthFlag: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="20" y="65" width="60" height="24" fill="%2394a3b8" rx="3"/>
    <circle cx="40" cy="42" r="5" fill="%23fed7aa"/>
    <rect x="36" y="47" width="8" height="12" fill="%232563eb" rx="2"/>
    <circle cx="60" cy="42" r="5" fill="%23fed7aa"/>
    <rect x="56" y="47" width="8" height="12" fill="%232563eb" rx="2"/>
    <line x1="50" y1="50" x2="50" y2="18" stroke="%2378350f" stroke-width="2.5"/>
    <rect x="50" y="18" width="22" height="15" fill="%23dc2626"/>
    <polygon points="61,21 62,25 66,25 63,27 64,31 61,29 58,31 59,27 56,25 60,25" fill="%23facc15"/>
  </svg>`,

  // 5. Chú bộ đội hành quân cờ đỏ sao vàng
  vietnamSoldiersMarch: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="40" rx="9" ry="8" fill="%23fed7aa"/>
    <path d="M40 36 C40 28 60 28 60 36 Z" fill="%23166534"/>
    <polygon points="50,31 51,34 54,34 52,36 53,38 50,37 47,38 48,36 46,34 49,34" fill="%23dc2626"/>
    <rect x="42" y="48" width="16" height="22" fill="%2315803d" rx="3"/>
    <line x1="45" y1="70" x2="44" y2="86" stroke="%23166534" stroke-width="4" stroke-linecap="round"/>
    <line x1="55" y1="70" x2="57" y2="86" stroke="%23166534" stroke-width="4" stroke-linecap="round"/>
    <line x1="54" y1="48" x2="68" y2="15" stroke="%2378350f" stroke-width="2"/>
    <rect x="68" y="15" width="22" height="15" fill="%23dc2626"/>
    <polygon points="79,18 80,22 84,22 81,24 82,28 79,26 76,28 77,24 74,22 78,22" fill="%23facc15"/>
  </svg>`,

  // 6. Trống đồng Đông Sơn mạ vàng
  dongSonDrum: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="%23fef08a" stroke="%23ca8a04" stroke-width="3"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="%23ca8a04" stroke-width="2" stroke-dasharray="3,3"/>
    <circle cx="50" cy="50" r="26" fill="none" stroke="%23ca8a04" stroke-width="1.5"/>
    <polygon points="50,32 53,47 68,50 53,53 50,68 47,53 32,50 47,47" fill="%23eab308"/>
    <circle cx="50" cy="50" r="6" fill="%23ca8a04"/>
  </svg>`,

  // 7. Chữ Song Hỷ đỏ truyền thống (囍)
  doubleHappinessRed: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="10" y="10" width="80" height="80" rx="16" fill="%23dc2626" stroke="%23facc15" stroke-width="3"/>
    <text x="50" y="68" font-family="'Songti SC', 'SimSun', serif" font-weight="900" font-size="58" fill="%23fef08a" text-anchor="middle">囍</text>
  </svg>`,

  // 8. Bông hoa sen hồng Việt Nam
  vietnamLotus: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M50 25 C40 45 40 70 50 82 C60 70 60 45 50 25 Z" fill="%23f43f5e"/>
    <path d="M35 38 C28 55 35 75 50 82 C42 68 38 52 35 38 Z" fill="%23fb7185"/>
    <path d="M65 38 C72 55 65 75 50 82 C58 68 62 52 65 38 Z" fill="%23fb7185"/>
    <path d="M22 52 C20 68 32 80 50 82 C35 78 26 66 22 52 Z" fill="%23fda4af"/>
    <path d="M78 52 C80 68 68 80 50 82 C65 78 74 66 78 52 Z" fill="%23fda4af"/>
    <ellipse cx="50" cy="85" rx="35" ry="5" fill="%2316a34a"/>
  </svg>`,

  // ==========================================
  // LỄ HỘI NỔI BẬT (CHRISTMAS & FESTIVAL - MATCH SCREENSHOT 8)
  // ==========================================
  // 1. Ngôi sao thông (Faceted Golden Tree Star Topper)
  pineTreeStar: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="starGoldG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%23fef08a"/>
        <stop offset="50%" stop-color="%23f59e0b"/>
        <stop offset="100%" stop-color="%23b45309"/>
      </linearGradient>
    </defs>
    <!-- 8-Point Faceted Star -->
    <polygon points="50,8 60,34 88,38 67,58 73,86 50,71 27,86 33,58 12,38 40,34" fill="url(%23starGoldG)" stroke="%2378350f" stroke-width="2"/>
    <polygon points="50,8 50,71 60,34" fill="%23fef08a" opacity="0.6"/>
    <polygon points="50,8 50,71 40,34" fill="%23b45309" opacity="0.4"/>
    <circle cx="50" cy="48" r="6" fill="%23ffffff" opacity="0.9"/>
  </svg>`,

  // 2. Cây thông noel (Lush Decorated Pine Tree)
  christmasTree: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <!-- Trunk -->
    <rect x="44" y="80" width="12" height="15" rx="2" fill="%2378350f"/>
    <!-- Bottom Tier -->
    <polygon points="50,55 18,82 82,82" fill="%2315803d" stroke="%2314532d" stroke-width="2"/>
    <!-- Middle Tier -->
    <polygon points="50,38 25,62 75,62" fill="%2316a34a" stroke="%2314532d" stroke-width="2"/>
    <!-- Top Tier -->
    <polygon points="50,20 32,44 68,44" fill="%2322c55e" stroke="%2314532d" stroke-width="2"/>
    <!-- Ornaments -->
    <circle cx="34" cy="74" r="4" fill="%23ef4444"/>
    <circle cx="66" cy="74" r="4" fill="%23facc15"/>
    <circle cx="48" cy="72" r="3.5" fill="%2338bdf8"/>
    <circle cx="40" cy="54" r="3.5" fill="%23f43f5e"/>
    <circle cx="60" cy="54" r="3.5" fill="%23fbbf24"/>
    <circle cx="50" cy="36" r="3" fill="%23ef4444"/>
    <!-- Star on top -->
    <polygon points="50,10 53,17 60,17 55,22 57,29 50,25 43,29 45,22 40,17 47,17" fill="%23facc15" stroke="%23ca8a04" stroke-width="1"/>
  </svg>`,

  // 3. Ông già Noel (Santa Claus Chibi Face)
  santaClaus: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <!-- Face -->
    <circle cx="50" cy="52" r="22" fill="%23fed7aa"/>
    <!-- Cheeks -->
    <circle cx="38" cy="54" r="5" fill="%23f87171" opacity="0.6"/>
    <circle cx="62" cy="54" r="5" fill="%23f87171" opacity="0.6"/>
    <!-- Eyes -->
    <circle cx="42" cy="46" r="2.5" fill="%2318181b"/>
    <circle cx="58" cy="46" r="2.5" fill="%2318181b"/>
    <!-- Nose -->
    <ellipse cx="50" cy="50" rx="4" ry="3" fill="%23f87171"/>
    <!-- Beard & Moustache -->
    <path d="M28 54 C25 78 75 78 72 54 C66 62 56 62 50 56 C44 62 34 62 28 54 Z" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
    <!-- Hat Brim -->
    <rect x="24" y="32" width="52" height="10" rx="5" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/>
    <!-- Hat Cone -->
    <path d="M30 34 C35 12 65 12 78 26 C82 30 84 38 84 38" fill="%23dc2626" stroke="%23b91c1c" stroke-width="2"/>
    <!-- Pom-pom -->
    <circle cx="84" cy="40" r="7" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="1.5"/>
  </svg>`,

  // 4. Tuần lộc Giáng sinh (Christmas Reindeer with Rudolph Nose)
  christmasReindeer: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <!-- Antlers -->
    <path d="M38 34 L26 18 M30 24 L22 26 M34 20 L30 14" stroke="%2378350f" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M62 34 L74 18 M70 24 L78 26 M66 20 L70 14" stroke="%2378350f" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Ears -->
    <ellipse cx="28" cy="40" rx="8" ry="4" transform="rotate(-20 28 40)" fill="%23a16207"/>
    <ellipse cx="72" cy="40" rx="8" ry="4" transform="rotate(20 72 40)" fill="%23a16207"/>
    <!-- Head -->
    <ellipse cx="50" cy="54" rx="22" ry="24" fill="%23b45309"/>
    <ellipse cx="50" cy="64" rx="14" ry="12" fill="%23d97706"/>
    <!-- Eyes -->
    <circle cx="40" cy="48" r="3.5" fill="%2318181b"/>
    <circle cx="60" cy="48" r="3.5" fill="%2318181b"/>
    <circle cx="41" cy="47" r="1" fill="%23ffffff"/>
    <circle cx="61" cy="47" r="1" fill="%23ffffff"/>
    <!-- Glowing Red Nose -->
    <circle cx="50" cy="62" r="7" fill="%23ef4444"/>
    <circle cx="48" cy="60" r="2.5" fill="%23ffffff"/>
  </svg>`,

  // 5. Nến lung linh (Festive Glowing Candles with Holly)
  festiveCandles: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <!-- Candle 1 -->
    <rect x="26" y="44" width="16" height="36" rx="2" fill="%23fef3c7" stroke="%23ca8a04" stroke-width="1.5"/>
    <!-- Candle 2 (Center) -->
    <rect x="42" y="32" width="16" height="48" rx="2" fill="%23dc2626" stroke="%23991b1b" stroke-width="1.5"/>
    <!-- Candle 3 -->
    <rect x="58" y="48" width="16" height="32" rx="2" fill="%23fef3c7" stroke="%23ca8a04" stroke-width="1.5"/>
    <!-- Flames & Auras -->
    <ellipse cx="34" cy="36" rx="5" ry="8" fill="%23f59e0b"/>
    <ellipse cx="34" cy="38" rx="2.5" ry="4" fill="%23fef08a"/>
    <ellipse cx="50" cy="24" rx="6" ry="9" fill="%23f59e0b"/>
    <ellipse cx="50" cy="26" rx="3" ry="5" fill="%23fef08a"/>
    <ellipse cx="66" cy="40" rx="5" ry="8" fill="%23f59e0b"/>
    <ellipse cx="66" cy="42" rx="2.5" ry="4" fill="%23fef08a"/>
    <!-- Holly Leaves & Berries -->
    <circle cx="44" cy="80" r="4" fill="%23ef4444"/>
    <circle cx="56" cy="80" r="4" fill="%23ef4444"/>
    <circle cx="50" cy="84" r="4" fill="%23b91c1c"/>
  </svg>`,

  // 6. Tất quà tặng (Christmas Gift Stocking)
  giftStocking: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <!-- Gifts sticking out -->
    <rect x="36" y="16" width="18" height="18" rx="2" fill="%23f59e0b" stroke="%23b45309" stroke-width="1.5"/>
    <line x1="45" y1="16" x2="45" y2="34" stroke="%23dc2626" stroke-width="2"/>
    <!-- Candy cane -->
    <path d="M56 14 C56 8 66 8 66 14 L66 32" fill="none" stroke="%23dc2626" stroke-width="4" stroke-linecap="round"/>
    <!-- Stocking Body -->
    <path d="M35 30 L65 30 L63 60 C63 68 68 72 74 74 C78 75 80 80 77 84 C72 90 56 94 44 85 C34 76 35 60 35 30 Z" fill="%23dc2626" stroke="%23991b1b" stroke-width="2"/>
    <!-- Fur Cuff -->
    <rect x="30" y="26" width="40" height="12" rx="6" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/>
    <!-- Star on stocking -->
    <polygon points="46,54 48,59 53,59 49,62 50,67 46,64 42,67 43,62 39,59 44,59" fill="%23fef08a"/>
  </svg>`,

  // 7. Chuông vàng Noel (Christmas Jingle Bells)
  jingleBells: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M30 40 C30 25 50 25 50 40 L54 65 L26 65 Z" fill="%23eab308" stroke="%23ca8a04" stroke-width="2"/>
    <path d="M50 40 C50 25 70 25 70 40 L74 65 L46 65 Z" fill="%23facc15" stroke="%23ca8a04" stroke-width="2"/>
    <circle cx="40" cy="70" r="5" fill="%23ca8a04"/>
    <circle cx="60" cy="70" r="5" fill="%23ca8a04"/>
    <path d="M38 28 C30 18 45 15 50 26 C55 15 70 18 62 28 Z" fill="%23ef4444"/>
  </svg>`,

  // 8. Người tuyết đáng yêu (Cute Snowman)
  christmasSnowman: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="68" r="24" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/>
    <circle cx="50" cy="38" r="16" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/>
    <circle cx="45" cy="35" r="2" fill="%230f172a"/>
    <circle cx="55" cy="35" r="2" fill="%230f172a"/>
    <polygon points="50,38 60,40 50,42" fill="%23ea580c"/>
    <path d="M38 48 C44 54 56 54 62 48" fill="none" stroke="%23dc2626" stroke-width="5" stroke-linecap="round"/>
    <rect x="40" y="16" width="20" height="12" fill="%231e293b"/>
    <line x1="34" y1="28" x2="66" y2="28" stroke="%231e293b" stroke-width="3"/>
  </svg>`,

  // 9. Vòng hoa Giáng sinh (Christmas Wreath)
  christmasWreath: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="34" fill="none" stroke="%2316a34a" stroke-width="16" stroke-dasharray="10,4"/>
    <circle cx="34" cy="30" r="3.5" fill="%23dc2626"/>
    <circle cx="66" cy="30" r="3.5" fill="%23dc2626"/>
    <circle cx="26" cy="55" r="3.5" fill="%23dc2626"/>
    <circle cx="74" cy="55" r="3.5" fill="%23dc2626"/>
    <path d="M42 78 C35 68 45 65 50 72 C55 65 65 68 58 78 Z" fill="%23ef4444"/>
  </svg>`,

  // 10. Bánh gừng Noel (Gingerbread Man)
  gingerbreadMan: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="28" r="14" fill="%23b45309"/>
    <path d="M38 40 L18 52 L24 60 L38 52 L38 82 L48 82 L48 64 L52 64 L52 82 L62 82 L62 52 L76 60 L82 52 L62 40 Z" fill="%23b45309"/>
    <circle cx="45" cy="26" r="2" fill="%23ffffff"/>
    <circle cx="55" cy="26" r="2" fill="%23ffffff"/>
    <path d="M46 32 Q50 36 54 32" stroke="%23ffffff" stroke-width="1.5" fill="none"/>
    <circle cx="50" cy="50" r="2.5" fill="%23dc2626"/>
    <circle cx="50" cy="60" r="2.5" fill="%2316a34a"/>
  </svg>`,

  // ==========================================
  // TRÁI TIM & NGÔI SAO
  // ==========================================
  sparkleGold: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23EAB308"><path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z"/></svg>`,
  doubleHearts: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23F43F5E"><path d="M40 30 C30 15 10 25 15 45 C20 60 40 75 40 75 C40 75 60 60 65 45 C70 25 50 15 40 30 Z" opacity="0.85"/><path d="M65 45 C58 35 45 40 48 52 C52 62 65 72 65 72 C65 72 78 62 82 52 C85 40 72 35 65 45 Z" fill="%23FB7185"/></svg>`,
  floralCorner: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%238C7355" stroke-width="3" stroke-linecap="round"><path d="M10 90 C10 40 40 10 90 10"/><path d="M25 65 C20 50 30 40 35 45 C40 50 35 60 25 65 Z" fill="%23BFA588"/><circle cx="90" cy="10" r="4" fill="%238C7355"/></svg>`,
  laurelWreath: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%23D4AF37" stroke-width="3"><path d="M50 85 C30 85 20 65 20 45 C20 30 30 18 45 15"/><path d="M50 85 C70 85 80 65 80 45 C80 30 70 18 55 15"/><path d="M22 55 Q12 50 18 42 Q25 48 22 55 Z" fill="%23D4AF37"/><path d="M78 55 Q88 50 82 42 Q75 48 78 55 Z" fill="%23D4AF37"/></svg>`,
};

export const GRAPHICS_CATALOG: GraphicSticker[] = [
  // ==========================================
  // NHÓM 1: YẾU TỐ ĐÁM CƯỚI (MATCH SCREENSHOT 9)
  // ==========================================
  {
    id: 'gfx-wed-candelabra',
    name: 'Chân nến cưới 3 ngọn',
    src: SVG_ICONS.candelabra,
    category: 'Yếu tố đám cưới',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-wed-blessing',
    name: 'Bách niên hảo hợp',
    src: SVG_ICONS.weddingBlessing,
    category: 'Yếu tố đám cưới',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-wed-rosebasket',
    name: 'Giỏ hoa hồng pastel',
    src: SVG_ICONS.roseBasket,
    category: 'Yếu tố đám cưới',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-wed-bouquet',
    name: 'Bó hoa cưới thắt nơ',
    src: SVG_ICONS.weddingBouquet,
    category: 'Yếu tố đám cưới',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-wed-heart',
    name: 'Trái tim Love You',
    src: SVG_ICONS.loveHeart,
    category: 'Yếu tố đám cưới',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-wed-ribbon',
    name: 'Dải ruy băng hoa hồng',
    src: SVG_ICONS.roseRibbon,
    category: 'Yếu tố đám cưới',
    defaultWidth: 110,
    defaultHeight: 80,
  },
  {
    id: 'gfx-wed-rings',
    name: 'Nhẫn cưới kim cương',
    src: SVG_ICONS.weddingRings,
    category: 'Yếu tố đám cưới',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-wed-champagne',
    name: 'Ly sâm panh hạnh phúc',
    src: SVG_ICONS.champagne,
    category: 'Yếu tố đám cưới',
    defaultWidth: 85,
    defaultHeight: 85,
  },
  {
    id: 'gfx-wed-cake',
    name: 'Bánh cưới hoàng gia',
    src: SVG_ICONS.weddingCake,
    category: 'Yếu tố đám cưới',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-wed-doves',
    name: 'Chim bồ câu tình yêu',
    src: SVG_ICONS.loveDoves,
    category: 'Yếu tố đám cưới',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-wed-wax-seal',
    name: 'Dấu sáp niêm phong thiệp',
    src: '/assets/wedding/plugins/wax-seal.webp',
    category: 'Yếu tố đám cưới',
    defaultWidth: 90,
    defaultHeight: 90,
  },

  // ==========================================
  // NHÓM 2: VĂN HÓA VIỆT (MATCH SCREENSHOT 9)
  // ==========================================
  {
    id: 'gfx-vn-landmark',
    name: 'Dinh Độc Lập sao vàng',
    src: SVG_ICONS.vnLandmarkStar,
    category: 'Văn hóa Việt',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-vn-304-gold',
    name: 'Chữ 3D 30/4 mạ vàng',
    src: SVG_ICONS.gold304,
    category: 'Văn hóa Việt',
    defaultWidth: 110,
    defaultHeight: 70,
  },
  {
    id: 'gfx-vn-divider',
    name: 'Đường viền hoàng gia',
    src: SVG_ICONS.ornamentDivider,
    category: 'Văn hóa Việt',
    defaultWidth: 130,
    defaultHeight: 40,
  },
  {
    id: 'gfx-vn-youth',
    name: 'Thanh niên rước cờ',
    src: SVG_ICONS.vietnamYouthFlag,
    category: 'Văn hóa Việt',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-vn-soldiers',
    name: 'Đoàn quân hành quân',
    src: SVG_ICONS.vietnamSoldiersMarch,
    category: 'Văn hóa Việt',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-vn-dongson',
    name: 'Trống đồng Đông Sơn',
    src: SVG_ICONS.dongSonDrum,
    category: 'Văn hóa Việt',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-vn-double-happiness',
    name: 'Chữ Song Hỷ đỏ truyền thống',
    src: SVG_ICONS.doubleHappinessRed,
    category: 'Văn hóa Việt',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-vn-lotus',
    name: 'Bông sen hồng thanh tao',
    src: SVG_ICONS.vietnamLotus,
    category: 'Văn hóa Việt',
    defaultWidth: 95,
    defaultHeight: 95,
  },

  // ==========================================
  // NHÓM 3: NHÂN VẬT & CHIBI (COUPLES & MASCOTS)
  // ==========================================
  {
    id: 'gfx-chibi-01',
    name: 'Cặp đôi bóng bay hạnh phúc',
    src: '/assets/wedding/characters/chibi-01.gif',
    category: 'Nhân vật',
    defaultWidth: 110,
    defaultHeight: 110,
  },
  {
    id: 'gfx-chibi-02',
    name: 'Chú rể cầm máy ảnh chụp ảnh',
    src: '/assets/wedding/characters/chibi-02.gif',
    category: 'Nhân vật',
    defaultWidth: 105,
    defaultHeight: 105,
  },
  {
    id: 'gfx-chibi-04',
    name: 'Cặp đôi lễ phục đen trắng',
    src: '/assets/wedding/characters/chibi-04.png',
    category: 'Nhân vật',
    defaultWidth: 105,
    defaultHeight: 105,
  },
  {
    id: 'gfx-chibi-07',
    name: 'Chú rể bảnh bao chỉnh nơ',
    src: '/assets/wedding/characters/chibi-07.png',
    category: 'Nhân vật',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-chibi-08',
    name: 'Cặp đôi cổ phục truyền thống',
    src: '/assets/wedding/characters/chibi-08.png',
    category: 'Nhân vật',
    defaultWidth: 105,
    defaultHeight: 105,
  },
  {
    id: 'gfx-chibi-05',
    name: 'Cô dâu chú rể váy cưới lộng lẫy',
    src: '/assets/wedding/characters/chibi-05.png',
    category: 'Nhân vật',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-chibi-06',
    name: 'Chibi khiêu vũ ngọt ngào',
    src: '/assets/wedding/characters/chibi-06.gif',
    category: 'Nhân vật',
    defaultWidth: 110,
    defaultHeight: 110,
  },
  {
    id: 'gfx-chibi-03',
    name: 'Chibi ôm gấu bông',
    src: '/assets/wedding/characters/chibi-03.gif',
    category: 'Nhân vật',
    defaultWidth: 110,
    defaultHeight: 110,
  },
  {
    id: 'gfx-chibi-09',
    name: 'Hoàng tử công chúa hẹn thề',
    src: '/assets/wedding/characters/chibi-09.png',
    category: 'Nhân vật',
    defaultWidth: 105,
    defaultHeight: 105,
  },
  {
    id: 'gfx-chibi-10',
    name: 'Trao nhẫn định ước trăm năm',
    src: '/assets/wedding/characters/chibi-10.png',
    category: 'Nhân vật',
    defaultWidth: 105,
    defaultHeight: 105,
  },
  {
    id: 'gfx-chibi-11',
    name: 'Xe hoa đưa nàng về dinh',
    src: '/assets/wedding/characters/chibi-11.png',
    category: 'Nhân vật',
    defaultWidth: 110,
    defaultHeight: 110,
  },

  // ==========================================
  // NHÓM 4: LỄ HỘI NỔI BẬT (100% MATCH SCREENSHOT 8)
  // ==========================================
  {
    id: 'gfx-fest-1',
    name: 'Ngôi sao thông',
    src: SVG_ICONS.pineTreeStar,
    category: 'Lễ hội nổi bật',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-fest-2',
    name: 'Cây thông noel',
    src: SVG_ICONS.christmasTree,
    category: 'Lễ hội nổi bật',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-fest-3',
    name: 'Ông già Noel',
    src: SVG_ICONS.santaClaus,
    category: 'Lễ hội nổi bật',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-fest-4',
    name: 'Tuần lộc Giáng sinh',
    src: SVG_ICONS.christmasReindeer,
    category: 'Lễ hội nổi bật',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-fest-5',
    name: 'Nến lung linh',
    src: SVG_ICONS.festiveCandles,
    category: 'Lễ hội nổi bật',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-fest-6',
    name: 'Tất quà tặng',
    src: SVG_ICONS.giftStocking,
    category: 'Lễ hội nổi bật',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-fest-7',
    name: 'Chuông vàng Noel',
    src: SVG_ICONS.jingleBells,
    category: 'Lễ hội nổi bật',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-fest-8',
    name: 'Người tuyết đáng yêu',
    src: SVG_ICONS.christmasSnowman,
    category: 'Lễ hội nổi bật',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-fest-9',
    name: 'Vòng hoa Giáng sinh',
    src: SVG_ICONS.christmasWreath,
    category: 'Lễ hội nổi bật',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-fest-10',
    name: 'Bánh gừng Noel',
    src: SVG_ICONS.gingerbreadMan,
    category: 'Lễ hội nổi bật',
    defaultWidth: 90,
    defaultHeight: 90,
  },

  // ==========================================
  // NHÓM 5: TRÁI TIM (HEARTS)
  // ==========================================
  {
    id: 'gfx-heart-double',
    name: 'Trái tim đôi đan lồng',
    src: SVG_ICONS.doubleHearts,
    category: 'Trái tim',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-heart-water',
    name: 'Trái tim màu nước',
    src: '/assets/wedding/plugins/calen_heart_1.png',
    category: 'Trái tim',
    defaultWidth: 85,
    defaultHeight: 85,
  },
  {
    id: 'gfx-decor-28',
    name: 'Trái tim hoa hồng',
    src: '/assets/wedding/decorations/decor-028.png',
    category: 'Trái tim',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-33',
    name: 'Trái tim kim tuyến',
    src: '/assets/wedding/decorations/decor-033.png',
    category: 'Trái tim',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-42',
    name: 'Trái tim nét vẽ thanh mảnh',
    src: '/assets/wedding/decorations/decor-042.png',
    category: 'Trái tim',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-decor-48',
    name: 'Trái tim tình yêu rực rỡ',
    src: '/assets/wedding/decorations/decor-048.png',
    category: 'Trái tim',
    defaultWidth: 95,
    defaultHeight: 95,
  },

  // ==========================================
  // NHÓM 6: NGÔI SAO (STARS & SPARKLES)
  // ==========================================
  {
    id: 'gfx-star-gold',
    name: 'Sao vàng 4 cánh',
    src: SVG_ICONS.sparkleGold,
    category: 'Ngôi sao',
    defaultWidth: 75,
    defaultHeight: 75,
  },
  {
    id: 'gfx-star-firework',
    name: 'Pháo hoa rực rỡ',
    src: '/assets/wedding/plugins/fireworks.png',
    category: 'Ngôi sao',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-50',
    name: 'Chùm sao lấp lánh',
    src: '/assets/wedding/decorations/decor-050.png',
    category: 'Ngôi sao',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-51',
    name: 'Ánh sao hoàng kim',
    src: '/assets/wedding/decorations/decor-051.png',
    category: 'Ngôi sao',
    defaultWidth: 90,
    defaultHeight: 90,
  },
  {
    id: 'gfx-decor-52',
    name: 'Tia sáng kỳ diệu',
    src: '/assets/wedding/decorations/decor-052.png',
    category: 'Ngôi sao',
    defaultWidth: 90,
    defaultHeight: 90,
  },

  // ==========================================
  // NHÓM 7: HOA & HỌA TIẾT (FLORAL ORNAMENTS)
  // ==========================================
  {
    id: 'gfx-floral-corner',
    name: 'Góc hoa văn thanh lịch',
    src: SVG_ICONS.floralCorner,
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-laurel-wreath',
    name: 'Vòng nguyệt quế hoàng gia',
    src: SVG_ICONS.laurelWreath,
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-70',
    name: 'Cành lá ô liu vintage',
    src: '/assets/wedding/decorations/decor-070.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-75',
    name: 'Khung viền hoa hồng',
    src: '/assets/wedding/decorations/decor-075.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 110,
    defaultHeight: 110,
  },
  {
    id: 'gfx-decor-80',
    name: 'Họa tiết hoàng gia Pháp',
    src: '/assets/wedding/decorations/decor-080.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-85',
    name: 'Đường phân cách nghệ thuật',
    src: '/assets/wedding/decorations/decor-085.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 120,
    defaultHeight: 60,
  },
  {
    id: 'gfx-decor-001',
    name: 'Họa tiết vintage 1',
    src: '/assets/wedding/decorations/decor-001.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-002',
    name: 'Họa tiết hoàng gia 2',
    src: '/assets/wedding/decorations/decor-002.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-003',
    name: 'Góc viền thiệp cưới',
    src: '/assets/wedding/decorations/decor-003.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-004',
    name: 'Nơ ruy băng tình yêu',
    src: '/assets/wedding/decorations/decor-004.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-005',
    name: 'Vòng tròn nguyệt quế',
    src: '/assets/wedding/decorations/decor-005.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-006',
    name: 'Cành hoa dại mùa hạ',
    src: '/assets/wedding/decorations/decor-006.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-007',
    name: 'Bông hồng vàng nhạt',
    src: '/assets/wedding/decorations/decor-007.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-decor-008',
    name: 'Nhánh lá bạch đàn eucalyptus',
    src: '/assets/wedding/decorations/decor-008.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-009',
    name: 'Dải ruy băng thắt nơ vàng',
    src: '/assets/wedding/decorations/decor-009.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 110,
    defaultHeight: 70,
  },
  {
    id: 'gfx-decor-010',
    name: 'Cành hoa mẫu đơn quý phái',
    src: '/assets/wedding/decorations/decor-010.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-015',
    name: 'Họa tiết Baroque cổ điển',
    src: '/assets/wedding/decorations/decor-015.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-020',
    name: 'Dải ruy băng uốn lượn',
    src: '/assets/wedding/decorations/decor-020.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 120,
    defaultHeight: 60,
  },
  {
    id: 'gfx-decor-025',
    name: 'Cành hoa cúc họa mi',
    src: '/assets/wedding/decorations/decor-025.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 95,
    defaultHeight: 95,
  },
  {
    id: 'gfx-decor-030',
    name: 'Bó hoa lavender tím',
    src: '/assets/wedding/decorations/decor-030.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-035',
    name: 'Cành phong lan thanh tú',
    src: '/assets/wedding/decorations/decor-035.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    id: 'gfx-decor-040',
    name: 'Họa tiết viền ren quý tộc',
    src: '/assets/wedding/decorations/decor-040.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 110,
    defaultHeight: 60,
  },
  {
    id: 'gfx-decor-060',
    name: 'Dải hoa leo lãng mạn',
    src: '/assets/wedding/decorations/decor-060.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 120,
    defaultHeight: 60,
  },
  {
    id: 'gfx-decor-065',
    name: 'Góc hoa lily trắng',
    src: '/assets/wedding/decorations/decor-065.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 105,
    defaultHeight: 105,
  },
  {
    id: 'gfx-decor-090',
    name: 'Hoa văn Art Deco mạ vàng',
    src: '/assets/wedding/decorations/decor-090.png',
    category: 'Hoa & Họa tiết',
    defaultWidth: 100,
    defaultHeight: 100,
  },

  // ==========================================
  // NHÓM 8: KHUNG VIỀN (FRAMES & BORDERS)
  // ==========================================
  {
    id: 'gfx-frame-01',
    name: 'Khung ảnh vintage vòm cung',
    src: '/assets/wedding/crop-shapes/crop-mask-01.png',
    category: 'Khung viền',
    defaultWidth: 120,
    defaultHeight: 140,
  },
  {
    id: 'gfx-frame-02',
    name: 'Khung ảnh bầu dục cổ điển',
    src: '/assets/wedding/crop-shapes/crop-mask-02.png',
    category: 'Khung viền',
    defaultWidth: 120,
    defaultHeight: 140,
  },
  {
    id: 'gfx-frame-03',
    name: 'Khung hoa văn Baroque',
    src: '/assets/wedding/crop-shapes/crop-mask-03.png',
    category: 'Khung viền',
    defaultWidth: 120,
    defaultHeight: 140,
  },
  {
    id: 'gfx-frame-04',
    name: 'Khung ảnh gợn sóng nghệ thuật',
    src: '/assets/wedding/crop-shapes/crop-mask-04.png',
    category: 'Khung viền',
    defaultWidth: 120,
    defaultHeight: 140,
  },
  {
    id: 'gfx-timeline-01',
    name: 'Biểu tượng lịch hẹn tiệc cưới',
    src: '/assets/wedding/flowchart-icons/timeline-icon-01.png',
    category: 'Yếu tố đám cưới',
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: 'gfx-timeline-02',
    name: 'Biểu tượng đón khách quý',
    src: '/assets/wedding/flowchart-icons/timeline-icon-02.png',
    category: 'Yếu tố đám cưới',
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: 'gfx-timeline-03',
    name: 'Biểu tượng làm lễ trao nhẫn',
    src: '/assets/wedding/flowchart-icons/timeline-icon-03.png',
    category: 'Yếu tố đám cưới',
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: 'gfx-timeline-04',
    name: 'Biểu tượng khai tiệc rượu mừng',
    src: '/assets/wedding/flowchart-icons/timeline-icon-04.png',
    category: 'Yếu tố đám cưới',
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    id: 'gfx-timeline-05',
    name: 'Biểu tượng chụp ảnh kỷ niệm',
    src: '/assets/wedding/flowchart-icons/timeline-icon-05.png',
    category: 'Yếu tố đám cưới',
    defaultWidth: 80,
    defaultHeight: 80,
  },
];
