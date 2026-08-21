# 🌏 TourBooking - Website Đặt Tour Du Lịch Trực Tuyến

> **Đề tài #53**: Website giới thiệu tour du lịch và cho phép đăng ký tour trực tuyến  
> **Môn học**: Lập Trình WWW Java  
> **Nhóm 5**

---

## 🎯 Chức năng theo yêu cầu đề tài

### 👥 Guest (Chưa đăng nhập)
- ✅ Xem danh sách tour từ CSDL
- ✅ Xem chi tiết từng tour
- ✅ Chọn tour → đưa vào giỏ hàng (lưu Session/localStorage)
- ✅ Xem giỏ hàng, chỉnh sửa số lượng (= 0 → xóa)
- ✅ Đăng ký tài khoản (kiểm tra email trùng + gửi email thông báo)
- ✅ Đăng nhập

### 👤 Customer (Đã đăng nhập)
- ✅ Tất cả quyền của Guest
- ✅ Thanh toán: cập nhật CSDL + gửi email + xóa Session sau khi thành công
- ✅ Xem lịch sử đơn đặt tour
- ✅ Cập nhật thông tin cá nhân

### 🛡️ Admin (Back-End)
- ✅ Tìm kiếm tour/danh mục/tài khoản/đơn hàng
- ✅ Quản lý Tour: Xem DS, Xem CT, Thêm, Sửa, Xóa (ràng buộc: không xóa nếu đã có đơn)
- ✅ Quản lý Danh mục: Xem DS, Xem CT, Thêm, Sửa, Xóa (ràng buộc: không xóa nếu có tour)
- ✅ Quản lý Tài khoản: Xem DS, Xem CT, Sửa, Xóa (không xóa nếu đã đặt hàng)
- ✅ Quản lý Đơn hàng: Xem DS (sắp xếp theo ngày), Xem CT, Cập nhật số lượng trong đơn

---

## 🏗️ Kiến trúc hệ thống

```
Frontend (ReactJS :3000)  ←→  Backend (Spring Boot :8080)  ←→  Database (SQL Server :1433)
```

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Frontend | ReactJS 18, React Router v6, Axios, React-Toastify |
| Backend | Spring Boot 3.3, Spring Security, JWT, Spring Data JPA |
| Database | SQL Server 2019+ |
| Security | BCrypt password, JWT Bearer Token |
| Email | JavaMailSender (Gmail SMTP) |
| IDE | IntelliJ IDEA |

---

## 🚀 Hướng dẫn cài đặt và chạy

### Bước 1: Cài đặt Database

1. Mở **SQL Server Management Studio (SSMS)**
2. Kết nối đến SQL Server local (localhost, port 1433)
3. Mở file `database/schema.sql`
4. Chạy toàn bộ script (F5)
5. Kiểm tra: database `TourBookingDB` đã được tạo với dữ liệu mẫu

### Bước 2: Cấu hình Backend

1. Mở **IntelliJ IDEA**
2. **File → Open** → chọn thư mục `TourBooking/backend`
3. IntelliJ sẽ tự nhận project Maven và tải dependencies

4. Mở file `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=TourBookingDB;encrypt=true;trustServerCertificate=true
   spring.datasource.username=sa
   spring.datasource.password=123456   ← đổi thành password SQL Server của bạn
   ```

5. *(Tùy chọn)* Cấu hình Gmail để gửi email:
   - Vào Gmail → Settings → App Passwords → Tạo App Password
   - Điền vào `spring.mail.username` và `spring.mail.password`

6. Chạy `TourBookingApplication.java` (nhấn Run ▶)
7. Kiểm tra: mở browser vào http://localhost:8080/api/tours

### Bước 3: Chạy Frontend

```bash
# Vào thư mục frontend
cd TourBooking/frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

Trình duyệt tự mở http://localhost:3000

---

## 🔑 Tài khoản mặc định (Seed Data)

| Vai trò | Username | Password | Email |
|---------|----------|----------|-------|
| Admin | `admin` | `123456` | admin@tourbooking.com |
| Customer | `customer1` | `123456` | customer@tourbooking.com |

---

## 📡 API Endpoints

### Public (Không cần đăng nhập)
```
GET  /api/tours                   → Danh sách tất cả tour active
GET  /api/tours/{id}              → Chi tiết tour
GET  /api/tours/search?keyword=   → Tìm kiếm tour
GET  /api/tours/category/{id}     → Tour theo danh mục
GET  /api/tours/filter?categoryId=&minPrice=&maxPrice=
GET  /api/categories              → Danh sách danh mục
POST /api/auth/register           → Đăng ký
POST /api/auth/login              → Đăng nhập → JWT token
```

### Customer (Cần JWT token)
```
POST /api/orders                  → Tạo đơn đặt tour
GET  /api/orders/my               → Đơn hàng của tôi
GET  /api/orders/{id}             → Chi tiết đơn hàng
PUT  /api/users/me                → Cập nhật thông tin
```

### Admin (Cần JWT token + role ADMIN)
```
GET  /api/admin/dashboard         → Thống kê tổng quan
GET/POST/PUT/DELETE /api/admin/tours
GET/POST/PUT/DELETE /api/admin/categories
GET/PUT/DELETE       /api/admin/users
GET/PUT              /api/admin/orders
PUT  /api/admin/orders/{id}/status
PUT  /api/admin/orders/{orderId}/details/{detailId}/quantity
```

---

## 📁 Cấu trúc thư mục

```
TourBooking/
├── database/
│   └── schema.sql                    # SQL Server schema + seed data
├── backend/                          # Spring Boot (IntelliJ project)
│   ├── pom.xml
│   └── src/main/java/com/nhom5/tourbooking/
│       ├── TourBookingApplication.java
│       ├── config/       (SecurityConfig, CorsConfig)
│       ├── controller/   (Auth, Tour, Category, Order, Admin)
│       ├── dto/          (Request/Response DTOs)
│       ├── entity/       (User, Tour, Category, Order, OrderDetail)
│       ├── exception/    (GlobalExceptionHandler, ResourceNotFoundException)
│       ├── repository/   (5 JPA repositories)
│       ├── security/     (JWT: Utils, Filter, UserDetailsService)
│       └── service/      (Tour, Category, Order, Email services)
└── frontend/                         # ReactJS
    └── src/
        ├── App.jsx
        ├── api/          (axiosConfig - tất cả API calls)
        ├── context/      (AuthContext, CartContext)
        ├── components/   (Navbar, Footer, TourCard, PrivateRoute...)
        └── pages/
            ├── HomePage, TourListPage, TourDetailPage
            ├── CartPage, CheckoutPage
            ├── LoginPage, RegisterPage, ProfilePage, MyOrdersPage
            └── admin/    (Dashboard, Tours, Categories, Orders, Users)
```

---

## 🐛 Xử lý lỗi thường gặp

**Lỗi kết nối SQL Server:**
- Kiểm tra SQL Server đang chạy: Services → SQL Server (MSSQLSERVER)
- Kiểm tra port 1433 đang listen: `netstat -an | findstr 1433`
- Kiểm tra SQL Server Authentication được bật trong SSMS → Properties → Security

**Lỗi Maven dependencies:**
- IntelliJ → Maven → Reload Project
- Hoặc chạy: `mvn clean install -DskipTests`

**Frontend không kết nối được backend:**
- Đảm bảo backend đang chạy trên port 8080
- Kiểm tra CORS config trong `CorsConfig.java` cho phép `http://localhost:3000`

---

## 👨‍💻 Nhóm thực hiện

| STT | MSSV | Họ Tên | Vai trò |
|-----|------|--------|---------|
| 1 | 23637711 | Vũ Trần Đức Nghĩa (Nhóm trưởng) | Backend API, Security |
| 2 | | Phan Hoàng Nhật Huy | Database, Cart, Order |
| 3 | | Nguyễn Hữu Thắng | Frontend UI/UX |
| 4 | | [Thành viên 4] | Admin Panel, Testing |

---

*Tham khảo UI: [Du Lịch Việt](https://dulichviet.com.vn) | Admin: [AdminLTE](https://adminlte.io)*
