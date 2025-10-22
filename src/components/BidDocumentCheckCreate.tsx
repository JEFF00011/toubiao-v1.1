import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, FileText, Upload, CheckSquare, Plus, Trash2, FolderOpen, FileCheck } from 'lucide-react';
import BidDocumentCheckProgress from './BidDocumentCheckProgress';

interface BidDocumentCheckCreateProps {
  onClose: () => void;
  onComplete: (data: any) => void;
}

interface BiddingProject {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface ParsedCheckPoint {
  id: string;
  name: string;
  selected: boolean;
}

interface PublicCheckPoint {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface ProjectCheckPoint {
  id: string;
  name: string;
  description: string;
}

const MOCK_BIDDING_PROJECTS: BiddingProject[] = [
  { id: '1', name: '某医院信息化建设项目', status: '已完成', createdAt: '2024-01-20' },
  { id: '2', name: '某市智慧城市建设项目', status: '已完成', createdAt: '2024-01-18' },
  { id: '3', name: '教育信息化项目', status: '已完成', createdAt: '2024-01-15' },
  { id: '4', name: '政务系统采购项目', status: '进行中', createdAt: '2024-01-12' },
];

const MOCK_PARSED_CHECKPOINTS: ParsedCheckPoint[] = [
  { id: 'p1', name: '项目基础信息', selected: true },
  { id: 'p2', name: '资格要求', selected: true },
  { id: 'p3', name: '评审要求', selected: true },
  { id: 'p4', name: '投标文件要求（投标文件完整性）', selected: true },
  { id: 'p5', name: '风险项/废标项', selected: true },
  { id: 'p6', name: '投标文件目录（目录完整性）', selected: true },
];

const PUBLIC_CHECKPOINTS: PublicCheckPoint[] = [
  { id: 'pub1', name: '盖章项检查', description: '检查投标文件中涉及盖章的部分是否全部盖章', selected: false },
];

const BidDocumentCheckCreate: React.FC<BidDocumentCheckCreateProps> = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkName, setCheckName] = useState('');
  const [selectedProject, setSelectedProject] = useState<BiddingProject | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedCheckPoints, setParsedCheckPoints] = useState<ParsedCheckPoint[]>(MOCK_PARSED_CHECKPOINTS);
  const [publicCheckPoints, setPublicCheckPoints] = useState<PublicCheckPoint[]>(PUBLIC_CHECKPOINTS);
  const [projectCheckPoints, setProjectCheckPoints] = useState<ProjectCheckPoint[]>([]);
  const [newCheckPoint, setNewCheckPoint] = useState({ name: '', description: '' });
  const [searchProject, setSearchProject] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [totalCheckPoints, setTotalCheckPoints] = useState(0);

  const completedProjects = MOCK_BIDDING_PROJECTS.filter(p => p.status === '已完成');
  const filteredProjects = completedProjects.filter(project =>
    project.name.toLowerCase().includes(searchProject.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('仅支持PDF格式文件');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('文件大小不能超过50MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!checkName.trim()) {
        alert('请输入检查名称');
        return;
      }
      if (!uploadedFile) {
        alert('请上传要检查的文件');
        return;
      }
    }

    if (currentStep === 2) {
      if (!selectedProject) {
        alert('请选择招标项目');
        return;
      }
      const selectedCount = parsedCheckPoints.filter(cp => cp.selected).length;
      if (selectedCount === 0) {
        alert('请至少选择一个检查点');
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      const total = [
        ...parsedCheckPoints.filter(cp => cp.selected),
        ...publicCheckPoints.filter(cp => cp.selected),
        ...projectCheckPoints
      ].length;

      setTotalCheckPoints(total);
      setShowProgress(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCheckComplete = (results: any) => {
    onComplete({
      name: checkName,
      documentName: uploadedFile?.name,
      documentType: 'uploaded',
      totalCheckPoints: results.passed + results.failed,
      passedCheckPoints: results.passed,
      failedCheckPoints: results.failed
    });
  };

  const handleProgressClose = () => {
    onClose();
  };

  const toggleParsedCheckPoint = (id: string) => {
    setParsedCheckPoints(parsedCheckPoints.map(cp =>
      cp.id === id ? { ...cp, selected: !cp.selected } : cp
    ));
  };

  const togglePublicCheckPoint = (id: string) => {
    setPublicCheckPoints(publicCheckPoints.map(cp =>
      cp.id === id ? { ...cp, selected: !cp.selected } : cp
    ));
  };

  const addProjectCheckPoint = () => {
    if (!newCheckPoint.name.trim() || !newCheckPoint.description.trim()) {
      alert('请填写完整的检查点信息');
      return;
    }

    const checkPoint: ProjectCheckPoint = {
      id: `project-${Date.now()}`,
      name: newCheckPoint.name,
      description: newCheckPoint.description
    };

    setProjectCheckPoints([...projectCheckPoints, checkPoint]);
    setNewCheckPoint({ name: '', description: '' });
  };

  const removeProjectCheckPoint = (id: string) => {
    setProjectCheckPoints(projectCheckPoints.filter(cp => cp.id !== id));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          检查名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={checkName}
          onChange={(e) => setCheckName(e.target.value)}
          placeholder="请输入投标文件检查名称"
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          上传投标文件 <span className="text-red-500">*</span>
        </label>
        <div
          className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
          <p className="text-sm text-neutral-600 mb-1 font-medium">点击或拖拽文件到此处上传</p>
          <p className="text-xs text-neutral-500">仅支持 PDF 格式</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
        </div>
        {uploadedFile && (
          <div className="mt-4">
            <div className="flex items-center justify-between bg-primary-50 border border-primary-200 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedFile(null);
                }}
                className="text-red-600 hover:text-red-800 transition-colors ml-3 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          请选择招标项目（仅显示状态为"已完成"的项目），选择后可配置招标要求检查点
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          选择招标项目 <span className="text-red-500">*</span>
        </label>
        <div className="mb-3">
          <input
            type="text"
            placeholder="搜索招标项目..."
            value={searchProject}
            onChange={(e) => setSearchProject(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto border border-neutral-200 rounded-lg">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
              <p>暂无已完成的招标项目</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`p-4 border-b border-neutral-100 last:border-b-0 cursor-pointer transition-colors ${
                  selectedProject?.id === project.id
                    ? 'bg-primary-50 border-l-4 border-l-primary-500'
                    : 'hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <FolderOpen className="w-5 h-5 mr-3 text-primary-600" />
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">{project.name}</div>
                      <div className="text-sm text-neutral-600 mt-1">创建时间: {project.createdAt}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    {project.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedProject && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              以下为招标要求检查点，默认全部选中，您可以取消不需要的检查点
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-neutral-900">
                招标要求检查点
              </h4>
              <span className="text-sm text-neutral-600">
                已选择 {parsedCheckPoints.filter(cp => cp.selected).length} / {parsedCheckPoints.length}
              </span>
            </div>

            <div className="border border-neutral-200 rounded-lg p-4 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {parsedCheckPoints.map(cp => (
                  <label
                    key={cp.id}
                    className="flex items-center p-2 bg-neutral-50 rounded hover:bg-neutral-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={cp.selected}
                      onChange={() => toggleParsedCheckPoint(cp.id)}
                      className="w-4 h-4 text-primary-600 rounded mr-2 flex-shrink-0"
                    />
                    <span className="text-sm text-neutral-900">{cp.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          这是可选步骤，您可以添加招标文件解析以外的检查点
        </p>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 mb-3">通用检查点选择</h4>
        <div className="border border-neutral-200 rounded-lg p-4 max-h-80 overflow-y-auto">
          {publicCheckPoints.length === 0 ? (
            <div className="text-center text-neutral-500 py-8">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
              <p>暂无通用检查点</p>
              <p className="text-sm mt-1">请前往"通用检查点管理"添加</p>
            </div>
          ) : (
            <div className="space-y-2">
              {publicCheckPoints.map(cp => (
                <label
                  key={cp.id}
                  className="flex items-start p-3 bg-neutral-50 rounded hover:bg-neutral-100 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={cp.selected}
                    onChange={() => togglePublicCheckPoint(cp.id)}
                    className="w-4 h-4 text-primary-600 rounded mt-0.5 mr-3 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">{cp.name}</div>
                    <div className="text-sm text-neutral-600 mt-1">{cp.description}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-neutral-900 mb-3">针对该项目的检查点</h4>
        <div className="space-y-3 bg-neutral-50 rounded-lg p-4">
          <div>
            <input
              type="text"
              placeholder="检查点名称"
              value={newCheckPoint.name}
              onChange={(e) => setNewCheckPoint({ ...newCheckPoint, name: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <textarea
              placeholder="检查点描述"
              value={newCheckPoint.description}
              onChange={(e) => setNewCheckPoint({ ...newCheckPoint, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={addProjectCheckPoint}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加项目检查点
          </button>
        </div>

        {projectCheckPoints.length > 0 && (
          <div className="mt-4 space-y-2">
            <h5 className="text-sm font-medium text-neutral-700">已添加的项目检查点 ({projectCheckPoints.length})</h5>
            {projectCheckPoints.map(cp => (
              <div key={cp.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">{cp.name}</div>
                    <div className="text-sm text-neutral-600 mt-1">{cp.description}</div>
                  </div>
                  <button
                    onClick={() => removeProjectCheckPoint(cp.id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedParsedCount = parsedCheckPoints.filter(cp => cp.selected).length;
    const selectedPublicCount = publicCheckPoints.filter(cp => cp.selected).length;
    const totalCheckPoints = selectedParsedCount + selectedPublicCount + projectCheckPoints.length;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckSquare className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">确认检查信息</h3>
          <p className="text-neutral-600">请确认以下信息无误后，开始检查</p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-6 space-y-4">
          <div>
            <span className="text-sm text-neutral-600">检查名称：</span>
            <p className="font-medium text-neutral-900 mt-1">{checkName}</p>
          </div>
          <div>
            <span className="text-sm text-neutral-600">上传文件：</span>
            <p className="font-medium text-neutral-900 mt-1">
              {uploadedFile?.name}
            </p>
          </div>
          {selectedProject && (
            <div>
              <span className="text-sm text-neutral-600">关联招标项目：</span>
              <p className="font-medium text-neutral-900 mt-1">{selectedProject.name}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-neutral-600">总检查点数：</span>
            <p className="font-medium text-neutral-900 mt-1">{totalCheckPoints}</p>
          </div>
          <div>
            <span className="text-sm text-neutral-600">检查点分布：</span>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-neutral-700">• 招标要求检查点: {selectedParsedCount} 个</p>
              <p className="text-neutral-700">• 通用检查点: {selectedPublicCount} 个</p>
              <p className="text-neutral-700">• 项目检查点: {projectCheckPoints.length} 个</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const steps = [
    { number: 1, title: '基本信息' },
    { number: 2, title: '招标项目与检查点' },
    { number: 3, title: '新增检查点' },
    { number: 4, title: '确认信息' }
  ];

  if (showProgress) {
    return (
      <BidDocumentCheckProgress
        checkName={checkName}
        totalCheckPoints={totalCheckPoints}
        onComplete={handleCheckComplete}
        onClose={handleProgressClose}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">新建投标文件检查</h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    currentStep >= step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`text-xs mt-2 text-center ${
                    currentStep >= step.number ? 'text-primary-600 font-medium' : 'text-neutral-600'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-neutral-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="p-6 border-t border-neutral-200">
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                currentStep === 1
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一步
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              {currentStep === 4 ? '开始检查' : '下一步'}
              {currentStep < 4 && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BidDocumentCheckCreate;
