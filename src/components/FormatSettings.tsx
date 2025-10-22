import React from 'react';
import { Settings, FileText, Type, Ruler, Upload, Download, FolderOpen } from 'lucide-react';

interface FormatSettingsProps {
  format: any;
  onUpdate: (format: any) => void;
}

const FormatSettings: React.FC<FormatSettingsProps> = ({ format, onUpdate }) => {
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [previewTemplate, setPreviewTemplate] = React.useState<any>(null);
  const [applyTemplate, setApplyTemplate] = React.useState<any>(null);
  const [deleteTemplate, setDeleteTemplate] = React.useState<any>(null);
  const [importedTemplates, setImportedTemplates] = React.useState([
    { id: 1, name: '政府采购标准模板', type: '公文格式', size: '2.1KB', date: '2024-01-15' },
    { id: 2, name: '建筑工程投标模板', type: '工程格式', size: '1.8KB', date: '2024-01-10' },
    { id: 3, name: '软件开发项目模板', type: '技术格式', size: '2.3KB', date: '2024-01-08' }
  ]);

  const updateFormat = (key: string, value: any) => {
    onUpdate({ ...format, [key]: value });
  };

  const handleApplyTemplate = (templateId: number) => {
    const template = importedTemplates.find(t => t.id === templateId);
    if (template) {
      setApplyTemplate(template);
    }
  };

  const confirmApplyTemplate = () => {
    if (applyTemplate) {
      // Apply different template formats based on template type
      let templateFormat;
      switch (applyTemplate.type) {
        case '公文格式':
          templateFormat = { fontSize: 16, fontFamily: 'SimSun', lineHeight: 1.5, margin: 25, alignment: 'left' };
          break;
        case '工程格式':
          templateFormat = { fontSize: 14, fontFamily: 'SimHei', lineHeight: 1.4, margin: 20, alignment: 'justify' };
          break;
        case '技术格式':
          templateFormat = { fontSize: 15, fontFamily: 'Microsoft YaHei', lineHeight: 1.6, margin: 30, alignment: 'left' };
          break;
        default:
          templateFormat = { fontSize: 14, fontFamily: 'SimSun', lineHeight: 1.5, margin: 25, alignment: 'left' };
      }
      onUpdate(templateFormat);
      setApplyTemplate(null);
    }
  };

  const handlePreviewTemplate = (templateId: number) => {
    const template = importedTemplates.find(t => t.id === templateId);
    if (template) {
      setPreviewTemplate(template);
    }
  };

  const handleDeleteTemplate = (templateId: number) => {
    const template = importedTemplates.find(t => t.id === templateId);
    if (template) {
      setDeleteTemplate(template);
    }
  };

  const confirmDeleteTemplate = () => {
    if (deleteTemplate) {
      setImportedTemplates(importedTemplates.filter(t => t.id !== deleteTemplate.id));
      setDeleteTemplate(null);
    }
  };

  const handleTemplateImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 模拟文件导入处理
      const newTemplate = {
        id: Date.now(),
        name: file.name.replace('.json', ''),
        type: '自定义格式',
        size: `${(file.size / 1024).toFixed(1)}KB`,
        date: new Date().toISOString().split('T')[0]
      };
      setImportedTemplates([...importedTemplates, newTemplate]);
      setShowImportModal(false);
    }
  };

  const exportCurrentFormat = () => {
    const formatData = JSON.stringify(format, null, 2);
    const blob = new Blob([formatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `format-template-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fontOptions = [
    { label: '宋体 (SimSun)', value: 'SimSun' },
    { label: '黑体 (SimHei)', value: 'SimHei' },
    { label: '微软雅黑 (Microsoft YaHei)', value: 'Microsoft YaHei' },
    { label: '仿宋 (FangSong)', value: 'FangSong' },
    { label: '楷体 (KaiTi)', value: 'KaiTi' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-7 h-7 mr-3 text-purple-600" />
            格式设置
          </h2>
          <p className="text-gray-600 mt-1">调整文档的字体、行距、页边距等格式参数</p>
        </div>

        {/* Template Management */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-indigo-600" />
              模板管理
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>导入模板</span>
              </button>
              <button
                onClick={exportCurrentFormat}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>导出当前格式</span>
              </button>
            </div>
          </div>

          {/* Template List */}
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模板名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">导入日期</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {importedTemplates.map(template => (
                  <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {template.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {template.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {template.size}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {template.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleApplyTemplate(template.id)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        应用
                      </button>
                      <button 
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                      >
                        预览
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Typography Settings */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Type className="w-5 h-5 mr-2 text-blue-600" />
                字体设置
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">字体家族</label>
                  <select
                    value={format.fontFamily}
                    onChange={(e) => updateFormat('fontFamily', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {fontOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    字体大小: {format.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={format.fontSize}
                    onChange={(e) => updateFormat('fontSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>12px</span>
                    <span>24px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    行间距: {format.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={format.lineHeight}
                    onChange={(e) => updateFormat('lineHeight', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1.0</span>
                    <span>3.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Settings */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Ruler className="w-5 h-5 mr-2 text-green-600" />
                布局设置
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">文本对齐</label>
                  <select
                    value={format.alignment}
                    onChange={(e) => updateFormat('alignment', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="left">左对齐</option>
                    <option value="center">居中对齐</option>
                    <option value="right">右对齐</option>
                    <option value="justify">两端对齐</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    页边距: {format.margin}mm
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="40"
                    value={format.margin}
                    onChange={(e) => updateFormat('margin', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15mm</span>
                    <span>40mm</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">页面大小</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>A4</option>
                      <option>A3</option>
                      <option>B4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">页面方向</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <option>纵向</option>
                      <option>横向</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              预览效果
            </h3>
            
            <div className="bg-white rounded-lg p-6 shadow-inner border-2 border-dashed border-gray-300 min-h-80">
              <div 
                style={{
                  fontSize: `${format.fontSize}px`,
                  fontFamily: format.fontFamily,
                  lineHeight: format.lineHeight,
                  textAlign: format.alignment,
                  margin: `${format.margin}px`
                }}
                className="space-y-4"
              >
                <h1 className="text-xl font-bold text-gray-900">示例标题</h1>
                <p className="text-gray-700">
                  这是一段示例文本，用于预览当前格式设置的效果。通过调整左侧的各项参数，
                  您可以实时看到文档格式的变化。
                </p>
                <h2 className="text-lg font-semibold text-gray-800">二级标题</h2>
                <p className="text-gray-700">
                  系统支持多种字体选择，包括宋体、黑体、微软雅黑等常用字体，
                  同时可以灵活调整字体大小、行间距和页边距等参数。
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>列表项目一</li>
                  <li>列表项目二</li>
                  <li>列表项目三</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button 
                onClick={() => {
                  alert('格式已应用到当前文档，可在文档编辑器中查看效果');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
              >
                应用到当前文档
              </button>
              <button 
                onClick={exportCurrentFormat}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
              >
                保存为默认格式
              </button>
              <button 
                onClick={() => setShowImportModal(true)}
                className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 rounded-lg transition-colors"
              >
                导入新模板
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速预设</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: '标准公文格式', desc: '符合国家标准的公文格式', format: { fontSize: 16, fontFamily: 'SimSun', lineHeight: 1.5, margin: 25, alignment: 'left' } },
              { name: '技术文档格式', desc: '适合技术方案的现代格式', format: { fontSize: 14, fontFamily: 'Microsoft YaHei', lineHeight: 1.4, margin: 20, alignment: 'left' } },
              { name: '简洁商务格式', desc: '简洁专业的商务文档格式', format: { fontSize: 15, fontFamily: 'SimHei', lineHeight: 1.6, margin: 30, alignment: 'justify' } }
            ].map((preset, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                <h4 className="font-medium text-gray-900 mb-1">{preset.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{preset.desc}</p>
                <button
                  onClick={() => onUpdate(preset.format)}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  应用此格式
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">导入格式模板</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">选择格式模板文件</p>
                <p className="text-sm text-gray-500 mb-4">支持 JSON 格式的模板文件</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleTemplateImport}
                  className="hidden"
                  id="template-upload"
                />
                <label
                  htmlFor="template-upload"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block"
                >
                  选择文件
                </label>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>• 模板文件应包含字体、大小、行距等格式信息</p>
                <p>• 支持从其他系统导出的标准格式模板</p>
                <p>• 导入后可在模板列表中管理和应用</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Template Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">模板预览</h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{previewTemplate.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">类型:</span>
                      <span className="ml-2 font-medium">{previewTemplate.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">大小:</span>
                      <span className="ml-2 font-medium">{previewTemplate.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">导入日期:</span>
                      <span className="ml-2 font-medium">{previewTemplate.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">格式预览</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    {previewTemplate.type === '公文格式' && (
                      <>
                        <p>• 字体: 宋体 16px</p>
                        <p>• 行距: 1.5倍</p>
                        <p>• 页边距: 25mm</p>
                        <p>• 对齐: 左对齐</p>
                      </>
                    )}
                    {previewTemplate.type === '工程格式' && (
                      <>
                        <p>• 字体: 黑体 14px</p>
                        <p>• 行距: 1.4倍</p>
                        <p>• 页边距: 20mm</p>
                        <p>• 对齐: 两端对齐</p>
                      </>
                    )}
                    {previewTemplate.type === '技术格式' && (
                      <>
                        <p>• 字体: 微软雅黑 15px</p>
                        <p>• 行距: 1.6倍</p>
                        <p>• 页边距: 30mm</p>
                        <p>• 对齐: 左对齐</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApplyTemplate(previewTemplate.id);
                      setPreviewTemplate(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    应用此模板
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Template Modal */}
      {applyTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">应用模板</h3>
                <button
                  onClick={() => setApplyTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{applyTemplate.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">类型:</span>
                      <span className="ml-2 font-medium">{applyTemplate.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">大小:</span>
                      <span className="ml-2 font-medium">{applyTemplate.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">导入日期:</span>
                      <span className="ml-2 font-medium">{applyTemplate.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">将要应用的格式</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    {applyTemplate.type === '公文格式' && (
                      <>
                        <p>• 字体: 宋体 16px</p>
                        <p>• 行距: 1.5倍</p>
                        <p>• 页边距: 25mm</p>
                        <p>• 对齐: 左对齐</p>
                      </>
                    )}
                    {applyTemplate.type === '工程格式' && (
                      <>
                        <p>• 字体: 黑体 14px</p>
                        <p>• 行距: 1.4倍</p>
                        <p>• 页边距: 20mm</p>
                        <p>• 对齐: 两端对齐</p>
                      </>
                    )}
                    {applyTemplate.type === '技术格式' && (
                      <>
                        <p>• 字体: 微软雅黑 15px</p>
                        <p>• 行距: 1.6倍</p>
                        <p>• 页边距: 30mm</p>
                        <p>• 对齐: 左对齐</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">确认应用</p>
                      <p>应用此模板将覆盖当前的格式设置，是否继续？</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={confirmApplyTemplate}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    确认应用
                  </button>
                  <button
                    onClick={() => setApplyTemplate(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Modal */}
      {deleteTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">删除模板</h3>
                <button
                  onClick={() => setDeleteTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{deleteTemplate.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">类型:</span>
                      <span className="ml-2 font-medium">{deleteTemplate.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">大小:</span>
                      <span className="ml-2 font-medium">{deleteTemplate.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">导入日期:</span>
                      <span className="ml-2 font-medium">{deleteTemplate.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm text-red-800">
                      <p className="font-medium mb-1">确认删除</p>
                      <p>删除后将无法恢复此模板，是否确定要删除？</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={confirmDeleteTemplate}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                  >
                    确认删除
                  </button>
                  <button
                    onClick={() => setDeleteTemplate(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormatSettings;