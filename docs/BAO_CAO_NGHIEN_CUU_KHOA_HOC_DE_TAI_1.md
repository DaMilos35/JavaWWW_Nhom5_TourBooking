# BÁO CÁO NGHIÊN CỨU KHOA HỌC SINH VIÊN
## TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH - KHOA CÔNG NGHỆ THÔNG TIN

### TÊN ĐỀ TÀI:
**NGHIÊN CỨU VÀ XÂY DỰNG HỆ THỐNG TÌM KIẾM NGỮ NGHĨA LAI GHÉP (HYBRID RETRIEVAL) ỨNG DỤNG CƠ SỞ DỮ LIỆU VECTOR VÀ MÔ HÌNH NGÔN NGỮ LỚN TRONG THƯƠNG MẠI ĐIỆN TỬ DU LỊCH**  
*(A Hybrid Semantic Retrieval Architecture using Vector Databases and Large Language Models for Travel Platforms)*

* **Sinh viên thực hiện**: Nhóm 5 (DHKTPM19ATT - Khóa 19)
  1. Vũ Trần Đức Nghĩa (MSSV: 23637711 - Nhóm trưởng)
  2. Nguyễn Đình Phi (MSSV: 23633271)
  3. Lê Viết Cao Sơn (MSSV: 23637311)
  4. Trần Hoàng Nam (MSSV: 23639071)
* **Giảng viên hướng dẫn**: ThS. Nguyễn Vũ Lâm
* **Năm thực hiện**: 2026

---

## TÓM TẮT ĐỀ TÀI (ABSTRACT)
Công trình này đề xuất một Kiến trúc Tìm kiếm Ngữ nghĩa Lai ghép (Hybrid Retrieval Pipeline) hoàn chỉnh tích hợp:
1. Nhánh thu hồi từ vựng chuẩn BM25.
2. Nhánh thu hồi ngữ nghĩa đa chiều dựa trên Cơ sở dữ liệu Vector PostgreSQL pgvector với cấu trúc chỉ mục HNSW.
3. Thuật toán dung hợp thứ hạng Reciprocal Rank Fusion (RRF).
4. Rào chắn kiểm soát địa lý tuyệt đối (Strict Geographic Isolation Guards).
5. Đường ống Tạo sinh Tăng cường Thu hồi (RAG) tích hợp mô hình ngôn ngữ lớn Google Gemini 1.5 Flash được bảo vệ bởi rào chắn an toàn PII Redaction và TypeChat JSON Schema.

### BẢNG KẾT QUẢ THỰC NGHIỆM ĐỊNH LƯỢNG (BENCHMARK RESULTS TRÊN 100 TRUY VẤN)

| Phương Pháp Tìm Kiếm | Precision@3 | Recall@5 | MRR | NDCG@5 | Tỷ Lệ Zero-Hit | Độ Trễ Trung Bình |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. SQL LIKE (Lexical Search)** | 44.5% | 83.0% | 0.838 | 0.791 | 4.0% | **0.11 ms** |
| **2. Pure Dense Vector (pgvector)** | 50.3% | 82.5% | 0.723 | 0.732 | 15.0% | **0.71 ms** |
| **3. Hybrid Retrieval (RRF Đề xuất)** | **52.5%** | **93.5%** | **0.930** | **0.901** | **0.0%** | **0.88 ms** |

*File Word hoàn chỉnh đã được khởi tạo sẵn sàng nộp tại: `docs/BAO_CAO_NGHIEN_CUU_KHOA_HOC_DE_TAI_1.docx`*
