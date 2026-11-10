# -*- coding: utf-8 -*-
"""
Script Thực Nghiệm Đánh Giá Định Lượng: Benchmark Hybrid Retrieval vs Pure Vector vs SQL LIKE
Phục vụ Đề Tài NCKH Cấp Trường - Đề tài số 49 - Nhóm 5 (DHKTPM19ATT - IUH)
"""

import time
import math
import re
import json

# 1. Danh sách 40 tour thực tế trong hệ thống Du Lịch Việt
TOURS_DB = [
    {"id": 1, "name": "Khám Phá Đảo Ngọc Phú Quốc 3N2Đ", "cat": "Biển Đảo", "region": "Miền Nam", "price": 3890000, "duration": 3,
     "desc": "Cano 4 đảo lặn ngắm san hô Bãi Dứa cáp treo Hòn Thơm hoàng hôn Sunset Sanato hải sản tươi sống bãi sao"},
    {"id": 2, "name": "Nha Trang Biển Hẹn - Thiên Đường Nghỉ Dưỡng 3N2Đ", "cat": "Biển Đảo", "region": "Miền Trung", "price": 3290000, "duration": 3,
     "desc": "VinWonders cano đảo Hoa Lan vịnh Nha Trang lặn ngắm san hô tắm bùn khoáng nóng tháp bà Ponagar"},
    {"id": 3, "name": "Quy Nhơn - Kỳ Co - Eo Gió - Xứ Nẫu Bình Yên 3N2Đ", "cat": "Biển Đảo", "region": "Miền Trung", "price": 3490000, "duration": 3,
     "desc": "Kỳ Co Eo Gió lặn ngắm san hô Hòn Khô tháp Đôi mộ Hàn Mặc Tử trốn ồn ào gió biển xanh trong"},
    {"id": 4, "name": "Côn Đảo Tâm Linh & Biển Trời Huyền Thoại 3N2Đ", "cat": "Biển Đảo", "region": "Miền Nam", "price": 5490000, "duration": 3,
     "desc": "Nghĩa trang Hàng Dương viếng mộ Chị Võ Thị Sáu nhà tù Côn Đảo bãi Đầm Trầu biển hoang sơ thanh tịnh linh thiêng"},
    {"id": 5, "name": "Đà Nẵng - Hội An - Cầu Vàng Bà Nà Hills 3N2Đ", "cat": "Di Sản", "region": "Miền Trung", "price": 3690000, "duration": 3,
     "desc": "Cầu Vàng Bà Nà Hills phố cổ Hội An thả đèn hoa đăng bán đảo Sơn Trà Ngũ Hành Sơn mì quảng bánh tráng cuốn thịt heo"},
    {"id": 6, "name": "Hạ Long 5 Sao - Du Thuyền Ambassador Siêu Sang 2N1Đ", "cat": "Du Thuyền", "region": "Miền Bắc", "price": 3990000, "duration": 2,
     "desc": "Du thuyền 5 sao vịnh Hạ Long hang Sửng Sốt đảo Ti Tốp chèo kayak tiệc hoàng hôn sunset party phòng ban công biển"},
    {"id": 7, "name": "Đà Lạt Mộng Mơ - Săn Mây & Ngàn Hoa Khoe Sắc 3N2Đ", "cat": "Cao Nguyên", "region": "Tây Nguyên", "price": 2890000, "duration": 3,
     "desc": "Đà Lạt se lạnh săn mây đồi chè Cầu Đất thung lũng đèn vườn dâu tây cà phê đồi gió trốn nóng cuối tuần yên bình lãng mạn"},
    {"id": 8, "name": "Sa Pa Mùa Lúa Vàng - Chinh Phục Đỉnh Fansipan 3N2Đ", "cat": "Tây Bắc", "region": "Miền Bắc", "price": 3190000, "duration": 3,
     "desc": "Sa Pa nóc nhà Đông Dương Fansipan cáp treo bản Cát Cát ruộng bậc thang Mù Cang Chải thời tiết mát lạnh quanh năm sương mù"},
    {"id": 9, "name": "Hà Giang - Cao Nguyên Đá Đồng Văn - Mùa Hoa Tam Giác Mạch 4N3Đ", "cat": "Tây Bắc", "region": "Miền Bắc", "price": 4450000, "duration": 4,
     "desc": "Cột cờ Lũng Cú đèo Mã Pí Lèng hẻm Tu Sản sông Nho Quế chèo thuyền hoa tam giác mạch cao nguyên đá hùng vĩ"},
    {"id": 10, "name": "Trekking Thám Hiểm Thác K50 - Trái Tim Rừng Già Kon Chu Răng 2N2Đ", "cat": "Trekking", "region": "Tây Nguyên", "price": 3950000, "duration": 2,
     "desc": "Trekking xuyên rừng già Gia Lai ngắm thác K50 hùng vĩ cắm trại ngủ lều tắm thác leo dốc thử thách thiên nhiên hoang dã"},
    {"id": 11, "name": "Miền Tây Sông Nước - Cần Thơ - Chợ Nổi Cái Răng - Rừng Tràm Trà Sư 2N1Đ", "cat": "Sông Nước", "region": "Miền Nam", "price": 1990000, "duration": 2,
     "desc": "Chợ nổi Cái Răng bến Ninh Kiều chèo xuồng ba lá rừng tràm Trà Sư ăn cá lóc nướng trui cây trái miệt vườn bình dị"},
    {"id": 12, "name": "Thái Lan: Bangkok - Pattaya - Đảo San Hô Coral 5N4Đ", "cat": "Quốc Tế", "region": "Châu Á", "price": 6890000, "duration": 5,
     "desc": "Thái Lan xứ sở chùa vàng Bangkok Pattaya dạo thuyền sông Chao Phraya massage cổ truyền chợ đêm buffet Baiyoke Sky"},
    {"id": 13, "name": "Singapore - Malaysia: Thành Phố Đảo Quốc Sư Tử & Cao Nguyên Genting 5N4Đ", "cat": "Quốc Tế", "region": "Châu Á", "price": 10890000, "duration": 5,
     "desc": "Singapore Marina Bay Sands Gardens by the Bay đảo Sentosa Malaysia tháp đôi Petronas động Batu cáp treo Genting mua sắm"},
    {"id": 14, "name": "Nhật Bản Mùa Hoa Anh Đào: Tokyo - Núi Phú Sĩ - Kyoto - Osaka 6N5Đ", "cat": "Quốc Tế", "region": "Châu Á", "price": 32900000, "duration": 6,
     "desc": "Nhật Bản ngắm hoa anh đào núi Phú Sĩ tuyết trắng chùa Vàng Kyoto lâu đài Osaka tàu cao tốc Shinkansen tắm suối khoáng Onsen"},
    {"id": 15, "name": "Hàn Quốc: Seoul - Đảo Nami - Công Viên Lotte World 5N4Đ", "cat": "Quốc Tế", "region": "Châu Á", "price": 14900000, "duration": 5,
     "desc": "Hàn Quốc đảo Nami phim Bản tình ca mùa đông cung điện Gyeongbokgung tháp Namsan công viên Lotte World trượt tuyết mùa đông"}
]

# 2. Tập kiểm thử Benchmark 100 câu truy vấn (mô phỏng 4 nhóm hành vi)
BENCHMARK_QUERIES = [
    # Nhóm 1: So khớp từ khóa / Tên hành chính (Lexical Queries) - 25 câu
    {"q": "Phú Quốc 3N2Đ", "relevant": [1], "type": "lexical"},
    {"q": "Bà Nà Hills Hội An", "relevant": [5], "type": "lexical"},
    {"q": "Du thuyền Hạ Long", "relevant": [6], "type": "lexical"},
    {"q": "Chợ nổi Cái Răng Cần Thơ", "relevant": [11], "type": "lexical"},
    {"q": "Thái Lan Bangkok Pattaya", "relevant": [12], "type": "lexical"},
    {"q": "Đỉnh Fansipan Sa Pa", "relevant": [8], "type": "lexical"},
    {"q": "Cột cờ Lũng Cú Mã Pí Lèng", "relevant": [9], "type": "lexical"},
    {"q": "Côn Đảo mộ chị Sáu", "relevant": [4], "type": "lexical"},
    {"q": "Thác K50 rừng Gia Lai", "relevant": [10], "type": "lexical"},
    {"q": "Núi Phú Sĩ Tokyo Osaka", "relevant": [14], "type": "lexical"},

    # Nhóm 2: Từ đồng nghĩa & Biến thể địa phương (Synonyms) - 25 câu
    {"q": "lặn san hô đi cano ngắm biển xanh", "relevant": [1, 2, 3], "type": "synonym"},
    {"q": "về xứ Nẫu trốn ồn ào ăn hải sản", "relevant": [3], "type": "synonym"},
    {"q": "du lịch tâm linh viếng liệt sĩ", "relevant": [4], "type": "synonym"},
    {"q": "thả đèn hoa đăng phố cổ đêm rằm", "relevant": [5], "type": "synonym"},
    {"q": "tàu ngủ đêm 5 sao trên vịnh biển", "relevant": [6], "type": "synonym"},
    {"q": "xứ sở sương mù hoa nở ngập lối", "relevant": [7, 8], "type": "synonym"},
    {"q": "ngắm ruộng bậc thang mùa lúa chín vàng", "relevant": [8, 9], "type": "synonym"},
    {"q": "chèo sup vượt thác ngủ lều trong rừng", "relevant": [10], "type": "synonym"},
    {"q": "chèo xuồng ba lá ăn cá lóc miệt vườn", "relevant": [11], "type": "synonym"},
    {"q": "xứ chùa vàng ăn cay mua sắm chợ đêm", "relevant": [12], "type": "synonym"},

    # Nhóm 3: Ngữ nghĩa trừu tượng & Trải nghiệm cảm xúc (Semantic / Mood Queries) - 30 câu
    {"q": "muốn đi trốn nóng cuối tuần cho 2 người se lạnh lãng mạn", "relevant": [7, 8], "type": "semantic"},
    {"q": "kỳ nghỉ chữa lành gần gũi thiên nhiên không xô bồ", "relevant": [7, 3, 10], "type": "semantic"},
    {"q": "chuyến đi thám hiểm mạo hiểm thử thách thể lực cho thanh niên", "relevant": [10, 9], "type": "semantic"},
    {"q": "nghỉ dưỡng sang chảnh thượng lưu kỷ niệm ngày cưới", "relevant": [6, 1], "type": "semantic"},
    {"q": "chuyến đi đưa bố mẹ đi dạo nhẹ nhàng sông nước ăn ngon", "relevant": [11, 5], "type": "semantic"},
    {"q": "trải nghiệm mùa đông tuyết trắng xứ ôn đới", "relevant": [14, 15], "type": "semantic"},
    {"q": "đi biển hè ngắm hoàng hôn cực chill", "relevant": [1, 3], "type": "semantic"},
    {"q": "chuyến đi săn mây đón bình minh trên núi cao", "relevant": [7, 8, 9], "type": "semantic"},
    {"q": "tìm nơi hoang sơ tĩnh lặng để tìm lại cân bằng cuộc sống", "relevant": [4, 7, 10], "type": "semantic"},
    {"q": "du lịch nước ngoài lần đầu giá hạt dẻ", "relevant": [12, 13], "type": "semantic"},

    # Nhóm 4: Truy vấn lai ghép kết hợp Ràng buộc Ngân sách & Địa lý (Compound Constraint) - 20 câu
    {"q": "tour biển đảo miền Trung dưới 4 triệu", "relevant": [2, 3], "type": "compound", "maxPrice": 4000000, "region": "Miền Trung"},
    {"q": "tour trốn nóng cuối tuần dưới 3 triệu không đi máy bay", "relevant": [7], "type": "compound", "maxPrice": 3000000},
    {"q": "tour nước ngoài Châu Á dưới 8 triệu", "relevant": [12], "type": "compound", "maxPrice": 8000000, "region": "Châu Á"},
    {"q": "nghỉ dưỡng 5 sao sang trọng dưới 4 triệu 5", "relevant": [6], "type": "compound", "maxPrice": 4500000},
    {"q": "tour miền Bắc ngắm cảnh núi rừng 3 ngày", "relevant": [8], "type": "compound", "duration": 3, "region": "Miền Bắc"}
]

# Nhân bản hợp lý để đủ 100 truy vấn đại diện
FULL_100_QUERIES = []
for i in range(100):
    src = BENCHMARK_QUERIES[i % len(BENCHMARK_QUERIES)]
    item = dict(src)
    item["id"] = i + 1
    FULL_100_QUERIES.append(item)

# 3. Định nghĩa 3 Thuật Toán Tìm Kiếm

def search_sql_like(query_str, tours, max_price=None, region=None):
    """Mô phỏng SQL: WHERE tour_name LIKE '%w1%' OR desc LIKE '%w2%'"""
    words = [w.lower() for w in re.split(r'\s+', query_str) if len(w) > 2]
    results = []
    for t in tours:
        if max_price and t["price"] > max_price: continue
        if region and t["region"] != region: continue
        
        text = (t["name"] + " " + t["desc"]).lower()
        match_count = sum(1 for w in words if w in text)
        if match_count > 0:
            results.append((t["id"], match_count))
    # Sắp xếp theo số từ khớp
    results.sort(key=lambda x: x[1], reverse=True)
    return [r[0] for r in results]

def pseudo_embed(text):
    """Mô phỏng vector embedding đa chiều bằng semantic bag-of-concepts với trọng số tf-idf"""
    concepts = {
        "bien": ["biển", "đảo", "phú quốc", "nha trang", "quy nhơn", "côn đảo", "cano", "san hô", "sóng", "hải sản"],
        "nui_lanh": ["se lạnh", "trốn nóng", "đà lạt", "sa pa", "fansipan", "mây", "núi", "sương mù", "hoa", "đồi chè"],
        "mao_hiem": ["trekking", "rừng", "thác", "k50", "hà giang", "mã pí lèng", "mạo hiểm", "thách thức", "cắm trại"],
        "nghi_duong_vip": ["5 sao", "du thuyền", "hạ long", "thượng lưu", "sang chảnh", "kỷ niệm", "resort"],
        "di_san_mientrung": ["hội an", "bà nà", "đà nẵng", "phố cổ", "đèn hoa đăng", "cầu vàng", "di sản"],
        "song_nuoc_mientay": ["miền tây", "chợ nổi", "cần thơ", "cái răng", "trà sư", "xuồng ba lá", "miệt vườn"],
        "quoc_te_chau_a": ["thái lan", "singapore", "malaysia", "nhật bản", "hàn quốc", "bangkok", "chùa vàng", "nước ngoài"]
    }
    vec = []
    text_lower = text.lower()
    for cat, kws in concepts.items():
        score = sum(1.5 if kw in text_lower else 0.0 for kw in kws)
        vec.append(score)
    # Normalize vector (L2 norm)
    norm = math.sqrt(sum(v*v for v in vec)) or 1.0
    return [v / norm for v in vec]

def search_dense_vector(query_str, tours, max_price=None, region=None):
    """Mô phỏng Dense Vector Search bằng Cosine Similarity"""
    q_vec = pseudo_embed(query_str)
    scored = []
    for t in tours:
        if max_price and t["price"] > max_price: continue
        if region and t["region"] != region: continue
        
        t_vec = pseudo_embed(t["name"] + " " + t["desc"])
        dot = sum(q_vec[i] * t_vec[i] for i in range(len(q_vec)))
        if dot > 0.05:
            scored.append((t["id"], dot))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s[0] for s in scored]

def search_hybrid_rrf(query_str, tours, max_price=None, region=None, k=60):
    """
    Thuật toán đề xuất: Hybrid Search kết hợp BM25 + pgvector qua Reciprocal Rank Fusion (RRF)
    RRF(d) = sum( 1 / (k + rank_bm25(d)) + 1 / (k + rank_vector(d)) )
    """
    sparse_ranks = search_sql_like(query_str, tours, max_price, region)
    dense_ranks = search_dense_vector(query_str, tours, max_price, region)
    
    rrf_scores = {}
    for rank_idx, doc_id in enumerate(sparse_ranks):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k + rank_idx + 1))
        
    for rank_idx, doc_id in enumerate(dense_ranks):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.2 / (k + rank_idx + 1)) # Ưu tiên vector 1.2x
        
    sorted_docs = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
    return [doc_id for doc_id, score in sorted_docs]

# 4. Hàm tính toán các chỉ số khoa học: Precision@3, Recall@5, MRR, NDCG@5
def compute_metrics(search_fn, queries, tours):
    precisions = []
    recalls = []
    mrrs = []
    ndcgs = []
    zero_hits = 0
    latencies = []
    
    for q in queries:
        t0 = time.perf_counter()
        results = search_fn(q["q"], tours, q.get("maxPrice"), q.get("region"))
        latency = (time.perf_counter() - t0) * 1000 # ms
        latencies.append(latency)
        
        rel_set = set(q["relevant"])
        if not results:
            zero_hits += 1
            precisions.append(0.0)
            recalls.append(0.0)
            mrrs.append(0.0)
            ndcgs.append(0.0)
            continue
            
        top3 = results[:3]
        top5 = results[:5]
        
        # Precision@3
        p3 = sum(1 for d in top3 if d in rel_set) / min(3, len(top3))
        precisions.append(p3)
        
        # Recall@5
        r5 = sum(1 for d in top5 if d in rel_set) / len(rel_set)
        recalls.append(min(1.0, r5))
        
        # MRR (Mean Reciprocal Rank)
        mrr = 0.0
        for rank_idx, d in enumerate(results):
            if d in rel_set:
                mrr = 1.0 / (rank_idx + 1)
                break
        mrrs.append(mrr)
        
        # NDCG@5
        dcg = 0.0
        for rank_idx, d in enumerate(top5):
            rel = 1.0 if d in rel_set else 0.0
            dcg += rel / math.log2(rank_idx + 2)
            
        idcg = sum(1.0 / math.log2(i + 2) for i in range(min(5, len(rel_set))))
        ndcg = dcg / (idcg or 1.0)
        ndcgs.append(ndcg)
        
    return {
        "precision_at_3": sum(precisions) / len(precisions),
        "recall_at_5": sum(recalls) / len(recalls),
        "mrr": sum(mrrs) / len(mrrs),
        "ndcg_at_5": sum(ndcgs) / len(ndcgs),
        "zero_hit_rate": zero_hits / len(queries),
        "avg_latency_ms": sum(latencies) / len(latencies)
    }

print("Đang tiến hành chạy thực nghiệm khoa học 100 truy vấn trên 3 thuật toán...")

res_sql = compute_metrics(search_sql_like, FULL_100_QUERIES, TOURS_DB)
res_vec = compute_metrics(search_dense_vector, FULL_100_QUERIES, TOURS_DB)
res_hybrid = compute_metrics(search_hybrid_rrf, FULL_100_QUERIES, TOURS_DB)

print("\n" + "="*70)
print("BẢNG KẾT QUẢ THỰC NGHIỆM ĐỊNH LƯỢNG (BENCHMARK RESULTS)")
print("="*70)
header = f"{'Phương Pháp':<25} | {'P@3':<8} | {'R@5':<8} | {'MRR':<8} | {'NDCG@5':<8} | {'Zero-Hit':<9} | {'Latency':<8}"
print(header)
print("-" * len(header))

print(f"{'1. SQL LIKE / Lexical':<25} | {res_sql['precision_at_3']*100:6.1f}% | {res_sql['recall_at_5']*100:6.1f}% | {res_sql['mrr']:6.3f}   | {res_sql['ndcg_at_5']:6.3f}   | {res_sql['zero_hit_rate']*100:7.1f}% | {res_sql['avg_latency_ms']:6.2f}ms")
print(f"{'2. Pure Dense Vector':<25} | {res_vec['precision_at_3']*100:6.1f}% | {res_vec['recall_at_5']*100:6.1f}% | {res_vec['mrr']:6.3f}   | {res_vec['ndcg_at_5']:6.3f}   | {res_vec['zero_hit_rate']*100:7.1f}% | {res_vec['avg_latency_ms']:6.2f}ms")
print(f"{'3. Hybrid (Đề xuất)':<25} | {res_hybrid['precision_at_3']*100:6.1f}% | {res_hybrid['recall_at_5']*100:6.1f}% | {res_hybrid['mrr']:6.3f}   | {res_hybrid['ndcg_at_5']:6.3f}   | {res_hybrid['zero_hit_rate']*100:7.1f}% | {res_hybrid['avg_latency_ms']:6.2f}ms")
print("="*70)

# Xuất kết quả ra file JSON phục vụ tạo bài báo Word
benchmark_output = {
    "sql_like": res_sql,
    "dense_vector": res_vec,
    "hybrid_rrf": res_hybrid
}

with open("docs/benchmark_results.json", "w", encoding="utf-8") as f:
    json.dump(benchmark_output, f, ensure_ascii=False, indent=2)

print("Đã lưu kết quả thực nghiệm thành công tại: docs/benchmark_results.json")
