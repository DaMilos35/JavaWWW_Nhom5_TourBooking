# Du Lịch Việt — Đặt tour trực tuyến

Ứng dụng gồm giao diện React/Vite và REST API Java Servlet chạy trên Apache Tomcat. Giao diện hiện tại được giữ nguyên; Vite chuyển tiếp các yêu cầu `/api` sang Tomcat trong lúc phát triển.

Giao diện có danh sách tour đã lưu (lưu cục bộ theo trình duyệt), Trung tâm trợ giúp tìm kiếm được và menu trạng thái các đơn gần đây. Ngôn ngữ tiếng Anh và thông báo đẩy chưa được hỗ trợ; menu ngôn ngữ chỉ báo trạng thái hiện có, còn menu thông báo đọc trạng thái đơn từ API khi người dùng mở.

## Công nghệ

- Frontend: React 18, Vite, React Router, Axios.
- Backend: Java 17+, Jakarta Servlet 6, Apache Tomcat 10.1+, Maven WAR.
- Cơ sở dữ liệu: MariaDB / MySQL.

## Chạy nhanh trên máy mới bằng Docker

Đây là cách khuyến nghị trên Windows, macOS và Linux. Chỉ cần Git và Docker Desktop (có Docker Compose v2); không cần cài riêng Java, Maven, Tomcat, Node.js hoặc MariaDB.

> Nhánh Java/Tomcat đang dùng là `feature/java-tomcat-ux`. Nhớ clone đúng nhánh này; nhánh `main` hiện không phải bản Java/Tomcat.

```powershell
git clone --single-branch --branch feature/java-tomcat-ux https://github.com/DaMilos35/JavaWWW_Nhom5_TourBooking.git
cd JavaWWW_Nhom5_TourBooking
docker compose up --build -d
docker compose ps
```

Chờ các dịch vụ `db`, `api` và `web` báo `healthy`/`running`, sau đó mở:

- Website: `http://localhost:3000`
- API cho Postman: `http://localhost:8080/tourbooking-api/api`
- MariaDB trên máy host (nếu cần dùng HeidiSQL): `127.0.0.1:3307`

Postman collection: `postman/TourBooking.postman_collection.json`. Tài khoản dữ liệu mẫu: `admin` / `123456` và `customer1` / `123456`.

Compose tự build WAR Java, deploy vào Tomcat, tạo MariaDB và nạp `database/schema.sql` khi khởi tạo database lần đầu. Cơ sở dữ liệu được giữ trong volume khi dừng bằng `docker compose down`; **không dùng** `docker compose down -v` trừ khi muốn xóa database và toàn bộ đơn hàng để tạo lại dữ liệu mẫu.

Các mật khẩu mặc định trong Compose chỉ dành cho chạy local/demo. Trước khi chia sẻ máy chủ ra ngoài, tạo file `.env` từ `.env.example`, đổi mật khẩu và đặt `JWT_SECRET` ngẫu nhiên dài ít nhất 32 ký tự. Có thể đổi các cổng `WEB_PORT`, `API_PORT`, `DB_PORT` trong `.env` nếu cổng mặc định đang được chương trình khác sử dụng.

Nếu service không khởi động, xem log bằng `docker compose logs --tail=100 db api web`. Để dừng các service mà vẫn giữ dữ liệu, chạy `docker compose down`.

## Chuẩn bị cơ sở dữ liệu
- Xác thực: JWT Bearer token; mật khẩu được băm bằng BCrypt.

## Chuẩn bị cơ sở dữ liệu

1. Khởi động MariaDB và xác nhận cổng của server (mặc định `3306`).
2. Mở `database/schema.sql` trong HeidiSQL, chọn kết nối MariaDB local rồi chạy toàn bộ script. Script sẽ tạo database `TourBookingDB` và **xóa rồi tạo lại** các bảng trong database đó cùng dữ liệu mẫu. Không chạy nếu database `TourBookingDB` đang có dữ liệu cần giữ.
3. Tài khoản demo: `admin` / `123456` và `customer1` / `123456`.

`database/schema.sql` đã thêm sẵn danh mục, tour, người dùng và một số đơn hàng. Không cần chạy thêm `database/seed_vi.sql`. Nếu muốn thay danh mục/tour bằng bộ dữ liệu tiếng Việt khác, có thể chạy `database/seed_vi.sql` trong HeidiSQL sau đó; script này xóa toàn bộ đơn hàng và chi tiết đơn hàng hiện có, nhưng giữ lại tài khoản người dùng.

Các tour trong hai script là dữ liệu minh họa, không phải chào bán thật; giá, số chỗ, điểm đánh giá và mô tả cần được xác minh trước khi sử dụng thực tế. Ngày khởi hành mẫu được tạo tương đối theo ngày chạy script. Cơ sở dữ liệu đã nạp từ bản cũ không tự đổi ngày: cập nhật tour hết lịch trong mục quản trị trước khi gửi yêu cầu đặt.

## Chạy API trên Tomcat

Yêu cầu Java 17 trở lên, Maven 3.9+ và Tomcat 10.1+. Cách đơn giản nhất trên Windows là tạo file cấu hình ngoài source code:

```powershell
Copy-Item backend/tourbooking.properties.example "$env:USERPROFILE\.tourbooking.properties"
notepad "$env:USERPROFILE\.tourbooking.properties"
```

Sửa `DB_PASSWORD` thành mật khẩu MariaDB của bạn. Thay giá trị `JWT_SECRET` bằng chuỗi ngẫu nhiên riêng (ít nhất 32 ký tự). `DB_DEBUG=true` bật chi tiết SQL để debug local; tắt thành `false` trước khi chạy môi trường public. File này nằm ngoài project/source code và bị Git bỏ qua. Servlet tự đọc file khi khởi động; không cần nhập DB credentials vào VM options của IntelliJ.

Sau khi lưu file, dừng rồi chạy lại Tomcat từ IntelliJ. Backend ưu tiên cấu hình theo thứ tự environment variables, JVM system properties, rồi `%USERPROFILE%\.tourbooking.properties`. Nếu database còn lỗi, response JSON trả kèm `detail`, `sqlState` và `vendorCode` để dễ xác định nguyên nhân.

Nếu muốn giữ cấu hình trong IntelliJ, vẫn có thể truyền các biến qua VM options hoặc environment variables. Với **Windows Service**, cũng có thể đặt các biến trong Java Options của Tomcat Service Manager:

```text
-DDB_URL=jdbc:mariadb://127.0.0.1:3306/TourBookingDB?useUnicode=true&characterEncoding=utf8
-DDB_USERNAME=root
-DDB_PASSWORD=your-mariadb-password
-DJWT_SECRET=your-own-random-secret-with-at-least-32-characters
-DCORS_ORIGIN=http://localhost:3000
```

Nếu bỏ qua `JWT_SECRET`, ứng dụng vẫn chạy với khóa ngẫu nhiên tạm thời và ghi cảnh báo trong log Tomcat; token đăng nhập sẽ hết hiệu lực khi Tomcat restart.

Đóng gói WAR:

```powershell
mvn -f backend/pom.xml clean package
```

Chép `backend/target/tourbooking-api.war` vào thư mục `webapps` của Tomcat, rồi khởi động Tomcat. API có base URL:

```text
http://localhost:8080/tourbooking-api/api
```

Ứng dụng đọc cấu hình từ environment variables trước, sau đó mới đến JVM system properties. Thiếu cấu hình database vẫn sẽ được báo lỗi khi cần kết nối database.

## Chạy giao diện React

Chỉ cần cách này khi phát triển giao diện trực tiếp trên máy host thay vì chạy Compose. Yêu cầu Node.js 20+; dùng `npm ci` để cài đúng các phiên bản đã khóa trong `package-lock.json`:

```powershell
npm ci
npm run dev
```

Mở `http://localhost:3000`. Cần khởi động Tomcat và deploy `tourbooking-api.war` trước; Vite proxy `/api` tới context `/tourbooking-api` tại `http://localhost:8080/tourbooking-api`. Nếu WAR được deploy với tên/context path khác, cập nhật target trong `vite.config.ts` tương ứng hoặc đặt `VITE_API_URL` (ví dụ `http://localhost:8080/tourbooking-api/api`) trước khi build giao diện. Nếu API không chạy, kiểm tra Tomcat ở cổng `8080` và trạng thái deploy của ứng dụng trước khi thử lại.

Tạo bản build giao diện:

```powershell
npm run build
```

## Kiểm thử bằng Postman

Import collection `postman/TourBooking.postman_collection.json`. Mặc định collection dùng `http://localhost:8080/tourbooking-api/api`.

1. Gửi **Admin login** hoặc **Customer login** để lưu token vào collection variables.
2. Gọi endpoint public để kiểm tra danh mục/tour; các request cần đăng nhập tự gửi Bearer token.
3. Với request quản trị, đăng nhập admin trước. Request tạo đơn lưu `orderId` vào collection variables để dùng tiếp ở request xem/hủy đơn.

Collection bao gồm xác thực, danh mục, tìm kiếm/lọc tour, hồ sơ, đơn hàng và các thao tác quản trị thường dùng. API JSON dùng UTF-8; lỗi trả về dạng `{ "message": "..." }`.

## API

Các endpoint được giữ tương thích với client React:

- Public: `/auth/login`, `/auth/register`, `/categories`, `/tours`, `/tours/search`, `/tours/filter`.
- Người dùng: `/users/me`, `/orders`, `/orders/my`, `/orders/{id}`, `/orders/{id}/cancel`.
- Quản trị (Bearer token có role `ADMIN`): `/admin/dashboard`, `/admin/tours`, `/admin/categories`, `/admin/users`, `/admin/orders`.

Khi đặt tour, server tính tổng tiền từ giá hiện tại trong database, kiểm tra số chỗ còn lại và cập nhật tồn chỗ trong transaction; không tin giá/tổng tiền do client gửi lên.

Checkout hiện chỉ tạo yêu cầu ở trạng thái `PENDING`, chưa tích hợp cổng thanh toán. Tour đã qua ngày khởi hành bị từ chối ở giao diện và API. Lịch trình theo ngày, dịch vụ bao gồm và chính sách đổi/hủy chưa có trường dữ liệu riêng nên giao diện báo rõ khi chưa được cung cấp.
