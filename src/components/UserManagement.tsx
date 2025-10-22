import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, X, RotateCcw } from 'lucide-react';

interface User {
  id: string;
  username: string;
  phone: string;
  role: string;
  enabled: boolean;
  created_at: string;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    username: '管理员',
    phone: '13800138000',
    role: '超级管理员',
    enabled: true,
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: '2',
    username: '项目管理员',
    phone: '13800138001',
    role: '项目管理员',
    enabled: true,
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: '3',
    username: '张三',
    phone: '13800138002',
    role: '普通用户',
    enabled: true,
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: '4',
    username: '李四',
    phone: '13800138003',
    role: '普通用户',
    enabled: true,
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: '5',
    username: '王五',
    phone: '13800138004',
    role: '普通用户',
    enabled: true,
    created_at: '2024-01-01 00:00:00'
  }
];


interface UserManagementProps {
  canEdit?: boolean;
  canDelete?: boolean;
  viewOwnOnly?: boolean;
  currentUser?: { username: string; role: string };
  dataScope?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({
  canEdit = true,
  canDelete = true,
  viewOwnOnly = false,
  currentUser,
  dataScope
}) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    role: '普通用户',
    password: 'toubiao@123',
    enabled: true,
  });

  const handleReset = () => {
    setSearchUsername('');
    setSearchPhone('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const filteredUsers = () => {
    let userList = users;

    if (viewOwnOnly && currentUser) {
      userList = users.filter(user => user.username === currentUser.username);
    }

    return userList
      .filter(user => {
        const matchUsername = !searchUsername || user.username.toLowerCase().includes(searchUsername.toLowerCase());
        const matchPhone = !searchPhone || user.phone?.includes(searchPhone);
        const matchStatus = statusFilter === 'all' ||
          (statusFilter === 'enabled' && user.enabled) ||
          (statusFilter === 'disabled' && !user.enabled);
        return matchUsername && matchPhone && matchStatus;
      })
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  };

  const paginatedUsers = () => {
    const filtered = filteredUsers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredUsers().length / itemsPerPage);

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleAddUser = () => {
    setFormData({
      username: '',
      phone: '',
      role: '普通用户',
      password: 'toubiao@123',
      enabled: true,
    });
    setCurrentView('add');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      phone: user.phone,
      role: user.role,
      password: 'toubiao@123',
      enabled: user.enabled,
    });
    setCurrentView('edit');
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const confirmAdd = async () => {
    if (!validatePhone(formData.phone)) {
      alert('请输入正确的手机号码（11位数字，以1开头）');
      return;
    }

    const newUser: User = {
      id: String(users.length + 1),
      username: formData.username,
      phone: formData.phone,
      role: formData.role,
      enabled: formData.enabled,
      created_at: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    };
    setUsers([...users, newUser]);
    setCurrentView('list');
  };

  const confirmEdit = async () => {
    if (selectedUser) {
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, username: formData.username, role: formData.role, enabled: formData.enabled }
          : u
      ));
    }
    setCurrentView('list');
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
    }
    setShowDeleteModal(false);
  };

  const confirmResetPassword = async () => {
    setShowResetPasswordModal(false);
  };

  const handleToggleUserStatus = (user: User) => {
    setUsers(users.map(u =>
      u.id === user.id
        ? { ...u, enabled: !u.enabled }
        : u
    ));
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpPage('');
    }
  };

  const renderUserForm = () => {
    const isEdit = currentView === 'edit';
    const title = isEdit ? '编辑用户' : '新增用户';

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
              <button
                onClick={() => setCurrentView('list')}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入姓名"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  手机号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入11位手机号"
                  disabled={isEdit}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  角色 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="超级管理员">超级管理员 - 拥有系统所有权限，可管理所有数据和用户</option>
                  <option value="项目管理员">项目管理员 - 可管理本企业范围内的数据和用户</option>
                  <option value="普通用户">普通用户 - 只能使用基本业务功能，知识库只读</option>
                </select>
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    初始密码
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    disabled
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 cursor-not-allowed text-neutral-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">默认密码为 toubiao@123，用户首次登录后可修改</p>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="enabled" className="ml-2 text-sm text-neutral-700">
                  启用账号
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={isEdit ? confirmEdit : confirmAdd}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {isEdit ? '保存' : '新增'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'add' || currentView === 'edit') {
    return renderUserForm();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">用户管理</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                用户名
                <input
                  type="text"
                  placeholder="请输入用户名"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                手机号
                <input
                  type="text"
                  placeholder="请输入手机号"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                状态
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-32 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部状态</option>
                  <option value="enabled">启用</option>
                  <option value="disabled">禁用</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
                >
                  重置
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  查询
                </button>
              </div>
            </div>
          </div>

        <div className="px-6 py-3 border-b border-neutral-200">
          <button
            onClick={handleAddUser}
            className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增用户
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">姓名</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">手机号</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">角色</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">状态</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">创建日期</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      加载中...
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers().length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedUsers().map((user, index) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{user.username}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">{user.phone}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">{user.role}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          user.enabled
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          user.enabled ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {user.enabled ? '启用' : '禁用'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                      {user.created_at}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          编辑
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="px-2 py-1 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          重置密码
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        </div>
      </div>

      <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-center gap-6">
        <div className="text-sm text-neutral-700">
          共 {filteredUsers().length} 条
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              currentPage === 1
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            &lt;
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 10) {
                pageNum = i + 1;
              } else if (currentPage <= 5) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 4) {
                pageNum = totalPages - 9 + i;
              } else {
                pageNum = currentPage - 4 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-1 text-sm rounded transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {totalPages > 10 && (
            <>
              <span className="text-neutral-500">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`px-2.5 py-1 text-sm rounded transition-colors ${
                  currentPage === totalPages
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              currentPage === totalPages
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            &gt;
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={itemsPerPage}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
          <span className="text-sm text-neutral-700">前往</span>
          <input
            type="number"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            placeholder="页"
            className="w-12 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            min={1}
            max={totalPages}
          />
          <button
            onClick={handleJumpToPage}
            className="px-3 py-1 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
          >
            页
          </button>
        </div>
      </div>

      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">删除用户</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-neutral-700">
                  确定要删除用户 <span className="font-semibold">{selectedUser.username}</span> 吗？
                </p>
                <p className="text-sm text-neutral-500 mt-2">此操作不可恢复。</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
