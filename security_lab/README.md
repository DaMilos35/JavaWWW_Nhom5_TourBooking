# PHÒNG THÍ NGHIỆM THỰC NGHIỆM AN NINH MẠNG (SECURITY LAB)
## Đề tài: Đối kháng Red Team vs Blue Team trên Java Spring Boot JWT API

Thư mục này được tạo độc lập nhằm phục vụ nội dung **Nghiên cứu khoa học (NCKH)** theo định hướng của Giảng viên hướng dẫn. Thư mục này **HOÀN TOÀN TÁCH BIỆT** và **KHÔNG** làm thay đổi bất kỳ logic hay giao diện demo nào của dự án chính.

---

### 1. Cấu trúc thư mục
* `run_red_team_attack_sim.cjs`: Script tự động hóa gửi 5 đợt tấn công từ Red Team vào máy chủ Backend và đo lường khả năng phòng thủ của Blue Team.
* `README.md`: Hướng dẫn vận hành và đối soát kết quả.
* Tài liệu lý thuyết và phân tích học thuật chi tiết tại: `docs/CHUYEN_DE_NCKH_BAO_MAT_JAVA_API_JWT.md`.

---

### 2. Cách chạy thực nghiệm (Khi Backend đang chạy)
Đảm bảo Backend đang chạy ở cổng 8080 (`.\gradlew.bat bootRun`), mở một cửa sổ Terminal mới và gõ:

```powershell
node security_lab/run_red_team_attack_sim.cjs
```

### 3. Kết quả 5 kịch bản thực nghiệm
1. **Kịch bản 1:** Truy cập trái phép endpoint `/api/orders` không truyền Token -> Trả về `401 Unauthorized`.
2. **Kịch bản 2:** Tấn công Algorithm Confusion bằng cách sửa Header `{"alg": "none"}` -> Bị từ chối `401/403`.
3. **Kịch bản 3:** Sửa đổi Payload nâng quyền lên ADMIN giữ nguyên hash cũ -> Bị từ chối do sai chữ ký số.
4. **Kịch bản 4:** Tấn công BOLA / IDOR (Customer A xem đơn hàng Customer B) -> Bị chặn tại Service layer (`403 Forbidden`).
5. **Kịch bản 5:** Thử nghiệm SQL Injection vào endpoint tìm kiếm tour -> JPA Parameterized Query vô hiệu hóa chuỗi độc hại, hệ thống hoạt động ổn định.
