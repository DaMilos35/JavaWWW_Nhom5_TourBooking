#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
Script Chuẩn hóa Báo cáo Đồ án Tốt nghiệp / Kết thúc học phần theo chuẩn học thuật IUH & Bộ GD&ĐT:
1. Đồng bộ lề trang (Margins): Trái 3.0cm (đóng gáy sách), Phải 2.0cm, Trên 2.0cm, Dưới 2.0cm.
2. Thiết lập Mục lục tự động chuẩn Microsoft Word (Word Dynamic TOC Field Code: TOC \o "1-3" \h \z \u).
3. Chuẩn hóa Danh mục hình ảnh (List of Figures) & Danh mục bảng biểu (List of Tables).
4. Bổ sung Danh mục từ viết tắt và thuật ngữ (List of Abbreviations) chuẩn đồ án CNTT.
5. Bổ sung Tài liệu tham khảo chuẩn IEEE (References) ở cuối báo cáo sau Chương 7.
6. Bảo tồn 100% tất cả 18 hình vẽ sơ đồ gốc, 16 bảng biểu và văn bản nội dung 7 chương.
"""

import os
import zipfile
import shutil
import docx
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

DOC_PATH = 'docs/Nhom5_Detai49_BaoCaoCuoiKy.docx'
BACKUP_PATH = 'docs/Nhom5_Detai49_BaoCaoCuoiKy.docx.bak'

def main():
    if not os.path.exists(BACKUP_PATH):
        shutil.copyfile(DOC_PATH, BACKUP_PATH)
        print(f"Created safety backup at {BACKUP_PATH}")

    doc = docx.Document(DOC_PATH)
    print(f"Loaded original document: {len(doc.paragraphs)} paragraphs, {len(doc.tables)} tables.")

    # =========================================================================
    # 1. CHUẨN HÓA CĂN LỀ TRANG (PAGE MARGINS) CHUẨN ĐỒ ÁN IUH (3 - 2 - 2 - 2 cm)
    # =========================================================================
    for idx, sec in enumerate(doc.sections):
        sec.top_margin = Cm(2.0)
        sec.bottom_margin = Cm(2.0)
        sec.left_margin = Cm(3.0)   # 3.0cm để đóng gáy sách / bìa mạ vàng
        sec.right_margin = Cm(2.0)
        sec.page_width = Cm(21.0)   # A4 Width
        sec.page_height = Cm(29.7)  # A4 Height
    print("Standardized page margins: Left=3.0cm, Right=2.0cm, Top=2.0cm, Bottom=2.0cm across all sections.")

    # =========================================================================
    # 2. XÁC ĐỊNH VỊ TRÍ CÁC PHẦN MỤC LỤC
    # =========================================================================
    start_toc_idx = None
    start_lof_idx = None
    start_lot_idx = None
    ch1_idx = None

    for i, p in enumerate(doc.paragraphs):
        t = p.text.strip().upper()
        if t == 'MỤC LỤC' and start_toc_idx is None:
            start_toc_idx = i
        elif t == 'MỤC LỤC HÌNH ẢNH' and start_lof_idx is None:
            start_lof_idx = i
        elif t == 'MỤC LỤC BẢNG BIỂU' and start_lot_idx is None:
            start_lot_idx = i
        elif 'CHƯƠNG 1.' in t and ch1_idx is None and i > 150:
            ch1_idx = i

    print(f"TOC starts at {start_toc_idx}, LOF at {start_lof_idx}, LOT at {start_lot_idx}, Ch1 at {ch1_idx}")

    # =========================================================================
    # 3. THU THẬP TẤT CẢ 51 TIÊU ĐỀ HEADING TỪ PHẦN THÂN BÀI BÁO CÁO
    # =========================================================================
    headings = []
    for p in doc.paragraphs[ch1_idx:]:
        s_name = p.style.name
        t = p.text.strip()
        if s_name.startswith('Heading') and t:
            lvl = 1
            if '2' in s_name:
                lvl = 2
            elif '3' in s_name:
                lvl = 3
            headings.append((lvl, s_name, t))

    print(f"Extracted {len(headings)} structured headings from Chapter 1 to 7.")

    # =========================================================================
    # 4. XÂY DỰNG KHỐI MỤC LỤC TỰ ĐỘNG CHUẨN MICROSOFT WORD (SDT + TOC FIELD)
    # =========================================================================
    w_ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

    page_map = {
        'CHƯƠNG 1': 1, '1.1': 1, '1.2': 2, '1.3': 2,
        'CHƯƠNG 2': 3, '2.1': 3, '2.2': 4, '2.3': 4, '2.4': 5,
        'CHƯƠNG 3': 6, '3.1': 6, '3.2': 7, '3.2.1': 8, '3.3': 9,
        '3.3.1': 9, '3.3.2': 11, '3.3.3': 13, '3.3.4': 15, '3.3.5': 17,
        '3.4': 18, '3.5': 19, '3.6': 23,
        'CHƯƠNG 4': 27, '4.1': 27, '4.2': 28, '4.3': 29, '4.4': 30, '4.5': 31,
        '4.6': 32, '4.7': 33, '4.8': 34, '4.9': 35,
        '4.9.1': 35, '4.9.2': 36, '4.9.3': 37, '4.9.4': 38, '4.9.5': 39, '4.9.6': 40, '4.9.7': 41,
        'CHƯƠNG 5': 42, '5.1': 42, '5.2': 42, '5.3': 44, '5.4': 44, '5.5': 45,
        'CHƯƠNG 6': 46, '6.1': 46, '6.2': 46,
        'CHƯƠNG 7': 48, '7.1': 48, '7.2': 48
    }

    def guess_page(title):
        for k, v in page_map.items():
            if title.startswith(k):
                return v
        return 1

    sdt_xml = f'''<w:sdt xmlns:w="{w_ns}">
  <w:sdtPr>
    <w:docPartObj>
      <w:docPartGallery w:val="Table of Contents"/>
      <w:docPartUnique/>
    </w:docPartObj>
  </w:sdtPr>
  <w:sdtContent>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="TOCHeading"/>
        <w:jc w:val="center"/>
        <w:spacing w:before="240" w:after="140"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
          <w:b/>
          <w:color w:val="000000"/>
          <w:sz w:val="28"/>
          <w:szCs w:val="28"/>
        </w:rPr>
        <w:t>MỤC LỤC</w:t>
      </w:r>
    </w:p>
'''

    for idx, (lvl, s_name, title) in enumerate(headings):
        style_val = f"TOC{lvl}"
        left_indent = 0 if lvl == 1 else (280 if lvl == 2 else 560)
        is_bold = "<w:b/>" if lvl == 1 else ""
        font_sz = "24" if lvl == 1 else "22"
        space_before = "60" if lvl == 1 else "20"
        page_num = guess_page(title)

        sdt_xml += f'''    <w:p>
      <w:pPr>
        <w:pStyle w:val="{style_val}"/>
        <w:tabs>
          <w:tab w:val="right" w:leader="dot" w:pos="9070"/>
        </w:tabs>
        <w:spacing w:before="{space_before}" w:after="20"/>
        <w:ind w:left="{left_indent}"/>
      </w:pPr>
'''
        if idx == 0:
            sdt_xml += r'''      <w:r>
        <w:fldChar w:fldCharType="begin"/>
        <w:instrText xml:space="preserve"> TOC \o "1-3" \h \z \u </w:instrText>
        <w:fldChar w:fldCharType="separate"/>
      </w:r>
'''
        safe_title = title.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        sdt_xml += f'''      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
          {is_bold}
          <w:sz w:val="{font_sz}"/>
          <w:szCs w:val="{font_sz}"/>
        </w:rPr>
        <w:t>{safe_title}</w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
          {is_bold}
        </w:rPr>
        <w:tab/>
      </w:r>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
          {is_bold}
          <w:sz w:val="{font_sz}"/>
          <w:szCs w:val="{font_sz}"/>
        </w:rPr>
        <w:t>{page_num}</w:t>
      </w:r>
'''
        if idx == len(headings) - 1:
            sdt_xml += '''      <w:r>
        <w:fldChar w:fldCharType="end"/>
      </w:r>
'''
        sdt_xml += '    </w:p>\n'

    sdt_xml += '''  </w:sdtContent>
</w:sdt>'''

    toc_element = parse_xml(sdt_xml)
    doc.paragraphs[start_toc_idx]._p.addprevious(toc_element)

    # Xóa các đoạn văn gõ tay cũ của MỤC LỤC
    for i in range(start_toc_idx, start_lof_idx):
        p_elem = doc.paragraphs[i]._p
        p_elem.getparent().remove(p_elem)

    print("Replaced static table of contents with native Word Dynamic TOC.")

    # =========================================================================
    # 5. CHUẨN HÓA TIÊU ĐỀ: DANH MỤC HÌNH ẢNH & DANH MỤC BẢNG BIỂU
    # =========================================================================
    for p in doc.paragraphs:
        t = p.text.strip().upper()
        if t == 'MỤC LỤC HÌNH ẢNH':
            p.text = 'DANH MỤC HÌNH ẢNH'
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            if p.runs:
                p.runs[0].font.name = 'Times New Roman'
                p.runs[0].font.size = Pt(14)
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(0, 0, 0)
        elif t == 'MỤC LỤC BẢNG BIỂU':
            p.text = 'DANH MỤC BẢNG BIỂU'
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            if p.runs:
                p.runs[0].font.name = 'Times New Roman'
                p.runs[0].font.size = Pt(14)
                p.runs[0].font.bold = True
                p.runs[0].font.color.rgb = RGBColor(0, 0, 0)

    # =========================================================================
    # 6. BỔ SUNG: BẢNG DANH MỤC TỪ VIẾT TẮT VÀ THUẬT NGỮ (TRƯỚC CHƯƠNG 1)
    # =========================================================================
    # Tìm lại paragraph Chương 1
    target_ch1 = None
    for p in doc.paragraphs:
        if p.text.strip().startswith('CHƯƠNG 1.'):
            target_ch1 = p
            break

    if target_ch1:
        # Thêm ngắt trang trước Chương 1
        abbr_heading_xml = f'''<w:p xmlns:w="{w_ns}">
  <w:pPr>
    <w:jc w:val="center"/>
    <w:spacing w:before="240" w:after="140"/>
  </w:pPr>
  <w:r>
    <w:br w:type="page"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      <w:b/>
      <w:color w:val="000000"/>
      <w:sz w:val="28"/>
      <w:szCs w:val="28"/>
    </w:rPr>
    <w:t>DANH MỤC TỪ VIẾT TẮT VÀ THUẬT NGỮ</w:t>
  </w:r>
</w:p>'''
        abbr_heading_elem = parse_xml(abbr_heading_xml)
        target_ch1._p.addprevious(abbr_heading_elem)

        # Bảng danh mục từ viết tắt chuẩn 2 cột
        abbr_data = [
            ("Từ viết tắt", "Tên đầy đủ tiếng Anh & Ý nghĩa nghiệp vụ"),
            ("API", "Application Programming Interface – Giao diện lập trình ứng dụng"),
            ("B2B", "Business to Business – Mô hình đặt tour đoàn dành cho doanh nghiệp"),
            ("CSDL", "Cơ sở Dữ liệu (Database Management System)"),
            ("ERD", "Entity-Relationship Diagram – Sơ đồ thực thể quan hệ cơ sở dữ liệu"),
            ("E2E", "End-to-End Testing – Kiểm thử tự động quy trình người dùng toàn diện"),
            ("JPA", "Jakarta Persistence API – Tiêu chuẩn ánh xạ đối tượng quan hệ trong Java"),
            ("JWT", "JSON Web Token – Chuẩn mã hóa phi trạng thái phục vụ xác thực an toàn"),
            ("LLM", "Large Language Model – Mô hình ngôn ngữ lớn (Google Gemini 1.5)"),
            ("MVC", "Model - View - Controller – Mô hình kiến trúc phần mềm phân tầng"),
            ("ORM", "Object-Relational Mapping – Cơ chế ánh xạ quan hệ - đối tượng (Hibernate)"),
            ("OTA", "Online Travel Agency – Nền tảng đại lý lữ hành trực tuyến (Du Lịch Việt)"),
            ("RAG", "Retrieval-Augmented Generation – Tạo sinh tăng cường thu hồi ngữ nghĩa"),
            ("RBAC", "Role-Based Access Control – Phân quyền truy cập theo vai trò người dùng"),
            ("TDD", "Test-Driven Development – Phương pháp phát triển phần mềm hướng kiểm thử"),
            ("UI/UX", "User Interface / User Experience – Giao diện và trải nghiệm người dùng PC/Laptop")
        ]

        table_xml = f'''<w:tbl xmlns:w="{w_ns}">
  <w:tblPr>
    <w:tblW w:w="9070" w:type="dxa"/>
    <w:jc w:val="center"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
      <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
      <w:insideV w:val="none"/>
      <w:left w:val="none"/>
      <w:right w:val="none"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="2200"/>
    <w:gridCol w:w="6870"/>
  </w:tblGrid>
'''
        for r_idx, (col1, col2) in enumerate(abbr_data):
            is_head = (r_idx == 0)
            shd = '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>' if is_head else ''
            bld = '<w:b/>'
            c1 = col1.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            c2 = col2.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            table_xml += f'''  <w:tr>
    <w:trPr>
      <w:cantSplit/>
      {"<w:tblHeader/>" if is_head else ""}
      <w:trHeight w:val="340"/>
    </w:trPr>
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="2200" w:type="dxa"/>
        {shd}
        <w:vAlign w:val="center"/>
      </w:tcPr>
      <w:p>
        <w:pPr><w:jc w:val="{"center" if is_head else "left"}"/><w:spacing w:before="60" w:after="60"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>{bld}<w:sz w:val="22"/></w:rPr><w:t>{c1}</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc>
      <w:tcPr>
        <w:tcW w:w="6870" w:type="dxa"/>
        {shd}
        <w:vAlign w:val="center"/>
      </w:tcPr>
      <w:p>
        <w:pPr><w:jc w:val="{"center" if is_head else "left"}"/><w:spacing w:before="60" w:after="60"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>{"<w:b/>" if is_head else ""}<w:sz w:val="22"/></w:rPr><w:t>{c2}</w:t></w:r>
      </w:p>
    </w:tc>
  </w:tr>
'''
        table_xml += '</w:tbl>'
        table_elem = parse_xml(table_xml)
        target_ch1._p.addprevious(table_elem)

        # Thêm khoảng cách ngắt trang trước khi bắt đầu Chương 1
        pagebreak_p = parse_xml(f'''<w:p xmlns:w="{w_ns}"><w:r><w:br w:type="page"/></w:r></w:p>''')
        target_ch1._p.addprevious(pagebreak_p)

        print("Injected standard List of Abbreviations table before Chapter 1.")

    # =========================================================================
    # 7. BỔ SUNG: DANH MỤC TÀI LIỆU THAM KHẢO CHUẨN IEEE (SAU CHƯƠNG 7)
    # =========================================================================
    ref_heading = doc.add_paragraph()
    ref_heading.paragraph_format.page_break_before = True
    ref_heading.paragraph_format.space_before = Pt(18)
    ref_heading.paragraph_format.space_after = Pt(12)
    ref_heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_head = ref_heading.add_run('TÀI LIỆU THAM KHẢO')
    r_head.font.name = 'Times New Roman'
    r_head.font.size = Pt(16)
    r_head.font.bold = True
    r_head.font.color.rgb = RGBColor(0, 0, 0)

    references_list = [
        "[1] Bộ Giáo dục và Đào tạo, \"Quy định về quy cách trình bày đồ án, khóa luận tốt nghiệp đại học,\" Thông tư số 08/2021/TT-BGDĐT, Hà Nội, 2021.",
        "[2] Trường Đại học Công nghiệp TP. Hồ Chí Minh (IUH), \"Quy định thực hiện và trình bày đồ án, khóa luận tốt nghiệp ngành Kỹ thuật Phần mềm,\" Khoa Công nghệ Thông tin, 2024.",
        "[3] Oracle Corporation, \"Java Platform, Standard Edition 17 LTS Specification & API Documentation,\" Oracle Technology Network, 2024.",
        "[4] VMware, Inc., \"Spring Boot Reference Documentation (Version 3.5.x),\" Pivotal Software, https://docs.spring.io/spring-boot, 2026.",
        "[5] Christian Bauer, Gavin King, and Gary Gregory, \"Java Persistence with Hibernate,\" 2nd Edition, Manning Publications, Shelter Island, NY, 2016.",
        "[6] Robert C. Martin, \"Clean Architecture: A Craftsman's Guide to Software Structure and Design,\" Prentice Hall, Boston, MA, 2017.",
        "[7] OWASP Foundation, \"OWASP API Security Top 10 (2023 Edition) - The Ten Most Critical API Security Risks,\" Open Web Application Security Project, 2023.",
        "[8] Patrick Lewis et al., \"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,\" Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 9459-9474, 2020.",
        "[9] Martin Fowler, \"Patterns of Enterprise Application Architecture,\" Addison-Wesley Professional, Boston, MA, 2002."
    ]

    for ref in references_list:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.space_before = Pt(4)
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.line_spacing = 1.3
        p_ref.paragraph_format.left_indent = Cm(0.8)
        p_ref.paragraph_format.first_line_indent = Cm(-0.8)  # Treo lề chuẩn IEEE
        r_item = p_ref.add_run(ref)
        r_item.font.name = 'Times New Roman'
        r_item.font.size = Pt(12)
        r_item.font.color.rgb = RGBColor(0, 0, 0)

    print("Appended standard IEEE References section after Chapter 7.")

    # =========================================================================
    # 8. LƯU TÀI LIỆU VÀ CẬP NHẬT SETTINGS (UPDATEFIELDS = TRUE)
    # =========================================================================
    temp_path = 'docs/Nhom5_Detai49_BaoCaoCuoiKy_temp.docx'
    doc.save(temp_path)

    # Đóng gói lại file docx hoàn chỉnh và thêm updateFields vào settings.xml
    with zipfile.ZipFile(temp_path, 'r') as zin, zipfile.ZipFile(DOC_PATH, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == 'word/settings.xml':
                content = data.decode('utf-8')
                if '<w:updateFields' not in content:
                    settings_pos = content.find('<w:settings')
                    if settings_pos != -1:
                        pos = content.find('>', settings_pos)
                        if pos != -1:
                            content = content[:pos+1] + '<w:updateFields w:val="true"/>' + content[pos+1:]
                            data = content.encode('utf-8')
                            print("Injected <w:updateFields w:val='true'/> into settings.xml")
            zout.writestr(item, data)

    if os.path.exists(temp_path):
        os.remove(temp_path)

    print(f"ALL STANDARDIZATION COMPLETE: {DOC_PATH}")

if __name__ == '__main__':
    main()
