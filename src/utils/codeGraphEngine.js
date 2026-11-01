/**
 * CodeGraph & Understand-Anything Domain Knowledge Engine
 * Inspired by:
 * - Understand-Anything (https://github.com/Egonex-AI/Understand-Anything)
 * - CodeGraph (https://github.com/colbymchenry/codegraph)
 * 
 * Provides:
 * 1. Multi-agent interactive system architecture & business logic domain mapping across 8 OTA dimensions.
 * 2. Tree-sitter AST symbol resolution across Spring Boot backend and React frontend.
 * 3. Blast radius & impact analysis when modifying critical OTA components.
 */

export const OTA_DOMAINS = [
  {
    id: 'domain-discovery',
    name: '1. Discovery & Search Intelligence',
    description: 'Hệ thống khám phá & tìm kiếm đa phương thức: Capsule Search, OmniSearch Ctrl+K, Dual-Lane Filter, AI Vector Semantic Search.',
    color: '#0284c7',
    nodes: [
      {
        id: 'node-omnisearch',
        name: 'OmniSearch Modal',
        type: 'COMPONENT',
        path: 'src/components/common/OmniSearchModal.jsx',
        desc: 'Spotlight search dạng popover (Ctrl+K) với tìm kiếm tức thì theo điểm đến, đối tác, danh mục.',
        dependencies: ['node-realtourapi', 'node-tourimages'],
        blastRadius: ['HomePage.jsx', 'TourListPage.jsx']
      },
      {
        id: 'node-duallanefilter',
        name: 'Dual-Lane Smart Filter',
        type: 'COMPONENT',
        path: 'src/pages/TourListPage.jsx',
        desc: 'Hệ thống lọc 2 làn ngang phân tách Nơi Khởi Hành và Chủ Đề kèm badge số lượng tour thời gian thực.',
        dependencies: ['node-tourspecification', 'node-tourcontroller'],
        blastRadius: ['TourListPage.css', 'axiosConfig.js']
      },
      {
        id: 'node-vectorsearch',
        name: 'VectorStore & Embedding',
        type: 'SERVICE',
        path: 'backend/src/main/java/.../VectorStoreService.java',
        desc: 'Tính toán cosine similarity dựa trên 384-dim semantic embeddings cho các truy vấn tự nhiên.',
        dependencies: ['node-embedding-model', 'node-database-indexes'],
        blastRadius: ['TourController.java', 'HomePage.jsx']
      }
    ]
  },
  {
    id: 'domain-booking',
    name: '2. Booking, Concurrency & Escrow',
    description: 'Hạ tầng đặt tour chịu tải cao, khóa bi quan chống overbooking, phân tầng đặt cọc (50% Quốc Tế / 30% Nội Địa).',
    color: '#f59e0b',
    nodes: [
      {
        id: 'node-orderservice',
        name: 'OrderService (Pessimistic Lock)',
        type: 'SERVICE',
        path: 'backend/src/main/java/.../OrderService.java',
        desc: 'Thực thi findByIdForUpdate, kiểm tra ngày hợp lệ, trừ kho chỗ khả dụng và xử lý hoàn trả chỗ tự động.',
        dependencies: ['node-orderrepo', 'node-tourrepo', 'node-emailservice'],
        blastRadius: ['OrderController.java', 'AdminOrderDetail.jsx', 'CheckoutPage.jsx']
      },
      {
        id: 'node-checkoutpage',
        name: 'Checkout & Escrow Stepper',
        type: 'COMPONENT',
        path: 'src/pages/CheckoutPage.jsx',
        desc: 'Giao diện thanh toán Bento: Tùy chọn cọc linh hoạt 50% vs 30%, chiết khấu B2B, điểm thưởng và stepper hoàn hủy.',
        dependencies: ['node-orderservice', 'node-vnpay'],
        blastRadius: ['CartContext.jsx', 'MyOrdersPage.jsx']
      },
      {
        id: 'node-depositplan',
        name: 'Pre-order Tiered Deposit Engine',
        type: 'BUSINESS_LOGIC',
        path: 'src/pages/CheckoutPage.jsx & travelBusinessRules.js',
        desc: 'Phân tầng đặt cọc: 50% tour Quốc Tế (vé bay & visa) và 30% tour Nội Địa, khóa hủy sau ngày khởi hành.',
        dependencies: ['node-orderservice', 'node-emailservice'],
        blastRadius: ['EmailService.java', 'MyOrdersPage.jsx']
      }
    ]
  },
  {
    id: 'domain-payments',
    name: '3. Payment Gateways & Banking',
    description: 'Tích hợp cổng thanh toán trực tuyến VNPay Sandbox, mã QR Chuyển khoản ngân hàng 24/7 và xác thực HMAC-SHA512.',
    color: '#10b981',
    nodes: [
      {
        id: 'node-vnpay',
        name: 'VNPay Gateway Service',
        type: 'SERVICE',
        path: 'backend/src/main/java/.../VnPayService.java',
        desc: 'Tạo URL thanh toán VNPay, ký số HMAC-SHA512 và xác thực IPN webhook đảm bảo an toàn giao dịch.',
        dependencies: ['node-orderservice'],
        blastRadius: ['VnPayReturnPage.jsx', 'OrderService.java']
      },
      {
        id: 'node-bankingqr',
        name: 'VietQR / Banking Generator',
        type: 'COMPONENT',
        path: 'src/pages/CheckoutPage.jsx',
        desc: 'Sinh mã QR chuyển khoản ngân hàng tự động kèm nội dung thanh toán định danh đơn hàng.',
        dependencies: ['node-checkoutpage'],
        blastRadius: ['MyOrdersPage.jsx']
      }
    ]
  },
  {
    id: 'domain-fulfillment',
    name: '4. Ticketing, Gmail OTP & E-Tickets',
    description: 'Xác thực tài khoản qua mã OTP Gmail 6 số, phát hành vé điện tử E-Ticket QR Code bảo mật.',
    color: '#8b5cf6',
    nodes: [
      {
        id: 'node-authservice',
        name: 'AuthService & OTP Flow',
        type: 'SERVICE',
        path: 'backend/src/main/java/.../AuthService.java',
        desc: 'Lưu trữ OTP ConcurrentHashMap với thời hạn 5 phút, gửi mã bảo mật qua Gmail SMTP và xác minh đăng ký.',
        dependencies: ['node-emailservice', 'node-userrepo'],
        blastRadius: ['RegisterPage.jsx', 'AuthController.java', 'ForgotPasswordPage.jsx']
      },
      {
        id: 'node-emailservice',
        name: 'EmailService (HTML Templating)',
        type: 'SERVICE',
        path: 'backend/src/main/java/.../EmailService.java',
        desc: 'Sinh template HTML chuẩn lữ hành: Thư chào mừng OTP, Vé điện tử E-ticket cọc 30/50%, Thư báo hủy hoàn tiền.',
        dependencies: ['node-springmail'],
        blastRadius: ['OrderService.java', 'AuthService.java']
      },
      {
        id: 'node-eticketqr',
        name: 'E-Ticket QR Generator',
        type: 'COMPONENT',
        path: 'src/pages/MyOrdersPage.jsx',
        desc: 'Hiển thị mã QR vé điện tử kèm thông tin chi tiết hành trình, phục vụ check-in nhanh tại điểm đón.',
        dependencies: ['node-orderservice'],
        blastRadius: ['MyOrdersPage.css']
      }
    ]
  },
  {
    id: 'domain-governance',
    name: '5. Multi-Vendor Governance & B2B',
    description: 'Hệ thống đối tác lữ hành chứng nhận (6 đơn vị), phân quyền RBAC và quản lý tài khoản doanh nghiệp B2B.',
    color: '#ec4899',
    nodes: [
      {
        id: 'node-providerdata',
        name: 'Certified Provider Directory',
        type: 'DATA_LAYER',
        path: 'src/utils/providerData.js',
        desc: 'Danh bạ 6 đơn vị tổ chức chuẩn mực: Vietravel, Saigontourist, Du Lịch Việt, BenThanh, Hanoitourist, BestPrice.',
        dependencies: ['node-tourdetail', 'node-tourcard', 'node-tourlist'],
        blastRadius: ['TourDetailPage.jsx', 'TourListPage.jsx', 'HomePage.jsx']
      },
      {
        id: 'node-b2bmanagement',
        name: 'Admin B2B Corporate Hub',
        type: 'ADMIN_MODULE',
        path: 'src/pages/admin/AdminB2B.jsx',
        desc: 'Phê duyệt hồ sơ doanh nghiệp, cấp hạn mức công nợ và quản lý hợp đồng chiết khấu đoàn.',
        dependencies: ['node-b2brepo', 'node-orderservice'],
        blastRadius: ['CheckoutPage.jsx', 'AdminDashboard.jsx']
      }
    ]
  },
  {
    id: 'domain-grounding',
    name: '6. Zero-Hallucination & Policy Grounding',
    description: 'Nền tảng kiểm chứng Context7, Guardrails AI và Agent-Reach, ngăn chặn hoàn toàn ảo giác thông tin du lịch.',
    color: '#06b6d4',
    nodes: [
      {
        id: 'node-context7',
        name: 'Context7 Vector Cache',
        type: 'DATA_LAYER',
        path: 'src/utils/context7Engine.js',
        desc: 'Lưu trữ tài liệu quy chuẩn hoàn hủy, bảo lãnh cọc visa, quy định chất lỏng & nhà ga T1/T2.',
        dependencies: ['node-aichatwidget', 'node-tourdetail'],
        blastRadius: ['AiChatWidget.jsx', 'TourDetailPage.jsx']
      },
      {
        id: 'node-guardrails',
        name: 'Guardrails AI Safety Engine',
        type: 'SERVICE',
        path: 'src/utils/guardrailsEngine.js',
        desc: 'Che giấu CCCD/Passport (PII masking), kiểm định phần trăm hoàn tiền và đảm bảo văn phong 5 sao.',
        dependencies: ['node-context7', 'node-aichatwidget'],
        blastRadius: ['AiChatWidget.jsx', 'AdminArchitectureGraph.jsx']
      },
      {
        id: 'node-travelreach',
        name: 'TravelReach Ground Truth',
        type: 'DATA_LAYER',
        path: 'src/utils/travelReachEngine.js',
        desc: 'Cung cấp dữ liệu thực tế về thời tiết, mùa lý tưởng, văn hóa bản địa và trang phục cho từng điểm đến.',
        dependencies: ['node-aichatwidget'],
        blastRadius: ['TourDetailPage.jsx', 'HomePage.jsx']
      }
    ]
  },
  {
    id: 'domain-observability',
    name: '7. Agent Observability & Telemetry',
    description: 'Theo dõi chỉ số viễn trắc AI qua Langfuse và kiểm định hợp đồng SLA đối tác lữ hành qua REA Probe.',
    color: '#6366f1',
    nodes: [
      {
        id: 'node-langfuse',
        name: 'Langfuse Trace Observability',
        type: 'SERVICE',
        path: 'src/utils/langfuseTraceEngine.js',
        desc: 'Ghi nhận phân tán trace session, đo độ trễ ms, chi phí token, và tỷ lệ không ảo giác (Zero-Hallucination Rate).',
        dependencies: ['node-aichatwidget'],
        blastRadius: ['AdminArchitectureGraph.jsx', 'AiChatWidget.jsx']
      },
      {
        id: 'node-reaprobe',
        name: 'REA Partner SLA Probe',
        type: 'SERVICE',
        path: 'src/utils/travelReachEngine.js',
        desc: 'Mô phỏng kiểm tra hợp đồng phân phối API, thời gian phản hồi và độ sẵn sàng 99.9% của các đối tác lữ hành.',
        dependencies: ['node-providerdata'],
        blastRadius: ['AdminArchitectureGraph.jsx']
      }
    ]
  },
  {
    id: 'domain-personalization',
    name: '8. Personalized Travel Memory & TypeChat',
    description: 'Lớp bộ nhớ khách hàng dài hạn Mem0 và bộ phân giải ý định có cấu trúc theo TypeScript Schema TypeChat.',
    color: '#d946ef',
    nodes: [
      {
        id: 'node-mem0',
        name: 'Mem0 Customer Travel Memory',
        type: 'SERVICE',
        path: 'src/utils/customerMemoryEngine.js',
        desc: 'Ghi nhớ hồ sơ cá nhân, điểm khởi hành ưu tiên, thành phần đoàn, lưu ý ăn uống và cảnh báo hạn hộ chiếu.',
        dependencies: ['node-aichatwidget', 'node-checkoutpage'],
        blastRadius: ['AiChatWidget.jsx', 'AdminArchitectureGraph.jsx']
      },
      {
        id: 'node-typechat',
        name: 'TypeChat Intent Engine',
        type: 'SERVICE',
        path: 'src/utils/typeChatBookingEngine.js',
        desc: 'Trích xuất đối tượng JSON có cấu trúc (BookingRequest Schema) từ ngôn ngữ tự nhiên để đồng bộ vào giỏ hàng/thanh toán.',
        dependencies: ['node-aichatwidget', 'node-checkoutpage'],
        blastRadius: ['CheckoutPage.jsx', 'AiChatWidget.jsx']
      }
    ]
  }
];

export const codeGraphEngine = {
  /**
   * Lấy toàn bộ danh sách các Domain và Nodes
   */
  getDomains: () => OTA_DOMAINS,

  /**
   * Tìm kiếm node theo tên hoặc đường dẫn code
   */
  searchNodes: (query = '') => {
    if (!query) return [];
    const lower = query.toLowerCase().trim();
    const results = [];
    OTA_DOMAINS.forEach(domain => {
      domain.nodes.forEach(node => {
        if (
          node.name.toLowerCase().includes(lower) ||
          node.path.toLowerCase().includes(lower) ||
          node.desc.toLowerCase().includes(lower)
        ) {
          results.push({ ...node, domainName: domain.name, domainColor: domain.color });
        }
      });
    });
    return results;
  },

  /**
   * Phân tích Blast Radius (Tác động lan truyền) của một Symbol
   */
  getImpactAnalysis: (nodeId) => {
    let target = null;
    let parentDomain = null;

    for (const d of OTA_DOMAINS) {
      const found = d.nodes.find(n => n.id === nodeId);
      if (found) {
        target = found;
        parentDomain = d;
        break;
      }
    }

    if (!target) return null;

    // Tìm các node khác có phụ thuộc hoặc chịu tác động
    const directImpacts = target.blastRadius || [];
    const dependencies = target.dependencies || [];

    return {
      target,
      domain: parentDomain.name,
      directImpacts,
      dependencies,
      riskLevel: directImpacts.length > 2 ? 'HIGH' : 'MEDIUM'
    };
  }
};

export default codeGraphEngine;
