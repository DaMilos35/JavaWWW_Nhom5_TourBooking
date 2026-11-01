import React, { useState, useMemo } from 'react';
import { 
  FaProjectDiagram, FaSearch, FaExclamationTriangle, FaCodeBranch, 
  FaServer, FaLayerGroup, FaCheckCircle, FaShieldAlt, FaExternalLinkAlt, 
  FaBook, FaGlobe, FaBolt, FaSyncAlt, FaChartLine, FaBrain, FaUserCheck,
  FaFileAlt, FaHistory, FaTrashAlt, FaCheck, FaExclamationCircle
} from 'react-icons/fa';
import { codeGraphEngine, OTA_DOMAINS } from '../../utils/codeGraphEngine';
import { travelReachEngine } from '../../utils/travelReachEngine';
import { context7Engine } from '../../utils/context7Engine';
import { langfuseTraceEngine } from '../../utils/langfuseTraceEngine';
import { customerMemoryEngine } from '../../utils/customerMemoryEngine';
import { guardrailsEngine } from '../../utils/guardrailsEngine';
import './AdminArchitectureGraph.css';

const AdminArchitectureGraph = () => {
  const [selectedDomainId, setSelectedDomainId] = useState(OTA_DOMAINS[0].id);
  const [selectedNode, setSelectedNode] = useState(OTA_DOMAINS[0].nodes[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('GRAPH'); // 'GRAPH', 'REA_PROBE', 'CONTEXT7', 'LANGFUSE', 'MEM0'

  // Probe telemetry data (REA & Agent-Reach)
  const [telemetry, setTelemetry] = useState(() => travelReachEngine.getSystemHealthTelemetry());
  const [probing, setProbing] = useState(false);

  // Langfuse Tracing state
  const [traces, setTraces] = useState(() => langfuseTraceEngine.getTraces());
  const [telemetryStats, setTelemetryStats] = useState(() => langfuseTraceEngine.getTelemetrySummary());
  const [selectedTrace, setSelectedTrace] = useState(() => traces[0] || null);

  // Mem0 Memory state
  const [customerMem, setCustomerMem] = useState(() => customerMemoryEngine.getMemory());
  const [passportAlarm, setPassportAlarm] = useState(() => customerMemoryEngine.checkPassportAlarm());
  const [prefInput, setPrefInput] = useState('');
  const [savedNotification, setSavedNotification] = useState('');

  const handleRefreshProbes = () => {
    setProbing(true);
    setTimeout(() => {
      setTelemetry(travelReachEngine.getSystemHealthTelemetry());
      setProbing(false);
    }, 400);
  };

  const handleRefreshTraces = () => {
    setTraces(langfuseTraceEngine.getTraces());
    setTelemetryStats(langfuseTraceEngine.getTelemetrySummary());
  };

  const handleClearTraces = () => {
    langfuseTraceEngine.clearTraces();
    handleRefreshTraces();
  };

  const handleAddDestination = (e) => {
    e.preventDefault();
    if (!prefInput.trim()) return;
    customerMemoryEngine.addFavoriteDestination(prefInput.trim());
    setCustomerMem(customerMemoryEngine.getMemory());
    setPrefInput('');
    setSavedNotification('Đã ghi nhớ điểm đến mới vào hồ sơ Mem0!');
    setTimeout(() => setSavedNotification(''), 2500);
  };

  const handleResetMemory = () => {
    customerMemoryEngine.resetMemory();
    setCustomerMem(customerMemoryEngine.getMemory());
    setPassportAlarm(customerMemoryEngine.checkPassportAlarm());
    setSavedNotification('Đã đặt lại hồ sơ du lịch mặc định.');
    setTimeout(() => setSavedNotification(''), 2500);
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
            <FaProjectDiagram /> ARCHITECTURE KNOWLEDGE GRAPH & AGENT OBSERVABILITY
          </div>
          <h2 className="arch-title">Trung Tâm Tình Báo Kiến Trúc & Giám Sát AI</h2>
          <p className="arch-subtitle">
            Hợp nhất 7 kiến trúc mã nguồn mở hàng đầu: <strong>CodeGraph</strong>, <strong>REA Probe</strong>, <strong>Agent-Reach</strong>, <strong>Upstash Context7</strong>, <strong>Langfuse Tracing</strong>, <strong>Mem0 Memory</strong> & <strong>Guardrails AI</strong>.
          </p>
        </div>

        <div className="arch-tab-controls">
          <button 
            type="button" 
            className={`arch-tab-btn ${activeTab === 'GRAPH' ? 'active' : ''}`}
            onClick={() => setActiveTab('GRAPH')}
          >
            <FaCodeBranch /> Sơ Đồ 8 Miền & AST Graph
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
          <button 
            type="button" 
            className={`arch-tab-btn ${activeTab === 'LANGFUSE' ? 'active' : ''}`}
            onClick={() => { setActiveTab('LANGFUSE'); handleRefreshTraces(); }}
          >
            <FaChartLine /> Langfuse Observability
          </button>
          <button 
            type="button" 
            className={`arch-tab-btn ${activeTab === 'MEM0' ? 'active' : ''}`}
            onClick={() => setActiveTab('MEM0')}
          >
            <FaBrain /> Mem0 Memory & Guardrails
          </button>
        </div>
      </div>

      {/* TAB 1: KNOWLEDGE GRAPH & AST IMPACT ANALYSIS (CodeGraph) */}
      {activeTab === 'GRAPH' && (
        <div className="arch-main-grid">
          {/* Cột 1: Danh sách các Domain nghiệp vụ */}
          <div className="arch-domain-sidebar card-surface">
            <div className="sidebar-section-title">
              <FaLayerGroup /> 8 MIỀN NGHIỆP VỤ HỆ THỐNG
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
              <span className="canvas-hint">Bấm vào từng Node để phân tích AST & Blast Radius</span>
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

          {/* Cột 3: Chi tiết Blast Radius & Phụ thuộc AST */}
          <div className="arch-impact-panel card-surface">
            <div className="sidebar-section-title">
              <FaExclamationTriangle className="text-warning" /> BLAST RADIUS & TÁC ĐỘNG AST
            </div>

            {selectedNode && impactAnalysis ? (
              <div className="impact-content-wrap">
                <div className="target-node-header">
                  <span className="target-domain-tag">{impactAnalysis.domain}</span>
                  <h4 className="target-node-name">{selectedNode.name}</h4>
                  <div className="risk-level-badge" data-risk={impactAnalysis.riskLevel}>
                    Mức độ ảnh hưởng: <strong>{impactAnalysis.riskLevel}</strong>
                  </div>
                </div>

                <div className="impact-section">
                  <div className="impact-section-label">Tệp tin nguồn (Source Path):</div>
                  <div className="code-path-box">
                    <code>{selectedNode.path}</code>
                  </div>
                </div>

                <div className="impact-section">
                  <div className="impact-section-label">Phụ thuộc trực tiếp (Dependencies):</div>
                  <div className="dep-tags-wrap">
                    {impactAnalysis.dependencies.map(dep => (
                      <span key={dep} className="dep-tag">
                        <FaCodeBranch /> {dep}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="impact-section">
                  <div className="impact-section-label">Các tệp tin chịu tác động lan truyền (Blast Radius):</div>
                  <div className="blast-files-list">
                    {impactAnalysis.directImpacts.map(file => (
                      <div key={file} className="blast-file-item">
                        <span className="bullet-dot"></span>
                        <span className="blast-file-name">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-selection-placeholder">
                <p>Chọn một Node trên sơ đồ để kích hoạt công cụ phân tích AST CodeGraph.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REA PARTNER SLA PROBES (morluto/rea & agent-reach) */}
      {activeTab === 'REA_PROBE' && (
        <div className="rea-probe-container card-surface">
          <div className="probe-top-bar">
            <div>
              <h3 className="probe-heading">Hệ Thống Kiểm Định SLA Đối Tác Lữ Hành Chuẩn REA</h3>
              <p className="probe-desc">
                Mô phỏng cơ chế giám sát viễn trắc hợp đồng phân phối vé theo thời gian thực (Contract SLA Health Check).
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-primary btn-refresh-probes"
              onClick={handleRefreshProbes}
              disabled={probing}
            >
              <FaSyncAlt className={probing ? 'fa-spin' : ''} /> {probing ? 'Đang gửi Probes...' : 'Quét SLA Thời Gian Thực'}
            </button>
          </div>

          <div className="telemetry-stats-row">
            <div className="telem-stat-card">
              <span className="stat-label">Tổng Đối Tác</span>
              <span className="stat-val">{telemetry.partnerCount} Đơn vị</span>
            </div>
            <div className="telem-stat-card">
              <span className="stat-label">Thời Gian Phản Hồi TB</span>
              <span className="stat-val text-success">{telemetry.avgLatencyMs} ms</span>
            </div>
            <div className="telem-stat-card">
              <span className="stat-label">Cam Kết Độ Sẵn Sàng (SLA)</span>
              <span className="stat-val text-primary">{telemetry.contractSlaUptime}</span>
            </div>
            <div className="telem-stat-card">
              <span className="stat-label">Trạng Thái Hệ Thống</span>
              <span className="stat-val text-success">
                <FaCheckCircle /> {telemetry.systemHealth}
              </span>
            </div>
          </div>

          <div className="probe-table-wrap">
            <table className="probe-table">
              <thead>
                <tr>
                  <th>Đơn Vị Lữ Hành</th>
                  <th>Mã Giấy Phép</th>
                  <th>Hạng Mức Bảo Hiểm</th>
                  <th>Độ Trễ Phản Hồi</th>
                  <th>Tỷ Lệ Lỗi (Error Rate)</th>
                  <th>Tuân Thủ Hợp Đồng</th>
                </tr>
              </thead>
              <tbody>
                {telemetry.probes.map(p => (
                  <tr key={p.providerId}>
                    <td>
                      <div className="partner-cell">
                        <span className="partner-dot" style={{ background: p.brandColor }}></span>
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td><code>{p.licenseCode}</code></td>
                    <td>{p.insuranceGuarantee}</td>
                    <td>
                      <span className="latency-badge">{p.latencyMs} ms</span>
                    </td>
                    <td>
                      <span className="error-badge">{p.errorRate}</span>
                    </td>
                    <td>
                      <span className="sla-status-pill pill-compliant">
                        <FaShieldAlt /> {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTEXT7 POLICY GROUNDING (upstash/context7) */}
      {activeTab === 'CONTEXT7' && (
        <div className="context7-browser card-surface">
          <div className="context7-header">
            <div>
              <h3 className="context7-title">Kho Quy Chuẩn Nghiệp Vụ Du Lịch (Context7 Knowledge Base)</h3>
              <p className="context7-subtitle">
                Toàn bộ tài liệu chính thức được tiêm trực tiếp vào prompt để triệt tiêu hoàn toàn hiện tượng ảo giác (Zero Hallucination).
              </p>
            </div>
            <span className="context7-doc-count">Đã nạp {allContext7Docs.length} tài liệu chính sách</span>
          </div>

          <div className="context7-docs-grid">
            {allContext7Docs.map(doc => (
              <div key={doc.id} className="context7-doc-card">
                <div className="doc-card-top">
                  <span className="doc-category-badge">{doc.category}</span>
                  <span className="doc-id-pill"><code>{doc.id}</code></span>
                </div>
                <h4 className="doc-title">{doc.title}</h4>
                <div className="doc-content-box">
                  <pre>{doc.content}</pre>
                </div>
                <div className="doc-keywords-row">
                  <span className="kw-label">Từ khóa kích hoạt:</span>
                  {doc.keywords.map(kw => (
                    <span key={kw} className="kw-tag">{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LANGFUSE AI OBSERVABILITY (langfuse/langfuse) */}
      {activeTab === 'LANGFUSE' && (
        <div className="langfuse-telemetry-container card-surface">
          <div className="probe-top-bar">
            <div>
              <h3 className="probe-heading">Langfuse AI Observability & Trace Telemetry</h3>
              <p className="probe-desc">
                Giám sát chi tiết từng phiên hội thoại LLM, độ trễ (latency), chi phí token và tỷ lệ không ảo giác (Zero-Hallucination).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={handleRefreshTraces}
              >
                <FaSyncAlt /> Làm Mới Viễn Trắc
              </button>
              <button 
                type="button" 
                className="btn btn-outline text-danger"
                onClick={handleClearTraces}
                title="Khôi phục dữ liệu mẫu"
              >
                <FaTrashAlt /> Đặt Lại Trace
              </button>
            </div>
          </div>

          {/* Metric Overview Row */}
          <div className="telemetry-stats-row">
            <div className="telem-stat-card">
              <span className="stat-label">Tổng Trace Sessions</span>
              <span className="stat-val text-primary">{telemetryStats.totalRequests}</span>
            </div>
            <div className="telem-stat-card">
              <span className="stat-label">Độ Trễ Trung Bình</span>
              <span className="stat-val text-success">{telemetryStats.avgLatencyMs} ms</span>
            </div>
            <div className="telem-stat-card">
              <span className="stat-label">Độ Trễ P95</span>
              <span className="stat-val text-warning">{telemetryStats.p95LatencyMs} ms</span>
            </div>
            <div className="telem-stat-card">
              <span className="stat-label">Tỷ Lệ Không Ảo Giác</span>
              <span className="stat-val text-success">{telemetryStats.zeroHallucinationRate}%</span>
            </div>
            <div className="telem-stat-card">
              <span className="stat-label">Guardrails Pass</span>
              <span className="stat-val text-success">{telemetryStats.guardrailsPassRate}%</span>
            </div>
          </div>

          {/* Trace Master-Detail View */}
          <div className="langfuse-master-detail-grid">
            <div className="trace-list-panel">
              <div className="sidebar-section-title">
                <FaHistory /> LỊCH SỬ TRACE GẦN ĐÂY
              </div>
              <div className="trace-items-scroll">
                {traces.map(tr => {
                  const isSelected = selectedTrace?.id === tr.id;
                  return (
                    <div 
                      key={tr.id}
                      className={`trace-item-row ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedTrace(tr)}
                    >
                      <div className="trace-row-top">
                        <span className="trace-id-badge"><code>{tr.id}</code></span>
                        <span className="trace-latency-badge">{tr.latencyMs} ms</span>
                      </div>
                      <div className="trace-user-query" title={tr.userQuery}>
                        {tr.userQuery}
                      </div>
                      <div className="trace-row-meta">
                        <span>{tr.totalTokens} tokens</span>
                        <span className="guardrail-indicator" style={{ color: tr.guardrailsPassed ? '#10b981' : '#ef4444' }}>
                          {tr.guardrailsPassed ? '✔ Guardrails Pass' : '✖ Flagged'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="trace-detail-panel">
              <div className="sidebar-section-title">
                <FaFileAlt /> CHI TIẾT TRACE VÀ NGUỒN GROUNDING
              </div>
              {selectedTrace ? (
                <div className="trace-detail-content">
                  <div className="detail-meta-grid">
                    <div className="meta-card">
                      <span className="meta-label">Session ID:</span>
                      <strong><code>{selectedTrace.sessionId}</code></strong>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">Model Pipeline:</span>
                      <strong>{selectedTrace.model}</strong>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">Độ Trễ:</span>
                      <strong className="text-success">{selectedTrace.latencyMs} ms</strong>
                    </div>
                    <div className="meta-card">
                      <span className="meta-label">Tokens:</span>
                      <strong>{selectedTrace.promptTokens} in / {selectedTrace.completionTokens} out ({selectedTrace.totalTokens} total)</strong>
                    </div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Câu hỏi người dùng (Prompt Input):</div>
                    <div className="query-box">{selectedTrace.userQuery}</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Phản hồi của AI (Output Preview):</div>
                    <div className="response-box">{selectedTrace.outputPreview}</div>
                  </div>

                  <div className="detail-section">
                    <div className="detail-label">Tài liệu Context7 đã Grounding:</div>
                    <div className="dep-tags-wrap">
                      {(selectedTrace.groundingSources || []).map(src => (
                        <span key={src} className="dep-tag text-primary">
                          <FaBook /> {src}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="guardrail-verdict-box">
                    <div className="verdict-title">
                      <FaShieldAlt style={{ color: '#10b981' }} /> Kết Quả Kiểm Định Guardrails AI
                    </div>
                    <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155' }}>
                      Phản hồi đã vượt qua bài kiểm tra không ảo giác về phần trăm hoàn hủy và cọc (Hallucination Score: {selectedTrace.hallucinationScore}).
                      Định danh nhạy cảm (PII) được bảo vệ chuẩn mực.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="empty-selection-placeholder">
                  <p>Chọn một trace để kiểm tra chi tiết luồng suy luận.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MEM0 CUSTOMER TRAVEL MEMORY & GUARDRAILS (mem0ai/mem0 & guardrails-ai) */}
      {activeTab === 'MEM0' && (
        <div className="mem0-profile-container card-surface">
          <div className="probe-top-bar">
            <div>
              <h3 className="probe-heading">Mem0 Customer Travel Memory & An Toàn Guardrails</h3>
              <p className="probe-desc">
                Lớp ghi nhớ hồ sơ khách hàng dài hạn giúp AI thấu hiểu sở thích gia đình, khẩu vị ăn uống và tự động cảnh báo thời hạn hộ chiếu.
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={handleResetMemory}
            >
              <FaSyncAlt /> Đặt Lại Hồ Sơ Gốc
            </button>
          </div>

          {savedNotification && (
            <div className="alert-toast animate-fade-in" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' }}>
              <FaCheck /> {savedNotification}
            </div>
          )}

          <div className="mem0-grid">
            {/* Cột 1: Thông tin hồ sơ & Hộ chiếu */}
            <div className="mem0-card">
              <h4 className="mem0-card-title"><FaUserCheck /> Hồ Sơ Khách Hàng Ghi Nhớ</h4>
              
              <div className="mem-field-row">
                <span className="mem-label">Nơi khởi hành ưu tiên:</span>
                <span className="mem-value"><strong>{customerMem.preferredDeparture}</strong></span>
              </div>

              <div className="mem-field-row">
                <span className="mem-label">Thành phần đoàn:</span>
                <span className="mem-value">{customerMem.partyType}</span>
              </div>

              <div className="mem-field-row">
                <span className="mem-label">Chế độ ăn uống & sức khỏe:</span>
                <span className="mem-value">
                  {customerMem.dietaryRestrictions.map(d => (
                    <span key={d} className="diet-pill">{d}</span>
                  ))}
                </span>
              </div>

              <div className="mem-field-row">
                <span className="mem-label">Ghi chú đặc biệt:</span>
                <span className="mem-value">{customerMem.notes}</span>
              </div>

              <div className="passport-alarm-card mt-3" style={{ borderLeft: `4px solid ${passportAlarm?.color || '#10b981'}` }}>
                <div className="alarm-header">
                  <FaShieldAlt style={{ color: passportAlarm?.color }} />
                  <strong>Kiểm Định Hộ Chiếu Xuất Cảnh</strong>
                </div>
                <div className="alarm-body">
                  <div>Số hộ chiếu: <strong>{customerMem.passportNumber}</strong></div>
                  <div>Ngày hết hạn: <strong>{customerMem.passportExpiryDate}</strong></div>
                  <p className="alarm-msg" style={{ color: passportAlarm?.color, marginTop: '6px' }}>
                    {passportAlarm?.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Cột 2: Danh sách điểm đến yêu thích & Grounding Preview */}
            <div className="mem0-card">
              <h4 className="mem0-card-title"><FaGlobe /> Điểm Đến Yêu Thích & Cá Nhân Hóa</h4>

              <div className="favorites-tags-wrap">
                {customerMem.favoriteDestinations.map(dest => (
                  <span key={dest} className="fav-dest-chip">
                    {dest}
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddDestination} className="add-pref-form mt-3">
                <input
                  type="text"
                  placeholder="Thêm điểm đến yêu thích (VD: Quy Nhơn, Hàn Quốc)..."
                  value={prefInput}
                  onChange={(e) => setPrefInput(e.target.value)}
                  className="pref-input"
                />
                <button type="submit" className="btn btn-primary btn-sm">Thêm</button>
              </form>

              <div className="prompt-injection-preview mt-4">
                <div className="preview-label">Đoạn Context Grounding được tự động tiêm vào AI Assistant:</div>
                <pre className="context-preview-box">
                  {customerMemoryEngine.generatePersonalizedGroundingContext()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArchitectureGraph;
