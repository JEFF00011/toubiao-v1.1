import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Download, Settings, X } from 'lucide-react';
import DocumentFormatManager from './DocumentFormatManager';

interface GeneratedDocument {
  id: string;
  name: string;
  fileTypes: string[];
  projectName: string;
  companyName: string;
  status: 'draft' | 'generating' | 'completed';
  createdAt: string;
  generationProgress?: number;
}

interface GeneratedDocumentListProps {
  documents: GeneratedDocument[];
  onCreateClick: () => void;
  onViewDocument: (doc: GeneratedDocument) => void;
  onEditDocument: (doc: GeneratedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onDownloadDocument: (doc: GeneratedDocument) => void;
}

const GeneratedDocumentList: React.FC<GeneratedDocumentListProps> = ({
  documents,
  onCreateClick,
  onViewDocument,
  onEditDocument,
  onDeleteDocument,
  onDownloadDocument
}) => {
  const [searchName, setSearchName] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<GeneratedDocument | null>(null);
  const [showFormatManager, setShowFormatManager] = useState(false);

  const handleReset = () => {
    setSearchName('');
    setSearchCompany('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    // Search functionality
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesName = searchName === '' || doc.projectName.toLowerCase().includes(searchName.toLowerCase());
      const matchesCompany = searchCompany === '' || doc.companyName.toLowerCase().includes(searchCompany.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesName && matchesCompany && matchesStatus;
    })
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const paginatedDocuments = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDocuments.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

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

  const handleDeleteClick = (doc: GeneratedDocument) => {
    setDeletingDocument(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingDocument) {
      onDeleteDocument(deletingDocument.id);
      setShowDeleteModal(false);
      setDeletingDocument(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '草稿', className: 'bg-neutral-100 text-neutral-700' },
      generating: { label: '生成中', className: 'bg-blue-100 text-blue-700' },
      completed: { label: '已完成', className: 'bg-green-100 text-green-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (showFormatManager) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">投标文件格式管理</h2>
            <button
              onClick={() => setShowFormatManager(false)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              返回文件列表
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <DocumentFormatManager
            onSelectFormat={(format) => {
              console.log('Selected format:', format);
              alert('格式已应用，您可以在生成文件时使用此格式');
              setShowFormatManager(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white rounded-lg border border-neutral-200 flex flex-col h-full">
          <div className="px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">投标文件生成管理</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                项目名称
                <input
                  type="text"
                  placeholder="请输入项目名称"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                企业名称
                <input
                  type="text"
                  placeholder="请输入企业名称"
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                状态
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部</option>
                  <option value="draft">草稿</option>
                  <option value="generating">生成中</option>
                  <option value="completed">已完成</option>
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

          <div className="px-6 py-3 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onCreateClick}
                className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                新增投标文件
              </button>
              <button
                onClick={() => setShowFormatManager(true)}
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <Settings className="w-4 h-4 mr-1" />
                投标文件格式管理
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">项目名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">投标文件类型</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">招标项目</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">企业名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">状态</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">创建时间</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedDocuments().length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedDocuments().map((doc, index) => (
                    <tr key={doc.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={doc.name}>
                          {doc.name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {doc.fileTypes.map(type =>
                          type === 'commercial' ? '商务文件' : '技术文件'
                        ).join('、')}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={doc.projectName}>
                          {doc.projectName}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={doc.companyName}>
                          {doc.companyName}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doc.status)}
                          {doc.status === 'generating' && doc.generationProgress !== undefined && (
                            <span className="text-xs text-blue-600 font-medium">
                              {doc.generationProgress}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {doc.createdAt}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {doc.status === 'completed' && (
                            <button
                              onClick={() => onViewDocument(doc)}
                              className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              查看
                            </button>
                          )}
                          {doc.status === 'draft' && (
                            <button
                              onClick={() => onEditDocument(doc)}
                              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              编辑
                            </button>
                          )}
                          {doc.status === 'completed' && (
                            <button
                              onClick={() => onDownloadDocument(doc)}
                              className="px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              下载
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(doc)}
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

        <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-center gap-6">
          <div className="text-sm text-neutral-700">
            共 {filteredDocuments.length} 条
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

      {showDeleteModal && deletingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">确认删除</h3>
            <p className="text-neutral-700 mb-6">
              确定要删除文件 "<strong>{deletingDocument.name}</strong>" 吗？此操作无法撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingDocument(null);
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedDocumentList;
