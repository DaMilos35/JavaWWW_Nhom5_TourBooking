# 📘 HƯỚNG DẪN CÀI ĐẶT, CHẠY DỰ ÁN VÀ KIỂM THỬ POSTMAN
### Đề tài #53: Website Giới Thiệu & Đặt Tour Du Lịch Trực Tuyến
### Môn học: Lập Trình WWW Java — Nhóm 5

---

## 📌 MỤC LỤC
1. [Giới thiệu dự án](#1-giới-thiệu-dự-án)
2. [Tài khoản kiểm thử có sẵn](#2-tài-khoản-kiểm-thử-có-sẵn)
3. [Cách 1: Chạy nhanh Fullstack (Khuyến nghị để chấm bài & trải nghiệm ngay)](#3-cách-1-chạy-nhanh-fullstack-khuyến-nghị)
4. [Cách 2: Chạy chuẩn môn WWW Java (Apache Tomcat 10.1 + MySQL/MariaDB)](#4-cách-2-chạy-chuẩn-môn-www-java-apache-tomcat-101)
5. [Cách 3: Chạy bằng Docker Compose (Tự động 100%)](#5-cách-3-chạy-bằng-docker-compose)
6. [Hướng dẫn kiểm thử toàn diện trên Postman](#6-hướng-dẫn-kiểm-thử-toàn-diện-trên-postman)
7. [Các lỗi thường gặp và cách khắc phục](#7-các-lỗi-thường-gặp-và-cách-khắc-phục)
8. [Hướng dẫn Commit và Push lại lên GitHub](#8-hướng-dẫn-commit-và-push-lại-lên-github)

---

## 1. Giới thiệu dự án
- **Frontend**: React 18, Vite, React Router DOM, Axios, React Icons, React Toastify.
- **Backend**: Java 17+, Jakarta Servlet 6.0, Apache Tomcat 10.1+, Maven (WAR packaging). Kèm server Node/Express proxy phục vụ môi trường phát triển nhanh.
- **Cơ sở dữ liệu**: MySQL / MariaDB (Script tạo CSDL trong thư mục `database/schema.sql`).
- **Bảo mật**: JWT (JSON Web Token), mã hóa mật khẩu BCrypt, phân quyền chặt chẽ theo Role (`ADMIN`, `CUSTOMER`, `GUEST`).

---

## 2. Tài khoản kiểm thử có sẵn
Toàn bộ mật khẩu mặc định đều là: **`123456`**

| Vai trò (Role) | Tên đăng nhập | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin` | `123456` | Toàn quyền quản trị: Thống kê Dashboard, Quản lý Tour, Danh mục, Đơn hàng, Người dùng (`/admin`) |
| **Khách hàng 1 (CUSTOMER)** | `customer1` | `123456` | Đặt tour, lưu tour yêu thích riêng, xem lịch sử đơn hàng cá nhân, đổi mật khẩu |
| **Khách hàng 2 (CUSTOMER)** | `nguyen_duc_nghia` | `123456` | Khách hàng mẫu thứ 2 để kiểm thử phân tách dữ liệu đơn và wishlist |
| **Khách vãng lai (GUEST)** | *(Chưa đăng nhập)* | *(Không)* | Chỉ xem và tìm kiếm tour công khai; bấm lưu tour hoặc đặt chỗ sẽ được yêu cầu đăng nhập |

---

## 3. Cách 1: Chạy nhanh Fullstack (Khuyến nghị)
> **Dành cho**: Thầy cô giáo hoặc thành viên nhóm muốn chấm bài / xem nhanh toàn bộ giao diện và luồng đặt tour mà không cần cài đặt Tomcat hay CSDL phức tạp.

### Bước 1: Mở Terminal tại thư mục gốc của dự án
Cài đặt các gói thư viện phụ thuộc:
```bash
npm install
```

### Bước 2: Khởi chạy dự án
```bash
npm run dev
```

### Bước 3: Truy cập hệ thống
- Mở trình duyệt web truy cập: **`http://localhost:3000`**
- Hệ thống đã tích hợp sẵn API Server nội bộ tại cổng 3000 phục vụ đầy đủ dữ liệu mẫu (Tour, Danh mục, Đặt hàng, Xác thực JWT).

---

## 4. Cách 2: Chạy chuẩn môn WWW Java (Apache Tomcat 10.1)

### Bước 1: Khởi tạo Cơ sở dữ liệu MySQL / MariaDB
1. Mở công cụ quản lý CSDL (HeidiSQL, phpMyAdmin, DBeaver hoặc MySQL Workbench).
2. Đảm bảo dịch vụ MySQL/MariaDB đang chạy (cổng mặc định `3306`).
3. Mở file **`database/schema.sql`** và bấm **Run All (Chạy toàn bộ script)**.
   - Script sẽ tự động tạo cơ sở dữ liệu `TourBookingDB`.
   - Tạo toàn bộ các bảng: `Users`, `Categories`, `Tours`, `Orders`, `OrderDetails`.
   - Nạp sẵn danh mục và các tour du lịch thực tế với hình ảnh chất lượng cao.

### Bước 2: Cấu hình thông tin kết nối CSDL cho Java Tomcat
Mở hoặc tạo file cấu hình kết nối database:
- Trên Windows: `%USERPROFILE%\.tourbooking.properties`
- Hoặc cấu hình biến môi trường / JVM Options trong Tomcat:
```properties
DB_URL=jdbc:mariadb://127.0.0.1:3306/TourBookingDB?useUnicode=true&characterEncoding=utf8
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=DuLichVietSecretKey2026WithAtLeast32CharactersLong
```

### Bước 3: Đóng gói WAR và Deploy vào Tomcat
1. Đóng gói ứng dụng Java:
   ```bash
   mvn clean package
   ```
2. Copy file `target/tourbooking-api.war` vào thư mục `webapps` của Apache Tomcat:
   ```
   C:\apache-tomcat-10.1.x\webapps\tourbooking-api.war
   ```
3. Khởi động Tomcat:
   - Chạy file `bin/startup.bat` (Windows) hoặc `bin/startup.sh` (Linux/Mac).
   - Kiểm tra đường dẫn API trên trình duyệt: `http://localhost:8080/tourbooking-api/api/categories` -> Trả về danh sách JSON thành công.

### Bước 4: Khởi chạy Frontend React kết nối Tomcat
Tại thư mục dự án, chạy:
```bash
npm install
npm run dev
```
Vite sẽ tự động proxy các request `/api` sang `http://localhost:8080/tourbooking-api`.

---

## 5. Cách 3: Chạy bằng Docker Compose
Nếu máy tính đã cài đặt **Docker Desktop**:
```bash
docker compose up --build -d
```
Docker sẽ tự động tạo 3 container:
1. `db`: MariaDB 10.11 (tự chạy `schema.sql`).
2. `api`: Apache Tomcat 10.1 chạy `tourbooking-api.war`.
3. `web`: Node.js chạy Frontend React tại cổng 3000.

---

## 6. Hướng dẫn kiểm thử toàn diện trên Postman

Thư mục **`postman/`** đã chuẩn bị sẵn đầy đủ cả Collection và Environment:
- `postman/TourBooking.postman_collection.json`
- `postman/TourBooking.postman_environment.json`

### Các bước thực hiện:
1. Mở phần mềm **Postman**.
2. Bấm nút **Import** (góc trên bên trái) -> Kéo thả cả 2 file trong thư mục `postman/` vào Postman.
3. Ở góc trên bên phải, bấm vào danh sách Environments và chọn:
   **`Du Lich Viet - Local & Tomcat Environment`**.
4. Biến môi trường mặc định:
   - Chạy máy chủ nội bộ: `baseUrl = http://localhost:3000/api`
   - Chạy với Tomcat: Đổi `baseUrl` thành `http://localhost:8080/tourbooking-api/api`

### Thứ tự chạy kịch bản Test mẫu (Test Flow):
1. **`Authentication > Admin login`**: Bấm Send -> Trạng thái 200 OK -> Script tự động lưu JWT token của Admin vào biến `adminToken`.
2. **`Authentication > Customer login`**: Bấm Send -> Trạng thái 200 OK -> Script tự động lưu JWT token của Customer vào biến `customerToken`.
3. **`Public catalog > List categories`**: Lấy danh sách danh mục tour (Tour Trong Nước, Quốc Tế, Nghỉ Dưỡng).
4. **`Public catalog > List active tours`**: Lấy danh sách toàn bộ tour đang mở bán.
5. **`Public catalog > Search tours`**: Tìm kiếm tour theo từ khóa (Ví dụ: `Hạ Long`, `Phú Quốc`, `Sapa`).
6. **`Public catalog > Filter tours`**: Lọc tour theo khoảng giá và danh mục.
7. **`Customer > My profile`**: Lấy thông tin hồ sơ của khách hàng đang đăng nhập.
8. **`Customer > Create booking order`**: Đặt tour mới -> Tự động tính toán tổng tiền, kiểm tra số chỗ và lưu `orderId`.
9. **`Customer > My orders`**: Xem danh sách đơn hàng đã đặt của người dùng.
10. **`Admin > Dashboard stats`**: Thống kê số lượng đơn, doanh thu và tổng số tour của hệ thống.

---

## 7. Các lỗi thường gặp và cách khắc phục

| Hiện tượng | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **Cổng 3000 hoặc 8080 bị chiếm dụng** | Một chương trình khác đang chạy cổng đó | Đổi cổng trong file `.env` hoặc tắt tiến trình đang chiếm cổng: `npx kill-port 3000` |
| **Lỗi `Cannot connect to database` khi chạy Tomcat** | Sai mật khẩu database hoặc chưa bật MariaDB/MySQL | Kiểm tra lại mật khẩu trong file `.tourbooking.properties` hoặc biến môi trường `DB_PASSWORD` |
| **Không lưu được tour yêu thích** | Chưa đăng nhập tài khoản | Hệ thống áp dụng phân quyền: Cần đăng nhập tài khoản khách hàng để lưu tour vào danh sách yêu thích riêng |
| **Lỗi `403 Forbidden` khi vào trang Quản trị** | Đăng nhập bằng tài khoản Customer | Đăng xuất và đăng nhập bằng tài khoản Quản trị: `admin` / `123456` |

---

## 8. Hướng dẫn Commit và Push lại lên GitHub

Nếu bạn tải mã nguồn về hoặc vừa cập nhật trên máy cá nhân, hãy thực hiện các lệnh sau để đẩy lên GitHub:

```bash
# 1. Kiểm tra trạng thái các file đã chỉnh sửa
git status

# 2. Thêm tất cả các file đã cập nhật vào staging
git add .

# 3. Tạo commit với thông điệp rõ ràng
git commit -m "feat(www-java): hoan thien giao dien builder, dong bo wishlist va bo sung tai lieu tomcat postman"

# 4. Đẩy mã nguồn lên nhánh chính (main hoặc feature branch của bạn)
git push origin feature/java-tomcat-ux
# hoặc:
# git push origin main
```
