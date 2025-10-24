import React, { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface HeadingStyle {
  numberingStyle: string;
  fontFamily: string;
  fontSize: number;
  indent: number;
  lineSpacing: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  bold: boolean;
}

interface DocumentFormat {
  id?: string;
  name: string;
  header: string;
  footer: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  heading1: HeadingStyle;
  heading2: HeadingStyle;
  heading3: HeadingStyle;
  heading4: HeadingStyle;
  heading5: HeadingStyle;
  heading6: HeadingStyle;
  bodyText: HeadingStyle;
}

interface DocumentFormatManagerProps {
  onSelectFormat: (format: DocumentFormat) => void;
}

const defaultHeadingStyle: HeadingStyle = {
  numberingStyle: '1.',
  fontFamily: '宋体',
  fontSize: 14,
  indent: 0,
  lineSpacing: 1.5,
  alignment: 'left',
  bold: false
};

const DocumentFormatManager: React.FC<DocumentFormatManagerProps> = ({ onSelectFormat }) => {
  const [formats, setFormats] = useState<DocumentFormat[]>([
    {
      id: '1',
      name: '标准公文格式',
      header: '',
      footer: '第 {page} 页 共 {total} 页',
      marginTop: 25,
      marginBottom: 25,
      marginLeft: 30,
      marginRight: 30,
      heading1: { ...defaultHeadingStyle, numberingStyle: '一、', fontSize: 18, bold: true, alignment: 'center' },
      heading2: { ...defaultHeadingStyle, numberingStyle: '1.1.', fontSize: 16, bold: true },
      heading3: { ...defaultHeadingStyle, numberingStyle: '1.1.1.', fontSize: 15, bold: true },
      heading4: { ...defaultHeadingStyle, numberingStyle: '1.1.1.1.', fontSize: 14, bold: false },
      heading5: { ...defaultHeadingStyle, numberingStyle: '1.1.1.1.1.', fontSize: 14, bold: false },
      heading6: { ...defaultHeadingStyle, numberingStyle: '1.1.1.1.1.1.', fontSize: 14, bold: false },
      bodyText: { ...defaultHeadingStyle, numberingStyle: '', fontSize: 14, indent: 2 }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingFormat, setEditingFormat] = useState<DocumentFormat | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<DocumentFormat | null>(null);

  const fontOptions = [
    '宋体', '黑体', '微软雅黑', '仿宋', '楷体', 'Arial', 'Times New Roman'
  ];

  const numberingOptionsByLevel: { [key: string]: string[] } = {
    heading1: ['一、', '1、', '第一章、', '无序号'],
    heading2: ['1.1.', '（一）', '1、', '无序号'],
    heading3: ['1.1.1.', '1、', '（1）', '无序号'],
    heading4: ['1.1.1.1.', '（1）', '①', '无序号'],
    heading5: ['1.1.1.1.1.', '①', 'a.', '无序号'],
    heading6: ['1.1.1.1.1.1.', 'a.', 'A.', '无序号']
  };

  const alignmentOptions = [
    { value: 'left', label: '左对齐' },
    { value: 'center', label: '居中' },
    { value: 'right', label: '右对齐' },
    { value: 'justify', label: '两端对齐' }
  ];

  const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditingFormat({
      name: '',
      header: '',
      footer: '第 {page} 页 共 {total} 页',
      marginTop: 25,
      marginBottom: 25,
      marginLeft: 30,
      marginRight: 30,
      heading1: { ...defaultHeadingStyle, numberingStyle: '一、', fontSize: 18, bold: true, alignment: 'center' },
      heading2: { ...defaultHeadingStyle, numberingStyle: '1.1.', fontSize: 16, bold: true },
      heading3: { ...defaultHeadingStyle, numberingStyle: '1.1.1.', fontSize: 15, bold: true },
      heading4: { ...defaultHeadingStyle, numberingStyle: '1.1.1.1.', fontSize: 14, bold: false },
      heading5: { ...defaultHeadingStyle, numberingStyle: '1.1.1.1.1.', fontSize: 14, bold: false },
      heading6: { ...defaultHeadingStyle, numberingStyle: '1.1.1.1.1.1.', fontSize: 14, bold: false },
      bodyText: { ...defaultHeadingStyle, numberingStyle: '', fontSize: 14, indent: 2 }
    });
    setShowModal(true);
  };

  const handleEdit = (format: DocumentFormat) => {
    setEditingFormat({ ...format });
    setShowModal(true);
  };

  const handleDelete = (format: DocumentFormat) => {
    setSelectedFormat(format);
    setShowDeleteModal(true);
  };

  const confirmSave = () => {
    if (!editingFormat || !editingFormat.name.trim()) {
      alert('请输入格式名称');
      return;
    }

    if (editingFormat.id) {
      setFormats(formats.map(f => f.id === editingFormat.id ? editingFormat : f));
    } else {
      setFormats([...formats, { ...editingFormat, id: Date.now().toString() }]);
    }

    setShowModal(false);
    setEditingFormat(null);
  };

  const confirmDelete = () => {
    if (selectedFormat) {
      setFormats(formats.filter(f => f.id !== selectedFormat.id));
      setShowDeleteModal(false);
      setSelectedFormat(null);
    }
  };

  const updateEditingFormat = (field: keyof DocumentFormat, value: any) => {
    if (!editingFormat) return;
    setEditingFormat({ ...editingFormat, [field]: value });
  };

  const updateHeadingStyle = (heading: keyof DocumentFormat, field: keyof HeadingStyle, value: any) => {
    if (!editingFormat) return;
    const currentStyle = editingFormat[heading] as HeadingStyle;
    setEditingFormat({
      ...editingFormat,
      [heading]: { ...currentStyle, [field]: value }
    });
  };

  const filteredFormats = formats.filter(format =>
    !searchTerm ||
    format.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedFormats = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFormats.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredFormats.length / itemsPerPage);

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

  const renderHeadingEditor = (label: string, heading: keyof DocumentFormat) => {
    if (!editingFormat) return null;
    const style = editingFormat[heading] as HeadingStyle;
    const isBodyText = heading === 'bodyText';
    const numberingOptions = numberingOptionsByLevel[heading as string] || [];

    return (
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <h4 className="font-semibold text-neutral-900 mb-3">{label}</h4>
        <div className="grid grid-cols-2 gap-3">
          {!isBodyText && (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">序号样式</label>
              <select
                value={style.numberingStyle}
                onChange={(e) => updateHeadingStyle(heading, 'numberingStyle', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {numberingOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">字体</label>
            <select
              value={style.fontFamily}
              onChange={(e) => updateHeadingStyle(heading, 'fontFamily', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {fontOptions.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">字号</label>
            <input
              type="number"
              value={style.fontSize}
              onChange={(e) => updateHeadingStyle(heading, 'fontSize', parseInt(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min="10"
              max="72"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">首行缩进（字符）</label>
            <input
              type="number"
              value={style.indent}
              onChange={(e) => updateHeadingStyle(heading, 'indent', parseInt(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min="0"
              max="10"
              step="1"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">行距（倍）</label>
            <input
              type="number"
              value={style.lineSpacing}
              onChange={(e) => updateHeadingStyle(heading, 'lineSpacing', parseFloat(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              min="1"
              max="3"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">对齐方式</label>
            <select
              value={style.alignment}
              onChange={(e) => updateHeadingStyle(heading, 'alignment', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {alignmentOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={style.bold}
                onChange={(e) => updateHeadingStyle(heading, 'bold', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">加粗</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">投标文件格式管理</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                格式名称
                <input
                  type="text"
                  placeholder="请输入格式名称"
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

          <div className="px-6 py-3 border-b border-neutral-200">
            <button
              onClick={handleAdd}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增格式
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">格式名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">页边距</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">一级标题</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">正文</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedFormats().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedFormats().map((format, index) => (
                    <tr key={format.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={format.name}>
                          {format.name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {format.marginTop}/{format.marginBottom}/{format.marginLeft}/{format.marginRight}mm
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {format.heading1.fontFamily} {format.heading1.fontSize}pt
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {format.bodyText.fontFamily} {format.bodyText.fontSize}pt
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(format)}
                            className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(format)}
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

          <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-center gap-6">
            <div className="text-sm text-neutral-700">共 {filteredFormats.length} 条</div>
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

      {showModal && editingFormat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingFormat.id ? '编辑格式' : '新增格式'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  格式名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingFormat.name}
                  onChange={(e) => updateEditingFormat('name', e.target.value)}
                  placeholder="请输入格式名称"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">页眉</label>
                  <input
                    type="text"
                    value={editingFormat.header}
                    onChange={(e) => updateEditingFormat('header', e.target.value)}
                    placeholder="页眉内容（留空则不显示）"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">页脚</label>
                  <input
                    type="text"
                    value={editingFormat.footer}
                    onChange={(e) => updateEditingFormat('footer', e.target.value)}
                    placeholder="页脚内容，{page} = 当前页，{total} = 总页数"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">页边距（毫米）</label>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">上边距</label>
                    <input
                      type="number"
                      value={editingFormat.marginTop}
                      onChange={(e) => updateEditingFormat('marginTop', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="10"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">下边距</label>
                    <input
                      type="number"
                      value={editingFormat.marginBottom}
                      onChange={(e) => updateEditingFormat('marginBottom', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="10"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">左边距</label>
                    <input
                      type="number"
                      value={editingFormat.marginLeft}
                      onChange={(e) => updateEditingFormat('marginLeft', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="10"
                      max="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-600 mb-1">右边距</label>
                    <input
                      type="number"
                      value={editingFormat.marginRight}
                      onChange={(e) => updateEditingFormat('marginRight', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="10"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-neutral-900">标题样式设置</h4>
                {renderHeadingEditor('一级标题', 'heading1')}
                {renderHeadingEditor('二级标题', 'heading2')}
                {renderHeadingEditor('三级标题', 'heading3')}
                {renderHeadingEditor('四级标题', 'heading4')}
                {renderHeadingEditor('五级标题', 'heading5')}
                {renderHeadingEditor('六级标题', 'heading6')}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-neutral-900">正文样式设置</h4>
                {renderHeadingEditor('正文', 'bodyText')}
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                {editingFormat.id ? '保存' : '确定'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedFormat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">确认删除</h3>
            </div>

            <div className="p-6">
              <p className="text-neutral-600">
                确定要删除格式 <span className="font-medium">"{selectedFormat.name}"</span> 吗？此操作不可恢复。
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

export default DocumentFormatManager;
export type { DocumentFormat, HeadingStyle };
