# 🎙️ KỊCH BẢN THUYẾT TRÌNH BẢO VỆ ĐỀ TÀI: CHUYÊN ĐỀ VECTOR DATABASE
**Đề tài số 49: Website Giới Thiệu Tour Du Lịch & Đặt Tour Trực Tuyến (Du Lịch Việt)**  
**Đơn vị:** Đại học Công nghiệp TP.HCM (IUH) – Khoa Công nghệ Thông tin  
**GVHD:** ThS. Nguyễn Vũ Lâm | **Nhóm thực hiện:** Nhóm 5 – Lớp DHKTPM19ATT  
**Thời lượng dự kiến:** 10 – 12 phút thuyết trình + 5 phút Demo & Hỏi đáp

---

## 📑 PHẦN 1: KỊCH BẢN NÓI CHI TIẾT TỪNG SLIDE (SPEAKER NOTES)

### Slide 1: Trang tiêu đề (0:00 - 0:45)
> *"Kính thưa Thầy Nguyễn Vũ Lâm cùng toàn thể quý Thầy Cô trong Hội đồng phản biện. Hôm nay, đại diện cho Nhóm 5, em xin phép trình bày báo cáo chuyên đề công nghệ cốt lõi được nhóm tích hợp sâu trong Đề tài số 49: **Cơ Sở Dữ Liệu Vector (Vector Database) và Ứng Dụng Tìm Kiếm Ngữ Nghĩa Trong Nền Tảng Thương Mại Điện Tử Du Lịch**.  
> Đây là bước đột phá công nghệ giúp giải quyết triệt để bài toán tìm kiếm thấu hiểu ý định người dùng theo tiêu chuẩn của các nền tảng OTA hàng đầu như Traveloka hay Booking."*

---

### Slide 2: Đặt vấn đề & Giới hạn của CSDL quan hệ (0:45 - 2:00)
> *"Thưa Thầy, trong thực tế khi khách hàng lên mạng tìm tour, họ thường tìm kiếm bằng cảm xúc và nhu cầu đời thường, ví dụ: 'muốn đi trốn nóng cuối tuần cho 2 người' hoặc 'tour biển hè có cano lặn ngắm san hô'.  
> Nếu hệ thống chỉ sử dụng câu lệnh SQL truyền thống như `LIKE '%trốn nóng%'`, kết quả trả về sẽ là con số 0 tròn trĩnh! Bởi vì trong cơ sở dữ liệu, tên tour được lưu mang tính hành chính: 'Đà Lạt 3N2Đ: Săn mây đồi chè'.  
> SQL thông thường chỉ so khớp máy móc từng ký tự (Lexical Search), hoàn toàn bị mù trước ngữ cảnh và các từ đồng nghĩa. Khoảng cách ngữ nghĩa này khiến doanh nghiệp lữ hành bỏ lỡ rất nhiều khách hàng tiềm năng."*

---

### Slide 3: Định nghĩa Vector Database (2:00 - 3:15)
> *"Để khắc phục nhược điểm trên, nhóm 5 đã nghiên cứu và đưa vào hệ thống **Cơ sở dữ liệu Vector (Vector Database)**.  
> Không giống như RDBMS lưu trữ bảng và các kiểu dữ liệu nguyên thủy, Vector Database lưu trữ các mảng số thực nhiều chiều đại diện cho ngữ nghĩa của dữ liệu phi cấu trúc.  
> Thay vì dùng chỉ mục B-Tree để tìm kiếm chính xác theo điều kiện logic, Vector Database sử dụng các thuật toán không gian để tìm ra những bản ghi lân cận gần nhất (Nearest Neighbor).  
> Trong dự án của nhóm, MariaDB đóng vai trò bảo vệ toàn vẹn giao dịch đặt tour, còn Vector Database đóng vai trò 'bộ não' thông minh xử lý tìm kiếm và điều phối AI."*

---

### Slide 4 & 5: Lý thuyết Embeddings & Thuật toán Cosine Similarity (3:15 - 5:00)
> *"Về mặt lý thuyết, mọi thông tin tour du lịch sẽ được mô hình Embedding (ở đây là Google Gemini text-embedding-004) mã hóa thành một vector trong không gian 768 chiều. Trong không gian này, các khái niệm có cùng ngữ cảnh sẽ hội tụ gần nhau.  
> Để đo lường khoảng cách giữa câu hỏi của khách hàng và các tour trong hệ thống, nhóm 5 áp dụng công thức **Cosine Similarity**:  
> $$\text{Cosine}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$  
> Nhóm lựa chọn Cosine Similarity thay vì khoảng cách Euclid vì Cosine Similarity có tính chất bất biến với độ dài văn bản (Scale-invariant). Cho dù một tour có phần mô tả dài 500 từ và một tour chỉ mô tả 50 từ, nếu cùng chung chủ đề 'biển đảo nghỉ dưỡng', góc lệch $\theta$ giữa hai vector vẫn rất nhỏ, đảm bảo điểm số tương đồng luôn chuẩn xác."*

---

### Slide 6: Kiến trúc RAG (Retrieval-Augmented Generation) (5:00 - 6:15)
> *"Vector Database còn là trái tim của kiến trúc **RAG - Retrieval-Augmented Generation**.  
> Khi người dùng chat với Trợ lý AI du lịch, quy trình diễn ra qua 3 bước:  
> 1. **Retrieval**: Câu hỏi được chuyển thành vector để truy vấn Top 4 tour phù hợp nhất trong Vector Store.  
> 2. **Augmentation**: Thông tin thật của 4 tour này được ghép vào Prompt làm ngữ cảnh thực tế.  
> 3. **Generation**: Mô hình Gemini 1.5 Flash sinh câu trả lời tư vấn.  
> Cơ chế này giúp giải quyết dứt điểm vấn đề 'Ảo giác' (Hallucination) của AI, đảm bảo AI không bao giờ bịa ra giá tiền hay lịch trình sai sự thật."*

---

### Slide 7: So sánh minh họa thực tế (6:15 - 7:30)
> *"Trên màn hình là kết quả thử nghiệm trực tiếp trên dữ liệu của đề tài:  
> Khách hàng tìm: 'Tour lặn ngắm san hô biển đảo hè có cano và flycam'.  
> - SQL LIKE trả về: 0 kết quả.  
> - Vector Database của nhóm 5 xếp hạng: Tour Phú Quốc 3N2Đ đạt độ khớp **94.6%**, Tour Nha Trang đạt **91.2%**, Tour Quy Nhơn đạt **88.5%**.  
> Toàn bộ các đặc điểm nổi bật như lặn san hô, tặng clip flycam đều được Vector DB tự động định vị chính xác."*

---

### Slide 8, 9 & 10: Liên hệ thực tế trong mã nguồn dự án Nhóm 5 (7:30 - 9:30)
> *"Về mặt hiện thực hóa mã nguồn trong backend Spring Boot:  
> - **Điểm sáng thứ nhất**: Lớp `EmbeddingService.java` được nhóm thiết kế theo cơ chế **Dual-Engine (Chịu lỗi 2 tầng)**: Khi có Internet và API Key, hệ thống sử dụng Google Gemini 768 chiều. Nếu mất mạng hoặc API gặp sự cố, hệ thống tự động chuyển sang bộ mã hóa cục bộ `LocalVectorizer` 128 chiều chuẩn hóa $L_2$. Nhờ đó, ứng dụng không bao giờ bị gián đoạn và 15/15 ca kiểm thử JUnit TDD luôn đạt 100%.  
> - **Điểm sáng thứ hai**: Lớp `TourVectorIndexer.java` tự động chạy khi Spring Boot khởi động, tổng hợp toàn bộ metadata phong phú chuẩn Traveloka gồm: phương tiện máy bay/xe, số sao khách sạn, huy hiệu, điểm nhấn và lịch trình.  
> - **Điểm sáng thứ ba**: `VectorStoreService.java` chạy trực tiếp trên bộ nhớ RAM với cấu trúc dữ liệu `ConcurrentHashMap`, đảm bảo truy xuất đồng thời đa luồng an toàn với độ trễ cực thấp dưới 5 mili-giây."*

---

### Slide 11 & 12: Trải nghiệm người dùng UX/UI & Định hướng tương lai (9:30 - 11:00)
> *"Trên giao diện React 18, nhóm đã thiết kế thanh tìm kiếm Hero Search hai chế độ: Khách hàng có thể chuyển đổi mượt mà giữa tìm kiếm SQL truyền thống và tìm kiếm AI Vector DB. Kết quả trả về hiển thị rõ ràng huy hiệu phần trăm tương đồng như `Độ khớp: 95%`, tích hợp nút Đặt tour tức thì và chiết khấu đoàn B2B.  
> Trong tương lai khi lượng dữ liệu đạt hàng triệu tour, kiến trúc của nhóm hoàn toàn sẵn sàng mở rộng sang cụm phân tán **Milvus** hoặc **PostgreSQL pgvector** mà không làm thay đổi tầng nghiệp vụ phía trên."*

---

### Slide 13: Kết luận & Chuyển sang Demo (11:00 - 11:30)
> *"Kính thưa Thầy, chuyên đề Vector Database của Nhóm 5 đã được kiểm thử toàn diện và tích hợp hoàn chỉnh vào sản phẩm. Sau đây, em xin phép mở trình duyệt để Thầy và Hội đồng kiểm chứng trực tiếp tính năng tìm kiếm ngữ nghĩa và quy trình đặt tour thời gian thực. Em xin trân trọng cảm ơn!"*

---

## 🧠 PHẦN 2: BỘ CÂU HỎI PHẢN BIỆN DỰ ĐOÁN & CÂU TRẢ LỜI MẪU 10/10

### ❓ Câu hỏi 1: Tại sao nhóm không dùng Full-Text Search của MySQL/MariaDB (`MATCH...AGAINST`) mà phải dùng Vector Database?
- **Trả lời xuất sắc**:
  > *"Thưa Thầy, Full-Text Search của MySQL/MariaDB dựa trên bảng chỉ mục đảo (Inverted Index) và tính điểm theo tần suất xuất hiện từ khóa TF-IDF hoặc BM25. Mặc dù nó tốt hơn `LIKE %keyword%` ở chỗ có thể xếp hạng độ liên quan, nhưng bản chất của nó **vẫn là so khớp từ khóa cú pháp (Lexical Matching)**.  
  > Nếu người dùng gõ từ đồng nghĩa, từ lóng hoặc mô tả cảm xúc chuyến đi mà trong văn bản không chứa đúng từ đó thì Full-Text Search vẫn hoàn toàn bỏ sót.  
  > Ngược lại, Vector Database ánh xạ văn bản vào không gian vector ngữ nghĩa (Semantic Vector Space). Nó hiểu được sự liên đới giữa các khái niệm mà không cần trùng lặp ký tự. Vì vậy, trong các hệ thống thương mại điện tử du lịch hiện đại, Vector Database là giải pháp ưu việt hơn hẳn."*

---

### ❓ Câu hỏi 2: Giải thích bản chất toán học của Cosine Similarity? Tại sao không dùng khoảng cách Euclid ($L_2$ Distance)?
- **Trả lời xuất sắc**:
  > *"Thưa Thầy, khoảng cách Euclid đo **độ dài đường thẳng** giữa hai điểm trong không gian:  
  > $$d(A, B) = \sqrt{\sum (A_i - B_i)^2}$$  
  > Điểm yếu của Euclid đối với văn bản là nó bị chi phối bởi độ dài văn bản (Magnitude). Nếu một tour mô tả rất chi tiết 1.000 từ, vector của nó sẽ có độ dài rất lớn; còn tour mô tả ngắn 50 từ sẽ có vector ngắn, khiến khoảng cách Euclid giữa chúng bị kéo xa nhau mặc dù hai tour cùng nói về biển đảo.  
  > Trong khi đó, **Cosine Similarity chỉ đo góc $\theta$ giữa hai hướng vector**:  
  > $$\cos(\theta) = \frac{A \cdot B}{\|A\| \|B\|}$$  
  > Nó chia cho tích độ dài $(\|A\| \cdot \|B\|)$, do đó nó **bất biến với độ dài văn bản (Scale-invariant)**. Một bài viết dài và một câu truy vấn ngắn có chung định hướng ngữ nghĩa sẽ cho $\cos(\theta) \approx 1$. Do đó Cosine Similarity là lựa chọn chuẩn mực trong xử lý ngôn ngữ tự nhiên."*

---

### ❓ Câu hỏi 3: Nếu đang chạy mà mất mạng Internet hoặc Google Gemini API hết tiền thì hệ thống tìm kiếm Vector có bị lỗi không?
- **Trả lời xuất sắc**:
  > *"Thưa Thầy, nhóm em đã lường trước kịch bản này từ khâu thiết kế kiến trúc và cài đặt giải pháp **Dual-Engine trong `EmbeddingService.java`**:  
  > Hệ thống luôn có khối lệnh `try-catch` bọc ngoài lời gọi Gemini API. Nếu phát hiện mất kết nối mạng, timeout quá 8 giây hoặc HTTP 429 do hết quota, service sẽ tự động kích hoạt **Local Semantic Projection (128 chiều, L2-Normalized)** chạy hoàn toàn bằng thuật toán Java nội bộ trên CPU máy chủ.  
  > Nhờ cơ chế Fallback thông minh này, hệ thống không bao giờ bị sập, người dùng vẫn tìm kiếm ngữ nghĩa bình thường và toàn bộ 15 ca kiểm thử tự động của nhóm em trong CI/CD đều chạy pass 100% ở môi trường offline."*

---

### ❓ Câu hỏi 4: Vector Database trong đồ án của nhóm được lưu trữ ở đâu? Khi tắt máy/restart server dữ liệu vector có mất không?
- **Trả lời xuất sắc**:
  > *"Thưa Thầy, trong phạm vi đề tài, nhóm em hiện thực hóa theo kiến trúc **In-Memory Vector Store** sử dụng cấu trúc `ConcurrentHashMap` trong Java Heap Memory.  
  > Khi server restart, toàn bộ dữ liệu vector trong RAM sẽ giải phóng. Tuy nhiên, nhóm đã thiết lập cơ chế **Auto-Reindexing Pipeline** thông qua annotation `@EventListener(ApplicationReadyEvent.class)` trong lớp `TourVectorIndexer.java`.  
  > Ngay khi Spring Boot khởi động hoàn tất, hệ thống sẽ tự động đọc danh sách các tour từ MariaDB, tổng hợp metadata và vector hóa nạp lại vào RAM chỉ trong khoảng 40 - 50 mili-giây đối với danh mục tour hiện tại.  
  > Ngoài ra, hệ thống còn cung cấp API `POST /api/ai/vector-db/reindex` để Quản trị viên có thể kích hoạt đánh lại chỉ mục bất cứ lúc nào."*

---

### ❓ Câu hỏi 5: Nếu sau này hệ thống mở rộng lên hàng triệu tour thì kiến trúc In-Memory này xử lý ra sao?
- **Trả lời xuất sắc**:
  > *"Thưa Thầy, khi mở rộng quy mô lên hàng triệu vector, bài toán tìm kiếm tuyến tính $O(N)$ trong RAM sẽ bắt đầu tốn bộ nhớ và thời gian tính toán. Khi đó nhóm sẽ nâng cấp theo 2 bước:  
  > 1. **Về mặt giải thuật**: Chuyển từ tìm kiếm vét cạn (Exact Search) sang tìm kiếm lân cận gần đúng **ANN (Approximate Nearest Neighbor)** bằng đồ thị **HNSW (Hierarchical Navigable Small World)**, giúp giảm độ phức tạp tìm kiếm từ $O(N)$ xuống $O(\log N)$.  
  > 2. **Về mặt hạ tầng**: Thay thế In-Memory Map bằng các cụm cơ sở dữ liệu vector chuyên dụng như **Milvus Cluster**, **Qdrant** hoặc tích hợp extension **pgvector** trên PostgreSQL. Do tầng nghiệp vụ `AiTourService` của nhóm được thiết kế theo nguyên lý Dependency Inversion, việc thay thế storage engine hoàn toàn không ảnh hưởng đến Controller hay giao diện người dùng."*
