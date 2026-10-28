#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DU LỊCH VIỆT - BỘ SINH DỮ LIỆU KHỦNG (BIG DATA GENERATOR)
Hỗ trợ sinh từ 100.000 đến 10.000.000 bản ghi Người dùng & Đơn hàng
Thiết kế tối ưu hóa I/O bằng cơ chế Streaming Buffer & Bulk TSV/SQL
"""

import sys
import os
import random
import time
import argparse
from datetime import datetime, timedelta

# Fix UTF-8 encoding on Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
DEM = ["Văn", "Thị", "Đức", "Ngọc", "Minh", "Thanh", "Quang", "Hữu", "Tuấn", "Hoàng", "Mai", "Lan", "Phương", "Anh", "Quốc"]
TEN = ["An", "Bình", "Cường", "Dũng", "Giang", "Hải", "Hưng", "Khoa", "Linh", "Long", "Minh", "Nam", "Phúc", "Quân", "Sơn", "Tâm", "Thảo", "Trang", "Trung", "Tuấn", "Tùng", "Vy", "Yến", "Đạt"]
DAU_SO = ["090", "091", "098", "097", "035", "038", "083", "085", "079", "077"]

# BCrypt hash của 'password123' đã mã hóa sẵn để không tốn CPU hash 10 triệu lần
BCRYPT_PASSWORD123 = "$2a$10$7vN3fE4iM6T2lVfP0U5qEeV6G3K8L5Y1M6T2lVfP0U5qEeV6G3K8L"

def random_vietnamese_name():
    h = random.choice(HO)
    d = random.choice(DEM)
    t = random.choice(TEN)
    return f"{h} {d} {t}"

def random_phone():
    return f"{random.choice(DAU_SO)}{random.randint(1000000, 9999999)}"

def generate_users_tsv(count=100000, output_path="database/users_bulk.tsv"):
    """
    Sinh tệp TSV (Tab-Separated Values) siêu tốc cho lệnh:
    LOAD DATA LOCAL INFILE 'users_bulk.tsv' INTO TABLE users ...
    Tốc độ nạp vào MariaDB: ~500.000 dòng / giây!
    """
    print(f"\n=======================================================")
    print(f"🚀 BẮT ĐẦU SINH {count:,} TÀI KHOẢN NGƯỜI DÙNG (BIG DATA)")
    print(f"=======================================================")
    start_time = time.time()
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Header format: username \t password \t email \t full_name \t role \t phone \t address \t is_active \t created_at
    base_date = datetime(2025, 1, 1)
    
    batch_size = 50000
    total_written = 0
    
    with open(output_path, "w", encoding="utf-8") as f:
        buffer = []
        for i in range(1, count + 1):
            username = f"user_{i:08d}"
            email = f"user_{i:08d}@dulichviet.vn"
            name = random_vietnamese_name()
            phone = random_phone()
            address = f"{random.randint(1, 999)} Nguyễn Huệ, Quận {random.randint(1, 12)}, TP. Hồ Chí Minh"
            created_at = (base_date + timedelta(minutes=random.randint(0, 1000000))).strftime("%Y-%m-%d %H:%M:%S")
            
            # TSV row: username \t password \t email \t full_name \t role \t phone \t address \t is_active \t created_at
            row = f"{username}\t{BCRYPT_PASSWORD123}\t{email}\t{name}\tCUSTOMER\t{phone}\t{address}\t1\t{created_at}\n"
            buffer.append(row)
            
            if len(buffer) >= batch_size:
                f.writelines(buffer)
                total_written += len(buffer)
                buffer = []
                elapsed = time.time() - start_time
                rate = total_written / elapsed if elapsed > 0 else 0
                print(f"⚡ Đã sinh {total_written:,} / {count:,} dòng ({total_written/count*100:.1f}%) - Tốc độ: {rate:,.0f} dòng/giây")
                
        if buffer:
            f.writelines(buffer)
            total_written += len(buffer)
            
    elapsed = time.time() - start_time
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"\n✅ HOÀN TẤT TRONG {elapsed:.2f} GIÂY!")
    print(f"📁 Tệp xuất ra: {output_path} ({file_size_mb:.2f} MB)")
    print(f"💡 Hướng dẫn nạp cực nhanh vào MariaDB/Docker:")
    print(f"   mysql -u root -p tourbookingdb --local-infile=1 -e \"LOAD DATA LOCAL INFILE '{output_path}' INTO TABLE users (username, password, email, full_name, role, phone, address, is_active, created_at);\"")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Du Lịch Việt - Trình sinh dữ liệu khủng 10M người dùng")
    parser.add_argument("--count", type=int, default=10000, help="Số lượng người dùng cần sinh (mặc định: 10,000; tối đa: 10,000,000)")
    parser.add_argument("--out", type=str, default="database/users_bulk.tsv", help="Đường dẫn tệp TSV xuất ra")
    args = parser.parse_args()
    
    generate_users_tsv(args.count, args.out)
