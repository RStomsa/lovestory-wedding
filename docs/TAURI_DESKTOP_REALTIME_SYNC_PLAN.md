# KẾ HOẠCH KIẾN TRÚC & TRIỂN KHAI HỆ THỐNG DESKTOP APP TAURI V2
## ĐỒNG BỘ REALTIME 2 CHIỀU (WEB ↔ APP) & QUẢN TRỊ NỘI DUNG LOVESTORY

> **Ngày lập kế hoạch**: 24/11/2026  
> **Dự án**: LoveStory (LoveStory Wedding & Events)  
> **Mục tiêu**: Xây dựng ứng dụng Desktop native siêu nhẹ (Tauri v2 + Rust), cung cấp bộ công cụ quản lý/chỉnh sửa template chuyên sâu, cập nhật đồ họa/khối mẫu, và cơ chế tự động đồng bộ thời gian thực hai chiều giữa Web và Desktop App.

---

### I. YÊU CẦU NGHIỆP VỤ CỐT LÕI (CORE REQUIREMENTS)

1. **Quản Lý & Chỉnh Sửa Templates Toàn Diện**:
   - Quản lý danh mục template: Phân loại danh mục (Thiệp Cưới, Sinh Nhật, Tốt Nghiệp, Sự Kiện, Kỷ Niệm), Hạng (Free, Basic, VIP), Giá bán lẻ, Thứ tự hiển thị (`displayOrder`), Huy hiệu (Hot, VIP).
   - Chỉnh sửa từng template: Từng phần tử canvas (Văn bản, Font cưới Paris/Chillatos/GreatVibes, Kích thước, Màu sắc, Bo góc, Ảnh, Nhạc nền MP3, Hiệu ứng cánh hoa rơi, Mẫu phong bì thư mở đầu).
   - Tạo mới template từ canvas trắng hoặc nhân bản (clone) nhanh từ các mẫu có sẵn.

2. **Cơ Chế Tự Đồng Bộ Realtime 2 Chiều (Bidirectional Realtime Sync)**:
   - **Web sửa → App nhận ngay**: Khi Admin hoặc người dùng chỉnh sửa trên trình duyệt web, Desktop App đang mở lập tức nhận dữ liệu mới nhất và cập nhật canvas trong vòng < 100ms mà không cần tải lại app.
   - **App sửa → Web nhận ngay**: Khi thao tác chỉnh sửa, đổi màu, thêm chữ hoặc đổi ảnh trên Desktop App, tất cả các tab Web đang mở tự động đồng bộ hiển thị ngay lập tức.
   - **Xử lý xung đột (Conflict Resolution)**: Cơ chế Version Counter (`version: number`) kết hợp `updatedAt` timestamp. Hiển thị thông báo trạng thái đồng bộ ("✓ Đã đồng bộ từ Web" / "✓ Đã đồng bộ từ Desktop").

3. **Cập Nhật Đồ Họa, Hình Dạng & Khối Mẫu Qua App**:
   - **Đồ họa (Stickers, Hoa cưới, Chibi, Chữ Hỷ, Thuần Việt)**: Tải ảnh từ máy tính hoặc cào trực tiếp từ URL, tự động nén WebP, lưu vào thư viện đồ họa hệ thống `customGraphics.json` và đồng bộ lên Web.
   - **Hình dạng (Shapes & Frames)**: Quản lý khung viền trang trí, hình khối vector SVG, khung ảnh vòm cổ điển.
   - **Khối mẫu (Component Blocks)**: Lưu nhóm nhiều phần tử (ví dụ: Khối Thông Tin Cô Dâu Chú Rể, Khối Lịch Đếm Ngược, Khối Bản Đồ Tiệc Cưới, Khối Hộp Mừng Cưới VietQR) thành mẫu khối dùng lại với 1 cú nhấp chuột.

4. **Tích Hợp Bộ 3 Động Cơ Rust Native Đã Hoàn Thiện**:
   - Tool Cào Mẫu & Stock Tự Động (Tokio 16–32 luồng).
   - Công cụ Nén Ảnh Cưới Đa Luồng (Rayon Multi-core WebP).
   - Dịch vụ Xuất File In Ấn 300 DPI CMYK (Bù lề Bleed 3mm & Crop marks).

---

### II. KIẾN TRÚC KỸ THUẬT (TECHNICAL ARCHITECTURE)

```
+-------------------------------------------------------------------------+
|                          LOVESTORY ECOSYSTEM                            |
+------------------------------------+------------------------------------+
|         WEB BROWSER CLIENT         |       TAURI V2 DESKTOP CLIENT      |
|    (Next.js 16 + React 19 Client)   |  (Windows .exe Native Webview2)   |
|                                    |                                    |
| - Canvas Editor Studio             | - Canvas Editor Studio (Native UI) |
| - Quản trị Web Admin Console       | - Rust Native File/Folder Dialogs  |
| - SSE Client Listener (/api/sse)   | - SSE Client Listener (/api/sse)   |
| - Local State Store (Zustand)      | - Tokio Crawler Engine             |
|                                    | - Rayon Image Compressor           |
|                                    | - 300 DPI CMYK Print Exporter      |
+------------------------------------+------------------------------------+
                                      ▲
                                      │ HTTP REST & SSE Stream
                                      ▼
+-------------------------------------------------------------------------+
|                       LOVESTORY BACKEND & SYNC BUS                      |
|                         (Next.js API Server)                            |
|                                                                         |
|  1. /api/realtime/sync       (POST: Nhận payload update từ App hoặc Web)|
|  2. /api/realtime/events     (GET: SSE Event Stream phát broadcast)    |
|  3. /api/admin/templates     (Quản trị danh mục & chi tiết templates)  |
|  4. /api/admin/assets        (Upload & quản lý Đồ họa, Shapes, Blocks)  |
+-------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------+
|                  PERSISTENCE LAYER (ZERO-MOCK POLICY)                   |
|                                                                         |
|  - SQLite Database via Prisma ORM (Bản quyền, Đơn hàng, Users, Sites)   |
|  - JSON Master Catalogs (customStudioPresets.json, customGraphics.json) |
|  - Local Storage Disk (public/assets/uploads/thumbnails, graphics, etc.)|
+-------------------------------------------------------------------------+
```

---

### III. THIẾT KẾ CHI TIẾT CÁC MÔ-ĐUN (MODULE SPECIFICATIONS)

#### Mô-đun 1: Kênh Đồng Bộ Realtime (SSE & Broadcast Channel)
- **Đường dẫn API**:
  - `GET /api/realtime/events`: Thiết lập luồng Server-Sent Events (SSE). Duy trì danh sách các client kết nối (Web & Desktop App). Hỗ trợ Heartbeat 15 giây giữ kết nối. Yêu cầu xác thực `requireAdmin` hoặc session token.
  - `POST /api/realtime/sync`: Nhận gói tin thay đổi có kiểm thực schema (Zod validation):
    ```typescript
    interface SyncPayload {
      source: 'web' | 'desktop';
      clientId: string;
      entityType: 'template' | 'graphic' | 'block' | 'shape';
      action: 'create' | 'update' | 'delete';
      id: string;
      data: any;
      timestamp: number;
      version: number; // Optimistic locking version
    }
    ```
- **Xử lý Xung Đột Thực Chất (Optimistic Locking & Element-Level Merge)**:
  - Bổ sung cột `version Int @default(1)` vào Prisma Schema cho `Template` và `CustomGraphic`.
  - Khi client gửi bản ghi với `version: N`, nếu DB hiện tại có `version > N`:
    - Server trả về mã HTTP `409 Conflict` kèm dữ liệu mới nhất.
    - Hoặc áp dụng **Element-level merge**: So sánh mảng `elements` theo `element.id`. Nếu bên Web sửa phần tử A và bên Desktop sửa phần tử B, hệ thống tự động gộp cả 2 thay đổi mà không ghi đè làm mất dữ liệu của nhau!
    - Nếu cùng sửa 1 phần tử: Hiển thị hộp thoại trực quan *"Mẫu vừa được sửa từ Web. Bạn muốn Nhận bản mới hay Giữ bản đang sửa?"*.

#### Mô-đun 2: Đồng Bộ Tài Nguyên Đồ Họa & Nhị Phân (Asset Binary Upload)
- Khi Desktop App tải lên hoặc cào asset từ máy tính:
  - App gọi API `/api/admin/assets/upload` để đẩy tệp nhị phân lên server (`public/assets/uploads/graphics/`).
  - Server trả về đường dẫn tương đối `/assets/uploads/graphics/...` và lưu metadata vào DB/JSON.
  - Nhờ vậy, cả Web và Desktop đều truy cập cùng một nguồn tài nguyên đồng nhất, không bị lỗi đứt link ảnh cục bộ.
- **Bảo Mật SVG & Dữ Liệu**:
  - Khử mã độc (Sanitize SVG) bằng cách chỉ cho phép các thẻ đồ họa an toàn (`path`, `rect`, `circle`, `g`, `defs`), loại bỏ các thẻ `script` hoặc thuộc tính `onload`/`onerror`.
  - Giới hạn dung lượng upload tối đa (ảnh <= 20MB, vector SVG <= 2MB).

#### Mô-đun 2: Quản Lý & Chỉnh Sửa Templates Chuyên Sâu
- **Giao diện Quản Lý Danh Mục**:
  - Bảng điều khiển danh mục: Bộ lọc Thể loại, Bộ lọc Phân hạng (Free/VIP), Tìm kiếm theo Tên/Slug.
  - Thao tác nhanh: Bật/Tắt hiển thị (`isActive`), Đổi giá bán lẻ trực tiếp trên bảng, Nhân bản mẫu (Clone Template), Xóa mẫu.
- **Trình Chỉnh Sửa Từng Mẫu (Studio Engine)**:
  - Canvas kéo thả tương tác mượt mà, căn chỉnh thông minh (Smart Align), thước đo khoảng cách.
  - Sửa từng phần tử: Kích thước, tọa độ X/Y, góc xoay, độ trong suốt, màu sắc hex, phông chữ cưới.
  - Thiết lập thuộc tính thiệp: Ảnh nền bìa, Nhạc nền MP3, Hiệu ứng hoa rơi, Phong bì mở thư.

#### Mô-đun 3: Quản Lý Đồ Họa, Hình Dạng & Khối Mẫu
- **Đồ họa (Graphics & Stickers)**:
  - Cho phép người dùng duyệt thư mục máy tính tải lên nhiều ảnh PNG trong suốt cùng lúc.
  - Tự động nén sang WebP nhẹ hơn 85%, trích xuất kích thước và lưu vào `customGraphics.json`.
- **Hình dạng (Vector Shapes & Frames)**:
  - Bộ sưu tập các khung hình học: Hình tròn, vòm cung Gothic, trái tim, khung hoa văn góc, đường kẻ phân cách hoàng gia.
  - Hỗ trợ đổi màu viền, độ dày viền và màu nền fill.
- **Khối mẫu (Component Blocks)**:
  - Tính năng "Lưu thành khối mẫu": Khi chọn nhiều phần tử trên canvas (ví dụ: Tên Dâu Rể + Ngày Cưới + Biểu tượng Nhẫn), bấm 1 nút để lưu thành Khối Mẫu dùng lại.
  - Hiển thị danh sách khối mẫu tại tab "Khối mẫu" để kéo thả vào bất kỳ thiệp nào.

#### Mô-đun 4: Đóng Gói Ứng Dụng Desktop Tauri v2
- Cấu trúc thư mục: `src-tauri/` với tệp cấu hình `tauri.conf.json`.
- Tích hợp binary `lovestory-tools` vào sidecar hoặc lệnh native của Tauri.
- Window Config: Kích thước tối ưu 1366x768, hỗ trợ Dark/Light Theme đồng bộ hệ điều hành.

---

### IV. KẾ HOẠCH BƯỚC ĐI (ROADMAP & IMPLEMENTATION PHASES)

- **Giai đoạn 1**: Xây dựng Backend Realtime Sync Engine (SSE endpoint `/api/realtime/events` và `/api/realtime/sync`).
- **Giai đoạn 2**: Nâng cấp giao diện Quản trị & Trình soạn thảo Studio hỗ trợ lắng nghe Realtime 2 chiều.
- **Giai đoạn 3**: Xây dựng mô-đun Quản lý Đồ họa, Hình dạng và Lưu Khối Mẫu (Component Blocks).
- **Giai đoạn 4**: Khởi tạo và cấu hình Tauri v2 Desktop App, đóng gói và kiểm thử đồng bộ Web ↔ App.
