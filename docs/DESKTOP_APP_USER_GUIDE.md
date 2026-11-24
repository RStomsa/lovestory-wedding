# HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG MÁY TÍNH & ĐỒNG BỘ REALTIME LOVESTORY STUDIO (v2.0)

> **Dự án**: LoveStory Wedding & Events  
> **Kiến trúc**: Desktop Native (Tauri v2 + Rust) ↔ Web Browser (Next.js 16 + React 19)  
> **Cơ chế**: Realtime 2 Chiều qua Server-Sent Events (SSE) & Element-Level Merge  

---

### 1. Cách Khởi Chạy Ứng Dụng Desktop (1-Click Launcher)
- Trong thư mục gốc của dự án `D:\WEB\cinelove`, nhấp đúp vào file:
  👉 **`start-desktop-app.bat`**
- Ứng dụng sẽ tự động kiểm tra máy chủ, khởi chạy cửa sổ Desktop độc lập (Native Window không thanh địa chỉ, tỉ lệ chuẩn 1440x920, tối ưu cho đồ họa chuyên nghiệp) và kết nối trực tiếp vào LoveStory Studio.

---

### 2. Cơ Chế Tự Động Đồng Bộ Realtime 2 Chiều (Web ↔ Desktop App)
- **Web sửa → Desktop nhận ngay**:
  Khi sửa thiệp trên trình duyệt Web (đổi màu chữ, đổi phông, đổi ảnh, thêm sticker), ứng dụng Desktop đang mở nhận được sự kiện SSE qua `/api/realtime/events` và cập nhật tức thì trong vòng < 50ms.
- **Desktop sửa → Web nhận ngay**:
  Mọi thao tác lưu mẫu hoặc chỉnh sửa từ ứng dụng Desktop được phát sóng đồng bộ ngược lại toàn bộ các tab Web.
- **Trạng thái Realtime trực quan (TopBar)**:
  - `🟢 Realtime: Web ↔ Desktop`: Kết nối thông suốt 2 chiều.
  - `🟡 Đang đồng bộ...`: Đang tải dữ liệu gộp.
  - Nhấp vào biểu tượng ✦ để kích hoạt đồng bộ cưỡng bức tức thì.
- **Cơ chế Element-Level Merge**:
  Nếu Web sửa phần tử Tiêu Đề và Desktop sửa phần tử Ảnh cưới cùng lúc trên cùng 1 thiệp, hệ thống tự động gộp cả 2 thay đổi mà không ghi đè mất công sức của nhau.

---

### 3. Quản Lý Đồ Họa, Hình Dạng & Khối Mẫu (Phase 3)
1. **Khối mẫu thiết kế (Component Blocks)**:
   - Truy cập tab **Khối mẫu** (biểu tượng Layers ở thanh bên trái).
   - Chọn danh mục: *Tên Dâu Rể, Lời Mời, Lịch Trình Tiệc Cưới, Hộp Mừng Cưới VietQR, Lời Cảm Ơn*.
   - Bấm **"Chèn khối vào thiệp"** để chèn toàn bộ cụm thiết kế vào vị trí xem hiện tại với tính năng Tự động đẩy dãn cách (`autoPushDown`).
   - **Tự tạo Khối mẫu**: Chọn bất kỳ phần tử nào trên Canvas → Bấm biểu tượng Layers ở bảng thuộc tính bên phải → Đặt tên khối và bấm **"Lưu Khối Mẫu"**. Khối mới sẽ được lưu vào `componentBlocks.json` và đồng bộ ngay lên toàn hệ thống.
2. **Hình dạng & Khung viền (Shapes & Classical Frames)**:
   - Truy cập tab **Hình dạng** ở thanh bên trái.
   - Thư viện khung viền cưới vector SVG: *Khung Vòm Cung Cổ Điển, Khung Viền Đôi Hoàng Gia, Đường Phân Cách Uốn Lượn, Trái Tim Nét Mảnh Tình Yêu, Hoa Văn Góc Cưới*.
   - Hình khối cơ bản: *Đường kẻ phân cách, Hình vuông bo góc, Hình chữ nhật viền, Hình tròn, Tam giác*.
3. **Đồ họa & Sticker Cưới**:
   - Truy cập tab **Đồ họa** (hơn 2,900+ mẫu stock hoa cưới, chibi dâu rể, chữ hỷ, thuần Việt).
   - Hỗ trợ tải ảnh PNG từ máy tính hoặc cào tự động bằng Tool Rust.

---

### 4. Bộ Ba Công Cụ Rust Hiệu Năng Cao (`lovestory-tools.exe`)
File binary đã được biên dịch sẵn tại `tools/lovestory-tools/target/release/lovestory-tools.exe`:
- **Tool Cào Mẫu Tự Động (`crawl`)**:
  `lovestory-tools.exe crawl --url "<URL>" --output "public/assets/crawled" --concurrency 16`
- **Tool Nén Ảnh Cưới Đa Luồng WebP (`compress`)**:
  `lovestory-tools.exe compress --input "<FOLDER>" --output "public/assets/compressed" --quality 82`
- **Dịch vụ Xuất File In Ấn 300 DPI CMYK (`export-print`)**:
  `lovestory-tools.exe export-print --template "<SLUG>" --bleed 3.0 --output "public/assets/prints"`

Tất cả đã sẵn sàng và tích hợp trơn tru vào giao diện Quản trị viên tại:
`http://localhost:3000/admin/tools`
