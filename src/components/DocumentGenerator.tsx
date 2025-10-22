import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, CheckCircle, Building2, FolderTree, Database, Loader, Download, X } from 'lucide-react';

interface BiddingProject {
  id: string;
  projectName: string;
  status: string;
  uploadTime: string;
  documentDirectory: {
    commercial: string;
    technical: string;
  };
}

interface Company {
  id: string;
  name: string;
}

interface DirectoryItem {
  id: string;
  title: string;
  level: number;
  wordCount: number;
  children: DirectoryItem[];
}

interface KnowledgeCategory {
  id: string;
  name: string;
  items: KnowledgeItem[];
  filters?: FilterConfig;
}

interface KnowledgeItem {
  id: string;
  name: string;
  selected: boolean;
  year?: string;
  rating?: string;
  status?: string;
  certNumber?: string;
  projectName?: string;
  clientName?: string;
  position?: string;
  contractNumber?: string;
}

interface FilterConfig {
  year?: string[];
  rating?: string[];
  status?: string[];
  position?: string[];
}

interface DocumentGeneratorProps {
  onClose: () => void;
  preSelectedProject?: BiddingProject | null;
  mode?: 'create' | 'edit' | 'view';
  existingDocument?: any;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  onClose,
  preSelectedProject,
  mode = 'create',
  existingDocument
}) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  const [currentStep, setCurrentStep] = useState(1);
  const [documentName, setDocumentName] = useState(existingDocument?.name || '');
  const [fileTypes, setFileTypes] = useState<string[]>(existingDocument?.fileTypes || []);
  const [selectedProject, setSelectedProject] = useState<BiddingProject | null>(preSelectedProject || null);
  const [commercialDirectory, setCommercialDirectory] = useState<DirectoryItem[]>([]);
  const [technicalDirectory, setTechnicalDirectory] = useState<DirectoryItem[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [knowledgeCategories, setKnowledgeCategories] = useState<KnowledgeCategory[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  const [companyPage, setCompanyPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  React.useEffect(() => {
    if (preSelectedProject) {
      if (preSelectedProject.documentDirectory?.commercial) {
        setCommercialDirectory(parseDirectory(preSelectedProject.documentDirectory.commercial));
      }
      if (preSelectedProject.documentDirectory?.technical) {
        setTechnicalDirectory(parseDirectory(preSelectedProject.documentDirectory.technical));
      }
    }
  }, [preSelectedProject]);

  React.useEffect(() => {
    if (!selectedProject && !preSelectedProject && MOCK_PROJECTS.length > 0) {
      const filteredProjects = MOCK_PROJECTS.filter(project =>
        project.projectName.toLowerCase().includes(projectSearch.toLowerCase())
      );
      if (filteredProjects.length > 0) {
        handleProjectSelect(filteredProjects[0]);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!selectedCompany && MOCK_COMPANIES.length > 0) {
      const filteredCompanies = MOCK_COMPANIES.filter(company =>
        company.name.toLowerCase().includes(companySearch.toLowerCase())
      );
      if (filteredCompanies.length > 0) {
        handleCompanySelect(filteredCompanies[0]);
      }
    }
  }, []);

  const MOCK_PROJECTS: BiddingProject[] = [
    {
      id: '1',
      projectName: '某市智慧城市建设项目',
      status: 'parsed',
      uploadTime: '2024-01-15',
      documentDirectory: {
        commercial: '一、资格证明文件\n  1.1 营业执照副本\n  1.2 资质证书\n二、商务响应文件\n  2.1 投标函\n  2.2 法定代表人授权书\n三、报价文件\n  3.1 投标报价表\n  3.2 报价说明',
        technical: '一、技术方案\n  1.1 总体技术方案\n  1.2 系统架构设计\n二、实施方案\n  2.1 项目实施计划\n  2.2 质量保证措施'
      }
    },
    {
      id: '2',
      projectName: '教育信息化平台采购项目',
      status: 'parsed',
      uploadTime: '2024-01-12',
      documentDirectory: {
        commercial: '一、资格文件\n  1.1 企业资质\n  1.2 授权书\n二、商务文件\n  2.1 投标承诺函\n  2.2 报价清单',
        technical: '一、技术响应\n  1.1 技术方案\n  1.2 系统设计\n二、服务方案\n  2.1 实施计划\n  2.2 培训方案'
      }
    }
  ];

  const MOCK_COMPANIES: Company[] = [
    { id: '1', name: '北京某某科技有限公司' },
    { id: '2', name: '上海XX信息技术有限公司' },
    { id: '3', name: '深圳YY软件开发公司' }
  ];

  const MOCK_KNOWLEDGE: KnowledgeCategory[] = [
    {
      id: 'company',
      name: '公司基础信息',
      items: [
        { id: 'company_1', name: '营业执照副本', selected: true },
        { id: 'company_2', name: '公司简介', selected: true },
        { id: 'company_3', name: '组织架构图', selected: false },
        { id: 'company_4', name: '公司发展历程', selected: false },
        { id: 'company_5', name: '公司文化介绍', selected: false }
      ]
    },
    {
      id: 'qualification',
      name: '资质信息',
      items: [
        { id: 'qual_1', name: '软件企业认定证书', certNumber: 'CERT-2024-001', rating: '甲级', status: 'valid', selected: true },
        { id: 'qual_2', name: 'ISO9001质量管理体系认证', certNumber: 'ISO-2024-002', rating: '无', status: 'valid', selected: true },
        { id: 'qual_3', name: '信息安全等保三级证书', certNumber: 'SEC-2024-003', rating: '三级', status: 'valid', selected: false },
        { id: 'qual_4', name: 'CMMI认证证书', certNumber: 'CMMI-2023-004', rating: '三级', status: 'expired', selected: false },
        { id: 'qual_5', name: '高新技术企业证书', certNumber: 'HIGH-2024-005', rating: '无', status: 'valid', selected: true },
        { id: 'qual_6', name: '建筑业企业资质证书', certNumber: 'BUILD-2024-006', rating: '乙级', status: 'valid', selected: false }
      ],
      filters: {
        rating: ['甲级', '乙级', '三级', '无'],
        status: ['valid', 'expired']
      }
    },
    {
      id: 'financial',
      name: '财务信息',
      items: [
        { id: 'fin_1', name: '2024年度财务审计报告', year: '2024', selected: true },
        { id: 'fin_2', name: '2023年度财务审计报告', year: '2023', selected: false },
        { id: 'fin_3', name: '2022年度财务审计报告', year: '2022', selected: false },
        { id: 'fin_4', name: '2024年资产负债表', year: '2024', selected: true },
        { id: 'fin_5', name: '2024年利润表', year: '2024', selected: false },
        { id: 'fin_6', name: '纳税证明', year: '2024', selected: true }
      ],
      filters: {
        year: ['2024', '2023', '2022', '2021']
      }
    },
    {
      id: 'performance',
      name: '业绩信息',
      items: [
        { id: 'perf_1', projectName: '智慧城市建设项目', clientName: '北京市政府', contractNumber: 'CT-2024-001', selected: true },
        { id: 'perf_2', projectName: '教育信息化平台', clientName: '教育部', contractNumber: 'CT-2024-002', selected: true },
        { id: 'perf_3', projectName: '政务服务平台', clientName: '上海市政府', contractNumber: 'CT-2023-003', selected: false },
        { id: 'perf_4', projectName: '医疗信息系统', clientName: '华山医院', contractNumber: 'CT-2023-004', selected: false },
        { id: 'perf_5', projectName: '企业ERP系统', clientName: '万科集团', contractNumber: 'CT-2022-005', selected: false }
      ]
    },
    {
      id: 'personnel',
      name: '人员信息',
      items: [
        { id: 'per_1', name: '张三', position: '项目经理', status: 'active', selected: true },
        { id: 'per_2', name: '李四', position: '技术总监', status: 'active', selected: true },
        { id: 'per_3', name: '王五', position: '项目经理', status: 'active', selected: false },
        { id: 'per_4', name: '赵六', position: '架构师', status: 'active', selected: false },
        { id: 'per_5', name: '孙七', position: '开发经理', status: 'resigned', selected: false }
      ],
      filters: {
        position: ['项目经理', '技术总监', '架构师', '开发经理'],
        status: ['active', 'resigned']
      }
    },
    {
      id: 'templates',
      name: '历史投标文件',
      items: [
        { id: 'temp_1', name: '类似项目投标文件模板', selected: true },
        { id: 'temp_2', name: '技术方案参考文档', selected: true },
        { id: 'temp_3', name: '售后服务方案模板', selected: false },
        { id: 'temp_4', name: '项目实施计划模板', selected: false },
        { id: 'temp_5', name: '培训方案模板', selected: false }
      ]
    }
  ];

  const parseDirectory = (text: string): DirectoryItem[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: DirectoryItem[] = [];
    const stack: DirectoryItem[] = [];

    lines.forEach((line, index) => {
      const indent = line.match(/^\s*/)?.[0].length || 0;
      const level = Math.floor(indent / 2);
      const cleanTitle = line.trim();

      const item: DirectoryItem = {
        id: `item-${index}`,
        title: cleanTitle,
        level,
        wordCount: 1800,
        children: []
      };

      if (level === 0) {
        items.push(item);
        stack.length = 0;
        stack.push(item);
      } else {
        while (stack.length > level) {
          stack.pop();
        }
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(item);
        }
        stack.push(item);
      }
    });

    return items;
  };

  const handleFileTypeToggle = (type: string) => {
    setFileTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const handleProjectSelect = (project: BiddingProject) => {
    setSelectedProject(project);

    if (project.documentDirectory.commercial) {
      setCommercialDirectory(parseDirectory(project.documentDirectory.commercial));
    }
    if (project.documentDirectory.technical) {
      setTechnicalDirectory(parseDirectory(project.documentDirectory.technical));
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setKnowledgeCategories(MOCK_KNOWLEDGE);
  };

  const updateWordCount = (itemId: string, count: number, items: DirectoryItem[]): DirectoryItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, wordCount: count };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateWordCount(itemId, count, item.children) };
      }
      return item;
    });
  };

  const updateCommercialWordCount = (itemId: string, count: number) => {
    setCommercialDirectory(prev => updateWordCount(itemId, count, prev));
  };

  const updateTechnicalWordCount = (itemId: string, count: number) => {
    setTechnicalDirectory(prev => updateWordCount(itemId, count, prev));
  };

  const toggleKnowledgeItem = (categoryId: string, itemId: string) => {
    setKnowledgeCategories(prev =>
      prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, selected: !item.selected } : item
            )
          };
        }
        return cat;
      })
    );
  };

  const toggleCategoryAll = (categoryId: string, selected: boolean) => {
    setKnowledgeCategories(prev =>
      prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map(item => ({ ...item, selected }))
          };
        }
        return cat;
      })
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setIsComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleExport = () => {
    alert('导出为 Word 文档功能');
  };

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return documentName.trim() !== '';
      case 2:
        return selectedProject !== null;
      case 3:
        return fileTypes.length > 0;
      case 4:
        return selectedCompany !== null;
      case 5:
        return knowledgeCategories.some(cat => cat.items.some(item => item.selected));
      default:
        return true;
    }
  };

  const renderDirectoryTree = (items: DirectoryItem[], level: number = 0, onUpdate: (id: string, count: number) => void) => {
    return items.map(item => (
      <div key={item.id} style={{ paddingLeft: `${level * 24}px` }}>
        <div className="flex items-center justify-between py-2 border-b border-neutral-100">
          <div className="flex-1">
            <span className={`text-sm ${level === 0 ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}>
              {item.title}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={item.wordCount}
              onChange={(e) => {
                const newCount = parseInt(e.target.value) || 0;
                onUpdate(item.id, newCount);
              }}
              disabled={isViewMode}
              className="w-24 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
            />
            <span className="text-sm text-neutral-500">字</span>
          </div>
        </div>
        {item.children.length > 0 && renderDirectoryTree(item.children, level + 1, onUpdate)}
      </div>
    ));
  };

  const steps = [
    { number: 1, name: '文件名称' },
    { number: 2, name: '招标项目' },
    { number: 3, name: '选择文件' },
    { number: 4, name: '企业知识库' },
    { number: 5, name: '知识资料' },
    { number: 6, name: '生成文件' }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  isActive || isCompleted
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {step.number}
              </div>
              <span className={`text-xs mt-2 text-center ${
                isActive || isCompleted ? 'text-primary-600 font-medium' : 'text-neutral-600'
              }`}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                isCompleted ? 'bg-primary-600' : 'bg-neutral-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          第一步：输入投标文件名称，用于标识和管理生成的投标文件。
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          投标文件名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          placeholder="例如：某市智慧城市建设项目投标文件"
          disabled={isViewMode}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );

  const renderStep2 = () => {
    const filteredProjects = MOCK_PROJECTS
      .filter(project =>
        project.projectName.toLowerCase().includes(projectSearch.toLowerCase())
      )
      .sort((a, b) => {
        return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
      });

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const startIndex = (projectPage - 1) * ITEMS_PER_PAGE;
    const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (preSelectedProject) {
      return (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">已选择招标项目</h3>
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900">{preSelectedProject.projectName}</h4>
                <p className="text-sm text-neutral-500 mt-1">上传时间：{preSelectedProject.uploadTime}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-600 mt-3">
            此项目已从招标项目管理页面自动选择
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            第二步：选择对应的招标项目，系统将根据该项目解析的文件目录结构生成投标文件。
          </p>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-4">选择招标项目 <span className="text-red-500">*</span></h3>

        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索项目名称..."
            value={projectSearch}
            onChange={(e) => {
              setProjectSearch(e.target.value);
              setProjectPage(1);
            }}
            disabled={isViewMode}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-3 min-h-[300px]">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              未找到匹配的项目
            </div>
          ) : (
            paginatedProjects.map(project => (
              <div
                key={project.id}
                onClick={() => !isViewMode && handleProjectSelect(project)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isViewMode ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                  selectedProject?.id === project.id
                    ? 'border-primary-600 bg-primary-50'
                    : isViewMode
                    ? 'border-neutral-200 bg-neutral-50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900">{project.projectName}</h4>
                    <p className="text-sm text-neutral-500 mt-1">上传时间：{project.uploadTime}</p>
                  </div>
                  {selectedProject?.id === project.id && (
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {filteredProjects.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              共 {filteredProjects.length} 个项目，当前第 {projectPage}/{totalPages} 页
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setProjectPage(Math.max(1, projectPage - 1))}
                disabled={projectPage === 1}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <span className="text-sm text-neutral-700">
                {projectPage} / {totalPages}
              </span>
              <button
                onClick={() => setProjectPage(Math.min(totalPages, projectPage + 1))}
                disabled={projectPage === totalPages}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          第三步：选择需要生成的招标文件类型，并为每个目录章节设置生成字数。这些文件与招标项目中解析出来的投标文件对应。
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">选择需要生成的文件类型 <span className="text-red-500">*</span></h3>
        <div className="grid grid-cols-2 gap-4">
          <label className={`flex items-center p-4 border-2 rounded-lg ${!isViewMode ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-not-allowed bg-neutral-50'} transition-colors ${
            fileTypes.includes('commercial') ? 'border-primary-600 bg-primary-50' : 'border-neutral-300'
          }`}>
            <input
              type="checkbox"
              checked={fileTypes.includes('commercial')}
              onChange={() => handleFileTypeToggle('commercial')}
              disabled={isViewMode}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 disabled:cursor-not-allowed"
            />
            <div className="ml-3">
              <div className="text-sm font-semibold text-neutral-900">商务文件</div>
              <div className="text-xs text-neutral-600 mt-0.5">资格证明、商务响应、报价等</div>
            </div>
          </label>
          <label className={`flex items-center p-4 border-2 rounded-lg ${!isViewMode ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-not-allowed bg-neutral-50'} transition-colors ${
            fileTypes.includes('technical') ? 'border-primary-600 bg-primary-50' : 'border-neutral-300'
          }`}>
            <input
              type="checkbox"
              checked={fileTypes.includes('technical')}
              onChange={() => handleFileTypeToggle('technical')}
              disabled={isViewMode}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div className="ml-3">
              <div className="text-sm font-semibold text-neutral-900">技术文件</div>
              <div className="text-xs text-neutral-600 mt-0.5">技术方案、实施方案等</div>
            </div>
          </label>
        </div>
      </div>

      {fileTypes.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-amber-800">请先选择需要生成的文件类型</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-neutral-900">目录章节字数设置</h3>

          {fileTypes.includes('commercial') && (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-green-900">商务文件目录结构</span>
                <span className="text-sm font-medium text-green-700">字数设置</span>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {commercialDirectory.length > 0 ? (
                  renderDirectoryTree(commercialDirectory, 0, updateCommercialWordCount)
                ) : (
                  <p className="text-center text-neutral-500 py-8">该项目暂无商务文件目录</p>
                )}
              </div>
            </div>
          )}

          {fileTypes.includes('technical') && (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">技术文件目录结构</span>
                <span className="text-sm font-medium text-blue-700">字数设置</span>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {technicalDirectory.length > 0 ? (
                  renderDirectoryTree(technicalDirectory, 0, updateTechnicalWordCount)
                ) : (
                  <p className="text-center text-neutral-500 py-8">该项目暂无技术文件目录</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => {
    const filteredCompanies = MOCK_COMPANIES.filter(company =>
      company.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
    const startIndex = (companyPage - 1) * ITEMS_PER_PAGE;
    const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            第四步：选择企业知识库，系统将使用该企业的基础信息、资质、业绩等资料生成投标文件。
          </p>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-4">选择企业知识库 <span className="text-red-500">*</span></h3>

        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索企业名称..."
            value={companySearch}
            onChange={(e) => {
              setCompanySearch(e.target.value);
              setCompanyPage(1);
            }}
            disabled={isViewMode}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="space-y-3 min-h-[300px]">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              未找到匹配的企业
            </div>
          ) : (
            paginatedCompanies.map(company => (
              <div
                key={company.id}
                onClick={() => !isViewMode && handleCompanySelect(company)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isViewMode ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
                  selectedCompany?.id === company.id
                    ? 'border-primary-600 bg-primary-50'
                    : isViewMode
                    ? 'border-neutral-200 bg-neutral-50'
                    : 'border-neutral-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-8 h-8 text-primary-600" />
                    <span className="font-medium text-neutral-900">{company.name}</span>
                  </div>
                  {selectedCompany?.id === company.id && (
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {filteredCompanies.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              共 {filteredCompanies.length} 个企业，当前第 {companyPage}/{totalPages} 页
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCompanyPage(Math.max(1, companyPage - 1))}
                disabled={companyPage === 1}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <span className="text-sm text-neutral-700">
                {companyPage} / {totalPages}
              </span>
              <button
                onClick={() => setCompanyPage(Math.min(totalPages, companyPage + 1))}
                disabled={companyPage === totalPages}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleCategoryFilterChange = (categoryId: string, filterKey: string, value: string) => {
    setCategoryFilters(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [filterKey]: value
      }
    }));
  };

  const getFilteredItems = (category: KnowledgeCategory) => {
    const filters = categoryFilters[category.id] || {};
    return category.items.filter(item => {
      if (filters.year && item.year && item.year !== filters.year) return false;
      if (filters.rating && item.rating && item.rating !== filters.rating) return false;
      if (filters.status && item.status && item.status !== filters.status) return false;
      if (filters.position && item.position && item.position !== filters.position) return false;
      return true;
    });
  };

  const renderItemDisplay = (item: KnowledgeItem, category: KnowledgeCategory) => {
    if (category.id === 'qualification') {
      return (
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-900">{item.name}</span>
            <div className="flex items-center space-x-3 text-xs text-neutral-600">
              <span>证书编号：{item.certNumber}</span>
              <span className={`px-2 py-0.5 rounded ${
                item.status === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {item.status === 'valid' ? '有效' : '已过期'}
              </span>
              {item.rating !== '无' && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{item.rating}</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (category.id === 'financial') {
      return (
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-900">{item.name}</span>
            {item.year && (
              <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">{item.year}年</span>
            )}
          </div>
        </div>
      );
    }

    if (category.id === 'performance') {
      return (
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-900">{item.projectName}</span>
            <div className="flex items-center space-x-3 text-xs text-neutral-600">
              <span>客户：{item.clientName}</span>
              <span>合同号：{item.contractNumber}</span>
            </div>
          </div>
        </div>
      );
    }

    if (category.id === 'personnel') {
      return (
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-900">{item.name}</span>
            <div className="flex items-center space-x-3 text-xs text-neutral-600">
              <span>{item.position}</span>
              <span className={`px-2 py-0.5 rounded ${
                item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {item.status === 'active' ? '在职' : '离职'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return <span className="ml-3 text-sm text-neutral-900">{item.name}</span>;
  };

  const renderStep5 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          第五步：选择需要使用的企业知识库资料，勾选的资料将作为生成投标文件的数据来源。支持按类型筛选查找。
        </p>
      </div>
      <h3 className="text-lg font-medium text-neutral-900 mb-4">选择知识库资料 <span className="text-red-500">*</span></h3>
      <div className="space-y-4">
        {knowledgeCategories.map(category => {
          const filteredItems = getFilteredItems(category);
          const selectedCount = filteredItems.filter(item => item.selected).length;

          return (
            <div key={category.id} className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-neutral-900">{category.name}</span>
                    <span className="text-xs text-neutral-600">({selectedCount}/{filteredItems.length})</span>
                  </div>
                  {!isViewMode && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCategoryAll(category.id, true)}
                        className="text-xs text-primary-600 hover:text-primary-800"
                      >
                        全选
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button
                        onClick={() => toggleCategoryAll(category.id, false)}
                        className="text-xs text-neutral-600 hover:text-neutral-800"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>

                {category.filters && (
                  <div className="flex items-center space-x-3 mt-2">
                    {category.filters.year && (
                      <select
                        value={categoryFilters[category.id]?.year || ''}
                        onChange={(e) => handleCategoryFilterChange(category.id, 'year', e.target.value)}
                        className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">所有年份</option>
                        {category.filters.year.map(year => (
                          <option key={year} value={year}>{year}年</option>
                        ))}
                      </select>
                    )}

                    {category.filters.rating && (
                      <select
                        value={categoryFilters[category.id]?.rating || ''}
                        onChange={(e) => handleCategoryFilterChange(category.id, 'rating', e.target.value)}
                        className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">所有等级</option>
                        {category.filters.rating.map(rating => (
                          <option key={rating} value={rating}>{rating}</option>
                        ))}
                      </select>
                    )}

                    {category.filters.status && (
                      <select
                        value={categoryFilters[category.id]?.status || ''}
                        onChange={(e) => handleCategoryFilterChange(category.id, 'status', e.target.value)}
                        className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">所有状态</option>
                        {category.filters.status.map(status => (
                          <option key={status} value={status}>
                            {status === 'valid' ? '有效' : status === 'expired' ? '已过期' : status === 'active' ? '在职' : '离职'}
                          </option>
                        ))}
                      </select>
                    )}

                    {category.filters.position && (
                      <select
                        value={categoryFilters[category.id]?.position || ''}
                        onChange={(e) => handleCategoryFilterChange(category.id, 'position', e.target.value)}
                        className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">所有职位</option>
                        {category.filters.position.map(position => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <p className="text-center text-neutral-500 py-4">暂无符合条件的资料</p>
                ) : (
                  filteredItems.map(item => (
                    <label
                      key={item.id}
                      className={`flex items-center p-3 rounded border border-transparent ${
                        !isViewMode ? 'hover:bg-neutral-50 hover:border-neutral-200 cursor-pointer' : 'cursor-not-allowed bg-neutral-50'
                      } ${item.selected ? 'bg-primary-50 border-primary-200' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleKnowledgeItem(category.id, item.id)}
                        disabled={isViewMode}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 disabled:cursor-not-allowed flex-shrink-0"
                      />
                      {renderItemDisplay(item, category)}
                    </label>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep6 = () => {
    if (isComplete || isViewMode) {
      return (
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
            {isViewMode ? '投标文件已完成' : '生成完成'}
          </h3>
          <p className="text-neutral-600 mb-8">投标文件已成功生成，可以导出使用。</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              导出 Word
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            第六步：确认所有配置信息，点击开始生成按钮，系统将自动生成投标文件。
          </p>
        </div>
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">开始生成投标文件</h3>
          <p className="text-neutral-600">确认以下信息无误后，点击开始生成</p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-6 space-y-4 mb-8">
          <div className="flex justify-between">
            <span className="text-sm text-neutral-600">文件名称：</span>
            <span className="text-sm font-medium text-neutral-900">{documentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-600">生成文件：</span>
            <span className="text-sm font-medium text-neutral-900">
              {fileTypes.includes('commercial') && '商务文件'}
              {fileTypes.includes('commercial') && fileTypes.includes('technical') && '、'}
              {fileTypes.includes('technical') && '技术文件'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-600">招标项目：</span>
            <span className="text-sm font-medium text-neutral-900">{selectedProject?.projectName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-600">企业：</span>
            <span className="text-sm font-medium text-neutral-900">{selectedCompany?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-neutral-600">已选资料：</span>
            <span className="text-sm font-medium text-neutral-900">
              {knowledgeCategories.reduce((acc, cat) => acc + cat.items.filter(i => i.selected).length, 0)} 项
            </span>
          </div>
        </div>

        {isGenerating ? (
          <div>
            <div className="flex items-center justify-center mb-4">
              <Loader className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-neutral-600 mb-1">
                <span>正在生成...</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={handleGenerate}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              开始生成
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-neutral-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            {isViewMode ? '查看投标文件' : isEditMode ? '编辑投标文件' : '投标文件生成'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderStepIndicator()}
          {renderStepContent()}
        </div>
      </div>

      {currentStep !== 6 && (
        <div className="border-t border-neutral-200 px-6 py-4 flex justify-between flex-shrink-0">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一步
          </button>
          <button
            onClick={isViewMode ? () => setCurrentStep(Math.min(currentStep + 1, 6)) : handleNextStep}
            disabled={isViewMode ? currentStep >= 6 : !canProceedToNextStep()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            下一步
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
