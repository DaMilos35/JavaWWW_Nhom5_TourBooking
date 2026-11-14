import React, { useState, useMemo } from 'react';
import { FaHistory, FaFilter, FaDownload, FaSearch, FaUser, FaMapMarkedAlt, FaShoppingCart, FaSignInAlt, FaTags, FaToggleOn, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// ---- Mock Data (replace with API call when backend ready) ----
const MOCK_LOGS = [
  { id: 1, timestamp: '2026-11-14T17:32:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'UPDATE', entity: 'Tour', entityId: 'T-241', detail: 'Cập nhật giá tour "Hà Long Luxury 5 Sao" từ 4.500.000đ → 4.890.000đ', ip: '192.168.1.5' },
  { id: 2, timestamp: '2026-11-14T16:55:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'HIDE', entity: 'Tour', entityId: 'T-089', detail: 'Tạm ẩn tour "Phú Quốc 3N2Đ" (chuyển trạng thái ACTIVE → INACTIVE)', ip: '192.168.1.5' },
  { id: 3, timestamp: '2026-11-14T16:10:00', actor: 'nguyen.phi@email.com', role: 'User', action: 'ORDER', entity: 'Order', entityId: '#457', detail: 'Đặt tour "Hà Long Du Thuyền 5 Sao Ambassador", 2 vé – 19.800.000đ', ip: '103.56.78.21' },
  { id: 4, timestamp: '2026-11-14T15:45:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'CONFIRM', entity: 'Order', entityId: '#455', detail: 'Xác nhận thanh toán đơn hàng #455 – Vietcombank TXN-998821', ip: '192.168.1.5' },
  { id: 5, timestamp: '2026-11-14T14:30:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'CREATE', entity: 'Tour', entityId: 'T-302', detail: 'Thêm mới tour "Đà Lạt Cắm Trại 2N1Đ" – Danh mục: Khám phá', ip: '192.168.1.5' },
  { id: 6, timestamp: '2026-11-14T13:20:00', actor: 'le.son@email.com', role: 'User', action: 'LOGIN', entity: 'Auth', entityId: 'U-078', detail: 'Đăng nhập thành công từ Chrome/Windows', ip: '117.3.45.90' },
  { id: 7, timestamp: '2026-11-14T12:05:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'UPDATE', entity: 'Category', entityId: 'CAT-3', detail: 'Cập nhật danh mục "Biển Đảo & Nghỉ Dưỡng" – đổi ảnh đại diện', ip: '192.168.1.5' },
  { id: 8, timestamp: '2026-11-14T11:00:00', actor: 'tran.nam@email.com', role: 'User', action: 'CANCEL', entity: 'Order', entityId: '#440', detail: 'Hủy đơn chưa thanh toán #440 (miễn phí 100%)', ip: '203.113.5.12' },
  { id: 9, timestamp: '2026-11-14T10:30:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'RESTORE', entity: 'Tour', entityId: 'T-120', detail: 'Khôi phục tour "Nha Trang 4N3Đ" từ trạng thái INACTIVE → ACTIVE', ip: '192.168.1.5' },
  { id: 10, timestamp: '2026-11-13T22:15:00', actor: 'nguyen.phi@email.com', role: 'User', action: 'LOGIN', entity: 'Auth', entityId: 'U-034', detail: 'Đăng nhập thành công từ Safari/iOS', ip: '42.112.88.7' },
  { id: 11, timestamp: '2026-11-13T20:40:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'UPDATE', entity: 'Order', entityId: '#439', detail: 'Cập nhật trạng thái đơn #439: CONFIRMED → COMPLETED', ip: '192.168.1.5' },
  { id: 12, timestamp: '2026-11-13T18:00:00', actor: 'le.son@email.com', role: 'User', action: 'ORDER', entity: 'Order', entityId: '#438', detail: 'Đặt tour "Hội An Phố Cổ 3N2Đ", 3 vé – 8.700.000đ', ip: '117.3.45.90' },
  { id: 13, timestamp: '2026-11-13T15:30:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'CREATE', entity: 'Category', entityId: 'CAT-8', detail: 'Thêm danh mục mới "MICE & Doanh Nghiệp"', ip: '192.168.1.5' },
  { id: 14, timestamp: '2026-11-13T14:10:00', actor: 'tran.nam@email.com', role: 'User', action: 'LOGIN', entity: 'Auth', entityId: 'U-012', detail: 'Đăng nhập thất bại (sai mật khẩu) – lần 2', ip: '203.113.5.12' },
  { id: 15, timestamp: '2026-11-13T09:00:00', actor: 'admin@dulichviet.vn', role: 'Admin', action: 'HIDE', entity: 'Category', entityId: 'CAT-2', detail: 'Tạm ẩn danh mục "Xe Máy & Trekking" (hết mùa)', ip: '192.168.1.5' },
];

const ACTION_CONFIG = {
  CREATE:  { label: 'Thêm mới',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: <FaMapMarkedAlt /> },
  UPDATE:  { label: 'Cập nhật',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   icon: <FaMapMarkedAlt /> },
  HIDE:    { label: 'Tạm ẩn',      color: '#f97316', bg: 'rgba(249,115,22,0.12)',   icon: <FaToggleOn /> },
  RESTORE: { label: 'Khôi phục',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',   icon: <FaToggleOn /> },
  ORDER:   { label: 'Đặt tour',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',   icon: <FaShoppingCart /> },
  CONFIRM: { label: 'Xác nhận TT', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)',   icon: <FaEye /> },
  CANCEL:  { label: 'Hủy đơn',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    icon: <FaShoppingCart /> },
  LOGIN:   { label: 'Đăng nhập',   color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: <FaSignInAlt /> },
};

const ENTITY_ICON = {
  Tour:     <FaMapMarkedAlt style={{ color: '#6366f1' }} />,
  Order:    <FaShoppingCart style={{ color: '#0ea5e9' }} />,
  Category: <FaTags style={{ color: '#f59e0b' }} />,
  Auth:     <FaSignInAlt style={{ color: '#94a3b8' }} />,
};

const PAGE_SIZE = 8;

const formatTs = (ts) => {
  const d = new Date(ts);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const downloadCSV = (data) => {
  const headers = ['ID', 'Thời gian', 'Người dùng', 'Vai trò', 'Hành động', 'Đối tượng', 'ID đối tượng', 'Chi tiết', 'IP'];
  const rows = data.map(r => [r.id, r.timestamp, r.actor, r.role, r.action, r.entity, r.entityId, `"${r.detail}"`, r.ip]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `activity-log-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
};

export default function AdminActivityLog() {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      const matchSearch = search === '' || log.actor.toLowerCase().includes(search.toLowerCase()) || log.detail.toLowerCase().includes(search.toLowerCase()) || log.entityId.toLowerCase().includes(search.toLowerCase());
      const matchAction = filterAction === 'ALL' || log.action === filterAction;
      const matchRole = filterRole === 'ALL' || log.role === filterRole;
      const matchDate = filterDate === '' || log.timestamp.startsWith(filterDate);
      return matchSearch && matchAction && matchRole && matchDate;
    });
  }, [search, filterAction, filterRole, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = () => setPage(1);

  return (
    <div style={{ padding: '24px 28px', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaHistory style={{ color: '#6366f1' }} /> Nhật Ký Hoạt Động Hệ Thống
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Toàn bộ hành động của Admin & Khách hàng — {filtered.length} bản ghi tìm thấy
          </p>
        </div>
        <button
          onClick={() => downloadCSV(filtered)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
        >
          <FaDownload /> Xuất CSV
        </button>
      </div>

      {/* KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Tổng bản ghi', value: MOCK_LOGS.length, color: '#6366f1' },
          { label: 'Hôm nay', value: MOCK_LOGS.filter(l => l.timestamp.startsWith('2026-11-14')).length, color: '#0ea5e9' },
          { label: 'Admin actions', value: MOCK_LOGS.filter(l => l.role === 'Admin').length, color: '#f59e0b' },
          { label: 'User actions', value: MOCK_LOGS.filter(l => l.role === 'User').length, color: '#22c55e' },
          { label: 'Đặt tour', value: MOCK_LOGS.filter(l => l.action === 'ORDER').length, color: '#14b8a6' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <FaFilter style={{ color: '#94a3b8' }} />
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); handleFilter(); }}
            placeholder="Tìm theo email, mã đơn, nội dung..."
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#334155' }}>
          <option value="ALL">Tất cả hành động</option>
          {Object.keys(ACTION_CONFIG).map(a => <option key={a} value={a}>{ACTION_CONFIG[a].label}</option>)}
        </select>
        <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#334155' }}>
          <option value="ALL">Tất cả vai trò</option>
          <option value="Admin">Admin</option>
          <option value="User">Khách hàng</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={e => { setFilterDate(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#334155' }}
        />
        {(search || filterAction !== 'ALL' || filterRole !== 'ALL' || filterDate) && (
          <button onClick={() => { setSearch(''); setFilterAction('ALL'); setFilterRole('ALL'); setFilterDate(''); setPage(1); }} style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Thời gian', 'Người dùng', 'Hành động', 'Đối tượng', 'Chi tiết', 'IP'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>Không tìm thấy bản ghi nào</td></tr>
              ) : paginated.map((log, i) => {
                const ac = ACTION_CONFIG[log.action] || { label: log.action, color: '#64748b', bg: '#f1f5f9' };
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#475569', fontSize: '0.82rem' }}>{formatTs(log.timestamp)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: log.role === 'Admin' ? '#6366f1' : '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                          {log.actor.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.84rem' }}>{log.actor}</div>
                          <div style={{ fontSize: '0.74rem', color: log.role === 'Admin' ? '#6366f1' : '#0ea5e9', fontWeight: 600 }}>{log.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: ac.bg, color: ac.color, fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {ac.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                        {ENTITY_ICON[log.entity]}
                        <span style={{ fontWeight: 600 }}>{log.entity}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{log.entityId}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569', maxWidth: '320px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.detail}>{log.detail}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{log.ip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
          <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Hiển thị {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} bản ghi
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', background: page === 1 ? '#f1f5f9' : '#fff', color: page === 1 ? '#94a3b8' : '#334155', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', background: p === page ? '#6366f1' : '#fff', color: p === page ? '#fff' : '#334155', fontWeight: p === page ? 700 : 400, cursor: 'pointer' }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', background: page === totalPages ? '#f1f5f9' : '#fff', color: page === totalPages ? '#94a3b8' : '#334155', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
