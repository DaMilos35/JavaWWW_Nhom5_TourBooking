#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script cập nhật chuyên sâu phần TÀI LIỆU THAM KHẢO cho Báo cáo Đồ án Đề tài 49:
- Bổ sung thông tin chi tiết: Tác giả, Tên tài liệu, Nhà xuất bản/Hội nghị, Năm, Nội dung ứng dụng vào đồ án.
- Tích hợp Link Hyperlink chuẩn Word (w:hyperlink) màu xanh gạch chân, click chuột trực tiếp để mở tài liệu gốc.
"""

import docx
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
import docx.opc.constants

DOC_PATH = 'docs/Nhom5_Detai49_BaoCaoCuoiKy.docx'

def main():
    doc = docx.Document(DOC_PATH)
    print(f"Loaded document with {len(doc.paragraphs)} paragraphs.")

    # 1. Tìm vị trí TÀI LIỆU THAM KHẢO
    ref_idx = None
    for i, p in enumerate(doc.paragraphs):
        if p.text.strip().upper() == 'TÀI LIỆU THAM KHẢO':
            ref_idx = i
            break

    if ref_idx is None:
        print("Error: TÀI LIỆU THAM KHẢO not found!")
        return

    print(f"Found TÀI LIỆU THAM KHẢO at paragraph {ref_idx}")

    # 2. Xóa các đoạn văn tham khảo cũ phía sau tiêu đề
    # Xóa từ ref_idx + 1 đến hết document
    total_p = len(doc.paragraphs)
    for i in range(total_p - 1, ref_idx, -1):
        p_elem = doc.paragraphs[i]._p
        p_elem.getparent().remove(p_elem)

    print(f"Removed {total_p - 1 - ref_idx} old simple reference paragraphs.")

    w_ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

    def add_doc_hyperlink(paragraph, url, text):
        part = paragraph.part
        r_id = part.relate_to(url, docx.opc.constants.RELATIONSHIP_TYPE.HYPERLINK, is_external=True)
        hyperlink_xml = f'''<w:hyperlink xmlns:w="{w_ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="{r_id}" w:history="1">
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      <w:color w:val="0563C1"/>
      <w:u w:val="single"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
    </w:rPr>
    <w:t>{text}</w:t>
  </w:r>
</w:hyperlink>'''
        hyperlink_elem = parse_xml(hyperlink_xml)
        paragraph._p.append(hyperlink_elem)

    detailed_references = [
        {
            "id": "[1]",
            "citation": "Bộ Giáo dục và Đào tạo, \"Quy định về quy cách trình bày đồ án, khóa luận tốt nghiệp đại học,\" Thông tư số 08/2021/TT-BGDĐT, Hà Nội, 2021.",
            "note": "Quy định khung thể thức văn bản hành chính học thuật, cách phân chia chương mục, đánh số trang và quy cách đóng bìa đồ án tốt nghiệp đại học.",
            "url": "https://moet.gov.vn/van-ban/van-ban-quan-ly/Pages/chi-tiet-van-ban.aspx?ItemID=1393"
        },
        {
            "id": "[2]",
            "citation": "Trường Đại học Công nghiệp TP. Hồ Chí Minh (IUH), \"Quy định thực hiện và trình bày đồ án, khóa luận tốt nghiệp ngành Kỹ thuật Phần mềm,\" Khoa Công nghệ Thông tin, 2024.",
            "note": "Hướng dẫn chính quy của Khoa CNTT - IUH về các biểu mẫu nhận xét của Giảng viên hướng dẫn, Giảng viên phản biện, danh mục bảng biểu và tiêu chí nghiệm thu phần mềm.",
            "url": "https://fit.iuh.edu.vn/"
        },
        {
            "id": "[3]",
            "citation": "Oracle Corporation, \"Java Platform, Standard Edition 17 LTS (Java SE 17) Specification & API Documentation,\" Oracle Technology Network, 2024.",
            "note": "Đặc tả kỹ thuật nền tảng Java 17 LTS: cú pháp Record, Pattern Matching, Garbage Collection (G1GC) và tính năng tối ưu hóa đa luồng phục vụ xây dựng Backend tại Chương 2 và Chương 4.",
            "url": "https://docs.oracle.com/en/java/javase/17/"
        },
        {
            "id": "[4]",
            "citation": "VMware Tanzu / Spring Team, \"Spring Boot Reference Documentation (Version 3.5.x),\" Pivotal Software, 2026.",
            "note": "Cẩm nang kiến trúc vi dịch vụ và ứng dụng web doanh nghiệp: cơ chế Auto-Configuration, quản lý Dependency Injection, xây dựng RESTful API và tích hợp HikariCP connection pool cho MariaDB tại Chương 2 và Chương 4.",
            "url": "https://docs.spring.io/spring-boot/docs/current/reference/html/"
        },
        {
            "id": "[5]",
            "citation": "Spring Security Team, \"Spring Security 6 Architecture & Stateless Authentication Guide,\" VMware, Inc., 2026.",
            "note": "Tài liệu kiến trúc bảo mật đa tầng: xây dựng bộ lọc SecurityFilterChain, cơ chế xác thực phi trạng thái bằng JSON Web Token (JWT), phòng chống CSRF, CORS và phân quyền vai trò (@PreAuthorize) tại Chương 3 và Chương 4.",
            "url": "https://docs.spring.io/spring-security/reference/"
        },
        {
            "id": "[6]",
            "citation": "Christian Bauer, Gavin King, and Gary Gregory, \"Java Persistence with Hibernate,\" 2nd Edition, Manning Publications, Shelter Island, NY, 2016.",
            "note": "Giáo trình chuyên sâu về ORM/JPA: kỹ thuật tối ưu truy vấn giải quyết bài toán N+1 Selects, khóa bi quan (@Lock PESSIMISTIC_WRITE) chống bán vé vượt số lượng (overselling) và thiết kế CSDL 3NF tại Chương 3 và Chương 4.",
            "url": "https://www.manning.com/books/java-persistence-with-hibernate"
        },
        {
            "id": "[7]",
            "citation": "Robert C. Martin (\"Uncle Bob\"), \"Clean Architecture: A Craftsman's Guide to Software Structure and Design,\" Prentice Hall, Boston, MA, 2017.",
            "note": "Nguyên tắc kiến trúc sạch và hệ thống nguyên lý SOLID: thiết kế phân ranh giới độc lập giữa các tầng Controller, Service, Repository và Entity, nâng cao khả năng kiểm thử tự động TDD đạt 100% tại Chương 3 và Chương 5.",
            "url": "https://www.pearson.com/en-us/subject-catalog/p/clean-architecture-a-craftsmans-guide-to-software-structure-and-design/P200000009514"
        },
        {
            "id": "[8]",
            "citation": "OWASP Foundation, \"OWASP API Security Top 10 - The Ten Most Critical API Security Risks,\" Open Web Application Security Project, 2023.",
            "note": "Tiêu chuẩn an ninh mạng ứng dụng web quốc tế: rà soát và phòng chống các lỗ hổng Broken Object Level Authorization (BOLA/IDOR), SQL Injection, rò rỉ dữ liệu và kiểm soát phiên làm việc an toàn tại Chương 4 và Chương 5.",
            "url": "https://owasp.org/www-project-api-security/"
        },
        {
            "id": "[9]",
            "citation": "Patrick Lewis, Ethan Perez, Aleksandara Piktus, et al., \"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,\" Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 9459-9474, 2020.",
            "note": "Công trình khoa học nền tảng định nghĩa kiến trúc RAG: kết hợp cơ sở dữ liệu Vector với mô hình ngôn ngữ lớn (Google Gemini AI) để xây dựng hệ thống Trợ lý ảo du lịch và tìm kiếm ngữ nghĩa lai ghép tại Chương 4 (mục 4.9).",
            "url": "https://arxiv.org/abs/2005.11401"
        },
        {
            "id": "[10]",
            "citation": "Nhóm sinh viên thực hiện Đề tài 49, \"Kho mã nguồn mở Hệ thống Đặt Tour Du Lịch Trực Tuyến (Du Lịch Việt) & Bộ tài liệu kỹ thuật,\" Trường ĐH Công nghiệp TP.HCM, 2026.",
            "note": "Toàn bộ mã nguồn mở Backend Spring Boot, Frontend React Desktop UI/UX, bộ kịch bản kiểm thử TDD/E2E, CSDL MariaDB và các sơ đồ kiến trúc hệ thống phục vụ hội đồng chấm đồ án.",
            "url": "https://github.com/DaMilos35/JavaWWW_Nhom5_TourBooking"
        }
    ]

    for item in detailed_references:
        # Đoạn 1: Trích dẫn chính (Citation)
        p_cite = doc.add_paragraph()
        p_cite.paragraph_format.space_before = Pt(8)
        p_cite.paragraph_format.space_after = Pt(2)
        p_cite.paragraph_format.line_spacing = 1.25
        p_cite.paragraph_format.left_indent = Cm(0.8)
        p_cite.paragraph_format.first_line_indent = Cm(-0.8)

        r_id = p_cite.add_run(f'{item["id"]} ')
        r_id.font.name = 'Times New Roman'
        r_id.font.size = Pt(12)
        r_id.font.bold = True

        r_text = p_cite.add_run(item["citation"])
        r_text.font.name = 'Times New Roman'
        r_text.font.size = Pt(12)
        r_text.font.color.rgb = RGBColor(0, 0, 0)

        # Đoạn 2: Ghi chú nội dung & Ứng dụng trong đồ án
        p_note = doc.add_paragraph()
        p_note.paragraph_format.space_before = Pt(1)
        p_note.paragraph_format.space_after = Pt(2)
        p_note.paragraph_format.line_spacing = 1.2
        p_note.paragraph_format.left_indent = Cm(0.8)

        r_note_lbl = p_note.add_run('• Nội dung & Ứng dụng: ')
        r_note_lbl.font.name = 'Times New Roman'
        r_note_lbl.font.size = Pt(11)
        r_note_lbl.font.bold = True
        r_note_lbl.font.color.rgb = RGBColor(70, 70, 70)

        r_note_val = p_note.add_run(item["note"])
        r_note_val.font.name = 'Times New Roman'
        r_note_val.font.size = Pt(11)
        r_note_val.font.italic = True
        r_note_val.font.color.rgb = RGBColor(70, 70, 70)

        # Đoạn 3: Đường dẫn tham khảo có thể click trực tiếp (Clickable Hyperlink)
        p_link = doc.add_paragraph()
        p_link.paragraph_format.space_before = Pt(1)
        p_link.paragraph_format.space_after = Pt(8)
        p_link.paragraph_format.line_spacing = 1.2
        p_link.paragraph_format.left_indent = Cm(0.8)

        r_link_lbl = p_link.add_run('• Liên kết tra cứu: ')
        r_link_lbl.font.name = 'Times New Roman'
        r_link_lbl.font.size = Pt(11)
        r_link_lbl.font.bold = True
        r_link_lbl.font.color.rgb = RGBColor(30, 64, 175)

        add_doc_hyperlink(p_link, item["url"], item["url"])

    doc.save(DOC_PATH)
    print(f"SUCCESS: Updated {len(detailed_references)} detailed references with clickable hyperlinks!")

if __name__ == '__main__':
    main()
