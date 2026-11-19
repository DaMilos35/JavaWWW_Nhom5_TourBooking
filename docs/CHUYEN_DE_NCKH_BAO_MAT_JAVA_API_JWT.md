# CHUYÊN ĐỀ NGHIÊN CỨU KHOA HỌC BẢO MẬT HỆ THỐNG
## NGHIÊN CỨU LỖ HỔNG XÁC THỰC API, CƠ CHẾ BYPASS JWT VÀ GIẢI PHÁP PHÒNG VỆ ĐA TẦNG (DEFENSE-IN-DEPTH) TRÊN NỀN TẢNG JAVA SPRING BOOT 3

* **Đơn vị đào tạo**: Khoa Công nghệ Thông tin – Trường Đại học Công nghiệp TP. Hồ Chí Minh (IUH)
* **Chuyên ngành**: Kỹ nghệ Phần mềm & An toàn Thông tin
* **Nhóm nghiên cứu**: Nhóm 5 (DHKTPM19ATT)
* **Giảng viên hướng dẫn**: ThS. Nguyễn Vũ Lâm
* **Năm thực hiện**: 2026

---

## TÓM TẮT CHUYÊN ĐỀ (ABSTRACT)
Trong bối cảnh các tổ chức an ninh mạng quốc tế như Cơ quan An ninh Mạng và Cơ sở Hạ tầng Hoa Kỳ (CISA) và Cơ quan An ninh Mạng Hàn Quốc (KISA) liên tục phát lệnh cảnh báo khẩn cấp về các lỗ hổng thực thi mã từ xa (RCE) và rò rỉ dữ liệu không cần xác thực trong các hệ thống phần mềm nền Java, việc nghiên cứu các cơ chế tấn công và thiết lập rào chắn phòng thủ trở thành ưu tiên sống còn. Nghiên cứu này triển khai mô hình đối kháng thực nghiệm **Red Team (Tấn công mô phỏng) vs Blue Team (Phòng thủ đa tầng)** trên kiến trúc API RESTful sử dụng JSON Web Token (JWT) và cơ sở dữ liệu quan hệ MariaDB. Thông qua 5 kịch bản thực nghiệm đối kháng bám sát chuẩn OWASP API Security Top 10, nghiên cứu chứng minh tính hiệu quả của mô hình kiểm soát Zero-Trust kết hợp Spring Security 6, khóa ký HMAC-SHA256 chuẩn hóa và đối soát quyền sở hữu dữ liệu cấp hàm (Method-Level Authorization).

---

## CHƯƠNG 1: TÍNH CẤP THIẾT VÀ BỐI CẢNH AN NINH MẠNG JAVA QUỐC TẾ

### 1.1. Làn sóng cảnh báo bảo mật hệ sinh thái Java
Java là một trong những ngôn ngữ lập trình doanh nghiệp phổ biến nhất thế giới. Tuy nhiên, kiến trúc hướng đối tượng mạnh mẽ và cơ chế nạp lớp động (Dynamic Class Loading) của JVM cũng là đích ngắm hàng đầu của các nhóm tin tặc cấp quốc gia (APT):
* **Lỗ hổng Psychic Signatures (CVE-2022-21449):** Xuất hiện trong quá trình xử lý thuật toán ký số ECDSA trên Java 15 đến Java 18 của Oracle. Lỗ hổng cho phép kẻ tấn công gửi một cặp giá trị chữ ký `(r, s) = (0, 0)`. Máy ảo Java tính toán phép nhân điểm kỳ dị dẫn đến việc xác thực chữ ký luôn trả về `true`! Bất kỳ hệ thống xác thực JWT nào dựa trên ECDSA (ES256) trên phiên bản Java lỗi đều bị vượt qua hoàn toàn mà không cần khóa riêng tư (Private Key).
* **Lỗ hổng Log4Shell (CVE-2021-44228) & Spring4Shell (CVE-2022-22965):** Khai thác cơ chế tra cứu JNDI và Binding tham số của Tomcat ClassLoader, cho phép kẻ tấn công thực thi mã độc tùy ý từ xa (RCE) qua một chuỗi Header HTTP thông thường mà không cần đăng nhập.
* **Cảnh báo từ chính phủ Mỹ và Hàn Quốc:** Trước nguy cơ các cơ sở hạ tầng trọng yếu bị tê liệt, CISA và KISA đã yêu cầu các cơ quan công quyền và khối ngân hàng, thương mại điện tử cập nhật ngay lập tức các bản vá định kỳ CPU (Critical Patch Update) của Oracle, đồng thời bắt buộc rà soát toàn bộ các điểm cuối API công khai.

---

## CHƯƠNG 2: MÔ HÌNH THỰC NGHIỆM ĐỐI KHÁNG RED TEAM VS BLUE TEAM

Để biến lý thuyết an ninh mạng thành kết quả nghiên cứu thực chứng, nhóm nghiên cứu thiết lập phòng thí nghiệm đối kháng nội bộ (Security Lab) phân chia thành 2 nhóm chuyên trách:

```
                            MÔ HÌNH THỰC NGHIỆM ĐỐI KHÁNG
                            
    ┌──────────────────────────┐               ┌──────────────────────────┐
    │  NHÓM 1: RED TEAM        │               │  NHÓM 2: BLUE TEAM       │
    │  (Offensive Simulation)  │               │  (Defensive Engineering) │
    ├──────────────────────────┤               ├──────────────────────────┤
    │ * Postman / Burp Suite   │  Tấn công     │ * Spring Boot 3.5.6      │
    │ * Node.js Attack Scripts │ ────────────> │ * Spring Security 6.x    │
    │ * 5 Kịch bản OWASP Top 10│ <──────────── │ * Java 17 + MariaDB      │
    │ * Giả mạo JWT / BOLA     │  Chặn lọc     │ * Rào chắn RBAC 3 Tầng   │
    └──────────────────────────┘               └──────────────────────────┘
```

### 2.1. Nhóm 1: Red Team (Tấn công & Vượt mặt xác thực)
Mục tiêu: Đóng vai trò kẻ tấn công bên ngoài (Unauthenticated Attacker) hoặc người dùng có đặc quyền thấp cố gắng leo thang quyền hạn và chiếm đoạt dữ liệu:
1. **Kịch bản 1 (Direct Unauthenticated Access):** Gửi request trực tiếp đến các endpoint nghiệp vụ thanh toán, danh sách hóa đơn (`/api/orders`, `/api/admin/users`) mà không có Header xác thực.
2. **Kịch bản 2 (Algorithm Confusion 'none'):** Chỉnh sửa cấu trúc Header của JWT thành `{"alg": "none", "typ": "JWT"}` và xóa bỏ toàn bộ phần chữ ký sau dấu chấm thứ hai nhằm đánh lừa thư viện xác minh token.
3. **Kịch bản 3 (Signature Tampering & Privilege Escalation):** Sử dụng token hợp lệ của tài khoản thường, giải mã Base64 payload, sửa trường `role: "CUSTOMER"` thành `role: "ADMIN"` nhưng không có khóa bí mật ký lại, nhằm kiểm tra tính nguyên vẹn của chữ ký số.
4. **Kịch bản 4 (Broken Object Level Authorization - BOLA / IDOR):** Đăng nhập với tài khoản hợp lệ A, nhưng cố tình thay đổi tham số trên URL (`GET /api/orders/2` hoặc `PUT /api/orders/2/cancel`) để truy cập và hủy đơn hàng của khách hàng B.
5. **Kịch bản 5 (Injection Probing):** Chèn các chuỗi phá vỡ cú pháp SQL (`' OR '1'='1' --`) vào các endpoint tìm kiếm và lọc dữ liệu công khai để thăm dò nguy cơ SQL Injection.

### 2.2. Nhóm 2: Blue Team (Xây dựng API, Kết nối CSDL & Phòng vệ đa tầng)
Mục tiêu: Thiết kế kiến trúc phòng vệ theo nguyên tắc **Zero-Trust** và **Defense-in-Depth** (Phòng ngự chiều sâu):
1. **Tầng Bộ lọc An ninh (Security Filter Chain):**
   * Đăng ký `JwtAuthenticationFilter` đứng trước `UsernamePasswordAuthenticationFilter`.
   * Mọi endpoint ngoại trừ `/api/auth/**`, `/api/tours/**` đều ở trạng thái mặc định `authenticated()`.
2. **Tầng Mã hóa và Xác thực Token:**
   * Sử dụng thuật toán `HMAC-SHA256` với khóa bí mật dài 256 bits được bảo vệ trong cấu hình hệ thống.
   * Ràng buộc chặt chẽ parser: Từ chối các token có thuật toán rỗng (`none`) hoặc sai lệch chữ ký; bắt buộc kiểm tra thời gian hết hạn (`Claims.EXPIRATION`).
   * Ứng dụng chạy trên Java 17 phiên bản mới nhất, hoàn toàn vô hiệu hóa lỗi "Psychic Signatures" của ECDSA.
3. **Tầng Kiểm soát Quyền hạn cấp hàm (Method-Level Security):**
   * Kích hoạt `@EnableMethodSecurity(prePostEnabled = true)`.
   * Sử dụng `@PreAuthorize("hasRole('ADMIN')")` cho các tác vụ quản trị.
   * Áp dụng kiểm tra quyền sở hữu dữ liệu (Ownership Verification): Kiểm tra `order.getUser().getId().equals(currentUser.getId())` trước khi trả về dữ liệu đơn hàng.
4. **Tầng Cơ sở dữ liệu (Database Layer):**
   * Kết nối CSDL MariaDB thông qua Spring Data JPA và Hibernate ORM với Prepared Statements tham số hóa 100%, triệt tiêu khả năng nối chuỗi SQL độc hại.
   * Băm mật khẩu người dùng bằng `BCryptPasswordEncoder` (độ phức tạp cost factor = 12).

---

## CHƯƠNG 3: KẾT QUẢ THỰC NGHIỆM ĐỊNH LƯỢNG

Thực nghiệm được tự động hóa bằng kịch bản kiểm thử độc lập tại `security_lab/run_red_team_attack_sim.cjs`. Kết quả thu nhận được trên máy chủ phát triển cục bộ như sau:

### Bảng 1: Ma trận Thực nghiệm Đối kháng Red Team vs Blue Team

| STT | Kịch Bản Kiểm Thử | Phương Thức Tấn Công (Red Team) | Cơ Chế Phòng Thủ (Blue Team) | Mã Lỗi Trả Về | Đánh Giá An Toàn |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **01** | Truy cập không kèm Token | `GET /api/orders` không truyền Authorization Header | `SecurityFilterChain.authorizeHttpRequests` chặn tại cổng Servlet | **HTTP 401** | **PASSED (An toàn)** |
| **02** | Khai thác thuật toán `none` | Header `{"alg":"none"}` + Payload Admin giả mạo | `JwtTokenProvider.validateToken()` bắt buộc chữ ký HMAC, từ chối token không chữ ký | **HTTP 401** | **PASSED (An toàn)** |
| **03** | Giả mạo Payload (Sửa Role) | Thay đổi Role thành `ADMIN` giữ nguyên hash chữ ký cũ | `SignatureException`: Khóa bí mật không khớp, hủy phiên làm việc ngay lập tức | **HTTP 401** | **PASSED (An toàn)** |
| **04** | Tấn công BOLA / IDOR | Customer A gọi `GET /api/orders/1` của Customer B | Đối soát `userId` trong Token với `order.user.id` trong CSDL | **HTTP 403** | **PASSED (An toàn)** |
| **05** | Tấn công SQL Injection | Gửi keyword: `' OR '1'='1' --` qua endpoint tìm kiếm | Spring Data JPA Parameterized Query vô hiệu hóa chuỗi escape | **HTTP 200 (Clean)** | **PASSED (An toàn)** |

### Nhận xét định lượng:
* **Tỷ lệ phòng thủ thành công:** **100% (5/5 kịch bản)**.
* **Thời gian phản hồi phòng thủ trung bình:** Dưới **15 ms** đối với các lỗi từ chối xác thực tại Filter, giúp tiết kiệm tài nguyên CPU và ngăn chặn tấn công từ chối dịch vụ (DoS).

---

## CHƯƠNG 4: KẾT LUẬN VÀ KHUYẾN NGHỊ KỸ THUẬT

1. **Kết luận:**
   * Việc chỉ dựa vào một lớp xác thực JWT ở tầng Gateway là chưa đủ. Mô hình phòng thủ đa tầng kết hợp Filter Gateway + Method Security + Data Ownership Check là mô hình chuẩn mực để bảo vệ hệ thống thương mại điện tử hiện đại.
   * Hệ sinh thái Java hoàn toàn an toàn khi tuân thủ nguyên tắc: Luôn cập nhật JDK bản vá mới nhất từ Oracle/OpenJDK, không tùy tiện tự viết bộ giải mã JWT mà sử dụng thư viện chuẩn (`jjwt`), và mã hóa toàn bộ truy vấn CSDL qua ORM.

2. **Khuyến nghị cho các dự án phần mềm doanh nghiệp:**
   * **Cập nhật JDK thường xuyên:** Định kỳ cập nhật bản vá CPU hàng quý của Oracle để phòng chống các lỗ hổng 0-day trong bộ vi xử lý và thư viện mật mã.
   * **Thời hạn Token ngắn kết hợp Refresh Token:** Đặt thời gian sống của Access Token trong khoảng 15 – 60 phút để giảm thiểu rủi ro nếu token bị rò rỉ tại client.
   * **Tuyệt đối không lưu khóa bí mật trong mã nguồn:** Sử dụng biến môi trường hệ thống (`.env` hoặc Vault) để quản lý `jwt.secret`.

---

*Tài liệu nghiên cứu khoa học chuyên đề được lưu trữ và đính kèm độc lập trong thư mục `docs/CHUYEN_DE_NCKH_BAO_MAT_JAVA_API_JWT.md` và mã kiểm thử thực nghiệm tại `security_lab/run_red_team_attack_sim.cjs`.*
