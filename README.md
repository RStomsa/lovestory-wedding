# 💍 LoveStory - Nền Tảng Thiệp Cưới & Sự Kiện Điện Ảnh (Cinematic Wedding Invitation Platform)

Dự án website tạo thiệp cưới online tương tác, scrollytelling điện ảnh sang trọng.

---

## 🌟 Điểm nổi bật & Tính năng hoàn chỉnh

### 1. 4 Giao Diện Phong Cách Độc Bản
- **Burgundy Cinema (Đặc trưng):** Tông đỏ rượu vang & vàng kim quý phái, cánh hoa hồng rơi, đĩa than xoay phát nhạc, typography cổ điển.
- **Korean Minimalist:** Tông màu kem ấm, xanh sage tinh tế, thanh lịch kiểu Hàn Quốc.
- **Romantic Floral:** Tông hồng phấn pastel, họa tiết hoa lá bồng bềnh lãng mạn.
- **Vintage Retro Film:** Tone phim 35mm hoài niệm, khung ảnh Polaroid hoài niệm.

### 2. Tiện Ích Độc Quyền "Ăn Tiền"
- 🎵 **Interactive Vinyl Music Player:** Đĩa than quay tròn phát nhạc, cơ chế bypass chống chặn autoplay audio của Safari iOS.
- 🌸 **Canvas Falling Petals:** Hiệu ứng cánh hoa bay / tim lấp lánh nhẹ nhàng, mượt mà trên mọi thiết bị.
- ⏳ **Real-time Countdown Timer:** Đồng hồ đếm ngược từng giây đến ngày chung đôi.
- 💳 **Hộp Mừng Cưới Thông Minh (VietQR Napas247):** Tự động sinh mã QR ngân hàng cho Chú Rể & Cô Dâu, khách quét là điền sẵn số tiền + lời chúc.
- 💌 **Cá Nhân Hóa Tên Khách Mời:** Tạo link riêng cho từng khách (VD: `/[slug]?guest=Anh+Tuan&role=Ban+Chu+Re`), hiển thị thiệp đề tên khách trân trọng.
- 📅 **Lịch Trình Hôn Lễ:** Chi tiết Lễ Vu Quy, Lễ Thành Hôn, Tiệc Cưới kèm nút "Xem Chỉ Đường" mở thẳng Google Maps.
- 📖 **Chuyện Tình Yêu (Love Story):** Dòng thời gian cột mốc tình yêu từ lần đầu gặp gỡ, hẹn hò đến lúc cầu hôn.
- 📸 **Album Ảnh Cưới Lightbox:** Xem ảnh phóng to toàn màn hình, chuyển ảnh mượt mà.
- ✍️ **Xác Nhận Tham Dự (RSVP) & Sổ Lưu Bút:** Bắn pháo hoa Confetti khi gửi lời chúc và lưu trữ trực tiếp.

### 3. Studio Thiết Kế Trực Quan (`/editor`)
- Thanh chuyển đổi giao diện xem thử: **Mobile Frame (iPhone view)** & **Desktop Fullscreen**.
- Chỉnh sửa thời gian thực (Live Preview): Đổi template 1-click, sửa thông tin cô dâu chú rể, nhạc nền, lịch cưới, tài khoản ngân hàng.
- Nút lưu dữ liệu trình duyệt và khôi phục dữ liệu gốc.
- Bộ công cụ tạo link riêng gửi khách hàng loạt qua Zalo / Messenger.

---

## 🚀 Hướng dẫn khởi chạy

Thư mục dự án: `D:\WEB\cinelove`

### 1. Chạy môi trường Development (Mở lên xem ngay):
Mở terminal trong thư mục `D:\WEB\cinelove`:

```bash
bun dev
# hoặc
npm run dev
```

Truy cập trên trình duyệt:
- **Trang chủ giới thiệu:** `http://localhost:3000`
- **Studio tạo & sửa thiệp:** `http://localhost:3000/editor`
- **Kho mẫu giao diện:** `http://localhost:3000/templates`
- **Xem thử thiệp cưới demo:** `http://localhost:3000/chu-re-va-co-dau`
- **Xem thử thiệp cá nhân hóa gửi khách:** `http://localhost:3000/chu-re-va-co-dau?guest=Anh+Tu%E1%BA%A5n&role=B%E1%BA%A1n+Ch%C3%BA+R%E1%BB%83`

### 2. Build bản Production:
```bash
bun run build
bun run start
```

---

## 📂 Cấu trúc thư mục

```text
D:\WEB\cinelove\
├── src\
│   ├── app\
│   │   ├── page.tsx               # Landing page giới thiệu nền tảng & bảng giá
│   │   ├── layout.tsx             # Root Layout (Google Fonts: Playfair Display + Plus Jakarta Sans)
│   │   ├── globals.css            # Tailwind CSS v4 & custom keyframes
│   │   ├── templates\page.tsx     # Danh mục kho mẫu giao diện
│   │   ├── editor\page.tsx        # Trình chỉnh sửa Studio trực quan (Mobile/Desktop preview)
│   │   └── [slug]\page.tsx        # Trang thiệp cưới công khai gửi cho khách
│   ├── components\
│   │   ├── common\
│   │   │   ├── FloatingMusicPlayer.tsx   # Đĩa than xoay phát nhạc
│   │   │   ├── FallingPetals.tsx         # Hiệu ứng cánh hoa rơi Canvas
│   │   │   ├── CountdownTimer.tsx        # Đồng hồ đếm ngược
│   │   │   ├── VietQRGiftBox.tsx         # Hộp mừng cưới VietQR Napas247
│   │   │   ├── RSVPForm.tsx              # Xác nhận tham dự + pháo hoa Confetti
│   │   │   ├── GuestbookWishes.tsx       # Sổ lưu bút chúc phúc
│   │   │   ├── GalleryLightbox.tsx       # Album ảnh cưới phóng to
│   │   │   └── LoveStoryTimeline.tsx     # Dòng thời gian tình yêu
│   │   ├── templates\
│   │   │   ├── BurgundyTemplate.tsx      # Giao diện Đỏ Rượu Vang Điện Ảnh
│   │   │   ├── PastelMinimalTemplate.tsx # Giao diện Tối Giản Hàn Quốc
│   │   │   ├── RomanticFloralTemplate.tsx# Giao diện Hoa Lãng Mạn
│   │   │   └── RetroFilmTemplate.tsx     # Giao diện Phim Nhựa Cổ Điển
│   │   ├── editor\
│   │   │   ├── DevicePreviewBar.tsx      # Thanh công cụ chuyển đổi Mobile/Desktop
│   │   │   └── EditorSidebar.tsx         # Bảng điều khiển sửa thông tin trực tiếp
│   │   └── TemplateRenderer.tsx          # Bộ điều hướng template động
│   ├── data\
│   │   └── defaultWedding.ts      # Dữ liệu thiệp mẫu cưới hoàn chỉnh
│   ├── lib\
│   │   ├── utils.ts               # Bộ sinh URL VietQR, format ngày tiếng Việt
│   │   └── storage.ts             # Quản lý lưu trữ localStorage
│   └── types\
│       └── wedding.ts             # Định nghĩa cấu trúc Typescript
├── package.json
└── README.md
```

---

## 💡 Chiến lược kinh doanh & Triển khai thực tế

1. **Deploy lên Vercel / Cloudflare Pages:**
   - Đẩy dự án lên GitHub và kết nối với **Vercel** (miễn phí).
   - Tốc độ tải trang toàn cầu cực nhanh, tự động có HTTPS bảo mật.
2. **Kênh tiếp cận khách hàng hiệu quả nhất (B2B Studio):**
   - Đem bản demo này đến các **Studio chụp ảnh cưới / Wedding Planner**.
   - Bán sỉ cho Studio với giá 50.000đ – 80.000đ/thiệp để Studio tặng kèm cho các cặp đôi chụp hình cưới.
3. **Thu tiền tự động:**
   - Tích hợp Webhook VietQR (qua SePay hoặc Casso). Khách chuyển khoản 199.000đ $\rightarrow$ Tài khoản tự động kích hoạt gói VIP trong 3 giây.
