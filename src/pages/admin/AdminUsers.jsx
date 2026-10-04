import React, { useState, useEffect } from 'react';
import { FaTrash, FaSearch, FaUserShield, FaUserCheck, FaShoppingBag, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const { user: currentUser } = useAuth();

  // Tải danh sách người dùng và danh sách đơn hàng để đếm số đơn
  const fetchData = async () => {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getOrders()
      ]);
      setUsers(usersRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Thay đổi quyền hạn (CUSTOMER <-> ADMIN)
  const handleRoleChange = async (id, newRole) => {
    if (id === currentUser?.id) {
      toast.error('Bạn không thể tự thay đổi quyền hạn của chính mình');
      return;
    }
    try {
      await adminApi.updateUser(id, { role: newRole });
      toast.success('Cập nhật quyền hạn thành công');
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi cập nhật quyền');
    }
  };

  // Khóa / Mở khóa tài khoản
  const handleToggleActive = async (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      toast.error('Bạn không thể tự khóa tài khoản của chính mình');
      return;
    }
    const newStatus = !targetUser.isActive;
    try {
      await adminApi.updateUser(targetUser.id, { isActive: newStatus });
      toast.success(`Đã ${newStatus ? 'mở khóa' : 'tạm khóa'} tài khoản ${targetUser.username}`);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái tài khoản');
    }
  };

  // Xóa tài khoản
  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      toast.error('Bạn không thể tự xóa tài khoản của chính mình');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await adminApi.deleteUser(id);
        toast.success('Xóa người dùng thành công');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể xóa người dùng đang có đơn hàng');
      }
    }
  };

  // Đếm số đơn hàng của người dùng
  const getUserOrderCount = (userId) => {
    return orders.filter(o => o.userId === userId).length;
  };

  // Lọc tìm kiếm
  const filteredUsers = users.filter(u => {
    const username = (u.username || '').toLowerCase();
    const fullName = (u.fullName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = (u.phone || '').toLowerCase();
    const query = searchKeyword.toLowerCase().trim();

    const matchesSearch = !query || 
      username.includes(query) || 
      fullName.includes(query) || 
      email.includes(query) || 
      phone.includes(query);

    const matchesRole = filterRole === 'ALL' || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="content-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>Quản Lý Người Dùng & Phân Quyền</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Tổng số {users.length} tài khoản trong hệ thống
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', flex: 1, minWidth: '240px' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Tìm theo username, họ tên, email, SĐT..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#1e293b' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Vai trò:</span>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', background: '#fff' }}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="CUSTOMER">Khách Hàng (CUSTOMER)</option>
            <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
          </select>
        </div>
      </div>

      <div className="admin-card" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Mã</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Tên đăng nhập</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Họ và Tên</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Email & SĐT</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Đơn đã đặt</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Vai Trò</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Trạng Thái</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(u => {
                  const orderCount = getUserOrderCount(u.id);
                  const isCurrent = u.id === currentUser?.id;
                  const isActive = u.isActive !== false;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>#{u.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0284c7' }}>
                        {u.username}
                        {isCurrent && (
                          <span style={{ marginLeft: '6px', fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>
                            (Bạn)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1e293b', fontWeight: 500 }}>
                        {u.fullName || 'Chưa cập nhật'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#334155', fontSize: '0.9rem' }}>{u.email}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{u.phone || 'Chưa có SĐT'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: orderCount > 0 ? '#0284c7' : '#94a3b8' }}>
                          <FaShoppingBag size={12} /> {orderCount} đơn
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <select 
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={isCurrent}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            border: '1px solid #cbd5e1',
                            backgroundColor: u.role === 'ADMIN' ? '#fef2f2' : '#f0fdf4',
                            color: u.role === 'ADMIN' ? '#dc2626' : '#16a34a',
                            cursor: isCurrent ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="CUSTOMER">Khách Hàng</option>
                          <option value="ADMIN">Quản Trị Viên</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleToggleActive(u)}
                          disabled={isCurrent}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: isCurrent ? 'not-allowed' : 'pointer',
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#15803d' : '#b91c1c'
                          }}
                          title={isCurrent ? 'Không thể tự khóa' : 'Bấm để khóa / mở khóa'}
                        >
                          {isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                          {isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button 
                          style={{
                            background: isCurrent ? '#f1f5f9' : '#fee2e2',
                            color: isCurrent ? '#94a3b8' : '#b91c1c',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: isCurrent ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleDelete(u.id)}
                          disabled={isCurrent}
                          title={isCurrent ? 'Không thể tự xóa tài khoản của bạn' : 'Xóa tài khoản người dùng'}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Không tìm thấy người dùng nào phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
