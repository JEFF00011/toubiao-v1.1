import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, AlertTriangle, CreditCard as Edit, Trash2, Sparkles } from 'lucide-react';

interface Qualification {
  id: string;
  name: string;
  certNumber: string;
  certScope: string;
  certOrganization: string;
  rating: string;
  validFrom?: string;
  validUntil: string;
  isPermanent?: boolean;
  attachments: { url?: string; name: string; id?: string }[];
}

interface QualificationListProps {
  readOnly?: boolean;
  companyId: string;
}

const QualificationList: React.FC<QualificationListProps> = ({ companyId, readOnly = false }) => {
  const [items, setItems] = useState<Qualification[]>(() => {
    const savedData = localStorage.getItem(`qualifications_${companyId}`);
    return savedData ? JSON.parse(savedData) : [
      {
        id: '1',
        name: 'ISO9001质量管理体系认证',
        certNumber: 'ISO9001-2024-001',
        certScope: '软件开发、系统集成',
        certOrganization: '中国质量认证中心',
        rating: '无',
        validFrom: '2024-01-01',
        validUntil: '2025-12-31',
        isPermanent: false,
        attachments: [{ id: '1', url: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=ISO9001', name: 'ISO9001证书.pdf' }]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`qualifications_${companyId}`, JSON.stringify(items));
  }, [items, companyId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchCertNumber, setSearchCertNumber] = useState('');
  const [searchRating, setSearchRating] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'expired'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Qualification | null>(null);
  const [editingItem, setEditingItem] = useState<Qualification | null>(null);

  const isExpired = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    return expiryDate < today;
  };

  const handleReset = () => {
    setSearchTerm('');
    setSearchCertNumber('');
    setSearchRating('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    console.log('Searching:', searchTerm, searchCertNumber, searchRating, statusFilter);
  };

  const handleAdd = () => {
    setEditingItem({
      id: '',
      name: '',
      certNumber: '',
      certScope: '',
      certOrganization: '',
      rating: '无',
      validFrom: '',
      validUntil: '',
      isPermanent: false,
      attachments: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: Qualification) => {
    setEditingItem({
      ...item,
      isPermanent: item.isPermanent || false
    });
    setShowEditModal(true);
  };

  const handleDelete = (item: Qualification) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmAdd = () => {
    if (editingItem) {
      const newItem: Qualification = {
        ...editingItem,
        id: String(Date.now())
      };
      setItems([...items, newItem]);
      setShowAddModal(false);
    }
  };

  const confirmEdit = () => {
    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id ? editingItem : item
      ));
      setShowEditModal(false);
    }
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setItems(items.filter(item => item.id !== selectedItem.id));
      setShowDeleteModal(false);
    }
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCertNumber = !searchCertNumber ||
        item.certNumber.toLowerCase().includes(searchCertNumber.toLowerCase());

      const matchesRating = searchRating === 'all' || item.rating === searchRating;

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'valid' && !isExpired(item.validUntil)) ||
        (statusFilter === 'expired' && isExpired(item.validUntil));

      return matchesSearch && matchesCertNumber && matchesRating && matchesStatus;
    })
    .sort((a, b) => {
      return new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime();
    });

  const paginatedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpPage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {readOnly && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <p className="text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            只读模式 - 无法编辑资质信息
          </p>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">资质信息</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                资质名称
                <input
                  type="text"
                  placeholder="请输入资质名称"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                资质编号
                <input
                  type="text"
                  placeholder="请输入资质编号"
                  value={searchCertNumber}
                  onChange={(e) => setSearchCertNumber(e.target.value)}
                  className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                评级
                <select
                  value={searchRating}
                  onChange={(e) => setSearchRating(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部</option>
                  <option value="无">无</option>
                  <option value="特级">特级</option>
                  <option value="一级">一级</option>
                  <option value="二级">二级</option>
                  <option value="三级">三级</option>
                  <option value="四级">四级</option>
                  <option value="五级">五级</option>
                  <option value="甲级">甲级</option>
                  <option value="乙级">乙级</option>
                  <option value="丙级">丙级</option>
                  <option value="AAA">AAA</option>
                  <option value="AAAA">AAAA</option>
                  <option value="AAAAA">AAAAA</option>
                  <option value="CS1">CS1</option>
                  <option value="CS2">CS2</option>
                  <option value="CS3">CS3</option>
                  <option value="CS4">CS4</option>
                  <option value="CS5">CS5</option>
                  <option value="一星级">一星级</option>
                  <option value="二星级">二星级</option>
                  <option value="三星级">三星级</option>
                  <option value="四星级">四星级</option>
                  <option value="五星级">五星级</option>
                  <option value="六星级">六星级</option>
                  <option value="七星级">七星级</option>
                  <option value="八星级">八星级</option>
                  <option value="九星级">九星级</option>
                  <option value="十星级">十星级</option>
                  <option value="十一星级">十一星级</option>
                  <option value="十二星级">十二星级</option>
                </select>
                资质状态
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'valid' | 'expired')}
                  className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部</option>
                  <option value="valid">有效</option>
                  <option value="expired">已过期</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
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

          {!readOnly && (
            <div className="px-6 py-3 border-b border-neutral-200">
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                新增资质
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">资质名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">资质编号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">评级</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">认证事项范围</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">认证机构</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">认证有效期</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">状态</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedItems().length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedItems().map((item, index) => (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={item.name}>
                          {item.name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {item.certNumber}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {item.rating || '无'}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={item.certScope}>
                          {item.certScope}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={item.certOrganization}>
                          {item.certOrganization}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <span className={isExpired(item.validUntil) ? 'text-red-600 font-medium' : ''}>
                          {item.validUntil}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {isExpired(item.validUntil) ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            已过期
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            有效
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        {!readOnly && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              删除
                            </button>
                          </div>
                        )}
                        {readOnly && (
                          <span className="text-xs text-neutral-400">只读</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-center gap-6">
            <div className="text-sm text-neutral-700">
              共 {filteredItems.length} 条
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
        </div>
      </div>

      {showAddModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-neutral-900">新增资质</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    资质名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="请输入资质名称"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    资质编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.certNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, certNumber: e.target.value })}
                    placeholder="请输入资质编号"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    认证事项范围 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editingItem.certScope}
                    onChange={(e) => setEditingItem({ ...editingItem, certScope: e.target.value })}
                    placeholder="请输入认证事项范围"
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    认证机构 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.certOrganization}
                    onChange={(e) => setEditingItem({ ...editingItem, certOrganization: e.target.value })}
                    placeholder="请输入认证机构"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    评级等级
                  </label>
                  <select
                    value={editingItem.rating}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="无">无</option>
                    <option value="特级">特级</option>
                    <option value="一级">一级</option>
                    <option value="二级">二级</option>
                    <option value="三级">三级</option>
                    <option value="四级">四级</option>
                    <option value="五级">五级</option>
                    <option value="甲级">甲级</option>
                    <option value="乙级">乙级</option>
                    <option value="丙级">丙级</option>
                    <option value="AAA">AAA</option>
                    <option value="AAAA">AAAA</option>
                    <option value="AAAAA">AAAAA</option>
                    <option value="CS1">CS1</option>
                    <option value="CS2">CS2</option>
                    <option value="CS3">CS3</option>
                    <option value="CS4">CS4</option>
                    <option value="CS5">CS5</option>
                    <option value="一星级">一星级</option>
                    <option value="二星级">二星级</option>
                    <option value="三星级">三星级</option>
                    <option value="四星级">四星级</option>
                    <option value="五星级">五星级</option>
                    <option value="六星级">六星级</option>
                    <option value="七星级">七星级</option>
                    <option value="八星级">八星级</option>
                    <option value="九星级">九星级</option>
                    <option value="十星级">十星级</option>
                    <option value="十一星级">十一星级</option>
                    <option value="十二星级">十二星级</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    认证有效期 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4 mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!editingItem.isPermanent}
                        onChange={() => setEditingItem({ ...editingItem, isPermanent: false })}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700">非长期</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={editingItem.isPermanent}
                        onChange={() => setEditingItem({ ...editingItem, isPermanent: true, validUntil: '', validFrom: '' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700">长期</span>
                    </label>
                  </div>
                  {!editingItem.isPermanent ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">生效日期</label>
                        <input
                          type="date"
                          value={editingItem.validFrom || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, validFrom: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">失效日期 <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={editingItem.validUntil}
                          onChange={(e) => setEditingItem({ ...editingItem, validUntil: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500">
                      长期有效
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    资质证书 <span className="text-red-500">*</span>
                  </label>
                  {editingItem.attachments && editingItem.attachments.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-3 gap-3 relative">
                        {editingItem.attachments.map((file, index) => (
                          <div key={file.id} className="relative group">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                            />
                            <button
                              onClick={() => {
                                setEditingItem({
                                  ...editingItem,
                                  attachments: editingItem.attachments.filter(f => f.id !== file.id)
                                });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {index === 0 && (
                              <button
                                onClick={() => {
                                  setEditingItem({
                                    ...editingItem,
                                    name: 'ISO9001质量管理体系认证',
                                    certNumber: 'ISO9001-2024-001',
                                    certScope: '软件开发、系统集成',
                                    certOrganization: '中国质量认证中心',
                                    rating: '无',
                                    validFrom: '2024-01-01',
                                    validUntil: '2025-12-31',
                                    isPermanent: false
                                  });
                                  alert('已自动填充资质信息');
                                }}
                                className="absolute bottom-1 right-1 flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-md"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>智能填充</span>
                              </button>
                            )}
                            <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('qualification-upload-add')?.click()}
                  >
                    <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                    <p className="text-xs text-neutral-600">点击上传</p>
                    <p className="text-xs text-neutral-500 mt-0.5">支持JPG、PNG格式</p>
                    <input
                      id="qualification-upload-add"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newFiles = files.map(f => ({
                          id: String(Date.now() + Math.random()),
                          name: f.name,
                          url: URL.createObjectURL(f)
                        }));
                        setEditingItem(prev => ({
                          ...prev,
                          attachments: [...prev.attachments, ...newFiles]
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmAdd}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-neutral-900">编辑资质</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    资质名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="请输入资质名称"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    资质编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.certNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, certNumber: e.target.value })}
                    placeholder="请输入资质编号"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    认证事项范围 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editingItem.certScope}
                    onChange={(e) => setEditingItem({ ...editingItem, certScope: e.target.value })}
                    placeholder="请输入认证事项范围"
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    认证机构 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.certOrganization}
                    onChange={(e) => setEditingItem({ ...editingItem, certOrganization: e.target.value })}
                    placeholder="请输入认证机构"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    评级等级
                  </label>
                  <select
                    value={editingItem.rating}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="无">无</option>
                    <option value="特级">特级</option>
                    <option value="一级">一级</option>
                    <option value="二级">二级</option>
                    <option value="三级">三级</option>
                    <option value="四级">四级</option>
                    <option value="五级">五级</option>
                    <option value="甲级">甲级</option>
                    <option value="乙级">乙级</option>
                    <option value="丙级">丙级</option>
                    <option value="AAA">AAA</option>
                    <option value="AAAA">AAAA</option>
                    <option value="AAAAA">AAAAA</option>
                    <option value="CS1">CS1</option>
                    <option value="CS2">CS2</option>
                    <option value="CS3">CS3</option>
                    <option value="CS4">CS4</option>
                    <option value="CS5">CS5</option>
                    <option value="一星级">一星级</option>
                    <option value="二星级">二星级</option>
                    <option value="三星级">三星级</option>
                    <option value="四星级">四星级</option>
                    <option value="五星级">五星级</option>
                    <option value="六星级">六星级</option>
                    <option value="七星级">七星级</option>
                    <option value="八星级">八星级</option>
                    <option value="九星级">九星级</option>
                    <option value="十星级">十星级</option>
                    <option value="十一星级">十一星级</option>
                    <option value="十二星级">十二星级</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    认证有效期 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4 mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!editingItem.isPermanent}
                        onChange={() => setEditingItem({ ...editingItem, isPermanent: false })}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700">非长期</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={editingItem.isPermanent}
                        onChange={() => setEditingItem({ ...editingItem, isPermanent: true, validUntil: '', validFrom: '' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700">长期</span>
                    </label>
                  </div>
                  {!editingItem.isPermanent ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">生效日期</label>
                        <input
                          type="date"
                          value={editingItem.validFrom || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, validFrom: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">失效日期 <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={editingItem.validUntil}
                          onChange={(e) => setEditingItem({ ...editingItem, validUntil: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500">
                      长期有效
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    资质证书 <span className="text-red-500">*</span>
                  </label>
                  {editingItem.attachments && editingItem.attachments.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-3 gap-3 relative">
                        {editingItem.attachments.map((file, index) => (
                          <div key={file.id || index} className="relative group">
                            {file.url ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                              />
                            ) : (
                              <div className="w-full h-32 flex items-center justify-center bg-neutral-100 rounded-lg border border-neutral-200">
                                <span className="text-xs text-neutral-500">{file.name}</span>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setEditingItem({
                                  ...editingItem,
                                  attachments: editingItem.attachments.filter((_, i) => i !== index)
                                });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {index === 0 && (
                              <button
                                onClick={() => {
                                  setEditingItem({
                                    ...editingItem,
                                    name: 'ISO9001质量管理体系认证',
                                    certNumber: 'ISO9001-2024-001',
                                    certScope: '软件开发、系统集成',
                                    certOrganization: '中国质量认证中心',
                                    rating: '无',
                                    validFrom: '2024-01-01',
                                    validUntil: '2025-12-31',
                                    isPermanent: false
                                  });
                                  alert('已自动填充资质信息');
                                }}
                                className="absolute bottom-1 right-1 flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-md"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>智能填充</span>
                              </button>
                            )}
                            <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('qualification-upload-edit')?.click()}
                  >
                    <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                    <p className="text-xs text-neutral-600">点击上传</p>
                    <p className="text-xs text-neutral-500 mt-0.5">支持JPG、PNG格式</p>
                    <input
                      id="qualification-upload-edit"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newFiles = files.map(f => ({
                          id: String(Date.now() + Math.random()),
                          name: f.name,
                          url: URL.createObjectURL(f)
                        }));
                        setEditingItem(prev => ({
                          ...prev,
                          attachments: [...prev.attachments, ...newFiles]
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmEdit}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">确认删除</h3>
            </div>

            <div className="p-6">
              <p className="text-neutral-600">
                确定要删除资质 <span className="font-medium">"{selectedItem.name}"</span> 吗？此操作不可恢复。
              </p>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualificationList;
