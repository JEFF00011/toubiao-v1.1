import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Settings } from 'lucide-react';

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

  const [isEditing, setIsEditing] = useState(false);
  const [editingFormat, setEditingFormat] = useState<DocumentFormat | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

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

  const handleCreate = () => {
    setEditingFormat({
      name: '新格式',
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
    setIsEditing(true);
  };

  const handleEdit = (format: DocumentFormat) => {
    setEditingFormat({ ...format });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingFormat) return;

    if (editingFormat.id) {
      setFormats(formats.map(f => f.id === editingFormat.id ? editingFormat : f));
    } else {
      setFormats([...formats, { ...editingFormat, id: Date.now().toString() }]);
    }

    setIsEditing(false);
    setEditingFormat(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingFormat(null);
  };

  const handleDelete = (id: string) => {
    setFormats(formats.filter(f => f.id !== id));
    setShowDeleteModal(null);
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
                className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                className="w-4 h-4 text-green-600 border-neutral-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-neutral-700">加粗</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  if (isEditing && editingFormat) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-900">
            {editingFormat.id ? '编辑格式' : '新增格式'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-neutral-900 mb-3">基本信息</h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">格式名称</label>
                <input
                  type="text"
                  value={editingFormat.name}
                  onChange={(e) => updateEditingFormat('name', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="请输入格式名称"
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-neutral-900 mb-3">页眉页脚</h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">页眉</label>
                <input
                  type="text"
                  value={editingFormat.header}
                  onChange={(e) => updateEditingFormat('header', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="页眉内容（留空则不显示）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">页脚</label>
                <input
                  type="text"
                  value={editingFormat.footer}
                  onChange={(e) => updateEditingFormat('footer', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="页脚内容，{page} = 当前页，{total} = 总页数"
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-neutral-900 mb-3">页边距设置（毫米）</h4>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">上边距</label>
                <input
                  type="number"
                  value={editingFormat.marginTop}
                  onChange={(e) => updateEditingFormat('marginTop', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="10"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">下边距</label>
                <input
                  type="number"
                  value={editingFormat.marginBottom}
                  onChange={(e) => updateEditingFormat('marginBottom', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="10"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">左边距</label>
                <input
                  type="number"
                  value={editingFormat.marginLeft}
                  onChange={(e) => updateEditingFormat('marginLeft', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="10"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">右边距</label>
                <input
                  type="number"
                  value={editingFormat.marginRight}
                  onChange={(e) => updateEditingFormat('marginRight', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="10"
                  max="50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-neutral-900">标题样式设置</h4>
            {renderHeadingEditor('一级标题', 'heading1')}
            {renderHeadingEditor('二级标题', 'heading2')}
            {renderHeadingEditor('三级标题', 'heading3')}
            {renderHeadingEditor('四级标题', 'heading4')}
            {renderHeadingEditor('五级标题', 'heading5')}
            {renderHeadingEditor('六级标题', 'heading6')}
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-neutral-900">正文样式设置</h4>
            {renderHeadingEditor('正文', 'bodyText')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          投标文件格式管理
        </h3>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增格式
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">格式名称</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">页边距</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">一级标题</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">正文</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {formats.map(format => (
              <tr key={format.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">{format.name}</td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {format.marginTop}/{format.marginBottom}/{format.marginLeft}/{format.marginRight}mm
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {format.heading1.fontFamily} {format.heading1.fontSize}pt
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {format.bodyText.fontFamily} {format.bodyText.fontSize}pt
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelectFormat(format)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      应用
                    </button>
                    <button
                      onClick={() => handleEdit(format)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(format.id!)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">确认删除</h3>
            <p className="text-neutral-600 mb-6">确定要删除此格式吗？此操作无法撤销。</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

export default DocumentFormatManager;
export type { DocumentFormat, HeadingStyle };
