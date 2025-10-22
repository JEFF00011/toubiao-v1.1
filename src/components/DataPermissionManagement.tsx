import React, { useState } from 'react';
import { Plus, Trash2, RefreshCw, X, Shield, Eye, Edit } from 'lucide-react';

interface User {
  id: string;
  username: string;
  phone: string;
  company_name: string;
}

interface Company {
  id: string;
  name: string;
}

interface DataPermission {
  id: string;
  user_id: string;
  username: string;
  company_id: string;
  company_name: string;
  can_view: boolean;
  can_edit: boolean;
  granted_by_name: string;
  created_at: string;
}

const MOCK_USERS: User[] = [
  { id: '1', username: '用户1', phone: '13800001111', company_name: 'A1公司' },
  { id: '2', username: '用户2', phone: '13800002222', company_name: 'A2公司' },
  { id: '3', username: '用户3', phone: '13800003333', company_name: 'B公司' }
];

const MOCK_COMPANIES: Company[] = [
  { id: '1', name: 'A公司' },
  { id: '2', name: 'A1公司' },
  { id: '3', name: 'A2公司' },
  { id: '4', name: 'B公司' }
];

const MOCK_PERMISSIONS: DataPermission[] = [
  {
    id: '1',
    user_id: '1',
    username: '用户1',
    company_id: '2',
    company_name: 'A1公司',
    can_view: true,
    can_edit: false,
    granted_by_name: 'A公司管理员',
    created_at: '2024-01-01 10:00:00'
  },
  {
    id: '2',
    user_id: '2',
    username: '用户2',
    company_id: '3',
    company_name: 'A2公司',
    can_view: true,
    can_edit: false,
    granted_by_name: 'A公司管理员',
    created_at: '2024-01-01 11:00:00'
  }
];

const DataPermissionManagement = () => {
  const [permissions, setPermissions] = useState<DataPermission[]>(MOCK_PERMISSIONS);
  const [users] = useState<User[]>(MOCK_USERS);
  const [companies] = useState<Company[]>(MOCK_COMPANIES);
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<DataPermission | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    company_id: '',
    can_view: true,
    can_edit: false,
  });

  const handleReset = () => {
    setSearchUsername('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const filteredPermissions = () => {
    return permissions.filter(permission => {
      const matchUsername = !searchUsername ||
        permission.username.toLowerCase().includes(searchUsername.toLowerCase());
      return matchUsername;
    });
  };

  const paginatedPermissions = () => {
    const filtered = filteredPermissions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredPermissions().length / itemsPerPage);

  const handleAddPermission = () => {
    setFormData({
      user_id: '',
      company_id: '',
      can_view: true,
      can_edit: false,
    });
    setShowAddModal(true);
  };

  const handleDeletePermission = (permission: DataPermission) => {
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  const confirmAdd = () => {
    if (!formData.user_id || !formData.company_id) {
      alert('请选择用户和企业');
      return;
    }

    const exists = permissions.some(
      p => p.user_id === formData.user_id && p.company_id === formData.company_id
    );

    if (exists) {
      alert('该用户已拥有该企业的访问权限');
      return;
    }

    const user = users.find(u => u.id === formData.user_id);
    const company = companies.find(c => c.id === formData.company_id);

    if (!user || !company) {
      alert('用户或企业信息不存在');
      return;
    }

    const newPermission: DataPermission = {
      id: String(permissions.length + 1),
      user_id: formData.user_id,
      username: user.username,
      company_id: formData.company_id,
      company_name: company.name,
      can_view: formData.can_view,
      can_edit: formData.can_edit,
      granted_by_name: '当前管理员',
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

    setPermissions([...permissions, newPermission]);
    setShowAddModal(false);
  };

  const confirmDelete = () => {
    if (selectedPermission) {
      setPermissions(permissions.filter(p => p.id !== selectedPermission.id));
    }
    setShowDeleteModal(false);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-neutral-900">数据权限管理</h2>
                <p className="text-sm text-neutral-500 mt-1">管理用户对企业数据的访问权限</p>
              </div>
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
              onClick={handleAddPermission}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              授权访问
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">用户</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">可访问企业</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">查看权限</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">编辑权限</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">授权人</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">授权时间</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        加载中...
                      </div>
                    </td>
                  </tr>
                ) : paginatedPermissions().length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedPermissions().map((permission, index) => (
                    <tr key={permission.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {permission.username}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {permission.company_name}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {permission.can_view ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            可查看
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                            不可查看
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {permission.can_edit ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <Edit className="w-3 h-3 mr-1" />
                            可编辑
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                            不可编辑
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {permission.granted_by_name}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {permission.created_at}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeletePermission(permission)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          撤销
                        </button>
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
          共 {filteredPermissions().length} 条
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">授权数据访问</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    选择用户 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">请选择用户</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.company_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    可访问企业 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">请选择企业</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700">
                    权限设置
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="can_view"
                      checked={formData.can_view}
                      onChange={(e) => setFormData({ ...formData, can_view: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="can_view" className="ml-2 text-sm text-neutral-700">
                      可查看数据
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="can_edit"
                      checked={formData.can_edit}
                      onChange={(e) => setFormData({ ...formData, can_edit: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="can_edit" className="ml-2 text-sm text-neutral-700">
                      可编辑数据
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmAdd}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors"
                >
                  确认授权
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">撤销访问权限</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-neutral-700">
                  确定要撤销 <span className="font-semibold">{selectedPermission.username}</span> 对
                  <span className="font-semibold"> {selectedPermission.company_name}</span> 的访问权限吗？
                </p>
                <p className="text-sm text-neutral-500 mt-2">撤销后该用户将无法访问该企业的数据。</p>
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
                  确认撤销
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPermissionManagement;
