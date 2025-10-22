import React, { useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw, X, UserPlus } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  code: string;
  contact_person: string;
  contact_phone: string;
  address: string;
  enabled: boolean;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  phone: string;
  role: string;
}

const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'A公司',
    code: 'company_a',
    contact_person: '张经理',
    contact_phone: '13800001111',
    address: '北京市朝阳区',
    enabled: true,
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: '2',
    name: 'A1公司',
    code: 'company_a1',
    contact_person: '王主管',
    contact_phone: '13800003333',
    address: '北京市海淀区',
    enabled: true,
    created_at: '2024-01-02 00:00:00'
  },
  {
    id: '3',
    name: 'A2公司',
    code: 'company_a2',
    contact_person: '赵主管',
    contact_phone: '13800004444',
    address: '北京市西城区',
    enabled: false,
    created_at: '2024-01-03 00:00:00'
  },
  {
    id: '4',
    name: 'B公司',
    code: 'company_b',
    contact_person: '李经理',
    contact_phone: '13800002222',
    address: '上海市浦东新区',
    enabled: true,
    created_at: '2024-01-04 00:00:00'
  }
];

const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', phone: '13800138000', role: '超级管理员' },
  { id: '2', username: 'company_admin_a', phone: '13800138001', role: '企业管理员' },
  { id: '3', username: '用户1', phone: '13800138002', role: '普通用户' },
  { id: '4', username: '用户2', phone: '13800138003', role: '普通用户' },
  { id: '5', username: '用户3', phone: '13800138004', role: '普通用户' },
  { id: '6', username: '张三', phone: '13800138005', role: '普通用户' },
  { id: '7', username: '李四', phone: '13800138006', role: '普通用户' },
  { id: '8', username: '王五', phone: '13800138007', role: '普通用户' }
];

interface CompanyManagementProps {
  canEdit?: boolean;
  canDelete?: boolean;
  dataScope?: string;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({ canEdit = true, canDelete = true }) => {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'addUsers' | 'manageUsers'>('list');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [newlyCreatedCompany, setNewlyCreatedCompany] = useState<Company | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [companyUsers, setCompanyUsers] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_person: '',
    contact_phone: '',
    address: '',
  });

  const handleReset = () => {
    setSearchName('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };


  const filteredCompanies = () => {
    return companies
      .filter(company => {
        const matchName = !searchName || company.name.toLowerCase().includes(searchName.toLowerCase());
        return matchName;
      })
      .sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  };

  const paginatedCompanies = () => {
    const filtered = filteredCompanies();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredCompanies().length / itemsPerPage);

  const handleAddCompany = () => {
    setFormData({
      name: '',
      code: '',
      contact_person: '',
      contact_phone: '',
      address: '',
    });
    setCurrentView('add');
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      code: company.code,
      contact_person: company.contact_person,
      contact_phone: company.contact_phone,
      address: company.address,
    });
    setCurrentView('edit');
  };

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const handleManageUsers = (company: Company) => {
    setSelectedCompany(company);
    const currentUsers = companyUsers[company.id] || [];
    setSelectedUsers(currentUsers);
    setCurrentView('manageUsers');
  };

  const generateCompanyCode = (name: string): string => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `company_${timestamp}_${randomStr}`;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const confirmAdd = async () => {
    if (!formData.name) {
      alert('请填写企业名称');
      return;
    }

    const generatedCode = generateCompanyCode(formData.name);

    const newCompany: Company = {
      id: String(companies.length + 1),
      name: formData.name,
      code: generatedCode,
      contact_person: formData.contact_person,
      contact_phone: formData.contact_phone,
      address: formData.address,
      created_by: '管理员',
      enabled: true,
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

    setCompanies([...companies, newCompany]);
    setNewlyCreatedCompany(newCompany);
    setSelectedUsers([]);
    setCurrentView('addUsers');
  };

  const confirmEdit = async () => {
    if (selectedCompany) {
      if (formData.contact_phone && !validatePhone(formData.contact_phone)) {
        alert('请输入正确的手机号码');
        return;
      }

      setCompanies(companies.map(c =>
        c.id === selectedCompany.id
          ? {
              ...c,
              name: formData.name,
              contact_person: formData.contact_person,
              contact_phone: formData.contact_phone,
              address: formData.address
            }
          : c
      ));
    }
    setCurrentView('list');
  };

  const confirmDelete = async () => {
    if (selectedCompany) {
      setCompanies(companies.filter(c => c.id !== selectedCompany.id));
    }
    setShowDeleteModal(false);
  };

  const handleToggleCompanyStatus = (company: Company) => {
    setCompanies(companies.map(c =>
      c.id === company.id
        ? { ...c, enabled: !c.enabled }
        : c
    ));
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const confirmAddUsers = () => {
    setCurrentView('list');
    setNewlyCreatedCompany(null);
    setSelectedUsers([]);
  };

  const skipAddUsers = () => {
    setCurrentView('list');
    setNewlyCreatedCompany(null);
    setSelectedUsers([]);
  };

  const confirmManageUsers = () => {
    if (selectedCompany) {
      setCompanyUsers({
        ...companyUsers,
        [selectedCompany.id]: selectedUsers
      });
    }
    setCurrentView('list');
    setSelectedCompany(null);
    setSelectedUsers([]);
  };

  const cancelManageUsers = () => {
    setCurrentView('list');
    setSelectedCompany(null);
    setSelectedUsers([]);
  };

  const getAvailableUsers = () => {
    return MOCK_USERS.filter(user => user.role !== '超级管理员');
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


  const renderAddUsersView = () => {
    if (!newlyCreatedCompany) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">为企业添加人员</h3>
              <p className="text-sm text-neutral-500 mt-1">
                已创建企业：<span className="font-medium text-neutral-900">{newlyCreatedCompany.name}</span>
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-neutral-700 mb-3">请选择要添加到该企业的用户（可多选）：</p>
              </div>

              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === MOCK_USERS.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(MOCK_USERS.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">用户名</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">手机号</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">角色</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {MOCK_USERS.map(user => (
                      <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleToggleUser(user.id)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-sm text-neutral-900">{user.username}</td>
                        <td className="px-4 py-2.5 text-sm text-neutral-900">{user.phone}</td>
                        <td className="px-4 py-2.5 text-sm text-neutral-900">{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedUsers.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    已选择 <span className="font-semibold">{selectedUsers.length}</span> 个用户
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
              <button
                onClick={skipAddUsers}
                className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                跳过，稍后添加
              </button>
              <button
                onClick={confirmAddUsers}
                disabled={selectedUsers.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                确认添加 {selectedUsers.length > 0 && `(${selectedUsers.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderManageUsersView = () => {
    if (!selectedCompany) return null;

    const availableUsers = getAvailableUsers();

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">人员授权管理</h3>
              <p className="text-sm text-neutral-500 mt-1">
                企业：<span className="font-medium text-neutral-900">{selectedCompany.name}</span>
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-neutral-700 mb-2">请选择有权访问该企业的用户（可多选）：</p>
                <p className="text-xs text-neutral-500">注意：超级管理员默认可查看所有企业，无需单独授权</p>
              </div>

              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === availableUsers.length && availableUsers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(availableUsers.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">用户名</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">手机号</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">角色</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {availableUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                          暂无可授权用户
                        </td>
                      </tr>
                    ) : (
                      availableUsers.map(user => (
                        <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-2.5">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleToggleUser(user.id)}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{user.username}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{user.phone}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{user.role}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {selectedUsers.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    已选择 <span className="font-semibold">{selectedUsers.length}</span> 个用户可访问此企业
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                onClick={cancelManageUsers}
                className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmManageUsers}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                保存授权
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompanyForm = () => {
    const isEdit = currentView === 'edit';
    const title = isEdit ? '编辑企业' : '新增企业';

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
                  企业名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入企业名称"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
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
                {isEdit ? '保存' : '下一步'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'add' || currentView === 'edit') {
    return renderCompanyForm();
  }

  if (currentView === 'addUsers') {
    return renderAddUsersView();
  }

  if (currentView === 'manageUsers') {
    return renderManageUsersView();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">企业管理</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                企业名称
                <input
                  type="text"
                  placeholder="请输入企业名称"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
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
              onClick={handleAddCompany}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增企业
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">企业名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600"></th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">状态</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">创建日期</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        加载中...
                      </div>
                    </td>
                  </tr>
                ) : paginatedCompanies().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedCompanies().map((company, index) => (
                    <tr key={company.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-sm font-medium text-neutral-900">{company.name}</span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {company.created_by}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleCompanyStatus(company)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            company.enabled
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            company.enabled ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          {company.enabled ? '启用' : '禁用'}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {company.created_at}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleManageUsers(company)}
                            className="px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            人员授权
                          </button>
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company)}
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
          共 {filteredCompanies().length} 条
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

      {showDeleteModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">删除企业</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-neutral-700">
                  确定要删除企业 <span className="font-semibold">{selectedCompany.name}</span> 吗？
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

export default CompanyManagement;
