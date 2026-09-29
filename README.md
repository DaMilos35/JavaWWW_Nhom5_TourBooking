# 🌏 Du Lịch Việt - Nền Tảng Đặt Tour Du Lịch Trực Tuyến

> Website đặt tour du lịch cao cấp chuẩn UX/UI 2026, hỗ trợ đầy đủ quy trình nghiệp vụ cho Khách hàng (Customer) và Quản trị viên (Admin).  
> **Dự án Fullstack chạy ngay trên mọi máy tính (Windows, macOS, Linux) chỉ với Node.js!**

---

## ⚡ Cài Đặt & Chạy Ngay (Chỉ 2 Bước)

Dự án đã được đóng gói trọn gói bao gồm cả Frontend (React + Vite) và Backend API (Express TypeScript) cùng bộ dữ liệu mẫu phong phú (tours, danh mục, đơn hàng, tài khoản demo). Bạn **không cần cài đặt SQL Server hay cấu hình phức tạp**, tải về là chạy được ngay:

### 1. Cài đặt các thư viện:
```bash
npm install
```

### 2. Khởi chạy ứng dụng:
```bash
npm run dev
```

Sau khi chạy lệnh, mở trình duyệt và truy cập:
👉 **`http://localhost:3000`**

---

## 🔑 Tài Khoản Trải Nghiệm Có Sẵn

Bạn có thể đăng nhập ngay bằng các tài khoản mẫu dưới đây (hoặc bấm nút đăng nhập nhanh trên giao diện):

| Vai trò | Tên đăng nhập (Username) | Mật khẩu (Password) | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin` | `123456` | Toàn quyền quản trị hệ thống tại `/admin` |
| **Khách Hàng (Customer)** | `customer1` | `123456` | Đặt tour, thanh toán, quản lý đơn hàng |
| **Khách Mới (Guest)** | Tự đăng ký | Tùy chọn | Đăng ký trực tiếp tại trang `/register` |

> 💡 **Tiện ích chuyển vai trò 1-click (Role Switcher)**:  
> Khi đang đăng nhập, bạn có thể bấm vào avatar trên thanh Menu Navbar hoặc chân Sidebar Admin để chuyển đổi qua lại tức thì giữa **Quản trị viên** và **Khách hàng** mà không cần mất công đăng xuất và gõ lại mật khẩu!

---

## 🌟 Tính Năng Nổi Bật

### 👤 Dành cho Khách Hàng (Customer & Guest)
- **Trang chủ & Khám phá**: Tìm kiếm tour theo từ khóa, địa điểm khởi hành, khoảng giá và danh mục điểm đến.
- **Chi tiết tour**: Lịch trình chi tiết từng ngày, thông tin dịch vụ bao gồm/không bao gồm, tính giá linh hoạt theo số lượng khách, hình ảnh chất lượng cao.
- **Giỏ hàng thông minh**: Thêm/xóa/sửa số lượng vé, lưu trạng thái tự động.
- **Thanh toán đa phương thức (Checkout)**: Điền thông tin hành khách, lựa chọn phương thức thanh toán thực tế (VietQR ngân hàng 24/7, VNPAY, Thẻ quốc tế Visa/Mastercard, Tiền mặt).
- **Lịch sử đơn hàng (`/my-orders`)**: Theo dõi tiến độ đơn, hủy đơn khi còn chờ xử lý, **In phiếu xác nhận / Hóa đơn điện tử** có mã QR.
- **Hồ sơ cá nhân (`/profile`)**: Cập nhật thông tin liên hệ và tính năng đổi mật khẩu an toàn.

### 🛡️ Dành cho Quản Trị Viên (Admin Panel `/admin`)
- **Dashboard tổng quan**: Báo cáo doanh thu thực tế, số lượng đơn, khách hàng mới, tour đang mở bán và tuyến tour thịnh hành.
- **Quản lý Tour (`/admin/tours`)**: 
  - Thêm mới, chỉnh sửa thông tin tour, số chỗ trống, điểm đánh giá.
  - Hỗ trợ nút **Gợi ý ảnh mẫu nhanh** (Hạ Long, Đà Nẵng, Phú Quốc, Sapa, Thái Lan, Nhật Bản) và xem trước ảnh trực tiếp.
  - Bật/tắt trạng thái mở bán (`Mở bán` / `Tạm ẩn`) tức thì bằng 1 click.
  - Bảo vệ dữ liệu: không cho phép xóa tour nếu tour đó đang có trong đơn hàng của khách.
- **Quản lý Danh mục (`/admin/categories`)**: Thêm mới, sửa tên, ảnh đại diện và mô tả danh mục; thống kê số lượng tour thuộc từng nhóm.
- **Quản lý Đơn hàng (`/admin/orders`)**: 
  - Bộ lọc tab trạng thái hiển thị số lượng trực tiếp (`Tất cả`, `Chờ xử lý`, `Đã xác nhận`, `Hoàn thành`, `Đã hủy`).
  - Tìm kiếm nhanh theo mã đơn, họ tên hoặc số điện thoại khách.
  - Chuyển đổi trạng thái đơn hàng (Chờ xử lý → Đã xác nhận → Hoàn thành → Đã hủy).
  - Trang chi tiết đơn hàng cho phép chỉnh sửa số lượng vé (tự động tính lại tổng tiền) và nút in hóa đơn/phiếu thu.
- **Quản lý Người dùng (`/admin/users`)**: 
  - Xem danh sách tài khoản, số lượng đơn hàng từng người đã đặt.
  - Nâng quyền thành Admin hoặc hạ quyền về Customer với cơ chế bảo vệ an toàn (chống tự tước quyền của chính mình).
  - Tạm khóa / Mở khóa tài khoản người dùng vi phạm.

---

## 📱 Thiết Kế Đáp Ứng (Responsive UX/UI 2026)

- Tương thích tối ưu trên mọi độ phân giải:
  - 📱 **Mobile (360px - 480px)**: Sidebar admin tự động chuyển thành ngăn kéo trượt (Off-canvas Drawer) có lớp nền mờ (Backdrop), bảng dữ liệu hỗ trợ cuộn mượt mà.
  - 💻 **Tablet (768px - 1024px)**: Menu co giãn linh hoạt, thanh tìm kiếm thông minh.
  - 🖥️ **Desktop (1280px - 1920px+)**: Giao diện rộng rãi, thao tác trực quan.
- Chuẩn hóa toàn bộ văn bản tiếng Việt Unicode UTF-8 chính xác, không lỗi font chữ.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, React Router v6, React-Toastify, React Icons, Axios.
- **Build Tool**: Vite (cực nhanh, hỗ trợ module bundling hiện đại).
- **Backend & API**: Node.js 20+, Express.js, TypeScript (`tsx`).
- **Bảo mật**: JWT (JSON Web Token) Bearer Authentication, bcryptjs mã hóa mật khẩu, Role-based Access Control (RBAC).

---

## 📦 Các Lệnh Thường Dùng

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `npm run dev` | Khởi chạy máy chủ phát triển Fullstack tại cổng 3000 |
| `npm run build` | Đóng gói sản phẩm tối ưu cho môi trường Production vào thư mục `/dist` |
| `npm start` | Chạy ứng dụng production với Node.js |
| `npm run lint` | Kiểm tra toàn bộ mã nguồn TypeScript, đảm bảo không có lỗi cú pháp |

---

## 🚀 Hướng Dẫn Đẩy Lên GitHub Của Bạn

Nếu bạn muốn tạo một repository mới trên GitHub cá nhân và đưa toàn bộ mã nguồn lên:

```bash
# 1. Khởi tạo Git
git init

# 2. Thêm tất cả các file vào Git (đã loại trừ node_modules qua .gitignore)
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: complete travel tour booking platform with full customer and admin features"

# 4. Đổi tên nhánh chính thành main
git branch -M main

# 5. Liên kết với kho lưu trữ GitHub của bạn (thay bằng URL repo của bạn)
git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/TÊN_REPO.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```

Chúc bạn có những trải nghiệm tuyệt vời với nền tảng **Du Lịch Việt**! 🚀
