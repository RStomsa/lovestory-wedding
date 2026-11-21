# LUẬT VÀ QUY TẮC PHÁT TRIỂN DỰ ÁN LOVESTORY (PROJECT RULES)

## 1. TUYỆT ĐỐI KHÔNG SỬ DỤNG DỮ LIỆU ẢO TRONG TOÀN BỘ DỰ ÁN (ZERO-MOCK POLICY)
- **Dữ liệu thật 100% từ Database**: Mọi trang trong dự án — đặc biệt là Bảng Điều Khiển Quản Trị `http://localhost:3000/admin`, Quản lý đơn hàng `/admin/orders`, Quản lý thành viên `/admin/users`, Quản lý thiệp cưới `/admin/sites`, Quản lý templates `/admin/templates` — BẮT BUỘC phải lấy số liệu thực tế được truy vấn trực tiếp từ cơ sở dữ liệu (SQLite qua Prisma ORM).
- **Nghiêm cấm bịa đặt số liệu (No Fake / Hardcoded / Random Metrics)**:
  * Tuyệt đối không hardcode mảng dữ liệu ảo, số doanh thu ảo, số lượng views ảo, số lượng user ảo.
  * Tuyệt đối không sử dụng `Math.random` để sinh số lượt xem (views), số lượt thích (likes), hay số đơn hàng giả lập. Khi tạo mẫu mới hoặc tạo thiệp mới, lượt xem và lượt thích phải khởi tạo bằng 0.
- **Xử lý trung thực trạng thái rỗng (Honest Empty State)**:
  * Khi cơ sở dữ liệu chưa có bản ghi (ví dụ: chưa có đơn hàng, chưa có thiệp cưới, chưa có lời chúc), hệ thống PHẢI hiển thị giao diện trạng thái rỗng (Empty State) rõ ràng: *"Chưa có đơn hàng nào trong cơ sở dữ liệu"*, tuyệt đối KHÔNG render danh sách ảo để che mắt người dùng.

## 2. QUY CHUẨN THƯƠNG HIỆU (BRANDING)
- Tuyệt đối cấm sử dụng tên thương hiệu "CineLove" trong bất kỳ văn bản giao diện, thông báo, code hay database.
- Tên thương hiệu duy nhất của dự án là **LoveStory** (LoveStory Wedding & Events).

## 3. CHÍNH SÁCH BẢNG GIÁ & VÒNG ĐỜI LƯU TRỮ (PRICING & DATA LIFECYCLE)
- **Gói Miễn Phí (Free)**: Tối đa 300 lượt xem (views), lưu trữ mở công khai 1 tháng (30 ngày). Sau 30 ngày (hoặc khi vượt 300 views), tự động chuyển sang trạng thái Backup trong cơ sở dữ liệu thêm 1 tháng cho khách hàng trước khi lưu kho (Archive).
- **Gói Chuẩn 1 Năm (50.000 đ)**: Thời hạn 365 ngày, KHÔNG GIỚI HẠN lượt xem (`maxViews: -1`).
- **Gói VIP Trọn Đời (200.000 đ)**: Lưu trữ vĩnh viễn trọn đời, KHÔNG GIỚI HẠN lượt xem, sử dụng toàn bộ kho template VIP.
- **Mua Lẻ Template VIP (30.000 đ)**: Mở quyền sử dụng trọn đời 1 template VIP cụ thể cho tài khoản.

## 4. BẢO VỆ HIỆU NĂNG & TÀI NGUYÊN HỆ THỐNG
- Không sử dụng `will-change: transform` trên các ảnh danh mục dài nhằm tránh tràn bộ nhớ VRAM của GPU.
- Mọi hiệu ứng hoạt họa (như cánh hoa rơi FallingPetals) phải được tối ưu FPS (tối đa 30-35 FPS) và tự động tạm dừng khi tab trình duyệt bị ẩn (`document.hidden`).
