#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full Generator for 16 Draw.io Architecture & UML Diagrams
Powered by Agents365-ai/drawio-skill
"""

import os
import sys
import json
import zlib
import base64
import urllib.parse
import re
from xml.sax.saxutils import escape

DIAGRAMS_DIR = os.path.abspath('docs/diagrams')
os.makedirs(DIAGRAMS_DIR, exist_ok=True)
SKILL_SCRIPTS_DIR = os.path.abspath('docs/drawio-skill/skills/drawio-skill/scripts')
sys.path.append(SKILL_SCRIPTS_DIR)

import seqlayout
import encode_drawio_url

def wrap_drawio_xml(diagram_name, content_cells_xml, width=1600, height=1100):
    """Bọc các cell thành file .drawio hoàn chỉnh chuẩn mxGraph."""
    safe_id = re.sub(r'[^a-zA-Z0-9_]', '_', diagram_name.lower())
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="drawio" version="26.0.0" type="device">
  <diagram id="{safe_id}" name="{escape(diagram_name)}">
    <mxGraphModel dx="1420" dy="880" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{width}" pageHeight="{height}" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
{content_cells_xml}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>"""

# ==============================================================================
# 1. HÌNH 2.1: SƠ ĐỒ KIẾN TRÚC 3 TẦNG CẤP DOANH NGHIỆP (3-TIER ARCHITECTURE)
# ==============================================================================
def build_hinh_2_1():
    print("  -> Đang dựng Hình 2.1: Sơ đồ Kiến trúc 3 tầng cấp doanh nghiệp...")
    cells = """
        <!-- Title Banner -->
        <mxCell id="t0" value="HỆ THỐNG DU LỊCH VIỆT — KIẾN TRÚC 3 TẦNG DOANH NGHIỆP TRÊN PC/LAPTOP" style="rounded=1;whiteSpace=wrap;html=1;fontSize=16;fontStyle=1;fillColor=#1e293b;strokeColor=#0f172a;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="60" y="30" width="1280" height="46" as="geometry" />
        </mxCell>

        <!-- TẦNG 1: PRESENTATION LAYER (CLIENT SPA) -->
        <mxCell id="tier1" value="TẦNG 1: GIAO DIỆN NGƯỜI DÙNG CHUYÊN BIỆT PC/LAPTOP (PRESENTATION LAYER - REACT 18 SPA)" style="swimlane;startSize=32;fillColor=#f0f9ff;strokeColor=#0284c7;fontColor=#0369a1;fontStyle=1;rounded=1;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="60" y="100" width="1280" height="150" as="geometry" />
        </mxCell>
        <mxCell id="t1_c1" value="Giao Diện Khách Hàng Desktop&#xa;• Bento Mosaic Media Gallery&#xa;• Dynamic Day Timeline&#xa;• Multi-Criteria Search Bar&#xa;• Cart &amp; Checkout Wizard" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#38bdf8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier1">
          <mxGeometry x="30" y="45" width="220" height="85" as="geometry" />
        </mxCell>
        <mxCell id="t1_c2" value="Bảng Quản Trị Trung Tâm Admin&#xa;• Multi-tab Analytics (KPIs)&#xa;• Soft Delete / Quản lý 80 Tour&#xa;• Phân loại 8 Tuyến Danh Mục&#xa;• Quản trị Đơn hàng &amp; Doanh thu" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#38bdf8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier1">
          <mxGeometry x="280" y="45" width="230" height="85" as="geometry" />
        </mxCell>
        <mxCell id="t1_c3" value="Trợ Lý Ảo Du Lịch Thông Minh&#xa;• Floating AI Chat Widget&#xa;• Interactive Tour Cards&#xa;• Real-time Suggestion Chips&#xa;• Sentiment Review Summarizer" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#38bdf8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier1">
          <mxGeometry x="540" y="45" width="220" height="85" as="geometry" />
        </mxCell>
        <mxCell id="t1_c4" value="Smart Dual-Mode API Client&#xa;• Axios Session withCredentials&#xa;• 0ms Offline Fallback Resiliency&#xa;• Automated 401 Auth Interceptor&#xa;• Client Specification Filter" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e0f2fe;strokeColor=#0284c7;fontColor=#0369a1;fontStyle=1;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier1">
          <mxGeometry x="790" y="45" width="220" height="85" as="geometry" />
        </mxCell>
        <mxCell id="t1_c5" value="State &amp; Context Management&#xa;• AuthContext (RBAC Token)&#xa;• CartContext (Local Subtotal)&#xa;• WishlistContext (Heart Sync)&#xa;• Toastify &amp; Portal Notification" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#38bdf8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier1">
          <mxGeometry x="1040" y="45" width="210" height="85" as="geometry" />
        </mxCell>

        <!-- SECURITY & RATE LIMITING GATEWAY -->
        <mxCell id="gw" value="GATEWAY BẢO MẬT: Spring Security 6 (RBAC), CSRF Filter, RateLimitingFilter (Sliding Window), CORS (3000 -> 8080)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="60" y="270" width="1280" height="40" as="geometry" />
        </mxCell>

        <!-- TẦNG 2: BUSINESS LOGIC LAYER (SPRING BOOT 3) -->
        <mxCell id="tier2" value="TẦNG 2: XỬ LÝ NGHIỆP VỤ DOANH NGHIỆP (BUSINESS LOGIC LAYER - SPRING BOOT 3.5.6 &amp; JAVA 17 LTS)" style="swimlane;startSize=32;fillColor=#f8fafc;strokeColor=#64748b;fontColor=#334155;fontStyle=1;rounded=1;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="60" y="330" width="1280" height="230" as="geometry" />
        </mxCell>
        <mxCell id="t2_c1" value="REST Controllers Layer&#xa;• TourController (/api/tours)&#xa;• OrderController (/api/orders)&#xa;• AdminController (/api/admin)&#xa;• AuthController (/api/auth)&#xa;• AiTourController (/api/ai)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#94a3b8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier2">
          <mxGeometry x="30" y="45" width="220" height="95" as="geometry" />
        </mxCell>
        <mxCell id="t2_c2" value="Core Business Services Layer&#xa;• TourService (Safe Delete, CRUD)&#xa;• OrderService (B2B Discount, Lock)&#xa;• UserService (RBAC, Loyalty Points)&#xa;• CategoryService (N+1 Query Cache)&#xa;• ExportService (Excel UTF-8 BOM)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#94a3b8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier2">
          <mxGeometry x="280" y="45" width="240" height="95" as="geometry" />
        </mxCell>
        <mxCell id="t2_c3" value="Dynamic Specification Engine&#xa;• TourSpecification Criteria Builder&#xa;• Multi-field keyword fuzzy match&#xa;• Price, Duration, Hotel Star range&#xa;• Safe Status partitioning" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#94a3b8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier2">
          <mxGeometry x="550" y="45" width="220" height="95" as="geometry" />
        </mxCell>
        <mxCell id="t2_c4" value="Contextual AI &amp; Rec Engine&#xa;• RecommendationService (Scoring)&#xa;• GeminiAiService (Google API)&#xa;• GuardrailsEngine (PII Redaction)&#xa;• TypeChatParser (Schema JSON)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#94a3b8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier2">
          <mxGeometry x="800" y="45" width="230" height="95" as="geometry" />
        </mxCell>
        <mxCell id="t2_c5" value="Performance &amp; Cache Module&#xa;• Spring Cache (@Cacheable)&#xa;• Eviction Strategy (Sync evict)&#xa;• Gzip HTTP Response Compression&#xa;• Zero-Password Email Webhook Relay" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#94a3b8;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier2">
          <mxGeometry x="1050" y="45" width="200" height="95" as="geometry" />
        </mxCell>

        <!-- Business Rules Box inside Tier 2 -->
        <mxCell id="t2_rules" value="Các Quy Tắc Bất Biến Nghiệp Vụ (Invariants): Khóa Bi Quan @Lock PESSIMISTIC_WRITE chống bán âm vé | Chiết khấu đoàn B2B bậc thang (0% - 5% - 10%) | Safe Delete bảo vệ đơn hàng | Phân lập Provider Isolation" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#10b981;fontColor=#065f46;fontStyle=1;fontSize=11;align=center;" vertex="1" parent="tier2">
          <mxGeometry x="30" y="160" width="1220" height="50" as="geometry" />
        </mxCell>

        <!-- TẦNG 3: DATA PERSISTENCE LAYER -->
        <mxCell id="tier3" value="TẦNG 3: TRUY XUẤT VÀ LƯU TRỮ DỮ LIỆU AN TOÀN (DATA ACCESS &amp; PERSISTENCE LAYER)" style="swimlane;startSize=32;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontStyle=1;rounded=1;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="60" y="585" width="1280" height="150" as="geometry" />
        </mxCell>
        <mxCell id="t3_c1" value="Spring Data JPA Repositories&#xa;• TourRepository (Pessimistic Lock)&#xa;• OrderRepository &amp; Details&#xa;• UserRepository &amp; CompanyRepo&#xa;• UserActivityRepository (Score)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#34d399;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier3">
          <mxGeometry x="30" y="45" width="230" height="85" as="geometry" />
        </mxCell>
        <mxCell id="t3_c2" value="Connection Pool HikariCP&#xa;• Max Pool Size: 50 connections&#xa;• Min Idle: 10 connections&#xa;• Leak Detection &amp; Auto Reconnect&#xa;• Low Latency Timeout: 20000ms" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#34d399;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier3">
          <mxGeometry x="290" y="45" width="230" height="85" as="geometry" />
        </mxCell>
        <mxCell id="t3_c3" value="Primary Database: MariaDB 12.2&#xa;• Chuẩn hóa 3NF (14 bảng dữ liệu)&#xa;• ACID Transactional Guarantees&#xa;• Bộ ký tự utf8mb4_unicode_ci&#xa;• Row-level Locking Storage" style="shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#059669;fontColor=#065f46;fontStyle=1;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier3">
          <mxGeometry x="550" y="45" width="230" height="85" as="geometry" />
        </mxCell>
        <mxCell id="t3_c4" value="Automated Data Initializer&#xa;• Self-healing Character Encoding&#xa;• Auto-seed 80 Tours &amp; 8 Categories&#xa;• Rolling Departure Date updater&#xa;• Persistent Logins table builder" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#34d399;fontColor=#0f172a;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier3">
          <mxGeometry x="810" y="45" width="230" height="85" as="geometry" />
        </mxCell>
        <mxCell id="t3_c5" value="In-Memory DB: H2 Profile&#xa;• Zero-install Quick Start&#xa;• Compatibility Mode: MariaDB&#xa;• Unit/Integration Testing Engine&#xa;• Standalone Offline Demo" style="shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#059669;fontColor=#065f46;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="tier3">
          <mxGeometry x="1060" y="45" width="190" height="85" as="geometry" />
        </mxCell>

        <!-- Connectors -->
        <mxCell id="edge1" style="endArrow=block;rounded=1;strokeColor=#0284c7;strokeWidth=2;html=1;" edge="1" parent="1" source="tier1" target="gw">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge2" style="endArrow=block;rounded=1;strokeColor=#d97706;strokeWidth=2;html=1;" edge="1" parent="1" source="gw" target="tier2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge3" style="endArrow=block;rounded=1;strokeColor=#059669;strokeWidth=2;html=1;" edge="1" parent="1" source="tier2" target="tier3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
    """
    xml = wrap_drawio_xml("Hinh 2.1: Sơ đồ Kiến trúc 3 tầng cấp doanh nghiệp", cells, 1400, 780)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_2_1_kien_truc_3_tang.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_2_1_kien_truc_3_tang.drawio")

# ==============================================================================
# 2. HÌNH 3.1: SƠ ĐỒ CA SỬ DỤNG TỔNG QUÁT (GENERAL USE CASE DIAGRAM)
# ==============================================================================
def build_hinh_3_1():
    print("  -> Đang dựng Hình 3.1: Sơ đồ Ca sử dụng tổng quát...")
    cells = """
        <!-- Boundary Box -->
        <mxCell id="sys_box" value="HỆ THỐNG ĐẶT VÀ QUẢN LÝ TOUR DU LỊCH VIỆT" style="swimlane;startSize=30;fillColor=#f8fafc;strokeColor=#0284c7;fontColor=#0369a1;fontStyle=1;rounded=1;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="240" y="30" width="880" height="740" as="geometry" />
        </mxCell>

        <!-- ACTORS ON LEFT -->
        <mxCell id="act_guest" value="Khách Vãng Lai&#xa;(Guest)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fillColor=#ffffff;strokeColor=#0284c7;" vertex="1" parent="1">
          <mxGeometry x="80" y="100" width="60" height="100" as="geometry" />
        </mxCell>
        <mxCell id="act_customer" value="Khách Hàng&#xa;(Customer)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fillColor=#ffffff;strokeColor=#059669;" vertex="1" parent="1">
          <mxGeometry x="80" y="270" width="60" height="100" as="geometry" />
        </mxCell>
        <mxCell id="act_b2b" value="Khách Doanh Nghiệp&#xa;(B2B Customer)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fillColor=#ffffff;strokeColor=#d97706;" vertex="1" parent="1">
          <mxGeometry x="80" y="470" width="60" height="100" as="geometry" />
        </mxCell>

        <!-- ACTORS ON RIGHT -->
        <mxCell id="act_admin" value="Quản Trị Viên&#xa;(Administrator)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fillColor=#ffffff;strokeColor=#dc2626;" vertex="1" parent="1">
          <mxGeometry x="1180" y="180" width="60" height="100" as="geometry" />
        </mxCell>
        <mxCell id="act_provider" value="Nhà Cung Cấp Tour&#xa;(Tour Provider)" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fontStyle=1;fillColor=#ffffff;strokeColor=#7c3aed;" vertex="1" parent="1">
          <mxGeometry x="1180" y="420" width="60" height="100" as="geometry" />
        </mxCell>

        <!-- USE CASES INSIDE BOUNDARY -->
        <!-- Group 1: Search & Booking -->
        <mxCell id="uc01" value="UC01: Tra cứu &amp; Tìm kiếm&#xa;Tour đa tiêu chí" style="ellipse;whiteSpace=wrap;html=1;fillColor=#e0f2fe;strokeColor=#0284c7;fontColor=#0369a1;fontStyle=1;" vertex="1" parent="sys_box">
          <mxGeometry x="50" y="50" width="220" height="60" as="geometry" />
        </mxCell>
        <mxCell id="uc_detail" value="Xem chi tiết lịch trình,&#xa;timeline &amp; ảnh thực tế" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#38bdf8;fontColor=#0f172a;" vertex="1" parent="sys_box">
          <mxGeometry x="320" y="50" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="uc_cart" value="Thêm tour vào giỏ hàng&#xa;&amp; Danh sách đã lưu" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#38bdf8;fontColor=#0f172a;" vertex="1" parent="sys_box">
          <mxGeometry x="50" y="140" width="220" height="60" as="geometry" />
        </mxCell>

        <mxCell id="uc02" value="UC02: Đặt tour trực tuyến &amp;&#xa;Chiết khấu đoàn B2B" style="ellipse;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sys_box">
          <mxGeometry x="50" y="230" width="230" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_deposit" value="Đặt cọc linh hoạt&#xa;(30% Nội Địa, 50% Quốc Tế)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#f59e0b;fontColor=#0f172a;" vertex="1" parent="sys_box">
          <mxGeometry x="330" y="230" width="200" height="60" as="geometry" />
        </mxCell>
        <mxCell id="uc_cancel" value="Hủy tour có hoàn tiền&#xa;theo thời gian quy định" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#f59e0b;fontColor=#0f172a;" vertex="1" parent="sys_box">
          <mxGeometry x="50" y="325" width="220" height="60" as="geometry" />
        </mxCell>

        <!-- Group 2: AI & Recommendation -->
        <mxCell id="uc04" value="UC04: Gợi ý tour cá nhân hóa&#xa;dựa trên lịch sử hoạt động" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontStyle=1;" vertex="1" parent="sys_box">
          <mxGeometry x="50" y="420" width="230" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc05" value="UC05: Tư vấn lịch trình qua&#xa;Trợ lý AI Google Gemini" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontStyle=1;" vertex="1" parent="sys_box">
          <mxGeometry x="50" y="520" width="230" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_tailor" value="AI Smart Itinerary Tailor&#xa;&amp; Sentiment Summarizer" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#10b981;fontColor=#0f172a;" vertex="1" parent="sys_box">
          <mxGeometry x="330" y="520" width="200" height="60" as="geometry" />
        </mxCell>

        <!-- Group 3: Admin & Provider Operations -->
        <mxCell id="uc03" value="UC03: Quản lý Tour &amp;&#xa;Safe Delete Validation" style="ellipse;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;fontStyle=1;" vertex="1" parent="sys_box">
          <mxGeometry x="610" y="100" width="220" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_cat" value="Quản lý 8 Tuyến Danh Mục&#xa;&amp; Bật/Tắt mở bán" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#ef4444;fontColor=#0f172a;" vertex="1" parent="sys_box">
          <mxGeometry x="610" y="195" width="220" height="60" as="geometry" />
        </mxCell>
        <mxCell id="uc_order_admin" value="Quản lý Đơn hàng, Xác nhận&#xa;VietQR/VNPAY &amp; Xuất Excel" style="ellipse;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;fontStyle=1;" vertex="1" parent="sys_box">
          <mxGeometry x="610" y="290" width="230" height="65" as="geometry" />
        </mxCell>
        <mxCell id="uc_kpi" value="Xem Dashboard Doanh Thu&#xa;&amp; Báo cáo phân tích KPI" style="ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#ef4444;fontColor=#0f172a;" vertex="1" parent="sys_box">
          <mxGeometry x="610" y="385" width="220" height="60" as="geometry" />
        </mxCell>
        <mxCell id="uc_provider_iso" value="Quản lý Tour Trực Thuộc&#xa;(Provider Data Isolation)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f5f3ff;strokeColor=#7c3aed;fontColor=#5b21b6;fontStyle=1;" vertex="1" parent="sys_box">
          <mxGeometry x="610" y="490" width="220" height="65" as="geometry" />
        </mxCell>

        <!-- Generalization / Extends / Includes -->
        <mxCell id="inc1" value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;" style="dashed=1;endArrow=open;html=1;strokeColor=#64748b;" edge="1" parent="sys_box" source="uc01" target="uc_detail">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="inc2" value="&amp;lt;&amp;lt;include&amp;gt;&amp;gt;" style="dashed=1;endArrow=open;html=1;strokeColor=#64748b;" edge="1" parent="sys_box" source="uc02" target="uc_deposit">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="inc3" value="&amp;lt;&amp;lt;extend&amp;gt;&amp;gt;" style="dashed=1;endArrow=open;html=1;strokeColor=#64748b;" edge="1" parent="sys_box" source="uc_tailor" target="uc05">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Connections from Actors to Use Cases -->
        <mxCell id="e_g1" style="endArrow=none;html=1;strokeColor=#0284c7;strokeWidth=1.5;" edge="1" parent="1" source="act_guest" target="uc01" />
        <mxCell id="e_g2" style="endArrow=none;html=1;strokeColor=#0284c7;strokeWidth=1.5;" edge="1" parent="1" source="act_guest" target="uc_cart" />
        <mxCell id="e_g3" style="endArrow=none;html=1;strokeColor=#0284c7;strokeWidth=1.5;" edge="1" parent="1" source="act_guest" target="uc05" />

        <mxCell id="e_c1" style="endArrow=none;html=1;strokeColor=#059669;strokeWidth=1.5;" edge="1" parent="1" source="act_customer" target="uc01" />
        <mxCell id="e_c2" style="endArrow=none;html=1;strokeColor=#059669;strokeWidth=1.5;" edge="1" parent="1" source="act_customer" target="uc02" />
        <mxCell id="e_c3" style="endArrow=none;html=1;strokeColor=#059669;strokeWidth=1.5;" edge="1" parent="1" source="act_customer" target="uc_cancel" />
        <mxCell id="e_c4" style="endArrow=none;html=1;strokeColor=#059669;strokeWidth=1.5;" edge="1" parent="1" source="act_customer" target="uc04" />
        <mxCell id="e_c5" style="endArrow=none;html=1;strokeColor=#059669;strokeWidth=1.5;" edge="1" parent="1" source="act_customer" target="uc05" />

        <mxCell id="e_b1" style="endArrow=none;html=1;strokeColor=#d97706;strokeWidth=1.5;" edge="1" parent="1" source="act_b2b" target="uc02" />
        <mxCell id="e_b2" style="endArrow=none;html=1;strokeColor=#d97706;strokeWidth=1.5;" edge="1" parent="1" source="act_b2b" target="uc01" />

        <mxCell id="e_a1" style="endArrow=none;html=1;strokeColor=#dc2626;strokeWidth=1.5;" edge="1" parent="1" source="act_admin" target="uc03" />
        <mxCell id="e_a2" style="endArrow=none;html=1;strokeColor=#dc2626;strokeWidth=1.5;" edge="1" parent="1" source="act_admin" target="uc_cat" />
        <mxCell id="e_a3" style="endArrow=none;html=1;strokeColor=#dc2626;strokeWidth=1.5;" edge="1" parent="1" source="act_admin" target="uc_order_admin" />
        <mxCell id="e_a4" style="endArrow=none;html=1;strokeColor=#dc2626;strokeWidth=1.5;" edge="1" parent="1" source="act_admin" target="uc_kpi" />

        <mxCell id="e_p1" style="endArrow=none;html=1;strokeColor=#7c3aed;strokeWidth=1.5;" edge="1" parent="1" source="act_provider" target="uc_provider_iso" />
    """
    xml = wrap_drawio_xml("Hinh 3.1: Sơ đồ Ca sử dụng tổng quát", cells, 1340, 800)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_3_1_usecase_tong_quat.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_3_1_usecase_tong_quat.drawio")

# ==============================================================================
# 3. HÌNH 3.2: SƠ ĐỒ ACTIVITY QUY TRÌNH TRA CỨU & LỌC TOUR (UC01)
# ==============================================================================
def build_hinh_3_2():
    print("  -> Đang dựng Hình 3.2: Sơ đồ Activity UC01...")
    cells = """
        <!-- Title -->
        <mxCell id="t" value="SƠ ĐỒ ACTIVITY: TRA CỨU VÀ TÌM KIẾM TOUR ĐA TIÊU CHÍ (UC01)" style="rounded=1;whiteSpace=wrap;html=1;fontSize=14;fontStyle=1;fillColor=#0284c7;strokeColor=#0369a1;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="100" y="20" width="800" height="40" as="geometry" />
        </mxCell>

        <!-- Swimlane Khách Hàng -->
        <mxCell id="sw_user" value="KHÁCH HÀNG (USER / CLIENT)" style="swimlane;startSize=30;fillColor=#f0f9ff;strokeColor=#0284c7;fontColor=#0369a1;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="80" width="380" height="660" as="geometry" />
        </mxCell>
        <!-- Swimlane Hệ Thống -->
        <mxCell id="sw_sys" value="HỆ THỐNG (BACKEND SPRING BOOT &amp; MARIADB)" style="swimlane;startSize=30;fillColor=#f8fafc;strokeColor=#64748b;fontColor=#334155;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="500" y="80" width="400" height="660" as="geometry" />
        </mxCell>

        <!-- User Start -->
        <mxCell id="start" value="" style="ellipse;fillColor=#0f172a;strokeColor=none;" vertex="1" parent="sw_user">
          <mxGeometry x="175" y="50" width="30" height="30" as="geometry" />
        </mxCell>
        <mxCell id="u_act1" value="Truy cập Trang chủ hoặc&#xa;Trang Danh sách tour (/tours)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#0284c7;" vertex="1" parent="sw_user">
          <mxGeometry x="90" y="110" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="u_act2" value="Nhập từ khóa hoặc chọn:&#xa;• Tuyến danh mục (1 - 8)&#xa;• Điểm khởi hành (Hà Nội, TP.HCM...)&#xa;• Ngân sách, thời lượng, số sao" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#0284c7;" vertex="1" parent="sw_user">
          <mxGeometry x="90" y="190" width="200" height="70" as="geometry" />
        </mxCell>

        <!-- System Processing -->
        <mxCell id="s_act1" value="Tiếp nhận Query Params&#xa;tại TourController.filterTours()" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="100" y="195" width="200" height="55" as="geometry" />
        </mxCell>
        <mxCell id="s_dec1" value="Có điều kiện&#xa;lọc không?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_sys">
          <mxGeometry x="135" y="280" width="130" height="70" as="geometry" />
        </mxCell>
        <mxCell id="s_act2" value="Khởi tạo Dynamic JPA&#xa;TourSpecification.withFilter()" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="30" y="380" width="160" height="50" as="geometry" />
        </mxCell>
        <mxCell id="s_act3" value="Lấy toàn bộ tour ACTIVE&#xa;với sắp xếp bestseller mặc định" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="210" y="380" width="165" height="50" as="geometry" />
        </mxCell>
        <mxCell id="s_act4" value="Truy vấn MariaDB qua HikariCP:&#xa;SELECT * FROM tours WHERE ..." style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#059669;fontColor=#065f46;" vertex="1" parent="sw_sys">
          <mxGeometry x="100" y="460" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="s_dec2" value="Kết quả&#xa;tìm thấy?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_sys">
          <mxGeometry x="140" y="540" width="120" height="60" as="geometry" />
        </mxCell>

        <!-- User Result -->
        <mxCell id="u_res_empty" value="Hiển thị Empty State:&#xa;'Không tìm thấy tour phù hợp'&#xa;+ Gợi ý các tour Bán chạy nhất" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;" vertex="1" parent="sw_user">
          <mxGeometry x="20" y="540" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="u_res_list" value="Kết xuất lưới danh sách tour&#xa;Traveloka Bento (9 tour/trang)&#xa;kèm số chỗ &amp; lịch khởi hành" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;" vertex="1" parent="sw_user">
          <mxGeometry x="200" y="540" width="165" height="60" as="geometry" />
        </mxCell>
        <mxCell id="end" value="" style="ellipse;fillColor=#0f172a;strokeColor=#cbd5e1;strokeWidth=3;" vertex="1" parent="sw_user">
          <mxGeometry x="175" y="620" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- Edges -->
        <mxCell id="e1" style="endArrow=block;html=1;strokeColor=#0284c7;" edge="1" parent="1" source="start" target="u_act1" />
        <mxCell id="e2" style="endArrow=block;html=1;strokeColor=#0284c7;" edge="1" parent="1" source="u_act1" target="u_act2" />
        <mxCell id="e3" style="endArrow=block;html=1;strokeColor=#0284c7;" edge="1" parent="1" source="u_act2" target="s_act1" />
        <mxCell id="e4" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act1" target="s_dec1" />
        <mxCell id="e5" value="Có" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_dec1" target="s_act2" />
        <mxCell id="e6" value="Không" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_dec1" target="s_act3" />
        <mxCell id="e7" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act2" target="s_act4" />
        <mxCell id="e8" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act3" target="s_act4" />
        <mxCell id="e9" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act4" target="s_dec2" />
        <mxCell id="e10" value="0 tour" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="s_dec2" target="u_res_empty" />
        <mxCell id="e11" value="> 0 tour" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="s_dec2" target="u_res_list" />
        <mxCell id="e12" style="endArrow=block;html=1;strokeColor=#0f172a;" edge="1" parent="1" source="u_res_empty" target="end" />
        <mxCell id="e13" style="endArrow=block;html=1;strokeColor=#0f172a;" edge="1" parent="1" source="u_res_list" target="end" />
    """
    xml = wrap_drawio_xml("Hinh 3.2: Sơ đồ Activity UC01", cells, 1020, 780)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_3_2_activity_uc01_tra_cuu_tour.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_3_2_activity_uc01_tra_cuu_tour.drawio")

# ==============================================================================
# 4. HÌNH 3.4: SƠ ĐỒ ACTIVITY ĐẶT TOUR ĐOÀN B2B & CHIẾT KHẤU BẬC THANG (UC02)
# ==============================================================================
def build_hinh_3_4():
    print("  -> Đang dựng Hình 3.4: Sơ đồ Activity UC02...")
    cells = """
        <!-- Title -->
        <mxCell id="t" value="SƠ ĐỒ ACTIVITY: ĐẶT TOUR ĐOÀN B2B VÀ TÍNH CHIẾT KHẤU BẬC THANG (UC02)" style="rounded=1;whiteSpace=wrap;html=1;fontSize=14;fontStyle=1;fillColor=#d97706;strokeColor=#b45309;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="100" y="20" width="860" height="40" as="geometry" />
        </mxCell>

        <!-- Swimlane Khách Hàng B2B -->
        <mxCell id="sw_b2b" value="DOANH NGHIỆP B2B (FPT_CORP)" style="swimlane;startSize=30;fillColor=#fffbeb;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="80" width="400" height="690" as="geometry" />
        </mxCell>
        <!-- Swimlane Hệ Thống -->
        <mxCell id="sw_sys" value="HỆ THỐNG DU LỊCH VIỆT (ORDER SERVICE &amp; DB)" style="swimlane;startSize=30;fillColor=#f8fafc;strokeColor=#64748b;fontColor=#334155;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="520" y="80" width="440" height="690" as="geometry" />
        </mxCell>

        <mxCell id="start" value="" style="ellipse;fillColor=#0f172a;strokeColor=none;" vertex="1" parent="sw_b2b">
          <mxGeometry x="185" y="45" width="30" height="30" as="geometry" />
        </mxCell>
        <mxCell id="b_act1" value="Chọn hành trình &amp; Nhập số lượng vé&#xa;(Ví dụ: Đoàn 15 khách teambuilding)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d97706;" vertex="1" parent="sw_b2b">
          <mxGeometry x="100" y="100" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="b_act2" value="Tick chọn 'Đặt tour B2B', nhập:&#xa;• Tên công ty &amp; Mã số thuế&#xa;• Địa chỉ xuất hóa đơn VAT&#xa;• Chọn phương thức thanh toán" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#d97706;" vertex="1" parent="sw_b2b">
          <mxGeometry x="100" y="175" width="200" height="75" as="geometry" />
        </mxCell>

        <!-- System Discount Engine -->
        <mxCell id="s_act1" value="Kích hoạt thuật toán chiết khấu&#xa;OrderService.calculateDiscountPercentage()" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="110" y="180" width="220" height="55" as="geometry" />
        </mxCell>
        <mxCell id="s_dec1" value="Số khách (N)&#xa;thuộc bậc nào?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_sys">
          <mxGeometry x="145" y="260" width="150" height="70" as="geometry" />
        </mxCell>

        <mxCell id="tier_0" value="N &lt; 10 khách:&#xa;Chiết khấu 0% (Giá gốc)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="10" y="350" width="130" height="45" as="geometry" />
        </mxCell>
        <mxCell id="tier_5" value="10 ≤ N ≤ 19 khách:&#xa;Chiết khấu 5% tổng tiền" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontStyle=1;fontColor=#065f46;" vertex="1" parent="sw_sys">
          <mxGeometry x="150" y="350" width="140" height="45" as="geometry" />
        </mxCell>
        <mxCell id="tier_10" value="N ≥ 20 khách:&#xa;Chiết khấu 10% tổng tiền" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e0f2fe;strokeColor=#0284c7;fontStyle=1;fontColor=#0369a1;" vertex="1" parent="sw_sys">
          <mxGeometry x="300" y="350" width="135" height="45" as="geometry" />
        </mxCell>

        <mxCell id="s_act2" value="Giữ khóa bi quan @Lock PESSIMISTIC_WRITE&#xa;và kiểm tra số chỗ trống khả dụng" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="110" y="425" width="220" height="50" as="geometry" />
        </mxCell>

        <mxCell id="s_dec2" value="Đủ chỗ&#xa;trống?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_sys">
          <mxGeometry x="165" y="500" width="110" height="60" as="geometry" />
        </mxCell>

        <mxCell id="s_fail" value="Ném OverbookingException&#xa;Thông báo tour không đủ số chỗ" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;" vertex="1" parent="sw_sys">
          <mxGeometry x="250" y="585" width="170" height="50" as="geometry" />
        </mxCell>

        <mxCell id="s_success" value="1. Khấu trừ số vé nguyên tử&#xa;2. Tạo bản ghi đơn hàng B2B&#xa;3. Ghi vết telemetry (+5đ BOOK)&#xa;4. Xuất mã E-Ticket &amp; Hóa đơn VAT" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontStyle=1;align=left;spacingLeft=10;" vertex="1" parent="sw_sys">
          <mxGeometry x="20" y="580" width="200" height="70" as="geometry" />
        </mxCell>

        <mxCell id="end" value="" style="ellipse;fillColor=#0f172a;strokeColor=#cbd5e1;strokeWidth=3;" vertex="1" parent="sw_b2b">
          <mxGeometry x="185" y="600" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- Edges -->
        <mxCell id="e1" style="endArrow=block;html=1;strokeColor=#d97706;" edge="1" parent="1" source="start" target="b_act1" />
        <mxCell id="e2" style="endArrow=block;html=1;strokeColor=#d97706;" edge="1" parent="1" source="b_act1" target="b_act2" />
        <mxCell id="e3" style="endArrow=block;html=1;strokeColor=#d97706;" edge="1" parent="1" source="b_act2" target="s_act1" />
        <mxCell id="e4" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act1" target="s_dec1" />
        <mxCell id="e5_1" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_dec1" target="tier_0" />
        <mxCell id="e5_2" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="s_dec1" target="tier_5" />
        <mxCell id="e5_3" style="endArrow=block;html=1;strokeColor=#0284c7;" edge="1" parent="1" source="s_dec1" target="tier_10" />
        <mxCell id="e6_1" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="tier_0" target="s_act2" />
        <mxCell id="e6_2" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="tier_5" target="s_act2" />
        <mxCell id="e6_3" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="tier_10" target="s_act2" />
        <mxCell id="e7" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act2" target="s_dec2" />
        <mxCell id="e8" value="Đủ" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="s_dec2" target="s_success" />
        <mxCell id="e9" value="Thiếu" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="s_dec2" target="s_fail" />
        <mxCell id="e10" style="endArrow=block;html=1;strokeColor=#0f172a;" edge="1" parent="1" source="s_success" target="end" />
    """
    xml = wrap_drawio_xml("Hinh 3.4: Sơ đồ Activity UC02", cells, 1080, 800)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_3_4_activity_uc02_dat_tour_b2b.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_3_4_activity_uc02_dat_tour_b2b.drawio")

# ==============================================================================
# 5. HÌNH 3.6: SƠ ĐỒ ACTIVITY CƠ CHẾ SAFE DELETE (UC03)
# ==============================================================================
def build_hinh_3_6():
    print("  -> Đang dựng Hình 3.6: Sơ đồ Activity UC03 Safe Delete...")
    cells = """
        <!-- Title -->
        <mxCell id="t" value="SƠ ĐỒ ACTIVITY: CƠ CHẾ KIỂM SOÁT XÓA AN TOÀN SAFE DELETE (UC03)" style="rounded=1;whiteSpace=wrap;html=1;fontSize=14;fontStyle=1;fillColor=#dc2626;strokeColor=#991b1b;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="100" y="20" width="820" height="40" as="geometry" />
        </mxCell>

        <!-- Swimlane Admin -->
        <mxCell id="sw_admin" value="QUẢN TRỊ VIÊN HỆ THỐNG (ADMINISTRATOR)" style="swimlane;startSize=30;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="80" width="380" height="660" as="geometry" />
        </mxCell>
        <!-- Swimlane Hệ Thống -->
        <mxCell id="sw_sys" value="HỆ THỐNG KIỂM SOÁT TÍNH TOÀN VẸN (TOUR SERVICE &amp; DB)" style="swimlane;startSize=30;fillColor=#f8fafc;strokeColor=#64748b;fontColor=#334155;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="500" y="80" width="420" height="660" as="geometry" />
        </mxCell>

        <mxCell id="start" value="" style="ellipse;fillColor=#0f172a;strokeColor=none;" vertex="1" parent="sw_admin">
          <mxGeometry x="175" y="45" width="30" height="30" as="geometry" />
        </mxCell>
        <mxCell id="a_act1" value="Truy cập Bảng Quản trị Tour (/admin/tours)&#xa;hoặc Quản lý Danh mục (/admin/categories)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#dc2626;" vertex="1" parent="sw_admin">
          <mxGeometry x="80" y="100" width="220" height="50" as="geometry" />
        </mxCell>
        <mxCell id="a_act2" value="Nhấn nút 'Xóa' trên một Tour&#xa;hoặc một Danh mục cụ thể" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#dc2626;" vertex="1" parent="sw_admin">
          <mxGeometry x="90" y="180" width="200" height="50" as="geometry" />
        </mxCell>

        <!-- System Validation -->
        <mxCell id="s_act1" value="Tiếp nhận DELETE Request&#xa;Kiểm tra đối tượng cần xóa" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="110" y="180" width="200" height="50" as="geometry" />
        </mxCell>
        <mxCell id="s_act2" value="Truy vấn kiểm tra toàn vẹn:&#xa;• Nếu là Tour: OrderDetailRepository.countByTourId()&#xa;• Nếu là Danh mục: TourRepository.countByCategoryId()" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="80" y="260" width="260" height="60" as="geometry" />
        </mxCell>

        <mxCell id="s_dec1" value="Số ràng buộc&#xa;phát sinh &gt; 0?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_sys">
          <mxGeometry x="140" y="350" width="140" height="70" as="geometry" />
        </mxCell>

        <mxCell id="s_blocked" value="KÍCH HOẠT RÀO CHẮN AN TOÀN:&#xa;• Ném ApiException(HTTP 400 Bad Request)&#xa;• Từ chối lệnh xóa cứng khỏi Database&#xa;• Bảo toàn lịch sử kế toán đơn hàng" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;fontStyle=1;align=left;spacingLeft=10;" vertex="1" parent="sw_sys">
          <mxGeometry x="10" y="450" width="210" height="80" as="geometry" />
        </mxCell>
        <mxCell id="s_allowed" value="CHO PHÉP XÓA AN TOÀN:&#xa;• Xóa bản ghi trong Database&#xa;• Xóa sạch Cache @CacheEvict&#xa;• Trả về HTTP 200 OK thành công" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontStyle=1;align=left;spacingLeft=10;" vertex="1" parent="sw_sys">
          <mxGeometry x="240" y="450" width="170" height="80" as="geometry" />
        </mxCell>

        <!-- Admin Alerts -->
        <mxCell id="a_alert" value="Hiển thị Modal Cảnh Báo An Toàn:&#xa;'Không thể xóa do đã phát sinh dữ liệu!&#xa;Hệ thống đề xuất: Chuyển sang TẠM ẨN'" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;fontStyle=1;" vertex="1" parent="sw_admin">
          <mxGeometry x="70" y="455" width="240" height="70" as="geometry" />
        </mxCell>
        <mxCell id="a_toggle" value="Admin bấm nút 'Tạm ẩn'&#xa;-> Cập nhật status='INACTIVE'&#xa;(Ẩn khỏi Catalog nhưng giữ đơn)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_admin">
          <mxGeometry x="85" y="555" width="210" height="60" as="geometry" />
        </mxCell>
        <mxCell id="end" value="" style="ellipse;fillColor=#0f172a;strokeColor=#cbd5e1;strokeWidth=3;" vertex="1" parent="sw_admin">
          <mxGeometry x="175" y="630" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- Edges -->
        <mxCell id="e1" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="start" target="a_act1" />
        <mxCell id="e2" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="a_act1" target="a_act2" />
        <mxCell id="e3" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="a_act2" target="s_act1" />
        <mxCell id="e4" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act1" target="s_act2" />
        <mxCell id="e5" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act2" target="s_dec1" />
        <mxCell id="e6_yes" value="Có đơn hàng" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="s_dec1" target="s_blocked" />
        <mxCell id="e6_no" value="Chưa có đơn" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="s_dec1" target="s_allowed" />
        <mxCell id="e7" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="s_blocked" target="a_alert" />
        <mxCell id="e8" style="endArrow=block;html=1;strokeColor=#d97706;" edge="1" parent="1" source="a_alert" target="a_toggle" />
        <mxCell id="e9" style="endArrow=block;html=1;strokeColor=#0f172a;" edge="1" parent="1" source="a_toggle" target="end" />
        <mxCell id="e10" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="s_allowed" target="end" />
    """
    xml = wrap_drawio_xml("Hinh 3.6: Sơ đồ Activity UC03 Safe Delete", cells, 1020, 780)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_3_6_activity_uc03_safe_delete.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_3_6_activity_uc03_safe_delete.drawio")

# ==============================================================================
# 6. HÌNH 3.8: SƠ ĐỒ ACTIVITY THUẬT TOÁN GỢI Ý TOUR CÁ NHÂN HÓA (UC04)
# ==============================================================================
def build_hinh_3_8():
    print("  -> Đang dựng Hình 3.8: Sơ đồ Activity UC04 Gợi ý cá nhân hóa...")
    cells = """
        <!-- Title -->
        <mxCell id="t" value="SƠ ĐỒ ACTIVITY: THUẬT TOÁN GỢI Ý TOUR CÁ NHÂN HÓA THEO MA TRẬN TRỌNG SỐ (UC04)" style="rounded=1;whiteSpace=wrap;html=1;fontSize=14;fontStyle=1;fillColor=#059669;strokeColor=#047857;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="100" y="20" width="860" height="40" as="geometry" />
        </mxCell>

        <!-- Swimlane Khách Hàng -->
        <mxCell id="sw_user" value="HÀNH VI KHÁCH HÀNG (CUSTOMER ACTIONS)" style="swimlane;startSize=30;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="80" width="380" height="660" as="geometry" />
        </mxCell>
        <!-- Swimlane Hệ Thống Gợi Ý -->
        <mxCell id="sw_sys" value="BỘ MÁY GỢI Ý THÔNG MINH (RECOMMENDATION ENGINE &amp; DB)" style="swimlane;startSize=30;fillColor=#f8fafc;strokeColor=#64748b;fontColor=#334155;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="500" y="80" width="460" height="660" as="geometry" />
        </mxCell>

        <mxCell id="start" value="" style="ellipse;fillColor=#0f172a;strokeColor=none;" vertex="1" parent="sw_user">
          <mxGeometry x="175" y="45" width="30" height="30" as="geometry" />
        </mxCell>
        <mxCell id="u_act1" value="Khách hàng lướt web và tương tác:&#xa;• Xem chi tiết một tour du lịch&#xa;• Thêm tour vào Giỏ hàng / Wishlist&#xa;• Tiến hành Đặt vé tour" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#059669;" vertex="1" parent="sw_user">
          <mxGeometry x="80" y="100" width="220" height="70" as="geometry" />
        </mxCell>

        <mxCell id="s_act1" value="Ghi vết sự kiện tự động (Activity Logger):&#xa;• VIEW = +1 điểm&#xa;• WISHLIST / CART = +3 điểm&#xa;• BOOK = +5 điểm" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;align=left;spacingLeft=10;" vertex="1" parent="sw_sys">
          <mxGeometry x="110" y="100" width="240" height="70" as="geometry" />
        </mxCell>
        <mxCell id="s_act2" value="Lưu vào bảng user_activity_history:&#xa;(user_id, session_id, tour_id, score)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="110" y="195" width="240" height="50" as="geometry" />
        </mxCell>

        <mxCell id="u_act2" value="Người dùng mở Trang chủ hoặc&#xa;cuộn xuống mục 'Gợi ý dành cho bạn'" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#059669;" vertex="1" parent="sw_user">
          <mxGeometry x="80" y="270" width="220" height="50" as="geometry" />
        </mxCell>

        <mxCell id="s_act3" value="Truy vấn tổng hợp trọng số:&#xa;SELECT category_id, SUM(score)&#xa;GROUP BY category_id ORDER BY score DESC" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;fontColor=#0f172a;" vertex="1" parent="sw_sys">
          <mxGeometry x="100" y="270" width="260" height="55" as="geometry" />
        </mxCell>
        <mxCell id="s_dec1" value="Người dùng&#xa;đã có lịch sử?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_sys">
          <mxGeometry x="170" y="355" width="120" height="65" as="geometry" />
        </mxCell>

        <mxCell id="s_fallback" value="Cold-Start Fallback:&#xa;Lấy Top các tour có rating cao nhất&#xa;và số lượt đặt cao nhất hệ thống" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;" vertex="1" parent="sw_sys">
          <mxGeometry x="250" y="445" width="190" height="55" as="geometry" />
        </mxCell>
        <mxCell id="s_personalized" value="Ma Trận Cá Nhân Hóa:&#xa;Lấy Top 2 danh mục có điểm cao nhất&#xa;-> Chọn các tour điểm cao tương ứng&#xa;-> Loại trừ các tour khách đã đặt vé" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontStyle=1;align=left;spacingLeft=10;" vertex="1" parent="sw_sys">
          <mxGeometry x="20" y="440" width="210" height="65" as="geometry" />
        </mxCell>

        <mxCell id="s_act4" value="Đóng gói Top 4 TourDto kèm thẻ&#xa;huy hiệu 'Dành riêng cho bạn'" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#059669;fontStyle=1;" vertex="1" parent="sw_sys">
          <mxGeometry x="120" y="535" width="220" height="45" as="geometry" />
        </mxCell>

        <mxCell id="u_render" value="Render thanh Carousel 4 thẻ tour&#xa;cá nhân hóa với hiệu ứng mượt mà" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;fontStyle=1;" vertex="1" parent="sw_user">
          <mxGeometry x="80" y="535" width="220" height="45" as="geometry" />
        </mxCell>
        <mxCell id="end" value="" style="ellipse;fillColor=#0f172a;strokeColor=#cbd5e1;strokeWidth=3;" vertex="1" parent="sw_user">
          <mxGeometry x="175" y="610" width="30" height="30" as="geometry" />
        </mxCell>

        <!-- Edges -->
        <mxCell id="e1" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="start" target="u_act1" />
        <mxCell id="e2" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="u_act1" target="s_act1" />
        <mxCell id="e3" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act1" target="s_act2" />
        <mxCell id="e4" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="u_act2" target="s_act3" />
        <mxCell id="e5" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_act3" target="s_dec1" />
        <mxCell id="e6_yes" value="Có" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="s_dec1" target="s_personalized" />
        <mxCell id="e6_no" value="Chưa có" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_dec1" target="s_fallback" />
        <mxCell id="e7_1" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_personalized" target="s_act4" />
        <mxCell id="e7_2" style="endArrow=block;html=1;strokeColor=#64748b;" edge="1" parent="1" source="s_fallback" target="s_act4" />
        <mxCell id="e8" style="endArrow=block;html=1;strokeColor=#059669;" edge="1" parent="1" source="s_act4" target="u_render" />
        <mxCell id="e9" style="endArrow=block;html=1;strokeColor=#0f172a;" edge="1" parent="1" source="u_render" target="end" />
    """
    xml = wrap_drawio_xml("Hinh 3.8: Sơ đồ Activity UC04", cells, 1060, 780)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_3_8_activity_uc04_goi_y_ca_nhan_hoa.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_3_8_activity_uc04_goi_y_ca_nhan_hoa.drawio")

# ==============================================================================
# 7. HÌNH 3.11: SƠ ĐỒ LỚP THỰC THỂ HỆ THỐNG (UML CLASS DIAGRAM - JPA ENTITIES)
# ==============================================================================
def build_hinh_3_11():
    print("  -> Đang dựng Hình 3.11: Sơ đồ Lớp Thực thể JPA (Class Diagram)...")
    cells = """
        <!-- Title Banner -->
        <mxCell id="t0" value="HỆ THỐNG DU LỊCH VIỆT — SƠ ĐỒ LỚP THỰC THỂ HỆ THỐNG (JPA ENTITY CLASS DIAGRAM)" style="rounded=1;whiteSpace=wrap;html=1;fontSize=15;fontStyle=1;fillColor=#1e293b;strokeColor=#0f172a;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="50" y="20" width="1340" height="42" as="geometry" />
        </mxCell>

        <!-- CLASS: User -->
        <mxCell id="c_user" value="User&#xa;(Bảng: Users)" style="swimlane;fontStyle=1;align=center;startSize=26;fillColor=#e0f2fe;strokeColor=#0284c7;fontColor=#0369a1;" vertex="1" parent="1">
          <mxGeometry x="60" y="90" width="230" height="230" as="geometry" />
        </mxCell>
        <mxCell id="c_user_f" value="- id: Integer {PK}&#xa;- username: String&#xa;- password: String (BCrypt)&#xa;- email: String&#xa;- fullName: String&#xa;- role: String (ADMIN/CUSTOMER/PROVIDER)&#xa;- phone: String&#xa;- membershipTier: String&#xa;- loyaltyPoints: Integer&#xa;- totalSpent: BigDecimal&#xa;- active: Boolean&#xa;- createdAt: LocalDateTime" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="c_user">
          <mxGeometry y="30" width="230" height="190" as="geometry" />
        </mxCell>

        <!-- CLASS: Category -->
        <mxCell id="c_cat" value="Category&#xa;(Bảng: Categories)" style="swimlane;fontStyle=1;align=center;startSize=26;fillColor=#ecfdf5;strokeColor=#059669;fontColor=#065f46;" vertex="1" parent="1">
          <mxGeometry x="360" y="90" width="210" height="160" as="geometry" />
        </mxCell>
        <mxCell id="c_cat_f" value="- id: Integer {PK}&#xa;- name: String&#xa;- description: String&#xa;- imageUrl: String&#xa;- status: String (ACTIVE/INACTIVE)&#xa;+ countTours(): Long" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="c_cat">
          <mxGeometry y="30" width="210" height="120" as="geometry" />
        </mxCell>

        <!-- CLASS: Tour -->
        <mxCell id="c_tour" value="Tour&#xa;(Bảng: Tours)" style="swimlane;fontStyle=1;align=center;startSize=26;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;" vertex="1" parent="1">
          <mxGeometry x="640" y="90" width="250" height="290" as="geometry" />
        </mxCell>
        <mxCell id="c_tour_f" value="- id: Integer {PK}&#xa;- name: String&#xa;- description: String&#xa;- price: BigDecimal&#xa;- originalPrice: BigDecimal&#xa;- duration: Integer&#xa;- departureLocation: String&#xa;- vehicle: String&#xa;- hotelStar: Integer&#xa;- badge: String&#xa;- availableSeats: Integer&#xa;- startDate: LocalDate&#xa;- endDate: LocalDate&#xa;- status: String (ACTIVE/INACTIVE)&#xa;- rating: Double&#xa;- category: Category {FK}&#xa;- provider: User {FK}" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="c_tour">
          <mxGeometry y="30" width="250" height="250" as="geometry" />
        </mxCell>

        <!-- CLASS: Order -->
        <mxCell id="c_order" value="Order&#xa;(Bảng: Orders)" style="swimlane;fontStyle=1;align=center;startSize=26;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;" vertex="1" parent="1">
          <mxGeometry x="960" y="90" width="250" height="300" as="geometry" />
        </mxCell>
        <mxCell id="c_order_f" value="- id: Integer {PK}&#xa;- orderCode: String&#xa;- user: User {FK}&#xa;- orderDate: LocalDateTime&#xa;- totalAmount: BigDecimal&#xa;- status: String (PENDING/CONFIRMED...)&#xa;- contactName: String&#xa;- contactPhone: String&#xa;- paymentMethod: String (VIETQR/VNPAY...)&#xa;- paymentStatus: String (PAID/UNPAID...)&#xa;- isB2B: Boolean&#xa;- discountPercent: Integer&#xa;- depositPercent: Integer&#xa;- depositAmount: BigDecimal&#xa;- cancellationFeePercent: Integer" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="c_order">
          <mxGeometry y="30" width="250" height="260" as="geometry" />
        </mxCell>

        <!-- CLASS: OrderDetail -->
        <mxCell id="c_detail" value="OrderDetail&#xa;(Bảng: OrderDetails)" style="swimlane;fontStyle=1;align=center;startSize=26;fillColor=#ffffff;strokeColor=#64748b;fontColor=#0f172a;" vertex="1" parent="1">
          <mxGeometry x="960" y="440" width="220" height="150" as="geometry" />
        </mxCell>
        <mxCell id="c_detail_f" value="- id: Integer {PK}&#xa;- order: Order {FK}&#xa;- tour: Tour {FK}&#xa;- quantity: Integer&#xa;- price: BigDecimal&#xa;+ calculateSubtotal(): BigDecimal" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="c_detail">
          <mxGeometry y="30" width="220" height="110" as="geometry" />
        </mxCell>

        <!-- CLASS: UserActivityHistory -->
        <mxCell id="c_act" value="UserActivityHistory&#xa;(Bảng: UserActivityHistory)" style="swimlane;fontStyle=1;align=center;startSize=26;fillColor=#f5f3ff;strokeColor=#7c3aed;fontColor=#5b21b6;" vertex="1" parent="1">
          <mxGeometry x="640" y="440" width="240" height="160" as="geometry" />
        </mxCell>
        <mxCell id="c_act_f" value="- id: Long {PK}&#xa;- user: User {FK, nullable}&#xa;- sessionId: String&#xa;- tour: Tour {FK}&#xa;- activityType: String (VIEW/CART/BOOK)&#xa;- score: Integer (1 / 3 / 5)&#xa;- createdAt: LocalDateTime" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="c_act">
          <mxGeometry y="30" width="240" height="120" as="geometry" />
        </mxCell>

        <!-- CLASS: Company -->
        <mxCell id="c_comp" value="Company&#xa;(Bảng: Companies)" style="swimlane;fontStyle=1;align=center;startSize=26;fillColor=#fffbeb;strokeColor=#d97706;fontColor=#92400e;" vertex="1" parent="1">
          <mxGeometry x="60" y="380" width="230" height="170" as="geometry" />
        </mxCell>
        <mxCell id="c_comp_f" value="- id: Integer {PK}&#xa;- name: String&#xa;- taxCode: String&#xa;- billingAddress: String&#xa;- contactEmail: String&#xa;- contactPhone: String&#xa;- createdAt: LocalDateTime" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="c_comp">
          <mxGeometry y="30" width="230" height="130" as="geometry" />
        </mxCell>

        <!-- CLASS: CorporateUser -->
        <mxCell id="c_corp_user" value="CorporateUser&#xa;(Bảng: CorporateUsers)" style="swimlane;fontStyle=1;align=center;startSize=26;fillColor=#fffbeb;strokeColor=#d97706;fontColor=#92400e;" vertex="1" parent="1">
          <mxGeometry x="360" y="380" width="220" height="160" as="geometry" />
        </mxCell>
        <mxCell id="c_corp_user_f" value="- id: Integer {PK}&#xa;- user: User {FK}&#xa;- company: Company {FK}&#xa;- employeeCode: String&#xa;- department: String&#xa;- isAuthorizedBooker: Boolean" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="c_corp_user">
          <mxGeometry y="30" width="220" height="120" as="geometry" />
        </mxCell>

        <!-- Relationships -->
        <!-- User - Order (1 - N) -->
        <mxCell id="r_u_o" value="1        0..*" style="endArrow=open;html=1;strokeColor=#dc2626;strokeWidth=1.5;" edge="1" parent="1" source="c_user" target="c_order">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <!-- Category - Tour (1 - N) -->
        <mxCell id="r_c_t" value="1        0..*" style="endArrow=open;html=1;strokeColor=#059669;strokeWidth=1.5;" edge="1" parent="1" source="c_cat" target="c_tour">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <!-- Order - OrderDetail (1 - N Composition) -->
        <mxCell id="r_o_d" value="1        1..*" style="endArrow=diamondThin;endFill=1;html=1;strokeColor=#dc2626;strokeWidth=1.5;" edge="1" parent="1" source="c_detail" target="c_order">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <!-- Tour - OrderDetail (1 - N) -->
        <mxCell id="r_t_d" value="1        0..*" style="endArrow=open;html=1;strokeColor=#d97706;strokeWidth=1.5;" edge="1" parent="1" source="c_tour" target="c_detail">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <!-- Tour - Activity (1 - N) -->
        <mxCell id="r_t_a" value="1        0..*" style="endArrow=open;html=1;strokeColor=#7c3aed;strokeWidth=1.5;" edge="1" parent="1" source="c_tour" target="c_act">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <!-- Company - CorporateUser (1 - N) -->
        <mxCell id="r_cp_u" value="1        0..*" style="endArrow=open;html=1;strokeColor=#d97706;strokeWidth=1.5;" edge="1" parent="1" source="c_comp" target="c_corp_user">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
    """
    xml = wrap_drawio_xml("Hinh 3.11: Sơ đồ Lớp Thực thể JPA Class Diagram", cells, 1440, 720)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_3_11_class_diagram_jpa_entities.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_3_11_class_diagram_jpa_entities.drawio")

# ==============================================================================
# 8. HÌNH 3.12: SƠ ĐỒ THỰC THỂ QUAN HỆ ERD 3NF
# ==============================================================================
def build_hinh_3_12():
    print("  -> Đang dựng Hình 3.12: Sơ đồ Thực thể Quan hệ CSDL ERD 3NF...")
    # Use sqlerd logic or native table XML according to diagram-types.md
    cells = """
        <!-- Title Banner -->
        <mxCell id="t0" value="HỆ THỐNG DU LỊCH VIỆT — SƠ ĐỒ THỰC THỂ QUAN HỆ CƠ SỞ DỮ LIỆU (ERD 3NF)" style="rounded=1;whiteSpace=wrap;html=1;fontSize=15;fontStyle=1;fillColor=#1e293b;strokeColor=#0f172a;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="50" y="20" width="1400" height="42" as="geometry" />
        </mxCell>

        <!-- TABLE: USERS -->
        <mxCell id="tb_users" value="USERS&#xa;(Người dùng hệ thống)" style="shape=table;startSize=28;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;strokeColor=#0284c7;fillColor=#e0f2fe;fontColor=#0369a1;" vertex="1" parent="1">
          <mxGeometry x="60" y="90" width="250" height="260" as="geometry" />
        </mxCell>
        <mxCell id="u_r1" value="PK  user_id : INT AUTO_INCREMENT" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="28" width="250" height="22" as="geometry" /></mxCell>
        <mxCell id="u_r2" value="     username : VARCHAR(50) UNIQUE" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="50" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r3" value="     password : VARCHAR(255)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="70" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r4" value="     email : VARCHAR(100) UNIQUE" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="90" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r5" value="     full_name : VARCHAR(150)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="110" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r6" value="     role : VARCHAR(20) DEFAULT 'CUSTOMER'" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="130" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r7" value="     phone : VARCHAR(20)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="150" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r8" value="     membership_tier : VARCHAR(30)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="170" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r9" value="     loyalty_points : INT DEFAULT 0" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="190" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r10" value="     total_spent : DECIMAL(18,2)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="210" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="u_r11" value="     is_active : TINYINT(1) DEFAULT 1" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_users"><mxGeometry y="230" width="250" height="20" as="geometry" /></mxCell>

        <!-- TABLE: CATEGORIES -->
        <mxCell id="tb_cat" value="CATEGORIES&#xa;(Danh mục tuyến tour)" style="shape=table;startSize=28;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;strokeColor=#059669;fillColor=#ecfdf5;fontColor=#065f46;" vertex="1" parent="1">
          <mxGeometry x="400" y="90" width="250" height="160" as="geometry" />
        </mxCell>
        <mxCell id="cat_r1" value="PK  category_id : INT AUTO_INCREMENT" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_cat"><mxGeometry y="28" width="250" height="22" as="geometry" /></mxCell>
        <mxCell id="cat_r2" value="     category_name : VARCHAR(100)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_cat"><mxGeometry y="50" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="cat_r3" value="     description : VARCHAR(500)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_cat"><mxGeometry y="70" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="cat_r4" value="     image_url : VARCHAR(500)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_cat"><mxGeometry y="90" width="250" height="20" as="geometry" /></mxCell>
        <mxCell id="cat_r5" value="     status : VARCHAR(20) DEFAULT 'ACTIVE'" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_cat"><mxGeometry y="110" width="250" height="20" as="geometry" /></mxCell>

        <!-- TABLE: TOURS -->
        <mxCell id="tb_tours" value="TOURS&#xa;(Thông tin tour du lịch)" style="shape=table;startSize=28;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;strokeColor=#d97706;fillColor=#fef3c7;fontColor=#92400e;" vertex="1" parent="1">
          <mxGeometry x="740" y="90" width="280" height="300" as="geometry" />
        </mxCell>
        <mxCell id="t_r1" value="PK  tour_id : INT AUTO_INCREMENT" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="28" width="280" height="22" as="geometry" /></mxCell>
        <mxCell id="t_r2" value="FK  category_id : INT NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="50" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r3" value="FK  provider_id : INT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="70" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r4" value="     tour_name : VARCHAR(300) NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="90" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r5" value="     price : DECIMAL(18,2) NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="110" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r6" value="     original_price : DECIMAL(18,2)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="130" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r7" value="     duration : INT NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="150" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r8" value="     departure_location : VARCHAR(200)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="170" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r9" value="     vehicle : VARCHAR(150)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="190" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r10" value="     available_seats : INT DEFAULT 20" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="210" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r11" value="     status : VARCHAR(20) DEFAULT 'ACTIVE'" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="230" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="t_r12" value="     rating : DOUBLE DEFAULT 5.0" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_tours"><mxGeometry y="250" width="280" height="20" as="geometry" /></mxCell>

        <!-- TABLE: ORDERS -->
        <mxCell id="tb_orders" value="ORDERS&#xa;(Đơn đặt tour &amp; Thanh toán)" style="shape=table;startSize=28;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;strokeColor=#dc2626;fillColor=#fee2e2;fontColor=#991b1b;" vertex="1" parent="1">
          <mxGeometry x="1110" y="90" width="280" height="310" as="geometry" />
        </mxCell>
        <mxCell id="o_r1" value="PK  order_id : INT AUTO_INCREMENT" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="28" width="280" height="22" as="geometry" /></mxCell>
        <mxCell id="o_r2" value="     order_code : VARCHAR(30) UNIQUE" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="50" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r3" value="FK  user_id : INT NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="70" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r4" value="     order_date : DATETIME" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="90" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r5" value="     total_amount : DECIMAL(18,2)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="110" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r6" value="     status : VARCHAR(20) DEFAULT 'PENDING'" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="130" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r7" value="     contact_name : VARCHAR(100)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="150" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r8" value="     payment_method : VARCHAR(30)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="170" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r9" value="     payment_status : VARCHAR(30)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="190" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r10" value="     is_b2b : TINYINT(1) DEFAULT 0" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="210" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r11" value="     discount_percent : INT DEFAULT 0" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="230" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="o_r12" value="     deposit_amount : DECIMAL(18,2)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_orders"><mxGeometry y="250" width="280" height="20" as="geometry" /></mxCell>

        <!-- TABLE: ORDERDETAILS -->
        <mxCell id="tb_det" value="ORDERDETAILS&#xa;(Chi tiết vé đặt)" style="shape=table;startSize=28;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;strokeColor=#475569;fillColor=#f8fafc;fontColor=#1e293b;" vertex="1" parent="1">
          <mxGeometry x="1110" y="460" width="260" height="160" as="geometry" />
        </mxCell>
        <mxCell id="d_r1" value="PK  order_detail_id : INT AUTO_INCREMENT" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_det"><mxGeometry y="28" width="260" height="22" as="geometry" /></mxCell>
        <mxCell id="d_r2" value="FK  order_id : INT NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_det"><mxGeometry y="50" width="260" height="20" as="geometry" /></mxCell>
        <mxCell id="d_r3" value="FK  tour_id : INT NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_det"><mxGeometry y="70" width="260" height="20" as="geometry" /></mxCell>
        <mxCell id="d_r4" value="     quantity : INT NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_det"><mxGeometry y="90" width="260" height="20" as="geometry" /></mxCell>
        <mxCell id="d_r5" value="     price : DECIMAL(18,2) NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_det"><mxGeometry y="110" width="260" height="20" as="geometry" /></mxCell>

        <!-- TABLE: USER_ACTIVITY_HISTORY -->
        <mxCell id="tb_act" value="USER_ACTIVITY_HISTORY&#xa;(Lịch sử hành vi đề xuất AI)" style="shape=table;startSize=28;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;strokeColor=#7c3aed;fillColor=#f5f3ff;fontColor=#5b21b6;" vertex="1" parent="1">
          <mxGeometry x="740" y="460" width="280" height="180" as="geometry" />
        </mxCell>
        <mxCell id="ac_r1" value="PK  id : BIGINT AUTO_INCREMENT" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_act"><mxGeometry y="28" width="280" height="22" as="geometry" /></mxCell>
        <mxCell id="ac_r2" value="FK  user_id : INT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_act"><mxGeometry y="50" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="ac_r3" value="     session_id : VARCHAR(100)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_act"><mxGeometry y="70" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="ac_r4" value="FK  tour_id : INT NOT NULL" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_act"><mxGeometry y="90" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="ac_r5" value="     activity_type : VARCHAR(50)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_act"><mxGeometry y="110" width="280" height="20" as="geometry" /></mxCell>
        <mxCell id="ac_r6" value="     score : INT DEFAULT 1" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_act"><mxGeometry y="130" width="280" height="20" as="geometry" /></mxCell>

        <!-- TABLE: COMPANIES (B2B) -->
        <mxCell id="tb_comp" value="COMPANIES&#xa;(Hồ sơ doanh nghiệp B2B)" style="shape=table;startSize=28;container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;strokeColor=#d97706;fillColor=#fffbeb;fontColor=#92400e;" vertex="1" parent="1">
          <mxGeometry x="60" y="420" width="260" height="180" as="geometry" />
        </mxCell>
        <mxCell id="cp_r1" value="PK  company_id : INT AUTO_INCREMENT" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontStyle=1;fontSize=11;" vertex="1" parent="tb_comp"><mxGeometry y="28" width="260" height="22" as="geometry" /></mxCell>
        <mxCell id="cp_r2" value="     company_name : VARCHAR(200)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_comp"><mxGeometry y="50" width="260" height="20" as="geometry" /></mxCell>
        <mxCell id="cp_r3" value="     tax_code : VARCHAR(50) UNIQUE" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_comp"><mxGeometry y="70" width="260" height="20" as="geometry" /></mxCell>
        <mxCell id="cp_r4" value="     billing_address : VARCHAR(255)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_comp"><mxGeometry y="90" width="260" height="20" as="geometry" /></mxCell>
        <mxCell id="cp_r5" value="     contact_email : VARCHAR(100)" style="shape=tableRow;horizontal=0;startSize=0;fillColor=none;fontSize=11;" vertex="1" parent="tb_comp"><mxGeometry y="110" width="260" height="20" as="geometry" /></mxCell>

        <!-- FK EDGES WITH CROW'S FOOT NOTATION -->
        <mxCell id="fk_u_o" value="1 : N" style="dashed=1;endArrow=ERmandOne;startArrow=ERmandOne;strokeColor=#dc2626;strokeWidth=1.5;html=1;" edge="1" parent="1" source="tb_users" target="tb_orders">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="fk_c_t" value="1 : N" style="dashed=1;endArrow=ERmandOne;startArrow=ERmandOne;strokeColor=#059669;strokeWidth=1.5;html=1;" edge="1" parent="1" source="tb_cat" target="tb_tours">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="fk_o_d" value="1 : N" style="dashed=1;endArrow=ERmandOne;startArrow=ERmandOne;strokeColor=#dc2626;strokeWidth=1.5;html=1;" edge="1" parent="1" source="tb_orders" target="tb_det">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="fk_t_d" value="1 : N" style="dashed=1;endArrow=ERmandOne;startArrow=ERmandOne;strokeColor=#d97706;strokeWidth=1.5;html=1;" edge="1" parent="1" source="tb_tours" target="tb_det">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="fk_t_act" value="1 : N" style="dashed=1;endArrow=ERmandOne;startArrow=ERmandOne;strokeColor=#7c3aed;strokeWidth=1.5;html=1;" edge="1" parent="1" source="tb_tours" target="tb_act">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
    """
    xml = wrap_drawio_xml("Hinh 3.12: Sơ đồ Thực thể Quan hệ CSDL ERD 3NF", cells, 1500, 750)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_3_12_erd_database_3nf.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_3_12_erd_database_3nf.drawio")

# ==============================================================================
# 9. HÌNH 4.1: SƠ ĐỒ KHÓA BI QUAN PESSIMISTIC LOCK (@Lock PESSIMISTIC_WRITE)
# ==============================================================================
def build_hinh_4_1():
    print("  -> Đang dựng Hình 4.1: Sơ đồ Luồng giao dịch Khóa bi quan...")
    cells = """
        <!-- Title Banner -->
        <mxCell id="t0" value="HỆ THỐNG DU LỊCH VIỆT — CƠ CHẾ KHÓA BI QUAN (@Lock PESSIMISTIC_WRITE) CHỐNG OVERSELLING" style="rounded=1;whiteSpace=wrap;html=1;fontSize=14;fontStyle=1;fillColor=#1e293b;strokeColor=#0f172a;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="60" y="20" width="1260" height="42" as="geometry" />
        </mxCell>

        <!-- Swimlane Khách Hàng A -->
        <mxCell id="sw_a" value="GIAO DỊCH 1: KHÁCH HÀNG A (ĐẾN TRƯỚC T=0ms)" style="swimlane;startSize=30;fillColor=#f0fdf4;strokeColor=#16a34a;fontColor=#166534;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="60" y="80" width="360" height="660" as="geometry" />
        </mxCell>
        <!-- Swimlane Cơ Sở Dữ Liệu -->
        <mxCell id="sw_db" value="MARIADB 12.2 (ROW-LEVEL LOCKING ENGINE)" style="swimlane;startSize=30;fillColor=#f8fafc;strokeColor=#64748b;fontColor=#334155;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="460" y="80" width="460" height="660" as="geometry" />
        </mxCell>
        <!-- Swimlane Khách Hàng B -->
        <mxCell id="sw_b" value="GIAO DỊCH 2: KHÁCH HÀNG B (ĐẾN SAU T=2ms)" style="swimlane;startSize=30;fillColor=#fef2f2;strokeColor=#dc2626;fontColor=#991b1b;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="960" y="80" width="360" height="660" as="geometry" />
        </mxCell>

        <!-- Initial DB State -->
        <mxCell id="db_init" value="Trạng thái ban đầu: Tour #1 (Phú Quốc)&#xa;available_seats = 1 (Chỉ còn duy nhất 1 vé!)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_db">
          <mxGeometry x="60" y="45" width="340" height="40" as="geometry" />
        </mxCell>

        <!-- Action A1 -->
        <mxCell id="a_1" value="Gửi yêu cầu đặt 1 vé&#xa;(T=0ms, OrderRequest)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#16a34a;" vertex="1" parent="sw_a">
          <mxGeometry x="80" y="105" width="200" height="45" as="geometry" />
        </mxCell>
        <mxCell id="db_lock_a" value="Thực thi: SELECT * FROM tours WHERE id=1 FOR UPDATE&#xa;-> Cấp Khóa Độc Quyền (Exclusive Lock) cho Giao Dịch A" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dcfce7;strokeColor=#16a34a;fontColor=#166534;fontStyle=1;" vertex="1" parent="sw_db">
          <mxGeometry x="40" y="105" width="380" height="50" as="geometry" />
        </mxCell>

        <!-- Action B1 Concurrent -->
        <mxCell id="b_1" value="Cùng gửi yêu cầu đặt 1 vé&#xa;(T=2ms, cùng Tour #1)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#dc2626;" vertex="1" parent="sw_b">
          <mxGeometry x="80" y="180" width="200" height="45" as="geometry" />
        </mxCell>
        <mxCell id="db_lock_b" value="Thực thi: SELECT ... FOR UPDATE&#xa;BỊ CHẶN (BLOCKED): Khóa đang do Giao Dịch A nắm giữ!&#xa;-> Giao Dịch B buộc phải chờ trong hàng đợi (Waiting Queue)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fee2e2;strokeColor=#dc2626;fontColor=#991b1b;fontStyle=1;" vertex="1" parent="sw_db">
          <mxGeometry x="40" y="180" width="380" height="60" as="geometry" />
        </mxCell>

        <!-- A Processing -->
        <mxCell id="a_2" value="Đọc available_seats = 1 (Đủ vé)&#xa;Khấu trừ nguyên tử: 1 - 1 = 0&#xa;Tạo Order #101 thành công" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#16a34a;" vertex="1" parent="sw_a">
          <mxGeometry x="80" y="260" width="200" height="55" as="geometry" />
        </mxCell>
        <mxCell id="db_update_a" value="UPDATE tours SET available_seats = 0 WHERE id = 1&#xa;COMMIT GIAO DỊCH A -> GIẢI PHÓNG KHÓA (LOCK RELEASED)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dcfce7;strokeColor=#16a34a;fontColor=#166534;fontStyle=1;" vertex="1" parent="sw_db">
          <mxGeometry x="40" y="260" width="380" height="50" as="geometry" />
        </mxCell>
        <mxCell id="a_success" value="XÁC NHẬN ĐẶT TOUR THÀNH CÔNG&#xa;Nhận E-Ticket và Mã QR thanh toán" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#16a34a;strokeColor=#15803d;fontColor=#ffffff;fontStyle=1;" vertex="1" parent="sw_a">
          <mxGeometry x="70" y="335" width="220" height="50" as="geometry" />
        </mxCell>

        <!-- B Resumes -->
        <mxCell id="db_resume_b" value="GIAO DỊCH B ĐƯỢC ĐÁNH THỨC &amp; NHẬN KHÓA:&#xa;Đọc dữ liệu mới nhất: available_seats = 0 (ĐÃ HẾT CHỖ!)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;" vertex="1" parent="sw_db">
          <mxGeometry x="40" y="350" width="380" height="50" as="geometry" />
        </mxCell>
        <mxCell id="b_2" value="Kiểm tra điều kiện: available_seats &lt; 1&#xa;-> PHÁT HIỆN HẾT CHỖ!&#xa;Rollback giao dịch, không trừ tiền" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#dc2626;" vertex="1" parent="sw_b">
          <mxGeometry x="80" y="420" width="200" height="55" as="geometry" />
        </mxCell>
        <mxCell id="b_fail" value="THÔNG BÁO: HẾT CHỖ&#xa;'Rất tiếc tour vừa hết vé trong giây lát!&#xa;Vui lòng chọn đợt khởi hành tiếp theo'" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dc2626;strokeColor=#b91c1c;fontColor=#ffffff;fontStyle=1;" vertex="1" parent="sw_b">
          <mxGeometry x="70" y="500" width="220" height="55" as="geometry" />
        </mxCell>

        <!-- Conclusion Box -->
        <mxCell id="res_box" value="KẾT QUẢ BẢO TOÀN TÍNH NGUYÊN TỬ (ACID): Tuyệt đối không xảy ra tình trạng bán âm vé (Overselling = 0). Dữ liệu tính nhất quán 100%!" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#1e293b;strokeColor=#0f172a;fontColor=#ffffff;fontStyle=1;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="60" y="680" width="1260" height="40" as="geometry" />
        </mxCell>

        <!-- Edges -->
        <mxCell id="e1" style="endArrow=block;html=1;strokeColor=#16a34a;" edge="1" parent="1" source="a_1" target="db_lock_a" />
        <mxCell id="e2" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="b_1" target="db_lock_b" />
        <mxCell id="e3" style="endArrow=block;html=1;strokeColor=#16a34a;" edge="1" parent="1" source="db_lock_a" target="a_2" />
        <mxCell id="e4" style="endArrow=block;html=1;strokeColor=#16a34a;" edge="1" parent="1" source="a_2" target="db_update_a" />
        <mxCell id="e5" style="endArrow=block;html=1;strokeColor=#16a34a;" edge="1" parent="1" source="db_update_a" target="a_success" />
        <mxCell id="e6" style="endArrow=block;html=1;strokeColor=#d97706;dashed=1;" edge="1" parent="1" source="db_update_a" target="db_resume_b" />
        <mxCell id="e7" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="db_resume_b" target="b_2" />
        <mxCell id="e8" style="endArrow=block;html=1;strokeColor=#dc2626;" edge="1" parent="1" source="b_2" target="b_fail" />
    """
    xml = wrap_drawio_xml("Hinh 4.1: Sơ đồ Luồng giao dịch Khóa bi quan", cells, 1380, 760)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_4_1_luong_khoa_bi_quan_pessimistic_lock.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_4_1_luong_khoa_bi_quan_pessimistic_lock.drawio")

# ==============================================================================
# 10. HÌNH 5.1: SƠ ĐỒ KIẾN TRÚC TÌM KIẾM NGỮ NGHĨA LAI GHÉP & RAG PIPELINE
# (DÀNH CHO BÁO CÁO NGHIÊN CỨU KHOA HỌC)
# ==============================================================================
def build_hinh_5_1():
    print("  -> Đang dựng Hình 5.1: Sơ đồ Kiến trúc Hybrid Semantic Retrieval & RAG Pipeline...")
    cells = """
        <!-- Title Banner -->
        <mxCell id="t0" value="KIẾN TRÚC TÌM KIẾM NGỮ NGHĨA LAI GHÉP (HYBRID RETRIEVAL) &amp; RAG PIPELINE VỚI STRICT GEOGRAPHIC ISOLATION" style="rounded=1;whiteSpace=wrap;html=1;fontSize=14;fontStyle=1;fillColor=#1e293b;strokeColor=#0f172a;fontColor=#ffffff;align=center;" vertex="1" parent="1">
          <mxGeometry x="50" y="20" width="1300" height="42" as="geometry" />
        </mxCell>

        <!-- User Query Input -->
        <mxCell id="q_in" value="TRUY VẤN NGÔN NGỮ TỰ NHIÊN CỦA DU KHÁCH (USER QUERY)&#xa;'Tư vấn tour đi ngắm biển khu vực Châu Á - Thái Bình Dương giá rẻ dưới 10 triệu'" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f0f9ff;strokeColor=#0284c7;fontColor=#0369a1;fontStyle=1;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="350" y="80" width="700" height="50" as="geometry" />
        </mxCell>

        <!-- Query Preprocessing Box -->
        <mxCell id="pre" value="TIỀN XỬ LÝ TRUY VẤN &amp; RÀO CHẮN NGỮ NGHĨA ĐỊA LÝ (QUERY PREPROCESSING &amp; STRICT GEO-ISOLATION)&#xa;1. Chuẩn hóa tiếng Việt &amp; Xóa dấu (removeVietnameseTones)&#xa;2. Bộ lọc Cách ly Địa lý (Strict Geographic Isolation Guard): Tách biệt APAC vs Australia vs Americas vs Europe&#xa;3. Trích xuất thực thể ngân sách và thời lượng qua TypeChat Schema Engine" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fef3c7;strokeColor=#d97706;fontColor=#92400e;fontStyle=1;fontSize=11;align=left;spacingLeft=15;" vertex="1" parent="1">
          <mxGeometry x="250" y="160" width="900" height="75" as="geometry" />
        </mxCell>

        <!-- DUAL-BRANCH RETRIEVAL CONTAINER -->
        <mxCell id="dual_box" value="HAI NHÁNH THU HỒI DỮ LIỆU SONG SONG (DUAL-BRANCH RETRIEVAL PIPELINE)" style="swimlane;startSize=28;fillColor=#f8fafc;strokeColor=#64748b;fontColor=#334155;fontStyle=1;rounded=1;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="120" y="260" width="1160" height="190" as="geometry" />
        </mxCell>

        <!-- Branch 1: Lexical -->
        <mxCell id="b1_box" value="NHÁNH 1: THU HỒI TỪ VỰNG CHÍNH XÁC (LEXICAL / BM25)&#xa;• Đánh chỉ mục đảo (Inverted Index) trên MariaDB / Elastic&#xa;• Khớp từ khóa cụ thể: 'biển', 'châu á', 'thái bình dương'&#xa;• Ưu điểm: Tốc độ cực nhanh (0.11 ms), không trượt từ khóa chuẩn" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#0284c7;fontColor=#0369a1;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="dual_box">
          <mxGeometry x="40" y="45" width="500" height="90" as="geometry" />
        </mxCell>
        <mxCell id="b1_res" value="Danh sách xếp hạng Rank_BM25 (Top 20 ứng viên)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e0f2fe;strokeColor=#0284c7;fontStyle=1;" vertex="1" parent="dual_box">
          <mxGeometry x="90" y="145" width="400" height="30" as="geometry" />
        </mxCell>

        <!-- Branch 2: Dense Semantic -->
        <mxCell id="b2_box" value="NHÁNH 2: THU HỒI NGỮ NGHĨA DENSE VECTOR (PGVECTOR HNSW)&#xa;• Mô hình nhúng: Google Text-Embedding-004 (768 chiều)&#xa;• Cấu trúc chỉ mục: HNSW Index (Hierarchical Navigable Small World)&#xa;• Ưu điểm: Hiểu ngữ cảnh trừu tượng ('nghỉ mát', 'chill', 'lãng mạn')" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#059669;fontColor=#065f46;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="dual_box">
          <mxGeometry x="620" y="45" width="500" height="90" as="geometry" />
        </mxCell>
        <mxCell id="b2_res" value="Danh sách xếp hạng Rank_Vector (Top 20 Cosine Similarity)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#059669;fontStyle=1;" vertex="1" parent="dual_box">
          <mxGeometry x="670" y="145" width="400" height="30" as="geometry" />
        </mxCell>

        <!-- FUSION LAYER: RRF -->
        <mxCell id="rrf_box" value="LỚP DUNG HỢP THỨ HẠNG: RECIPROCAL RANK FUSION (RRF)&#xa;RRF_Score(d) = ∑ ( 1 / ( k + Rank_i(d) ) ) với k = 60 chuẩn NeurIPS&#xa;-> Trung hòa điểm số tuyệt đối, loại bỏ hiện tượng thiên lệch phân phối điểm và ngăn chặn Rò Rỉ Ngữ Nghĩa (Zero-Hallucination)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ecfdf5;strokeColor=#10b981;fontColor=#065f46;fontStyle=1;fontSize=12;align=center;" vertex="1" parent="1">
          <mxGeometry x="200" y="480" width="1000" height="65" as="geometry" />
        </mxCell>

        <!-- RAG GENERATION & GUARDRAILS -->
        <mxCell id="rag_box" value="ĐƯỜNG ỐNG TẠO SINH TĂNG CƯỜNG THU HỒI (RAG) &amp; MÔ HÌNH NGÔN NGỮ LỚN GOOGLE GEMINI 1.5 FLASH" style="swimlane;startSize=28;fillColor=#fdf4ff;strokeColor=#c084fc;fontColor=#6b21a8;fontStyle=1;rounded=1;collapsible=0;" vertex="1" parent="1">
          <mxGeometry x="120" y="575" width="1160" height="150" as="geometry" />
        </mxCell>
        <mxCell id="rag_c1" value="Prompt Injection Context&#xa;• Augmented Top 5 RRF Tours&#xa;• Live Seats &amp; Rolling Dates&#xa;• OTA Domain Knowledge Base" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#c084fc;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="rag_box">
          <mxGeometry x="40" y="45" width="240" height="80" as="geometry" />
        </mxCell>
        <mxCell id="rag_c2" value="Google Gemini 1.5 Flash&#xa;• Multimodal In-context Reasoning&#xa;• Bóc tách lịch trình thông minh&#xa;• Trích xuất thông số minh bạch" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#c084fc;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="rag_box">
          <mxGeometry x="340" y="45" width="240" height="80" as="geometry" />
        </mxCell>
        <mxCell id="rag_c3" value="Guardrails &amp; TypeChat Enforcement&#xa;• PII Redaction: Che giấu CCCD/SĐT&#xa;• JSON Schema Output Validator&#xa;• Khóa tuyệt đối sinh văn bản tự do" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#c084fc;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="rag_box">
          <mxGeometry x="640" y="45" width="250" height="80" as="geometry" />
        </mxCell>
        <mxCell id="rag_c4" value="UI Output Renderer&#xa;• Hồi đáp Markdown tự nhiên&#xa;• Interactive Tour Cards&#xa;• 1-Click Booking Action Pills" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fae8ff;strokeColor=#a855f7;fontColor=#581c87;fontStyle=1;fontSize=11;align=left;spacingLeft=10;" vertex="1" parent="rag_box">
          <mxGeometry x="930" y="45" width="190" height="80" as="geometry" />
        </mxCell>

        <!-- Connectors -->
        <mxCell id="e1" style="endArrow=block;strokeColor=#0284c7;strokeWidth=2;html=1;" edge="1" parent="1" source="q_in" target="pre" />
        <mxCell id="e2_1" style="endArrow=block;strokeColor=#0284c7;strokeWidth=2;html=1;" edge="1" parent="1" source="pre" target="b1_box" />
        <mxCell id="e2_2" style="endArrow=block;strokeColor=#059669;strokeWidth=2;html=1;" edge="1" parent="1" source="pre" target="b2_box" />
        <mxCell id="e3_1" style="endArrow=block;strokeColor=#0284c7;strokeWidth=2;html=1;" edge="1" parent="1" source="b1_res" target="rrf_box" />
        <mxCell id="e3_2" style="endArrow=block;strokeColor=#059669;strokeWidth=2;html=1;" edge="1" parent="1" source="b2_res" target="rrf_box" />
        <mxCell id="e4" style="endArrow=block;strokeColor=#10b981;strokeWidth=2;html=1;" edge="1" parent="1" source="rrf_box" target="rag_box" />
    """
    xml = wrap_drawio_xml("Hinh 5.1: Sơ đồ Kiến trúc Hybrid Semantic Retrieval & RAG Pipeline", cells, 1400, 760)
    out_path = os.path.join(DIAGRAMS_DIR, "hinh_5_1_hybrid_semantic_retrieval_rag.drawio")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(xml)
    print(f"  ✓ Đã sinh: hinh_5_1_hybrid_semantic_retrieval_rag.drawio")

def build_sequence_diagrams():
    print("  -> Kiểm tra và nạp 6 sơ đồ Sequence Diagrams chuẩn seqlayout...")
    seq_files = [
        "hinh_2_2_sequence_rate_limiting.drawio",
        "hinh_3_3_sequence_uc01_tra_cuu_tour.drawio",
        "hinh_3_5_sequence_uc02_dat_tour_b2b.drawio",
        "hinh_3_7_sequence_uc03_safe_delete.drawio",
        "hinh_3_9_sequence_uc04_goi_y_ca_nhan_hoa.drawio",
        "hinh_3_10_sequence_uc05_gemini_ai.drawio"
    ]
    for sf in seq_files:
        p = os.path.join(DIAGRAMS_DIR, sf)
        if os.path.exists(p):
            print(f"  ✓ Đã có: {sf}")
        else:
            print(f"  ! Cảnh báo thiếu: {sf}")

# ==============================================================================
# MAIN RUNNER & TẠO BÁO CÁO MỤC LỤC 1-CLICK DRAW.IO LINKS
# ==============================================================================
def main():
    print("======================================================================")
    print("🚀 BẮT ĐẦU XÂY DỰNG TOÀN BỘ 16 SƠ ĐỒ DRAW.IO BẰNG DRAWIO-SKILL")
    print("======================================================================")

    # 1. 3-Tier Enterprise Architecture
    build_hinh_2_1()

    # 2. Sequence Diagrams
    build_sequence_diagrams()

    # 3. Use Case Diagram
    build_hinh_3_1()

    # 4. Activity Diagrams
    build_hinh_3_2()
    build_hinh_3_4()
    build_hinh_3_6()
    build_hinh_3_8()

    # 5. Class Diagram & ERD
    build_hinh_3_11()
    build_hinh_3_12()

    # 6. Concurrency / Pessimistic Locking
    build_hinh_4_1()

    # 7. Scientific Paper Hybrid Retrieval RAG Architecture
    build_hinh_5_1()

    print("======================================================================")
    print("🔗 ĐANG TẠO ĐƯỜNG DẪN 1-CLICK MỞ TRỰC TIẾP TRÊN APP.DIAGRAMS.NET...")
    print("======================================================================")

    drawio_files = [f for f in sorted(os.listdir(DIAGRAMS_DIR)) if f.endswith(".drawio")]
    links_summary = []

    for df in drawio_files:
        fpath = os.path.join(DIAGRAMS_DIR, df)
        with open(fpath, "r", encoding="utf-8") as f:
            xml_content = f.read()
        edit_url = encode_drawio_url.edit_url(xml_content)
        viewer_url = encode_drawio_url.encode(xml_content)
        links_summary.append({
            "file": df,
            "path": fpath,
            "edit_url": edit_url,
            "viewer_url": viewer_url
        })
        print(f"  ✓ {df:45s} -> Đã tạo URL 1-click")

    # Lưu README tổng hợp vào docs/diagrams/README.md
    readme_path = os.path.join(DIAGRAMS_DIR, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("# TỔNG HỢP TOÀN BỘ 16 SƠ ĐỒ KIẾN TRÚC & THIẾT KẾ DU LỊCH VIỆT (DRAW.IO)\n\n")
        f.write("> **Được tạo tự động chuẩn hóa bởi bộ công cụ [`Agents365-ai/drawio-skill`](https://github.com/agents365-ai/drawio-skill)**.\n")
        f.write("> Mọi sơ đồ dưới đây đều có định dạng chuẩn `.drawio` (XML vector), cho phép mở chỉnh sửa trực tiếp 1 chạm trên trình duyệt mà không cần cài đặt phần mềm.\n\n")
        f.write("| STT | Tên Sơ Đồ Trong Báo Cáo | File Gốc (.drawio) | Mở & Chỉnh Sửa Trực Tiếp (1-Click) | Xem Tương Tác |\n")
        f.write("| :---: | :--- | :--- | :---: | :---: |\n")
        for i, item in enumerate(links_summary, 1):
            f.write(f"| {i} | **{item['file'].replace('.drawio', '')}** | [`{item['file']}`](./{item['file']}) | [🚀 Mở trên Draw.io]({item['edit_url']}) | [👁️ Xem nhanh]({item['viewer_url']}) |\n")
        f.write("\n---\n*Sinh viên thực hiện: Nhóm 5 (DHKTPM19ATT) — Giảng viên hướng dẫn: ThS. Nguyễn Vũ Lâm — Năm 2026.*\n")

    print(f"\n✨ ĐÃ HOÀN TẤT XUẤT BẢNG MỤC LỤC SƠ ĐỒ TẠI: {readme_path}")

if __name__ == "__main__":
    main()
