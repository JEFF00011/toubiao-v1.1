import React, { useState } from 'react';
import { Upload, FileText, X, ArrowLeft, AlertCircle } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  category: 'tender' | 'specification' | 'other';
}

interface BiddingProjectUploadProps {
  onBack: () => void;
  onStartParsing: (projectName: string, files: UploadedFile[]) => void;
  initialProjectName?: string;
  initialFileName?: string;
}

const BiddingProjectUpload: React.FC<BiddingProjectUploadProps> = ({
  onBack,
  onStartParsing,
  initialProjectName = '',
  initialFileName = ''
}) => {
  const [projectName, setProjectName] = useState(initialProjectName);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    initialFileName ? [{ name: initialFileName, size: 0, category: 'tender' }] : []
  );
  const [draggingCategory, setDraggingCategory] = useState<string | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const categories = [
    {
      id: 'tender',
      label: '招标文件',
      required: true,
      description: '主要招标文件，包含项目基本信息、评审标准等'
    },
    {
      id: 'specification',
      label: '招标技术规范书',
      required: true,
      description: '技术要求、性能指标、验收标准等技术文件'
    },
    {
      id: 'other',
      label: '其他文件',
      required: false,
      description: '补充说明、图纸资料、附件等（可选）'
    }
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList, category: 'tender' | 'specification' | 'other') => {
    const validFiles: UploadedFile[] = [];
    const allowedExtensions = ['.doc', '.docx'];

    Array.from(files).forEach(file => {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert(`文件 "${file.name}" 格式不支持，仅支持 DOC、DOCX 格式`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(`文件 "${file.name}" 超过50MB限制，无法上传`);
        return;
      }

      validFiles.push({ name: file.name, size: file.size, category });
    });

    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles]);
      if (!projectName && validFiles.length > 0) {
        setProjectName(validFiles[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e: React.DragEvent, category: 'tender' | 'specification' | 'other') => {
    e.preventDefault();
    setDraggingCategory(null);

    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files, category);
    }
  };

  const handleDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDraggingCategory(category);
  };

  const handleDragLeave = () => {
    setDraggingCategory(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'tender' | 'specification' | 'other') => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files, category);
    }
    e.target.value = '';
  };

  const handleStartParsing = () => {
    if (!projectName.trim()) {
      alert('请输入项目名称');
      return;
    }

    const tenderFiles = uploadedFiles.filter(f => f.category === 'tender');
    const specFiles = uploadedFiles.filter(f => f.category === 'specification');

    if (tenderFiles.length === 0) {
      alert('请至少上传一个招标文件');
      return;
    }

    if (specFiles.length === 0) {
      alert('请至少上传一个招标技术规范书');
      return;
    }

    onStartParsing(projectName.trim(), uploadedFiles);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getFilesByCategory = (category: string) => {
    return uploadedFiles.filter(f => f.category === category);
  };

  const renderUploadArea = (category: typeof categories[0]) => {
    const categoryFiles = getFilesByCategory(category.id);
    const isDragging = draggingCategory === category.id;

    return (
      <div className="h-full flex flex-col border border-neutral-200 rounded-lg bg-neutral-50/50 p-4">
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-neutral-900">
              {category.label}
              {category.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-200 text-neutral-700">
              {categoryFiles.length}
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">{category.description}</p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer mb-3 ${
            isDragging
              ? 'border-primary-500 bg-primary-50 scale-105'
              : category.required && categoryFiles.length === 0
              ? 'border-red-300 hover:border-red-400 bg-red-50/50'
              : 'border-neutral-300 hover:border-primary-400 hover:bg-white'
          }`}
          onDrop={(e) => handleDrop(e, category.id as any)}
          onDragOver={(e) => handleDragOver(e, category.id)}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById(`file-upload-${category.id}`)?.click()}
        >
          <Upload className={`w-8 h-8 mx-auto mb-2 ${
            category.required && categoryFiles.length === 0 ? 'text-red-400' : 'text-neutral-400'
          }`} />
          <p className="text-sm text-neutral-700 font-medium mb-1">点击上传</p>
          <p className="text-xs text-neutral-500">或拖拽文件到此处</p>
          <input
            id={`file-upload-${category.id}`}
            type="file"
            className="hidden"
            accept=".doc,.docx"
            multiple
            onChange={(e) => handleFileInputChange(e, category.id as any)}
          />
        </div>

        {categoryFiles.length > 0 && (
          <div className="flex-1 overflow-auto space-y-2">
            {categoryFiles.map((file, index) => {
              const globalIndex = uploadedFiles.findIndex(
                f => f.name === file.name && f.category === file.category
              );
              return (
                <div key={index} className="group bg-white px-2.5 py-2 rounded border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-900 truncate font-medium" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(globalIndex);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 flex-shrink-0 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const tenderFiles = uploadedFiles.filter(f => f.category === 'tender');
  const specFiles = uploadedFiles.filter(f => f.category === 'specification');
  const canSubmit = projectName.trim() && tenderFiles.length > 0 && specFiles.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-medium text-neutral-900">上传招标文件</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                项目名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="请输入招标项目名称"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {categories.map(category => (
                <div key={category.id}>
                  {renderUploadArea(category)}
                </div>
              ))}
            </div>

            {(tenderFiles.length === 0 || specFiles.length === 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start mt-6">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-1">必选项提醒</h4>
                  <p className="text-sm text-amber-700">
                    {tenderFiles.length === 0 && specFiles.length === 0 && '请上传招标文件和招标技术规范书'}
                    {tenderFiles.length === 0 && specFiles.length > 0 && '请上传招标文件'}
                    {tenderFiles.length > 0 && specFiles.length === 0 && '请上传招标技术规范书'}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">温馨提示</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 招标文件和招标技术规范书为必选项，至少各上传一个</li>
                <li>• 其他文件为可选项，可上传补充材料和附件</li>
                <li>• 支持同时上传多个文件，系统会自动合并解析</li>
                <li>• 解析过程可能需要几分钟，请耐心等待</li>
                <li>• 解析完成后，请仔细核对解析内容</li>
              </ul>
            </div>
          </div>

          <div className="px-6 py-4 bg-neutral-50 flex justify-between items-center gap-2 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              已上传 <span className="font-medium text-neutral-900">{uploadedFiles.length}</span> 个文件
            </div>
            <div className="flex gap-2">
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleStartParsing}
                disabled={!canSubmit}
                className="px-6 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                开始解析
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingProjectUpload;
