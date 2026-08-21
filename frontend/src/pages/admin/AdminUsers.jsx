import React, { useState, useEffect } from 'react';
import { FaTrash, FaUserEdit } from 'react-icons/fa';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } catch (error) {
      toast.error('Lá»—i khi táº£i danh sÃ¡ch ngÆ°á»i dÃ¹ng');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (id === currentUser?.id) {
      toast.error('Báº¡n khÃ´ng thá»ƒ tá»± thay Ä‘á»•i quyá»n cá»§a mÃ¬nh');
      return;
    }
    try {
      await adminApi.updateUser(id, { role: newRole });
      toast.success('Cáº­p nháº­t quyá»n thÃ nh cÃ´ng');
      fetchUsers();
    } catch (error) {
      toast.error('Lá»—i cáº­p nháº­t quyá»n');
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      toast.error('Báº¡n khÃ´ng thá»ƒ tá»± xÃ³a tÃ i khoáº£n cá»§a mÃ¬nh');
      return;
    }
    if (window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a ngÆ°á»i dÃ¹ng nÃ y?')) {
      try {
        await adminApi.deleteUser(id);
        toast.success('XÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'KhÃ´ng thá»ƒ xÃ³a ngÆ°á»i dÃ¹ng (cÃ³ thá»ƒ há» Ä‘Ã£ cÃ³ Ä‘Æ¡n hÃ ng)');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="content-header mb-4">
        <h2>Quáº£n lÃ½ NgÆ°á»i dÃ¹ng</h2>
      </div>

      <div className="admin-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Há» TÃªn</th>
                  <th>Email</th>
                  <th>SÄT</th>
                  <th>Vai TrÃ²</th>
                  <th>HÃ nh Ä‘á»™ng</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.fullName || 'N/A'}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <select 
                        className={`form-control form-control-sm ${u.role === 'ADMIN' ? 'bg-danger text-white' : ''}`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === currentUser?.id}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === currentUser?.id}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="text-center py-4">KhÃ´ng cÃ³ dá»¯ liá»‡u</td></tr>
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

