import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Search } from 'lucide-react';

interface CheckPoint {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  isDefault?: boolean;
}

interface CheckPointManagerProps {
  onClose: () => void;
}

const MOCK_PUBLIC_CHECKPOINTS: CheckPoint[] = [
  { id: 'default-stamp', name: '盖章项检查', description: '检查投标文件中涉及盖章的部分是否全部盖章', isPublic: true, isDefault: true },
];

const CheckPointManager: React.FC<CheckPointManagerProps> = ({ onClose }) => {
  const [checkPoints, setCheckPoints] = useState<CheckPoint[]>(MOCK_PUBLIC_CHECKPOINTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCheckPoint, setSelectedCheckPoint] = useState<CheckPoint | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });


  const filteredCheckPoints = checkPoints.filter(cp =>
    cp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cp.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setFormData({ name: '', description: '' });
    setShowAddModal(true);
  };

  const handleEdit = (checkPoint: CheckPoint) => {
    if (checkPoint.isDefault) {
      return;
    }
    setSelectedCheckPoint(checkPoint);
    setFormData({
      name: checkPoint.name,
      description: checkPoint.description
    });
    setShowEditModal(true);
  };

  const handleDelete = (checkPoint: CheckPoint) => {
    if (checkPoint.isDefault) {
      return;
    }
    setSelectedCheckPoint(checkPoint);
    setShowDeleteModal(true);
  };

  const confirmAdd = () => {
    const newCheckPoint: CheckPoint = {
      id: String(Date.now()),
      name: formData.name,
      description: formData.description,
      isPublic: true
    };
    setCheckPoints([...checkPoints, newCheckPoint]);
    setShowAddModal(false);
  };

  const confirmEdit = () => {
    if (selectedCheckPoint) {
      setCheckPoints(checkPoints.map(cp =>
        cp.id === selectedCheckPoint.id
          ? { ...cp, name: formData.name, description: formData.description }
          : cp
      ));
    }
    setShowEditModal(false);
    setSelectedCheckPoint(null);
  };

  const confirmDelete = () => {
    if (selectedCheckPoint) {
      setCheckPoints(checkPoints.filter(cp => cp.id !== selectedCheckPoint.id));
    }
    setShowDeleteModal(false);
    setSelectedCheckPoint(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">通用检查点管理</h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜索检查点名称、描述或分类..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增检查点
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredCheckPoints.map((checkPoint) => (
              <div
                key={checkPoint.id}
                className="bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 mb-2">{checkPoint.name}</h4>
                    <p className="text-sm text-neutral-600">{checkPoint.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {checkPoint.isDefault ? (
                      <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                        默认检查项
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(checkPoint)}
                          className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(checkPoint)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          删除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCheckPoints.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <p>没有找到匹配的检查点</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-neutral-600">
              共 {filteredCheckPoints.length} 个检查点
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">新增检查点</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    检查点名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入检查点名称"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    检查点描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="请输入检查点描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmAdd}
                    disabled={!formData.name || !formData.description}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedCheckPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">编辑检查点</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    检查点名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    检查点描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmEdit}
                    disabled={!formData.name || !formData.description}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedCheckPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">删除检查点</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-neutral-700">
                  确定要删除检查点 <span className="font-semibold">"{selectedCheckPoint.name}"</span> 吗？
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

export default CheckPointManager;
