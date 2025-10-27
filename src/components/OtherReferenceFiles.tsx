import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, FileText, Trash2, Edit, AlertTriangle } from 'lucide-react';

interface ReferenceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileDescription: string;
  attachments: { url: string; name: string; size: number }[];
  createdAt?: string;
}

interface OtherReferenceFilesProps {
  readOnly?: boolean;
  companyId: string;
}

const OtherReferenceFiles: React.FC<OtherReferenceFilesProps> = ({ companyId, readOnly = false }) => {
  const [items, setItems] = useState<ReferenceFile[]>(() => {
    const savedData = localStorage.getItem(`reference_files_${companyId}`);
    return savedData ? JSON.parse(savedData) : [];
  });

  useEffect(() => {
    localStorage.setItem(`reference_files_${companyId}`, JSON.stringify(items));
  }, [items, companyId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReferenceFile | null>(null);
  const [editingItem, setEditingItem] = useState<ReferenceFile | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    console.log('Searching:', searchTerm);
  };

  const handleAdd = () => {
    setEditingItem({
      id: '',
      fileName: '',
      fileType: '',
      fileDescription: '',
      attachments: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: ReferenceFile) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = (item: ReferenceFile) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmAdd = () => {
    if (editingItem) {
      const newItem: ReferenceFile = {
        ...editingItem,
        id: String(Date.now()),
        createdAt: new Date().toISOString()
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
      setEditingItem({
        ...editingItem,
        attachments: editingItem.attachments.filter((_, i) => i !== index)
      });
    }
  };

  const filteredItems = items.filter(item =>
    !searchTerm ||
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fileType.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
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

  const renderFormModal = (isEdit: boolean) => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="text-lg font-medium text-neutral-900">
              {isEdit ? '编辑其他参考文件' : '上传其他参考文件'}
            </h3>
            <button
              onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                文件名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingItem.fileName}
                onChange={(e) => setEditingItem({ ...editingItem, fileName: e.target.value })}
                placeholder="请输入文件名称"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                文件类型 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingItem.fileType}
                onChange={(e) => setEditingItem({ ...editingItem, fileType: e.target.value })}
                placeholder="请输入文件类型"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                文件描述
              </label>
              <textarea
                value={editingItem.fileDescription}
                onChange={(e) => setEditingItem({ ...editingItem, fileDescription: e.target.value })}
                placeholder="请输入文件描述"
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                附件 <span className="text-red-500">*</span>
              </label>
              <div
                className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => handleAddFile({ name: `${editingItem.fileName || '文件'}.pdf`, size: 2048000 })}
              >
                <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-sm text-neutral-600 mb-1">点击上传文件（支持多选）</p>
                <p className="text-xs text-neutral-500">仅支持 JPG、PNG、JPEG、PDF 格式</p>
              </div>
              {editingItem.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {editingItem.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-900 truncate">{file.name}</span>
                        <span className="text-xs text-neutral-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
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
              onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
              className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={isEdit ? confirmEdit : confirmAdd}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              {isEdit ? '保存' : '确定'}
            </button>
          </div>
        </div>
      </div>
    );
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
              <h2 className="text-lg font-medium text-neutral-900">其他参考文件</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                文件名称
                <input
                  type="text"
                  placeholder="请输入文件名称"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

          {!readOnly && (
            <div className="px-6 py-3 border-b border-neutral-200">
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                上传其他参考文件
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">文件名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">文件类型</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">文件描述</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">附件数量</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedItems().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
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
                        <div className="max-w-xs truncate" title={item.fileName}>
                          {item.fileName}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {item.fileType}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={item.fileDescription}>
                          {item.fileDescription || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {item.attachments.length} 个文件
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
            <div className="text-sm text-neutral-700">共 {filteredItems.length} 条</div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`px-2 py-1 text-sm rounded transition-colors ${currentPage === 1 ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>&lt;</button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 10) pageNum = i + 1;
                  else if (currentPage <= 5) pageNum = i + 1;
                  else if (currentPage >= totalPages - 4) pageNum = totalPages - 9 + i;
                  else pageNum = currentPage - 4 + i;
                  return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-2.5 py-1 text-sm rounded transition-colors ${currentPage === pageNum ? 'bg-primary-600 text-white' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>{pageNum}</button>);
                })}
              </div>
              {totalPages > 10 && (<><span className="text-neutral-500">...</span><button onClick={() => setCurrentPage(totalPages)} className={`px-2.5 py-1 text-sm rounded transition-colors ${currentPage === totalPages ? 'bg-primary-600 text-white' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>{totalPages}</button></>)}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`px-2 py-1 text-sm rounded transition-colors ${currentPage === totalPages ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>&gt;</button>
            </div>
            <div className="flex items-center space-x-2">
              <select value={itemsPerPage} onChange={(e) => handlePageSizeChange(Number(e.target.value))} className="px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"><option value={10}>10条/页</option><option value={20}>20条/页</option><option value={50}>50条/页</option></select>
              <span className="text-sm text-neutral-700">前往</span>
              <input type="number" value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} placeholder="页" className="w-12 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500" min={1} max={totalPages} />
              <button onClick={handleJumpToPage} className="px-3 py-1 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors">页</button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && renderFormModal(false)}
      {showEditModal && renderFormModal(true)}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">确认删除</h3>
            </div>

            <div className="p-6">
              <p className="text-neutral-600">
                确定要删除文件 <span className="font-medium">"{selectedItem.fileName}"</span> 吗？此操作不可恢复。
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

export default OtherReferenceFiles;
