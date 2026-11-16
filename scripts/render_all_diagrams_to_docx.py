#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
High-Resolution Draw.io Diagram Renderer & DOCX Document Injector
Powered by Python Pillow & Python-docx
Generates 300 DPI high-res figures from .drawio XML and injects into Word reports.
"""

import os
import sys
import re
import math
import html
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

DIAGRAMS_DIR = os.path.abspath('docs/diagrams')
REPORTS_DIR = os.path.abspath('docs')

# Tải font tiếng Việt Segoe UI từ Windows
FONT_REGULAR_PATH = r"C:\Windows\Fonts\segoeui.ttf"
FONT_BOLD_PATH = r"C:\Windows\Fonts\segoeuib.ttf"
if not os.path.exists(FONT_REGULAR_PATH):
    FONT_REGULAR_PATH = r"C:\Windows\Fonts\arial.ttf"
    FONT_BOLD_PATH = r"C:\Windows\Fonts\arialbd.ttf"

def get_font(size, bold=False):
    path = FONT_BOLD_PATH if bold else FONT_REGULAR_PATH
    try:
        return ImageFont.truetype(path, int(size))
    except Exception:
        return ImageFont.load_default()

def parse_style(style_str):
    res = {}
    if not style_str:
        return res
    for part in style_str.split(';'):
        part = part.strip()
        if not part:
            continue
        if '=' in part:
            k, v = part.split('=', 1)
            res[k.strip()] = v.strip()
        else:
            res[part] = True
    return res

def clean_text(raw_text):
    if not raw_text:
        return ""
    t = raw_text.replace("&#xa;", "\n").replace("<br/>", "\n").replace("<br>", "\n")
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t)
    return t.strip()

def parse_color(c_str, default="#000000"):
    if not c_str or c_str == "none":
        return None
    c_str = c_str.strip()
    if c_str.startswith("#"):
        if len(c_str) == 7:
            return (int(c_str[1:3], 16), int(c_str[3:5], 16), int(c_str[5:7], 16))
        elif len(c_str) == 4:
            return (int(c_str[1]*2, 16), int(c_str[2]*2, 16), int(c_str[3]*2, 16))
    return default

def draw_arrowhead(draw, x1, y1, x2, y2, color, size=14, filled=True):
    angle = math.atan2(y2 - y1, x2 - x1)
    d_angle = math.radians(22)
    left_x = x2 - size * math.cos(angle - d_angle)
    left_y = y2 - size * math.sin(angle - d_angle)
    right_x = x2 - size * math.cos(angle + d_angle)
    right_y = y2 - size * math.sin(angle + d_angle)
    points = [(x2, y2), (left_x, left_y), (right_x, right_y)]
    if filled:
        draw.polygon(points, fill=color)
    else:
        draw.line([(left_x, left_y), (x2, y2), (right_x, right_y)], fill=color, width=2)

def draw_dashed_line(draw, x1, y1, x2, y2, fill, width=2, dash_len=8, gap_len=6):
    dist = math.hypot(x2 - x1, y2 - y1)
    if dist < 1:
        return
    dx = (x2 - x1) / dist
    dy = (y2 - y1) / dist
    curr = 0
    while curr < dist:
        end = min(curr + dash_len, dist)
        draw.line([(x1 + dx * curr, y1 + dy * curr), (x1 + dx * end, y1 + dy * end)], fill=fill, width=width)
        curr += dash_len + gap_len

def render_drawio_file(drawio_path, output_png_path, scale=2.0):
    """Phân tích file drawio và vẽ ra ảnh PNG sắc nét chuẩn 300 DPI."""
    tree = ET.parse(drawio_path)
    root = tree.getroot()

    cells = {}
    children_map = {}
    edges = []

    for cell in root.iter('mxCell'):
        cid = cell.get('id')
        if not cid or cid in ('0', '1'):
            continue
        pid = cell.get('parent')
        if pid not in children_map:
            children_map[pid] = []
        children_map[pid].append(cid)

        style = parse_style(cell.get('style'))
        geo = cell.find('mxGeometry')
        value = clean_text(cell.get('value') or '')

        if cell.get('edge') == '1':
            source = cell.get('source')
            target = cell.get('target')
            points = []
            if geo is not None:
                arr = geo.find('Array')
                if arr is not None:
                    for pt in arr.findall('mxPoint'):
                        px = float(pt.get('x', 0))
                        py = float(pt.get('y', 0))
                        points.append((px, py))
            edges.append({
                'id': cid,
                'source': source,
                'target': target,
                'style': style,
                'value': value,
                'points': points
            })
        else:
            gx = float(geo.get('x', 0)) if geo is not None else 0.0
            gy = float(geo.get('y', 0)) if geo is not None else 0.0
            gw = float(geo.get('width', 120)) if geo is not None else 120.0
            gh = float(geo.get('height', 60)) if geo is not None else 60.0
            cells[cid] = {
                'id': cid,
                'parent': pid,
                'style': style,
                'value': value,
                'x': gx,
                'y': gy,
                'w': gw,
                'h': gh,
                'abs_x': gx,
                'abs_y': gy
            }

    # Tính toán tọa độ tuyệt đối (Absolute coordinates)
    def compute_abs(cid):
        c = cells[cid]
        pid = c['parent']
        if pid and pid in cells:
            px, py = compute_abs(pid)
            c['abs_x'] = px + c['x']
            c['abs_y'] = py + c['y']
        else:
            c['abs_x'] = c['x']
            c['abs_y'] = c['y']
        return c['abs_x'], c['abs_y']

    for cid in list(cells.keys()):
        compute_abs(cid)

    # Tính toán bounding box
    min_x = 999999
    min_y = 999999
    max_x = -999999
    max_y = -999999

    for c in cells.values():
        min_x = min(min_x, c['abs_x'])
        min_y = min(min_y, c['abs_y'])
        max_x = max(max_x, c['abs_x'] + c['w'])
        max_y = max(max_y, c['abs_y'] + c['h'])

    for e in edges:
        for px, py in e['points']:
            min_x = min(min_x, px)
            min_y = min(min_y, py)
            max_x = max(max_x, px)
            max_y = max(max_y, py)

    if min_x > max_x:
        min_x, min_y, max_x, max_y = 0, 0, 1200, 800

    padding = 35
    origin_x = min_x - padding
    origin_y = min_y - padding
    canvas_w = int((max_x - min_x + padding * 2) * scale)
    canvas_h = int((max_y - min_y + padding * 2) * scale)

    # Khởi tạo ảnh với nền trắng
    im = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(im)

    def tx(x):
        return (x - origin_x) * scale

    def ty(y):
        return (y - origin_y) * scale

    # 1. Vẽ Swimlanes & Containers trước
    for c in cells.values():
        s = c['style']
        if 'swimlane' in s or s.get('shape') == 'swimlane':
            x1 = tx(c['abs_x'])
            y1 = ty(c['abs_y'])
            x2 = tx(c['abs_x'] + c['w'])
            y2 = ty(c['abs_y'] + c['h'])
            start_size = float(s.get('startSize', 30)) * scale

            fill = parse_color(s.get('fillColor'), '#f8fafc')
            stroke = parse_color(s.get('strokeColor'), '#94a3b8')

            # Thân swimlane
            draw.rounded_rectangle([x1, y1, x2, y2], radius=int(8*scale), fill=fill, outline=stroke, width=int(2*scale))
            # Header swimlane
            header_fill = stroke if fill == stroke else (stroke[0], stroke[1], stroke[2])
            # Header bar
            draw.rectangle([x1, y1, x2, y1 + start_size], fill=stroke)

            # Tiêu đề Swimlane
            val = c['value']
            font = get_font(13 * scale, bold=True)
            text_color = (255, 255, 255)
            draw.text((x1 + 15 * scale, y1 + 6 * scale), val, fill=text_color, font=font)

    # 2. Vẽ Lifelines (cho Sequence diagrams)
    for c in cells.values():
        s = c['style']
        shape = s.get('shape')
        if shape == 'umlLifeline' or 'participant' in s:
            x1 = tx(c['abs_x'])
            y1 = ty(c['abs_y'])
            w = c['w'] * scale
            h = c['h'] * scale
            head_h = float(s.get('size', 40)) * scale

            # Hộp đối tượng lifeline
            fill = parse_color(s.get('fillColor'), '#e0f2fe')
            stroke = parse_color(s.get('strokeColor'), '#0284c7')
            draw.rounded_rectangle([x1, y1, x1 + w, y1 + head_h], radius=int(6*scale), fill=fill, outline=stroke, width=int(2*scale))

            # Tên lifeline
            val = c['value']
            font = get_font(11 * scale, bold=True)
            lines = val.split('\n')
            ty_text = y1 + 6 * scale
            for line in lines:
                draw.text((x1 + 8 * scale, ty_text), line, fill=(15, 23, 42), font=font)
                ty_text += 15 * scale

            # Trục đường đứt nét Lifeline dọc xuống
            center_x = x1 + w / 2
            draw_dashed_line(draw, center_x, y1 + head_h, center_x, y1 + h, fill=(148, 163, 184), width=int(2*scale))

    # 3. Vẽ Vertices bình thường
    for c in cells.values():
        s = c['style']
        if 'swimlane' in s or s.get('shape') in ('swimlane', 'umlLifeline'):
            continue

        x1 = tx(c['abs_x'])
        y1 = ty(c['abs_y'])
        x2 = tx(c['abs_x'] + c['w'])
        y2 = ty(c['abs_y'] + c['h'])
        shape = s.get('shape')

        fill = parse_color(s.get('fillColor'), '#ffffff')
        stroke = parse_color(s.get('strokeColor'), '#64748b')
        stroke_w = int(float(s.get('strokeWidth', 1)) * scale)

        if shape == 'rhombus' or 'rhombus' in s:
            # Hình thoi (Decision)
            mx = (x1 + x2) / 2
            my = (y1 + y2) / 2
            poly = [(mx, y1), (x2, my), (mx, y2), (x1, my)]
            draw.polygon(poly, fill=fill, outline=stroke)
        elif shape == 'ellipse' or 'ellipse' in s:
            # Hình elip / Start / End
            draw.ellipse([x1, y1, x2, y2], fill=fill, outline=stroke, width=stroke_w)
            if s.get('strokeWidth') == '3' or s.get('strokeWidth') == 3:
                # End node double circle
                draw.ellipse([x1+4*scale, y1+4*scale, x2-4*scale, y2-4*scale], outline=stroke, width=int(2*scale))
        elif shape == 'note':
            # Hình note ghi chú góc gập
            fold = int(12 * scale)
            poly = [(x1, y1), (x2 - fold, y1), (x2, y1 + fold), (x2, y2), (x1, y2)]
            draw.polygon(poly, fill=fill, outline=stroke)
            draw.line([(x2 - fold, y1), (x2 - fold, y1 + fold), (x2, y1 + fold)], fill=stroke, width=stroke_w)
        else:
            # Hình chữ nhật / Bo góc
            radius = int(8 * scale) if s.get('rounded') == '1' or 'rounded' in s else 0
            if radius > 0:
                draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=stroke, width=stroke_w)
            else:
                draw.rectangle([x1, y1, x2, y2], fill=fill, outline=stroke, width=stroke_w)

        # Vẽ văn bản trong Vertex
        val = c['value']
        if val:
            font_size = float(s.get('fontSize', 11)) * scale
            bold = s.get('fontStyle') == '1'
            font = get_font(font_size, bold=bold)
            text_color = parse_color(s.get('fontColor'), '#0f172a') or (15, 23, 42)

            lines = val.split('\n')
            total_text_h = len(lines) * (font_size * 1.35)
            align = s.get('align', 'left')

            if align == 'center':
                start_y = (y1 + y2 - total_text_h) / 2
                for line in lines:
                    line_w = draw.textlength(line, font=font)
                    line_x = (x1 + x2 - line_w) / 2
                    draw.text((line_x, start_y), line, fill=text_color, font=font)
                    start_y += font_size * 1.35
            else:
                start_y = y1 + 8 * scale
                spacing_left = float(s.get('spacingLeft', 8)) * scale
                for line in lines:
                    draw.text((x1 + spacing_left, start_y), line, fill=text_color, font=font)
                    start_y += font_size * 1.35

    # 4. Vẽ Edges & Arrows
    for e in edges:
        s = e['style']
        src_id = e['source']
        tgt_id = e['target']

        edge_color = parse_color(s.get('strokeColor'), '#334155') or (51, 65, 85)
        edge_width = int(float(s.get('strokeWidth', 2)) * scale)
        is_dashed = s.get('dashed') == '1'

        src_cell = cells.get(src_id)
        tgt_cell = cells.get(tgt_id)

        if not src_cell or not tgt_cell:
            continue

        # Điểm bắt đầu
        exit_x = float(s.get('exitX', 0.5))
        exit_y = float(s.get('exitY', 0.5))
        sx = tx(src_cell['abs_x'] + src_cell['w'] * exit_x)
        sy = ty(src_cell['abs_y'] + src_cell['h'] * exit_y)

        # Điểm kết thúc
        entry_x = float(s.get('entryX', 0.5))
        entry_y = float(s.get('entryY', 0.5))
        ex = tx(tgt_cell['abs_x'] + tgt_cell['w'] * entry_x)
        ey = ty(tgt_cell['abs_y'] + tgt_cell['h'] * entry_y)

        route_pts = [(sx, sy)]
        for px, py in e['points']:
            route_pts.append((tx(px), ty(py)))
        route_pts.append((ex, ey))

        # Vẽ từng đoạn đường
        for i in range(len(route_pts) - 1):
            p1 = route_pts[i]
            p2 = route_pts[i+1]
            if is_dashed:
                draw_dashed_line(draw, p1[0], p1[1], p2[0], p2[1], fill=edge_color, width=edge_width)
            else:
                draw.line([p1, p2], fill=edge_color, width=edge_width)

        # Mũi tên kết thúc
        end_arrow = s.get('endArrow', 'block')
        if end_arrow != 'none':
            last_p1 = route_pts[-2]
            last_p2 = route_pts[-1]
            draw_arrowhead(draw, last_p1[0], last_p1[1], last_p2[0], last_p2[1], color=edge_color, size=int(12*scale), filled=(end_arrow == 'block'))

        # Nhãn text trên cạnh (Edge Label)
        val = e['value']
        if val:
            font = get_font(10.5 * scale, bold=True)
            mid_idx = len(route_pts) // 2
            p_prev = route_pts[mid_idx - 1]
            p_curr = route_pts[mid_idx]
            mx = (p_prev[0] + p_curr[0]) / 2
            my = (p_prev[1] + p_curr[1]) / 2 - 14 * scale

            lines = val.split('\n')
            total_h = len(lines) * 14 * scale
            max_w = max(draw.textlength(l, font=font) for l in lines)

            # Box trắng mờ lót nền cho chữ dễ đọc
            draw.rounded_rectangle([mx - max_w/2 - 6*scale, my - 4*scale, mx + max_w/2 + 6*scale, my + total_h + 4*scale], radius=int(4*scale), fill=(255, 255, 255, 230), outline=(226, 232, 240), width=1)

            cur_y = my
            for line in lines:
                lw = draw.textlength(line, font=font)
                draw.text((mx - lw/2, cur_y), line, fill=(30, 41, 59), font=font)
                cur_y += 14 * scale

    # Lưu ảnh RGB sạch sẽ
    final_im = Image.new("RGB", im.size, (255, 255, 255))
    final_im.paste(im, mask=im.split()[3])
    final_im.save(output_png_path, "PNG", dpi=(300, 300))
    print(f"  ✓ Đã render 300 DPI: {os.path.basename(output_png_path)} ({canvas_w}x{canvas_h})")

def main():
    print("======================================================================")
    print("🎨 BẮT ĐẦU RENDER TẤT CẢ 16 SƠ ĐỒ DRAW.IO SANG ẢNH PNG CHẤT LƯỢNG CAO (300 DPI)")
    print("======================================================================")

    drawio_files = [f for f in sorted(os.listdir(DIAGRAMS_DIR)) if f.endswith(".drawio")]
    generated_pngs = {}

    for df in drawio_files:
        in_path = os.path.join(DIAGRAMS_DIR, df)
        png_name = df.replace(".drawio", ".png")
        out_path = os.path.join(DIAGRAMS_DIR, png_name)
        render_drawio_file(in_path, out_path, scale=2.0)
        generated_pngs[df] = out_path

    print("\n======================================================================")
    print("📄 ĐANG CHÈN ẢNH VÀO FILE BÁO CÁO ĐỒ ÁN CUỐI KỲ (Detai49_BaoCaoCuoiKy.docx)...")
    print("======================================================================")

    # Bản đồ rId tương ứng trong Nhom5_Detai49_BaoCaoCuoiKy.docx
    docx_main_path = os.path.join(REPORTS_DIR, "Nhom5_Detai49_BaoCaoCuoiKy.docx")
    doc_main = docx.Document(docx_main_path)

    image_map = {
        'rId18': 'hinh_2_1_kien_truc_3_tang.drawio',
        'rId19': 'hinh_2_2_sequence_rate_limiting.drawio',
        'rId20': 'hinh_3_1_usecase_tong_quat.drawio',
        'rId21': 'hinh_3_2_activity_uc01_tra_cuu_tour.drawio',
        'rId22': 'hinh_3_3_sequence_uc01_tra_cuu_tour.drawio',
        'rId23': 'hinh_3_4_activity_uc02_dat_tour_b2b.drawio',
        'rId24': 'hinh_3_5_sequence_uc02_dat_tour_b2b.drawio',
        'rId25': 'hinh_3_6_activity_uc03_safe_delete.drawio',
        'rId26': 'hinh_3_7_sequence_uc03_safe_delete.drawio',
        'rId27': 'hinh_3_8_activity_uc04_goi_y_ca_nhan_hoa.drawio',
        'rId28': 'hinh_3_9_sequence_uc04_goi_y_ca_nhan_hoa.drawio',
        'rId29': 'hinh_3_10_sequence_uc05_gemini_ai.drawio',
        'rId30': 'hinh_3_11_class_diagram_jpa_entities.drawio',
        'rId31': 'hinh_3_12_erd_database_3nf.drawio',
        'rId38': 'hinh_4_1_luong_khoa_bi_quan_pessimistic_lock.drawio'
    }

    updated_count = 0
    for rid, drawio_name in image_map.items():
        if rid in doc_main.part.rels:
            png_path = generated_pngs.get(drawio_name)
            if png_path and os.path.exists(png_path):
                with open(png_path, "rb") as f:
                    new_bytes = f.read()
                part = doc_main.part.rels[rid].target_part
                part._blob = new_bytes
                updated_count += 1
                print(f"  ✓ Đã cập nhật ảnh {rid} -> {drawio_name}")

    doc_main.save(docx_main_path)
    print(f"✨ ĐÃ CẬP NHẬT THÀNH CÔNG {updated_count}/15 HÌNH VẼ TRONG: {docx_main_path}")

    print("\n======================================================================")
    print("📄 ĐANG CHÈN ẢNH VÀO BÁO CÁO NGHIÊN CỨU KHOA HỌC (BAO_CAO_NGHIEN_CUU_KHOA_HOC_DE_TAI_1.docx)...")
    print("======================================================================")

    docx_nckh_path = os.path.join(REPORTS_DIR, "BAO_CAO_NGHIEN_CUU_KHOA_HOC_DE_TAI_1.docx")
    doc_nckh = docx.Document(docx_nckh_path)

    # Tìm vị trí thích hợp tại Chương 3 (Section 3.1)
    target_idx = None
    for i, p in enumerate(doc_nckh.paragraphs):
        if "3.1. Tổng quan Kiến trúc Pipeline Tìm kiếm Lai ghép 3 Tầng" in p.text:
            target_idx = i + 1
            break

    rag_png = generated_pngs.get("hinh_5_1_hybrid_semantic_retrieval_rag.drawio")
    if target_idx is not None and rag_png and os.path.exists(rag_png):
        # Chèn ảnh vào ngay sau đoạn giới thiệu 3.1
        img_p = doc_nckh.paragraphs[target_idx].insert_paragraph_before()
        img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = img_p.add_run()
        run.add_picture(rag_png, width=Inches(6.3))

        # Thêm chú thích hình
        caption_p = doc_nckh.paragraphs[target_idx].insert_paragraph_before()
        caption_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap_run = caption_p.add_run("Hình 3.1: Sơ đồ Kiến trúc Hệ thống Tìm kiếm Ngữ nghĩa Lai ghép (Hybrid Semantic Retrieval) & RAG Pipeline")
        cap_run.bold = True
        cap_run.font.size = Pt(10)
        cap_run.font.italic = True
        cap_run.font.color.rgb = RGBColor(71, 85, 105)

        doc_nckh.save(docx_nckh_path)
        print(f"  ✓ Đã chèn thành công Hình 3.1 (Kiến trúc RAG Pipeline) vào: {docx_nckh_path}")
    else:
        print(f"  ! Không tìm thấy vị trí chèn trong {docx_nckh_path}")

    print("\n🎉 TOÀN BỘ ẢNH ĐÃ ĐƯỢC CHÈN VÀO FILE BÁO CÁO THÀNH CÔNG VỚI CHẤT LƯỢNG 300 DPI!")

if __name__ == "__main__":
    main()
