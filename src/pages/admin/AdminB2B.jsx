import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaBuilding, FaCheckCircle, FaClock, FaBan, FaExclamationTriangle,
  FaMoneyBillWave, FaFileContract, FaUsers, FaSearch, FaPlus,
  FaChartLine, FaThumbsUp, FaThumbsDown, FaEye, FaSyncAlt
} from 'react-icons/fa';
import './AdminB2B.css';

const API = 'http://localhost:8080/api/corporate';

const STATUS_BADGE = {
  VERIFIED:             { color: '#10b981', bg: '#d1fae5', label: 'Đã xác minh' },
  PENDING_VERIFICATION: { color: '#f59e0b', bg: '#fef3c7', label: 'Chờ xác minh' },
  REJECTED:             { color: '#ef4444', bg: '#fee2e2', label: 'Từ chối' },
  SUSPENDED:            { color: '#6b7280', bg: '#f3f4f6', label: 'Tạm khóa' },
};

const CREDIT_STATUS_BADGE = {
  ACTIVE:     { color: '#10b981', bg: '#d1fae5', label: 'Hoạt động' },
  WARNING:    { color: '#f59e0b', bg: '#fef3c7', label: 'Cảnh báo' },
  RESTRICTED: { color: '#ef4444', bg: '#fee2e2', label: 'Hạn chế' },
  BLOCKED:    { color: '#7c3aed', bg: '#ede9fe', label: 'Bị khóa' },
};

const APPROVAL_BADGE = {
  PENDING:  { color: '#f59e0b', bg: '#fef3c7', label: 'Chờ duyệt' },
  APPROVED: { color: '#10b981', bg: '#d1fae5', label: 'Đã duyệt' },
  REJECTED: { color: '#ef4444', bg: '#fee2e2', label: 'Từ chối' },
  EXPIRED:  { color: '#6b7280', bg: '#f3f4f6', label: 'Hết hạn' },
};

const fmt = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' ₫' : '—';

export default function AdminB2B() {
  const [tab, setTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [credit, setCredit] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState('PENDING');
  const [newCompanyForm, setNewCompanyForm] = useState({
    companyName: '', taxCode: '', emailDomain: '', billingEmail: '',
    registeredAddress: '', industry: '', companySize: 'ENTERPRISE',
    paymentMethod: 'CREDIT_LINE', vatName: '', vatAddress: ''
  });

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/companies`);
      setCompanies(await r.json());
    } catch { toast.error('Lỗi tải danh sách công ty'); }
    finally { setLoading(false); }
  };

  const selectCompany = async (company) => {
    setSelectedCompany(company);
    setTab('detail');
    const [creditR, policiesR, bookingsR, approvalsR] = await Promise.all([
      fetch(`${API}/companies/${company.companyId}/credit`),
      fetch(`${API}/companies/${company.companyId}/policies`),
      fetch(`${API}/companies/${company.companyId}/bookings`),
      fetch(`${API}/companies/${company.companyId}/approvals?status=${approvalFilter}`),
    ]);
    setCredit(creditR.ok ? await creditR.json() : null);
    setPolicies(policiesR.ok ? await policiesR.json() : []);
    const bkData = bookingsR.ok ? await bookingsR.json() : { data: [] };
    setBookings(bkData.data || []);
    const apData = approvalsR.ok ? await approvalsR.json() : { data: [] };
    setApprovals(apData.data || []);
  };

  const updateKyb = async (companyId, status) => {
    const r = await fetch(`${API}/companies/${companyId}/kyb`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (r.ok) {
      toast.success('Cập nhật KYB thành công!');
      fetchCompanies();
      if (selectedCompany?.companyId === companyId) {
        setSelectedCompany(prev => ({ ...prev, kybStatus: status }));
      }
    } else toast.error('Cập nhật thất bại');
  };

  const resolveApproval = async (approvalId, action) => {
    const note = action === 'approve' ? 'Đã phê duyệt' : prompt('Lý do từ chối:') || '';
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    const key = action === 'approve' ? 'note' : 'reason';
    const r = await fetch(`${API}/approvals/${approvalId}/${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approverCorpUserId: 1, [key]: note })
    });
    if (r.ok) {
      toast.success(action === 'approve' ? '✅ Đã phê duyệt!' : '❌ Đã từ chối!');
      if (selectedCompany) selectCompany(selectedCompany);
    } else {
      const err = await r.json();
      toast.error(err.message || 'Thao tác thất bại');
    }
  };

  const createCompany = async (e) => {
    e.preventDefault();
    const r = await fetch(`${API}/companies`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompanyForm)
    });
    if (r.ok) {
      toast.success('Tạo công ty thành công!');
      setShowCreateModal(false);
      fetchCompanies();
      setNewCompanyForm({ companyName: '', taxCode: '', emailDomain: '', billingEmail: '',
        registeredAddress: '', industry: '', companySize: 'ENTERPRISE',
        paymentMethod: 'CREDIT_LINE', vatName: '', vatAddress: '' });
    } else {
      const err = await r.json();
      toast.error(err.message || 'Tạo thất bại');
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.taxCode?.includes(search)
  );

  const Badge = ({ status, map }) => {
    const s = map[status] || { color: '#6b7280', bg: '#f3f4f6', label: status };
    return (
      <span style={{ color: s.color, background: s.bg, padding: '2px 10px',
        borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="b2b-page">
      {/* Header */}
      <div className="b2b-header">
        <div>
          <h1><FaBuilding style={{ marginRight: 10, color: '#6366f1' }} />Quản lý B2B Doanh nghiệp</h1>
          <p className="b2b-subtitle">Thẩm định KYB · Travel Policy · Hạn mức tín dụng · Phê duyệt đơn hàng</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <FaPlus /> Thêm công ty
        </button>
      </div>

      {/* Stats row */}
      <div className="b2b-stats">
        {[
          { icon: <FaBuilding />, label: 'Tổng công ty', value: companies.length, color: '#6366f1' },
          { icon: <FaCheckCircle />, label: 'Đã xác minh', value: companies.filter(c => c.kybStatus === 'VERIFIED').length, color: '#10b981' },
          { icon: <FaClock />, label: 'Chờ xác minh', value: companies.filter(c => c.kybStatus === 'PENDING_VERIFICATION').length, color: '#f59e0b' },
          { icon: <FaExclamationTriangle />, label: 'Đang hoạt động', value: companies.filter(c => c.isActive).length, color: '#3b82f6' },
        ].map((s, i) => (
          <div key={i} className="b2b-stat-card">
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="b2b-tabs">
        {[
          { key: 'companies', label: 'Danh sách công ty', icon: <FaBuilding /> },
          ...(selectedCompany ? [{ key: 'detail', label: selectedCompany.companyName, icon: <FaEye /> }] : []),
        ].map(t => (
          <button key={t.key} className={`b2b-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* COMPANIES TAB */}
      {tab === 'companies' && (
        <div className="b2b-panel">
          <div className="panel-toolbar">
            <div className="search-box">
              <FaSearch />
              <input placeholder="Tìm tên công ty, MST..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn-outline" onClick={fetchCompanies}><FaSyncAlt /> Làm mới</button>
          </div>

          {loading ? <div className="loading-spinner">Đang tải...</div> : (
            <div className="b2b-table-wrap">
              <table className="b2b-table">
                <thead>
                  <tr>
                    <th>Tên công ty</th>
                    <th>MST</th>
                    <th>Domain</th>
                    <th>Thanh toán</th>
                    <th>KYB</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map(c => (
                    <tr key={c.companyId} onClick={() => selectCompany(c)} className="clickable-row">
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.companyName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.industry}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{c.taxCode}</td>
                      <td>@{c.emailDomain}</td>
                      <td>
                        <span style={{
                          color: c.paymentMethod === 'CREDIT_LINE' ? '#6366f1' : '#10b981',
                          fontWeight: 600, fontSize: '0.8rem'
                        }}>
                          {c.paymentMethod === 'CREDIT_LINE' ? '💳 Tín dụng' : '💰 Trả trước'}
                        </span>
                      </td>
                      <td><Badge status={c.kybStatus} map={STATUS_BADGE} /></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {c.kybStatus === 'PENDING_VERIFICATION' && (
                            <>
                              <button className="btn-sm btn-success"
                                onClick={() => updateKyb(c.companyId, 'VERIFIED')}>
                                <FaThumbsUp /> Duyệt
                              </button>
                              <button className="btn-sm btn-danger"
                                onClick={() => updateKyb(c.companyId, 'REJECTED')}>
                                <FaThumbsDown /> Từ chối
                              </button>
                            </>
                          )}
                          <button className="btn-sm btn-outline"
                            onClick={() => selectCompany(c)}>
                            <FaEye /> Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCompanies.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
                      Không tìm thấy công ty nào
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DETAIL TAB */}
      {tab === 'detail' && selectedCompany && (
        <div className="b2b-detail">
          {/* Company Info */}
          <div className="detail-grid">
            <div className="detail-card">
              <h3><FaBuilding /> Thông tin doanh nghiệp</h3>
              <div className="info-rows">
                <div className="info-row"><span>Tên công ty</span><strong>{selectedCompany.companyName}</strong></div>
                <div className="info-row"><span>MST</span><code>{selectedCompany.taxCode}</code></div>
                <div className="info-row"><span>Domain email</span><code>@{selectedCompany.emailDomain}</code></div>
                <div className="info-row"><span>Trạng thái KYB</span><Badge status={selectedCompany.kybStatus} map={STATUS_BADGE} /></div>
                <div className="info-row"><span>Phương thức TT</span>
                  <span style={{ color: '#6366f1', fontWeight: 600 }}>
                    {selectedCompany.paymentMethod === 'CREDIT_LINE' ? '💳 Tín dụng' : '💰 Trả trước'}
                  </span>
                </div>
                <div className="info-row"><span>Địa chỉ</span><span>{selectedCompany.registeredAddress}</span></div>
              </div>
            </div>

            {/* Credit Limit */}
            {credit && (
              <div className="detail-card">
                <h3><FaChartLine /> Hạn mức tín dụng</h3>
                <Badge status={credit.accountStatus} map={CREDIT_STATUS_BADGE} />
                <div className="credit-bar-wrap">
                  <div className="credit-bar-track">
                    <div className="credit-bar-fill" style={{
                      width: `${Math.min(credit.usagePercent, 100)}%`,
                      background: credit.usagePercent >= 100 ? '#ef4444'
                        : credit.usagePercent >= 80 ? '#f59e0b' : '#10b981'
                    }} />
                  </div>
                  <span className="credit-pct">{credit.usagePercent}%</span>
                </div>
                <div className="info-rows" style={{ marginTop: 12 }}>
                  <div className="info-row"><span>Hạn mức</span><strong style={{ color: '#6366f1' }}>{fmt(credit.creditLimit)}</strong></div>
                  <div className="info-row"><span>Đã sử dụng</span><strong style={{ color: '#ef4444' }}>{fmt(credit.usedCredit)}</strong></div>
                  <div className="info-row"><span>Còn lại</span><strong style={{ color: '#10b981' }}>{fmt(credit.availableCredit)}</strong></div>
                  <div className="info-row"><span>Quá hạn</span><strong style={{ color: credit.overdueAmount > 0 ? '#ef4444' : '#94a3b8' }}>{fmt(credit.overdueAmount)}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Travel Policies */}
          <div className="detail-card" style={{ marginTop: 20 }}>
            <h3><FaFileContract /> Travel Policies ({policies.length})</h3>
            {policies.length === 0
              ? <p style={{ color: '#94a3b8' }}>Chưa có policy nào.</p>
              : (
                <div className="policy-grid">
                  {policies.map(p => (
                    <div key={p.policyId} className={`policy-card ${p.isDefault ? 'default' : ''}`}>
                      {p.isDefault && <span className="default-badge">Mặc định</span>}
                      <h4>{p.policyName}</h4>
                      <p>{p.description}</p>
                      <div className="policy-rules">
                        <div>💰 Hạn mức/chuyến: <strong>{fmt(p.maxAmountPerTrip)}</strong></div>
                        <div>📅 Đặt trước tối thiểu: <strong>{p.advanceBookingDaysMin} ngày</strong></div>
                        {p.requireApprovalAbove && (
                          <div>⚠️ Phê duyệt khi vượt: <strong>{fmt(p.requireApprovalAbove)}</strong></div>
                        )}
                        <div>🏨 Khách sạn tối đa: <strong>{p.maxHotelStar} sao</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Approvals */}
          <div className="detail-card" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}><FaClock /> Yêu cầu phê duyệt</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', ''].map(s => (
                  <button key={s} className={`filter-btn ${approvalFilter === s ? 'active' : ''}`}
                    onClick={() => setApprovalFilter(s)}>
                    {s || 'Tất cả'}
                  </button>
                ))}
              </div>
            </div>
            {approvals.length === 0
              ? <p style={{ color: '#94a3b8' }}>Không có yêu cầu phê duyệt nào.</p>
              : (
                <div className="b2b-table-wrap">
                  <table className="b2b-table">
                    <thead>
                      <tr>
                        <th>Mã yêu cầu</th>
                        <th>Booking</th>
                        <th>Người đặt</th>
                        <th>Số tiền</th>
                        <th>Vượt hạn</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.map(ar => (
                        <tr key={ar.approvalId}>
                          <td><code style={{ fontSize: '0.8rem' }}>{ar.approvalCode}</code></td>
                          <td><code style={{ fontSize: '0.8rem' }}>{ar.bookingCode}</code></td>
                          <td>{ar.requester}</td>
                          <td style={{ color: '#ef4444', fontWeight: 600 }}>{fmt(ar.bookingAmount)}</td>
                          <td style={{ color: '#f59e0b', fontWeight: 600 }}>+{fmt(ar.exceededAmount)}</td>
                          <td><Badge status={ar.status} map={APPROVAL_BADGE} /></td>
                          <td>
                            {ar.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn-sm btn-success"
                                  onClick={() => resolveApproval(ar.approvalId, 'approve')}>
                                  <FaThumbsUp /> Duyệt
                                </button>
                                <button className="btn-sm btn-danger"
                                  onClick={() => resolveApproval(ar.approvalId, 'reject')}>
                                  <FaThumbsDown /> Từ chối
                                </button>
                              </div>
                            )}
                            {ar.status !== 'PENDING' && (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{ar.approverNote || '—'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>

          {/* Bookings */}
          <div className="detail-card" style={{ marginTop: 20 }}>
            <h3><FaMoneyBillWave /> Đơn hàng B2B ({bookings.length})</h3>
            {bookings.length === 0
              ? <p style={{ color: '#94a3b8' }}>Chưa có đơn hàng nào.</p>
              : (
                <div className="b2b-table-wrap">
                  <table className="b2b-table">
                    <thead>
                      <tr><th>Mã</th><th>Tour</th><th>Liên hệ</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày tạo</th></tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.bookingId}>
                          <td><code style={{ fontSize: '0.8rem' }}>{b.bookingCode}</code></td>
                          <td style={{ maxWidth: 200 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{b.tourName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>x{b.quantity} · {b.discountPercent}% CK</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>{b.contactName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.contactEmail}</div>
                          </td>
                          <td style={{ color: '#10b981', fontWeight: 700 }}>{fmt(b.finalAmount)}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <Badge status={b.bookingStatus} map={{
                                CONFIRMED: { color: '#10b981', bg: '#d1fae5', label: '✅ Xác nhận' },
                                PENDING_APPROVAL: { color: '#f59e0b', bg: '#fef3c7', label: '⏳ Chờ duyệt' },
                                CANCELLED: { color: '#ef4444', bg: '#fee2e2', label: '❌ Hủy' },
                                COMPLETED: { color: '#6366f1', bg: '#ede9fe', label: '🏁 Hoàn thành' },
                              }} />
                              {b.isOverPolicy && <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>⚠️ Vượt hạn mức</span>}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>➕ Thêm Công ty Mới</h2>
            <form onSubmit={createCompany} className="modal-form">
              {[
                { label: 'Tên công ty *', key: 'companyName', required: true },
                { label: 'Mã số thuế *', key: 'taxCode', required: true },
                { label: 'Domain email *', key: 'emailDomain', placeholder: 'fpt.com.vn', required: true },
                { label: 'Email billing *', key: 'billingEmail', required: true },
                { label: 'Địa chỉ đăng ký', key: 'registeredAddress' },
                { label: 'Ngành nghề', key: 'industry' },
                { label: 'Tên trên hóa đơn VAT', key: 'vatName' },
                { label: 'Địa chỉ trên hóa đơn', key: 'vatAddress' },
              ].map(f => (
                <div key={f.key} className="form-row">
                  <label>{f.label}</label>
                  <input type="text" required={f.required}
                    placeholder={f.placeholder || ''}
                    value={newCompanyForm[f.key]}
                    onChange={e => setNewCompanyForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-row">
                <label>Quy mô</label>
                <select value={newCompanyForm.companySize}
                  onChange={e => setNewCompanyForm(p => ({ ...p, companySize: e.target.value }))}>
                  <option value="STARTUP">Startup</option>
                  <option value="SME">SME</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="form-row">
                <label>Phương thức thanh toán</label>
                <select value={newCompanyForm.paymentMethod}
                  onChange={e => setNewCompanyForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                  <option value="PAY_AS_YOU_GO">Trả trước (Pay-as-you-go)</option>
                  <option value="CREDIT_LINE">Tín dụng (Credit Line)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Tạo công ty</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
