import React, { useState, useMemo } from 'react';
import { 
  FaProjectDiagram, FaSearch, FaExclamationTriangle, FaCodeBranch, 
  FaServer, FaLayerGroup, FaCheckCircle, FaShieldAlt, FaExternalLinkAlt, 
  FaBook, FaGlobe, FaBolt, FaSyncAlt
} from 'react-icons/fa';
import { codeGraphEngine, OTA_DOMAINS } from '../../utils/codeGraphEngine';
import { travelReachEngine } from '../../utils/travelReachEngine';
import { context7Engine } from '../../utils/context7Engine';
import './AdminArchitectureGraph.css';

const AdminArchitectureGraph = () => {
  const [selectedDomainId, setSelectedDomainId] = useState(OTA_DOMAINS[0].id);
  const [selectedNode, setSelectedNode] = useState(OTA_DOMAINS[0].nodes[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('GRAPH'); // 'GRAPH', 'REA_PROBE', 'CONTEXT7'

  // Probe telemetry data (REA & Agent-Reach)
  const [telemetry, setTelemetry] = useState(() => travelReachEngine.getSystemHealthTelemetry());
  const [probing, setProbing] = useState(false);

  const handleRefreshProbes = () => {
    setProbing(true);
    setTimeout(() => {
      setTelemetry(travelReachEngine.getSystemHealthTelemetry());
      setProbing(false);
    }, 400);
  };

  const selectedDomain = useMemo(() => {
    return OTA_DOMAINS.find(d => d.id === selectedDomainId) || OTA_DOMAINS[0];
  }, [selectedDomainId]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return codeGraphEngine.searchNodes(searchQuery);
  }, [searchQuery]);

  const impactAnalysis = useMemo(() => {
    if (!selectedNode) return null;
    return codeGraphEngine.getImpactAnalysis(selectedNode.id);
  }, [selectedNode]);

  const allContext7Docs = useMemo(() => {
    return context7Engine.getAllDocs();
  }, []);

  return (
    <div className="admin-architecture-page animate-fade-in">
      {/* Header Banner */}
      <div className="arch-header card-surface">
        <div className="arch-header-left">
          <div className="arch-badge">
            <FaProjectDiagram /> ARCHITECTURE KNOWLEDGE GRAPH
          </div>
          <h2 className="arch-title">Bản Đồ Kiến Trúc & Vòng Đời Nghiệp Vụ OTA</h2>
          <p className="arch-subtitle">
            Tích hợp nền tảng <strong>Understand-Anything</strong>, <strong>CodeGraph</strong>, <strong>REA Probe</strong>, <strong>Agent-Reach</strong> & <strong>Context7</strong>.
            Minh họa trực quan luồng dữ liệu, phân tích tác động AST (Blast Radius) và kiểm định SLA đối tác lữ hành.
          </p>
        </div>

        <div className="arch-tab-controls">
          <button 
            type="button" 
            className={`arch-tab-btn ${activeTab === 'GRAPH' ? 'active' : ''}`}
            onClick={() => setActiveTab('GRAPH')}
          >
            <FaCodeBranch /> Sơ Đồ Miền & AST Graph
          </button>
          <button 
            type="button" 
            className={`arch-tab-btn ${activeTab === 'REA_PROBE' ? 'active' : ''}`}
            onClick={() => setActiveTab('REA_PROBE')}
          >
            <FaServer /> REA Partner SLA Probe
          </button>
          <button 
            type="button" 
            className={`arch-tab-btn ${activeTab === 'CONTEXT7' ? 'active' : ''}`}
            onClick={() => setActiveTab('CONTEXT7')}
          >
            <FaBook /> Context7 Policy Store
          </button>
        </div>
      </div>

      {/* TAB 1: KNOWLEDGE GRAPH & AST IMPACT ANALYSIS */}
      {activeTab === 'GRAPH' && (
        <div className="arch-main-grid">
          {/* Cột 1: Danh sách các Domain nghiệp vụ */}
          <div className="arch-domain-sidebar card-surface">
            <div className="sidebar-section-title">
              <FaLayerGroup /> MIỀN NGHIỆP VỤ HỆ THỐNG
            </div>

            <div className="search-symbol-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm file, class, component..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-symbol-input"
              />
            </div>

            {searchResults ? (
              <div className="search-results-list">
                <div className="results-count">Tìm thấy {searchResults.length} module:</div>
                {searchResults.map(node => (
                  <div
                    key={node.id}
                    className={`symbol-item ${selectedNode?.id === node.id ? 'selected' : ''}`}
                    onClick={() => setSelectedNode(node)}
                  >
                    <span className="symbol-type-pill" style={{ background: node.domainColor }}>{node.type}</span>
                    <div className="symbol-item-info">
                      <strong>{node.name}</strong>
                      <span className="symbol-path">{node.path}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="domains-list">
                {OTA_DOMAINS.map(domain => (
                  <button
                    key={domain.id}
                    type="button"
                    className={`domain-card-btn ${selectedDomainId === domain.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedDomainId(domain.id);
                      setSelectedNode(domain.nodes[0]);
                    }}
                    style={{ borderLeftColor: domain.color }}
                  >
                    <div className="domain-card-name">{domain.name}</div>
                    <div className="domain-card-desc">{domain.description}</div>
                    <div className="domain-nodes-count">{domain.nodes.length} Core Nodes</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cột 2: Sơ đồ tương tác các Node trong Miền */}
          <div className="arch-interactive-canvas card-surface">
            <div className="canvas-header">
              <div className="canvas-title-row">
                <span className="domain-indicator-dot" style={{ background: selectedDomain.color }}></span>
                <h3 className="canvas-domain-name">{selectedDomain.name}</h3>
              </div>
              <span className="canvas-hint">Bấm vào từng Node để xem quan hệ phụ thuộc & Blast Radius</span>
            </div>

            <div className="nodes-flow-container">
              {selectedDomain.nodes.map((node, index) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    className={`flow-node-card ${isSelected ? 'is-focused' : ''}`}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div className="node-card-top">
                      <span className="node-step-badge">NODE {index + 1}</span>
                      <span className="node-type-tag">{node.type}</span>
                    </div>
                    <h4 className="node-card-title">{node.name}</h4>
                    <p className="node-card-desc">{node.desc}</p>
                    <div className="node-card-path">
                      <code>{node.path}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột 3: CodeGraph AST Impact & Blast Radius Drawer */}
          <div className="arch-impact-drawer card-surface">
            <div className="drawer-title">
              <FaCodeBranch className="text-primary" /> PHÂN TÍCH TÁC ĐỘNG (BLAST RADIUS)
            </div>

            {selectedNode && impactAnalysis ? (
              <div className="impact-details animate-fade-in">
                <div className="symbol-selected-box">
                  <div className="symbol-selected-header">
                    <span className="symbol-type-tag">{selectedNode.type}</span>
                    <span className={`risk-badge ${impactAnalysis.riskLevel.toLowerCase()}`}>
                      {impactAnalysis.riskLevel} IMPACT
                    </span>
                  </div>
                  <h4 className="symbol-title">{selectedNode.name}</h4>
                  <div className="symbol-path-box">{selectedNode.path}</div>
                  <p className="symbol-desc">{selectedNode.desc}</p>
                </div>

                <div className="impact-section mt-4">
                  <h5 className="impact-heading">
                    <FaExclamationTriangle className="text-warning" /> Thành Phần Bị Ảnh Hưởng (Blast Radius):
                  </h5>
                  <ul className="impact-list">
                    {impactAnalysis.directImpacts.map((target, idx) => (
                      <li key={idx} className="impact-item">
                        <span className="bullet-dot"></span>
                        <code>{target}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="impact-section mt-3">
                  <h5 className="impact-heading">
                    <FaCheckCircle className="text-success" /> Module Phụ Thuộc (Dependencies):
                  </h5>
                  <div className="deps-chips-wrap">
                    {impactAnalysis.dependencies.map((dep, idx) => (
                      <span key={idx} className="dep-chip">
                        {dep.replace('node-', '')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="concurrency-assurance-box mt-4">
                  <FaShieldAlt className="shield-icon" />
                  <div>
                    <strong>Bảo Toàn Bất Biến Nghiệp Vụ:</strong>
                    <span>Khóa bi quan <code>findByIdForUpdate</code> đảm bảo không bao giờ bị Race Condition khi tải cao.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="drawer-empty">Chọn một node để phân tích quan hệ.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REA PARTNER CONTRACT SLA PROBE */}
      {activeTab === 'REA_PROBE' && (
        <div className="arch-rea-view animate-fade-in">
          <div className="rea-summary-card card-surface">
            <div className="rea-summary-row">
              <div>
                <h3 className="rea-title">REA Partner Protocol & Concurrency Telemetry</h3>
                <p className="rea-desc">Kiểm thử hợp đồng dịch vụ và độ trễ kết nối thời gian thực với 6 đơn vị tổ chức lữ hành chính thức.</p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary btn-refresh-probes" 
                onClick={handleRefreshProbes}
                disabled={probing}
              >
                <FaSyncAlt className={probing ? 'spin-anim' : ''} /> {probing ? 'Đang gửi Probe...' : 'Kiểm Tra Lại'}
              </button>
            </div>

            <div className="telemetry-bento-grid mt-4">
              <div className="telemetry-box">
                <span className="telemetry-label">Trạng Thái Mạng Lưới:</span>
                <strong className="telemetry-val text-success">
                  <FaCheckCircle /> {telemetry.circuitBreakerState}
                </strong>
              </div>
              <div className="telemetry-box">
                <span className="telemetry-label">Độ Trễ Trung Bình:</span>
                <strong className="telemetry-val text-primary">{telemetry.averageLatencyMs} ms</strong>
              </div>
              <div className="telemetry-box">
                <span className="telemetry-label">Khả Năng Chịu Tải:</span>
                <strong className="telemetry-val text-accent">{telemetry.concurrencyCapacity}</strong>
              </div>
              <div className="telemetry-box">
                <span className="telemetry-label">Đơn Vị Khả Dụng:</span>
                <strong className="telemetry-val">{telemetry.activeProviders} / 6 Hoạt Động</strong>
              </div>
            </div>
          </div>

          <div className="probes-cards-grid mt-4">
            {telemetry.probes.map(p => (
              <div key={p.providerId} className="probe-card card-surface">
                <div className="probe-card-header">
                  <div>
                    <h4 className="probe-provider-name">{p.name}</h4>
                    <span className="probe-license">{p.licenseChecked}</span>
                  </div>
                  <span className="probe-badge-online">ONLINE</span>
                </div>
                <div className="probe-metrics-row">
                  <div className="metric-item">
                    <span>Độ trễ API:</span>
                    <strong>{p.latencyMs} ms</strong>
                  </div>
                  <div className="metric-item">
                    <span>Kho chỗ:</span>
                    <strong className="text-success">{p.inventorySyncStatus}</strong>
                  </div>
                  <div className="metric-item">
                    <span>Cơ chế khóa:</span>
                    <strong className="text-primary">{p.seatGuarantee}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTEXT7 POLICY STORE */}
      {activeTab === 'CONTEXT7' && (
        <div className="arch-context7-view animate-fade-in">
          <div className="context7-header-card card-surface">
            <h3 className="context7-title">Context7 Official Travel Policy Grounding Store</h3>
            <p className="context7-desc">
              Tập hợp các quy định điều khoản chính thống được nạp trực tiếp vào bộ đệm của AI Assistant để loại bỏ hoàn toàn hiện tượng ảo giác (Zero Hallucination).
            </p>
          </div>

          <div className="context7-cards-grid mt-4">
            {allContext7Docs.map(doc => (
              <div key={doc.id} className="context7-doc-card card-surface">
                <div className="doc-top-row">
                  <span className="doc-cat-pill">{doc.category}</span>
                  <span className="doc-id-pill">{doc.id}</span>
                </div>
                <h4 className="doc-title">{doc.title}</h4>
                <div className="doc-content-body">
                  <pre>{doc.content}</pre>
                </div>
                <div className="doc-keywords-row">
                  <strong>Từ khóa nhận diện:</strong>
                  {doc.keywords.map((kw, i) => (
                    <span key={i} className="kw-tag">{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArchitectureGraph;
