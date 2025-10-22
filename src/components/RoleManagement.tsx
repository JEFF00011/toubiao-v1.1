import React, { useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw, X, CheckSquare } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description: string;
}

interface RolePermission {
  roleId: string;
  permissionCodes: string[];
}

const MOCK_ROLES: Role[] = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有系统所有功能权限，可管理所有企业和用户',
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: '2',
    name: '企业管理员',
    description: '可管理本企业的所有配置和用户，包括企业知识库',
    created_at: '2024-01-01 00:00:00'
  },
  {
    id: '3',
    name: '普通用户',
    description: '仅可查看企业知识库，拥有招标项目、投标文件生成和检查的所有权限',
    created_at: '2024-01-01 00:00:00'
  }
];

const MOCK_PERMISSIONS: Permission[] = [
  { id: '1', name: '查看企业知识库', code: 'knowledge_view', module: '企业知识库', description: '查看企业知识库内容' },
  { id: '2', name: '编辑企业知识库', code: 'knowledge_edit', module: '企业知识库', description: '编辑、上传企业知识库内容' },
  { id: '3', name: '查看招标项目', code: 'project_view', module: '招标项目管理', description: '查看招标项目' },
  { id: '4', name: '创建招标项目', code: 'project_create', module: '招标项目管理', description: '创建招标项目' },
  { id: '5', name: '编辑招标项目', code: 'project_edit', module: '招标项目管理', description: '编辑招标项目' },
  { id: '6', name: '删除招标项目', code: 'project_delete', module: '招标项目管理', description: '删除招标项目' },
  { id: '7', name: '查看投标文件', code: 'document_view', module: '投标文件生成', description: '查看生成的投标文件' },
  { id: '8', name: '生成投标文件', code: 'document_generate', module: '投标文件生成', description: '生成投标文件' },
  { id: '9', name: '编辑投标文件', code: 'document_edit', module: '投标文件生成', description: '编辑投标文件' },
  { id: '10', name: '删除投标文件', code: 'document_delete', module: '投标文件生成', description: '删除投标文件' },
  { id: '11', name: '查看检查结果', code: 'check_view', module: '投标文件检查', description: '查看投标文件检查结果' },
  { id: '12', name: '执行文件检查', code: 'check_execute', module: '投标文件检查', description: '执行投标文件检查' },
  { id: '13', name: '查看用户信息', code: 'user_view', module: '系统管理', description: '查看用户信息' },
  { id: '14', name: '管理用户', code: 'user_manage', module: '系统管理', description: '管理用户（增删改）' },
  { id: '15', name: '管理角色', code: 'role_manage', module: '系统管理', description: '管理角色和权限' },
  { id: '16', name: '管理企业', code: 'company_manage', module: '系统管理', description: '管理企业信息' },
  { id: '17', name: '系统设置', code: 'system_settings', module: '系统管理', description: '修改系统设置' }
];

const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
  { roleId: '1', permissionCodes: MOCK_PERMISSIONS.map(p => p.code) },
  {
    roleId: '2',
    permissionCodes: [
      'knowledge_view', 'knowledge_edit',
      'project_view', 'project_create', 'project_edit', 'project_delete',
      'document_view', 'document_generate', 'document_edit', 'document_delete',
      'check_view', 'check_execute',
      'user_view', 'user_manage'
    ]
  },
  {
    roleId: '3',
    permissionCodes: [
      'knowledge_view',
      'project_view', 'project_create', 'project_edit', 'project_delete',
      'document_view', 'document_generate', 'document_edit', 'document_delete',
      'check_view', 'check_execute',
      'user_view'
    ]
  }
];

interface RoleManagementProps {
  canEdit?: boolean;
  canDelete?: boolean;
  dataScope?: string;
  currentUser?: { username: string; role: string };
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  canEdit = true,
  canDelete = true,
  dataScope,
  currentUser
}) => {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [permissions] = useState<Permission[]>(MOCK_PERMISSIONS);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPermissions: [] as string[],
  });

  const handleReset = () => {
    setSearchName('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const filteredRoles = () => {
    return roles
      .filter(role => {
        const matchName = !searchName || role.name.toLowerCase().includes(searchName.toLowerCase());
        return matchName;
      })
      .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  };

  const paginatedRoles = () => {
    const filtered = filteredRoles();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredRoles().length / itemsPerPage);

  const getRolePermissionCount = (roleId: string): number => {
    const rp = rolePermissions.find(r => r.roleId === roleId);
    return rp ? rp.permissionCodes.length : 0;
  };

  const handleAddRole = () => {
    setFormData({
      name: '',
      description: '',
      selectedPermissions: [],
    });
    setCurrentView('add');
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    const rp = rolePermissions.find(r => r.roleId === role.id);
    setFormData({
      name: role.name,
      description: role.description,
      selectedPermissions: rp ? rp.permissionCodes : [],
    });
    setCurrentView('edit');
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const generateRoleCode = (name: string): string => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `role_${timestamp}_${randomStr}`;
  };

  const confirmAdd = async () => {
    if (!formData.name) {
      alert('请填写角色名称');
      return;
    }

    const generatedCode = generateRoleCode(formData.name);

    const newRole: Role = {
      id: String(roles.length + 1),
      name: formData.name,
      description: formData.description,
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

    setRoles([...roles, newRole]);
    setRolePermissions([...rolePermissions, {
      roleId: newRole.id,
      permissionCodes: formData.selectedPermissions
    }]);
    setCurrentView('list');
  };

  const confirmEdit = async () => {
    if (selectedRole) {
      setRoles(roles.map(r =>
        r.id === selectedRole.id
          ? { ...r, name: formData.name, description: formData.description }
          : r
      ));
      setRolePermissions(rolePermissions.map(rp =>
        rp.roleId === selectedRole.id
          ? { ...rp, permissionCodes: formData.selectedPermissions }
          : rp
      ));
    }
    setCurrentView('list');
  };

  const confirmDelete = async () => {
    if (selectedRole) {
      setRoles(roles.filter(r => r.id !== selectedRole.id));
      setRolePermissions(rolePermissions.filter(rp => rp.roleId !== selectedRole.id));
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

  const groupPermissionsByModule = () => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(p => {
      if (!grouped[p.module]) {
        grouped[p.module] = [];
      }
      grouped[p.module].push(p);
    });
    return grouped;
  };

  const handleTogglePermission = (permissionCode: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(permissionCode)
        ? prev.selectedPermissions.filter(p => p !== permissionCode)
        : [...prev.selectedPermissions, permissionCode]
    }));
  };

  const handleToggleModulePermissions = (module: string) => {
    const modulePermissions = permissions.filter(p => p.module === module);
    const modulePermissionCodes = modulePermissions.map(p => p.code);
    const allSelected = modulePermissionCodes.every(code => formData.selectedPermissions.includes(code));

    setFormData(prev => ({
      ...prev,
      selectedPermissions: allSelected
        ? prev.selectedPermissions.filter(p => !modulePermissionCodes.includes(p))
        : [...new Set([...prev.selectedPermissions, ...modulePermissionCodes])]
    }));
  };

  const renderRoleForm = () => {
    const isEdit = currentView === 'edit';
    const title = isEdit ? '编辑角色' : '新增角色';
    const groupedPermissions = groupPermissionsByModule();

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

            <div className="p-6 space-y-6 max-w-4xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  角色名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入角色名称"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  角色描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入角色描述"
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  角色权限 <span className="text-neutral-500 text-xs ml-2">已选择 {formData.selectedPermissions.length} 个权限</span>
                </label>
                <div className="border border-neutral-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([module, perms]) => {
                    const modulePermissionCodes = perms.map(p => p.code);
                    const allSelected = modulePermissionCodes.every(code => formData.selectedPermissions.includes(code));
                    const someSelected = modulePermissionCodes.some(code => formData.selectedPermissions.includes(code));

                    return (
                      <div key={module} className="mb-4 last:mb-0">
                        <div
                          className="flex items-center mb-2 pb-2 border-b border-neutral-200 cursor-pointer hover:bg-neutral-50 rounded px-2 py-1 -mx-2"
                          onClick={() => handleToggleModulePermissions(module)}
                        >
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <label className="ml-2 font-semibold text-neutral-900 cursor-pointer flex-1">
                            {module}
                            {someSelected && !allSelected && (
                              <span className="ml-2 text-xs text-neutral-500">（部分选中）</span>
                            )}
                          </label>
                        </div>
                        <div className="space-y-2 ml-6">
                          {perms.map(permission => (
                            <div
                              key={permission.id}
                              className="flex items-start hover:bg-neutral-50 rounded px-2 py-1 -mx-2 cursor-pointer"
                              onClick={() => handleTogglePermission(permission.code)}
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedPermissions.includes(permission.code)}
                                onChange={() => {}}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mt-0.5"
                              />
                              <div className="ml-2 flex-1">
                                <div className="text-sm font-medium text-neutral-900">
                                  {permission.name}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  {permission.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
    return renderRoleForm();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">角色管理</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                角色名称
                <input
                  type="text"
                  placeholder="请输入角色名称"
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
              onClick={handleAddRole}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增角色
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">角色名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">权限数量</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">角色描述</th>
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
                ) : paginatedRoles().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedRoles().map((role, index) => (
                    <tr key={role.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900">{role.name}</div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <span className="inline-flex items-center">
                          <CheckSquare className="w-4 h-4 mr-1 text-green-600" />
                          {getRolePermissionCount(role.id)} 个
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-neutral-600 max-w-xs truncate">
                        {role.description}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {role.created_at}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role)}
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
          共 {filteredRoles().length} 条
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

      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">删除角色</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-neutral-700">
                  确定要删除角色 <span className="font-semibold">{selectedRole.name}</span> 吗？
                </p>
                <p className="text-sm text-neutral-500 mt-2">此操作不可恢复，该角色的所有权限配置也将被删除。</p>
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

export default RoleManagement;
