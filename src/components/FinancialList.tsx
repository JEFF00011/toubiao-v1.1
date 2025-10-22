import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, FileText, Trash2, Edit, AlertTriangle } from 'lucide-react';

interface FinancialReport {
  id: string;
  reportName: string;
  year: string;
  attachments: { url: string; name: string; size: number }[];
}

interface FinancialListProps {
  readOnly?: boolean;
  companyId: string;
}

const FinancialList: React.FC<FinancialListProps> = ({ companyId, readOnly = false }) => {
  const [items, setItems] = useState<FinancialReport[]>(() => {
    const savedData = localStorage.getItem(`financial_${companyId}`);
    return savedData ? JSON.parse(savedData) : [
    {
      id: '1',
      reportName: '2024年度财务报告',
      year: '2024',
      attachments: [
        { url: '', name: '2024财务报告.pdf', size: 2048576 }
      ]
    }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`financial_${companyId}`, JSON.stringify(items));
  }, [items, companyId]);

  const [searchYear, setSearchYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinancialReport | null>(null);
  const [editingItem, setEditingItem] = useState<FinancialReport | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleReset = () => {
    setSearchYear('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    console.log('Searching:', searchYear);
  };

  const handleAdd = () => {
    setEditingItem({
      id: '',
      reportName: '',
      year: new Date().getFullYear().toString(),
      attachments: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: FinancialReport) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = (item: FinancialReport) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmAdd = () => {
    if (editingItem) {
      const newItem: FinancialReport = {
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

  const handleAddFile = (file: { name: string; size: number }) => {
    if (editingItem) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`文件 "${file.name}" 超过50MB限制，无法上传`);
        return;
      }
      const newAttachment = { url: '', name: file.name, size: file.size };
      setEditingItem({
        ...editingItem,
        attachments: [...editingItem.attachments, newAttachment]
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    if (editingItem) {
      const newAttachments = editingItem.attachments.filter((_, i) => i !== index);
      setEditingItem({ ...editingItem, attachments: newAttachments });
    }
  };

  const filteredItems = items
    .filter(item =>
      !searchYear || item.year === searchYear
    )
    .sort((a, b) => {
      return parseInt(b.year) - parseInt(a.year);
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

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 20; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="flex flex-col h-full">
      {readOnly && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <p className="text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            只读模式 - 无法编辑此信息
          </p>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">财务信息</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                时间
                <select
                  value={searchYear}
                  onChange={(e) => setSearchYear(e.target.value)}
                  className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">全部</option>
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
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

          {!readOnly && (
            <div className="px-6 py-3 border-b border-neutral-200">
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                新增报告
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">报告名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">时间</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">附件</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedItems().length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
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
                        <div className="max-w-xs truncate" title={item.reportName}>
                          {item.reportName}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {item.year}年
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate">
                          {item.attachments.map((file, fileIndex) => (
                            <div key={fileIndex} className="text-primary-600 hover:text-primary-800 cursor-pointer truncate" title={`${file.name} (${formatFileSize(file.size)})`}>
                              {file.name} ({formatFileSize(file.size)})
                            </div>
                          ))}
                        </div>
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
              <h3 className="text-lg font-medium text-neutral-900">新增财务报告</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  报告名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingItem.reportName}
                  onChange={(e) => setEditingItem({ ...editingItem, reportName: e.target.value })}
                  placeholder="请输入报告名称"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  时间 <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingItem.year}
                  onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  附件 <span className="text-red-500">*</span> <span className="text-neutral-500 text-xs">(支持多文件上传)</span>
                </label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('financial-upload-add')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">点击或拖拽文件到此处上传（支持多选）</p>
                  <p className="text-xs text-neutral-500 mt-1">仅支持 JPG、PNG、JPEG、PDF 格式</p>
                  <input
                    id="financial-upload-add"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        handleAddFile({ name: file.name, size: file.size });
                      });
                    }}
                  />
                </div>
                {editingItem.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-neutral-700">已上传文件：</p>
                    {editingItem.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-900 truncate">{file.name}</span>
                          <span className="text-xs text-neutral-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm ml-2 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
              <h3 className="text-lg font-medium text-neutral-900">编辑财务报告</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  报告名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingItem.reportName}
                  onChange={(e) => setEditingItem({ ...editingItem, reportName: e.target.value })}
                  placeholder="请输入报告名称"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  时间 <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingItem.year}
                  onChange={(e) => setEditingItem({ ...editingItem, year: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  附件 <span className="text-neutral-500 text-xs">(支持多文件上传)</span>
                </label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('financial-upload-edit')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">点击或拖拽文件到此处上传（支持多选）</p>
                  <p className="text-xs text-neutral-500 mt-1">仅支持 JPG、PNG、JPEG、PDF 格式</p>
                  <input
                    id="financial-upload-edit"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        handleAddFile({ name: file.name, size: file.size });
                      });
                    }}
                  />
                </div>
                {editingItem.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-neutral-700">已上传文件：</p>
                    {editingItem.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-900 truncate">{file.name}</span>
                          <span className="text-xs text-neutral-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm ml-2 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                确定要删除财务报告 <span className="font-medium">"{selectedItem.reportName}"</span> 吗？此操作不可恢复。
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

export default FinancialList;
