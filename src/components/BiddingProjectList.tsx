import React, { useState } from 'react';
import { Plus, Eye, Trash2, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle, FileText, Download, Edit } from 'lucide-react';

interface BiddingProject {
  id: string;
  projectName: string;
  status: 'pending' | 'parsing' | 'parsed' | 'failed' | 'completed';
  uploadTime: string;
  fileName: string;
  parseProgress?: number;
  errorMessage?: string;
  parsedData?: any;
}

interface BiddingProjectListProps {
  projects: BiddingProject[];
  onUploadClick: () => void;
  onViewProject: (project: BiddingProject) => void;
  onDeleteProject: (projectId: string) => void;
  onReparse: (project: BiddingProject) => void;
  onGenerateDocument: (project?: BiddingProject) => void;
  onDownloadProject: (project: BiddingProject) => void;
}

const BiddingProjectList: React.FC<BiddingProjectListProps> = ({
  projects,
  onUploadClick,
  onViewProject,
  onDeleteProject,
  onReparse,
  onGenerateDocument,
  onDownloadProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState<BiddingProject | null>(null);
  const [selectedProject, setSelectedProject] = useState<BiddingProject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const handleSearch = () => {
    console.log('Searching:', searchTerm, statusFilter);
  };

  const handleDelete = (project: BiddingProject) => {
    setDeletingProject(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingProject) {
      onDeleteProject(deletingProject.id);
      setShowDeleteModal(false);
      setDeletingProject(null);
    }
  };

  const filteredProjects = projects
    .filter(project => {
      const matchName = !searchTerm || project.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchName && matchStatus;
    })
    .sort((a, b) => {
      return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
    });

  const paginatedProjects = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

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

  const getStatusBadge = (status: BiddingProject['status']) => {
    const statusConfig = {
      pending: { label: '待解析', className: 'bg-gray-100 text-gray-800' },
      parsing: { label: '解析中', className: 'bg-blue-100 text-blue-800' },
      parsed: { label: '已解析', className: 'bg-green-100 text-green-800' },
      failed: { label: '解析失败', className: 'bg-red-100 text-red-800' },
      completed: { label: '已完成', className: 'bg-primary-100 text-primary-800' }
    };

    const config = statusConfig[status];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white rounded-lg border border-neutral-200 flex flex-col h-full">
          <div className="px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">招标项目管理</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                项目名称
                <input
                  type="text"
                  placeholder="请输入项目名称"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                状态
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部</option>
                  <option value="pending">待解析</option>
                  <option value="parsing">解析中</option>
                  <option value="parsed">已解析</option>
                  <option value="failed">解析失败</option>
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
            <div className="flex items-center gap-2">
              <button
                onClick={onUploadClick}
                className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                上传招标文件
              </button>
              <button
                onClick={() => selectedProject ? onGenerateDocument(selectedProject) : null}
                disabled={!selectedProject || selectedProject.status !== 'completed'}
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                title={!selectedProject ? '请先选择已完成的项目' : selectedProject.status !== 'completed' ? '仅已完成的项目可生成投标文件' : ''}
              >
                <FileText className="w-4 h-4 mr-1" />
                投标文件生成
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">选择</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">招标项目名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">状态</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">上传时间</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedProjects().map((project, index) => (
                    <tr key={project.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <input
                          type="radio"
                          name="selectedProject"
                          checked={selectedProject?.id === project.id}
                          onChange={() => setSelectedProject(project)}
                          disabled={project.status !== 'completed'}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={project.status !== 'completed' ? '仅已完成的项目可选择' : ''}
                        />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-md truncate" title={project.projectName}>
                          {project.projectName}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        {getStatusBadge(project.status)}
                        {project.status === 'parsing' && project.parseProgress !== undefined && (
                          <span className="ml-2 text-xs text-neutral-500">
                            {project.parseProgress}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {project.uploadTime}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          {(project.status === 'pending' || project.status === 'failed' || project.status === 'parsed') && (
                            <button
                              onClick={() => onViewProject(project)}
                              className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              编辑
                            </button>
                          )}
                          {(project.status === 'parsing' || project.status === 'completed') && (
                            <button
                              onClick={() => onViewProject(project)}
                              className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              查看
                            </button>
                          )}
                          {project.status === 'completed' && (
                            <button
                              onClick={() => onDownloadProject(project)}
                              className="px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              下载
                            </button>
                          )}
                          {project.status === 'failed' && (
                            <button
                              onClick={() => onReparse(project)}
                              className="px-2 py-1 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              重新解析
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(project)}
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

          <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-center gap-6 flex-shrink-0">
            <div className="text-sm text-neutral-700">
              共 {filteredProjects.length} 条
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
                onKeyDown={(e) => e.key === 'Enter' && handleJumpToPage()}
                placeholder="页"
                className="w-12 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                min={1}
                max={totalPages}
              />
              <button
                onClick={handleJumpToPage}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                跳转
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && deletingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">确认删除</h3>
            </div>

            <div className="p-6">
              <p className="text-neutral-600">
                确定要删除项目 <span className="font-medium">"{deletingProject.projectName}"</span> 吗？此操作不可恢复。
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

export default BiddingProjectList;
