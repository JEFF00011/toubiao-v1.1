import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, FileText, CheckCircle, Building2, FolderTree, Loader, Download, X, BookOpen, Plus } from 'lucide-react';

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

interface DocumentFormat {
  id: string;
  company_id: string;
  name: string;
  header: string;
  footer: string;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  heading_styles: any;
  body_text_style: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface DirectoryItem {
  id: string;
  title: string;
  level: number;
  generationMode: 'copy' | 'brief' | 'detailed';
  selectedKnowledgeItems?: string[];
  selectedReferenceItems?: string[];
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
  projectPosition?: string;
  contractNumber?: string;
  contractAmount?: string;
  productName?: string;
  productBrand?: string;
  productSpec?: string;
  productModel?: string;
  productQuantity?: string;
  productCategory?: string;
  qualificationCount?: number;
  isLegalPerson?: boolean;
  isAuthorizedDelegate?: boolean;
  uploadTime?: string;
  signYear?: string;
}

interface FilterConfig {
  year?: string[];
  rating?: string[];
  status?: string[];
  position?: string[];
  productCategory?: string[];
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
  const [selectedFormat, setSelectedFormat] = useState<DocumentFormat | null>(null);
  const [documentFormats, setDocumentFormats] = useState<DocumentFormat[]>([]);
  const [knowledgeCategories, setKnowledgeCategories] = useState<KnowledgeCategory[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [categorySearches, setCategorySearches] = useState<{ [key: string]: { [key: string]: string } }>({});
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState('company');
  const [activeProductTab, setActiveProductTab] = useState<'productionEquipment' | 'testingEquipment' | 'companyProducts'>('productionEquipment');
  const [activePersonnelTab, setActivePersonnelTab] = useState<'legalPerson' | 'authorizedDelegate' | 'otherPersonnel'>('legalPerson');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  const [companyPage, setCompanyPage] = useState(1);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [currentDirectoryItem, setCurrentDirectoryItem] = useState<DirectoryItem | null>(null);
  const [currentDirectoryType, setCurrentDirectoryType] = useState<'commercial' | 'technical'>('commercial');
  const [tempSelectedKnowledgeIds, setTempSelectedKnowledgeIds] = useState<string[]>([]);
  const [tempSelectedReferenceIds, setTempSelectedReferenceIds] = useState<string[]>([]);
  const companyDropdownRef = React.useRef<HTMLDivElement>(null);
  const projectDropdownRef = React.useRef<HTMLDivElement>(null);
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
    if ((isEditMode || isViewMode) && existingDocument?.projectId && MOCK_PROJECTS.length > 0) {
      const project = MOCK_PROJECTS.find(p => p.id === existingDocument.projectId);
      if (project && (!selectedProject || selectedProject.id !== project.id)) {
        setSelectedProject(project);
        setIsProjectDropdownOpen(false);
        if (project.documentDirectory?.commercial) {
          setCommercialDirectory(parseDirectory(project.documentDirectory.commercial));
        }
        if (project.documentDirectory?.technical) {
          setTechnicalDirectory(parseDirectory(project.documentDirectory.technical));
        }
      }
    }
  }, [isEditMode, isViewMode, existingDocument, selectedProject]);

  React.useEffect(() => {
    if ((isEditMode || isViewMode) && !selectedCompany && MOCK_COMPANIES.length > 0) {
      const filteredCompanies = MOCK_COMPANIES.filter(company =>
        company.name.toLowerCase().includes(companySearch.toLowerCase())
      );
      if (filteredCompanies.length > 0) {
        handleCompanySelect(filteredCompanies[0]);
      }
    }
  }, [isEditMode, isViewMode]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const MOCK_FORMATS: DocumentFormat[] = [
    {
      id: 'fmt_1',
      company_id: '1',
      name: '标准格式A',
      header: '北京某某科技有限公司',
      footer: '第 {page} 页 共 {total} 页',
      margin_top: 25,
      margin_bottom: 25,
      margin_left: 30,
      margin_right: 30,
      heading_styles: {
        heading1: { numberingStyle: '一、', fontFamily: '宋体', fontSize: 18, indent: 0, lineSpacing: 1.5, alignment: 'center', bold: true },
        heading2: { numberingStyle: '（一）', fontFamily: '宋体', fontSize: 16, indent: 0, lineSpacing: 1.5, alignment: 'left', bold: true },
        heading3: { numberingStyle: '1.', fontFamily: '宋体', fontSize: 15, indent: 0, lineSpacing: 1.5, alignment: 'left', bold: true }
      },
      body_text_style: { numberingStyle: '1.', fontFamily: '宋体', fontSize: 14, indent: 2, lineSpacing: 1.5, alignment: 'left', bold: false },
      is_default: true,
      created_at: '2024-10-20',
      updated_at: '2024-10-20'
    },
    {
      id: 'fmt_2',
      company_id: '1',
      name: '简约格式B',
      header: '',
      footer: '第 {page} 页',
      margin_top: 20,
      margin_bottom: 20,
      margin_left: 25,
      margin_right: 25,
      heading_styles: {
        heading1: { numberingStyle: '1.', fontFamily: '微软雅黑', fontSize: 16, indent: 0, lineSpacing: 1.3, alignment: 'left', bold: true },
        heading2: { numberingStyle: '1.1', fontFamily: '微软雅黑', fontSize: 14, indent: 0, lineSpacing: 1.3, alignment: 'left', bold: true },
        heading3: { numberingStyle: '1.1.1', fontFamily: '微软雅黑', fontSize: 13, indent: 0, lineSpacing: 1.3, alignment: 'left', bold: false }
      },
      body_text_style: { numberingStyle: '', fontFamily: '微软雅黑', fontSize: 12, indent: 2, lineSpacing: 1.3, alignment: 'left', bold: false },
      is_default: false,
      created_at: '2024-10-18',
      updated_at: '2024-10-18'
    },
    {
      id: 'fmt_3',
      company_id: '2',
      name: '正式格式',
      header: '上海XX信息技术有限公司投标文件',
      footer: '第 {page} 页 共 {total} 页',
      margin_top: 30,
      margin_bottom: 30,
      margin_left: 35,
      margin_right: 35,
      heading_styles: {
        heading1: { numberingStyle: '第一章 ', fontFamily: '仿宋', fontSize: 20, indent: 0, lineSpacing: 2.0, alignment: 'center', bold: true },
        heading2: { numberingStyle: '一、', fontFamily: '仿宋', fontSize: 16, indent: 0, lineSpacing: 1.8, alignment: 'left', bold: true },
        heading3: { numberingStyle: '（一）', fontFamily: '仿宋', fontSize: 15, indent: 0, lineSpacing: 1.5, alignment: 'left', bold: true }
      },
      body_text_style: { numberingStyle: '', fontFamily: '仿宋', fontSize: 14, indent: 2, lineSpacing: 1.5, alignment: 'justify', bold: false },
      is_default: true,
      created_at: '2024-10-15',
      updated_at: '2024-10-15'
    }
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
        { id: 'qual_1', name: '软件企业认定证书', certNumber: 'CERT-2024-001', rating: '甲级', status: 'valid', uploadTime: '2024-10-20', selected: true },
        { id: 'qual_2', name: 'ISO9001质量管理体系认证', certNumber: 'ISO-2024-002', rating: '无', status: 'valid', uploadTime: '2024-10-18', selected: true },
        { id: 'qual_3', name: '信息安全等保三级证书', certNumber: 'SEC-2024-003', rating: '三级', status: 'valid', uploadTime: '2024-10-15', selected: false },
        { id: 'qual_4', name: 'CMMI认证证书', certNumber: 'CMMI-2023-004', rating: '三级', status: 'expired', uploadTime: '2024-09-10', selected: false },
        { id: 'qual_5', name: '高新技术企业证书', certNumber: 'HIGH-2024-005', rating: '无', status: 'valid', uploadTime: '2024-08-25', selected: true },
        { id: 'qual_6', name: '建筑业企业资质证书', certNumber: 'BUILD-2024-006', rating: '乙级', status: 'valid', uploadTime: '2024-07-12', selected: false }
      ],
      filters: {
        rating: ['无', '特级', '一级', '二级', '三级', '四级', '五级', '甲级', '乙级', '丙级', 'AAA', 'AAAA', 'AAAAA', 'CS1', 'CS2', 'CS3', 'CS4', 'CS5', '一星级', '二星级', '三星级', '四星级', '五星级', '六星级', '七星级', '八星级', '九星级', '十星级', '十一星级', '十二星级'],
        status: ['valid', 'expired']
      }
    },
    {
      id: 'financial',
      name: '财务信息',
      items: [
        { id: 'fin_4', name: '2024年资产负债表', year: '2024', selected: true },
        { id: 'fin_5', name: '2024年利润表', year: '2024', selected: false },
        { id: 'fin_6', name: '纳税证明', year: '2024', selected: true },
        { id: 'fin_1', name: '2024年度财务审计报告', year: '2024', selected: true },
        { id: 'fin_2', name: '2023年度财务审计报告', year: '2023', selected: false },
        { id: 'fin_3', name: '2022年度财务审计报告', year: '2022', selected: false }
      ],
      filters: {
        year: ['2024', '2023', '2022', '2021']
      }
    },
    {
      id: 'performance',
      name: '业绩信息',
      items: [
        { id: 'perf_1', name: '智慧城市建设项目', projectName: '智慧城市建设项目', clientName: '北京市政府', contractNumber: 'CT-2024-001', signYear: '2024', selected: true },
        { id: 'perf_2', name: '教育信息化平台', projectName: '教育信息化平台', clientName: '教育部', contractNumber: 'CT-2024-002', signYear: '2024', selected: true },
        { id: 'perf_3', name: '政务服务平台', projectName: '政务服务平台', clientName: '上海市政府', contractNumber: 'CT-2023-003', signYear: '2023', selected: false },
        { id: 'perf_4', name: '医疗信息系统', projectName: '医疗信息系统', clientName: '华山医院', contractNumber: 'CT-2023-004', signYear: '2023', selected: false },
        { id: 'perf_5', name: '企业ERP系统', projectName: '企业ERP系统', clientName: '万科集团', contractNumber: 'CT-2022-005', signYear: '2022', selected: false }
      ]
    },
    {
      id: 'legalPerson',
      name: '人员信息 - 法人',
      items: [
        { id: 'legal_1', name: '王建国', position: '法定代表人', status: 'active', uploadTime: '2024-10-20', isLegalPerson: true, selected: true }
      ],
      filters: {
        status: ['active', 'resigned']
      }
    },
    {
      id: 'authorizedDelegate',
      name: '人员信息 - 授权委托人',
      items: [
        { id: 'per_1', name: '张三', position: '其他人员', status: 'active', uploadTime: '2024-10-22', selected: true },
        { id: 'per_2', name: '李四', position: '其他人员', status: 'active', uploadTime: '2024-10-20', selected: true },
        { id: 'per_3', name: '王五', position: '其他人员', status: 'active', uploadTime: '2024-10-15', selected: false },
        { id: 'per_4', name: '赵六', position: '其他人员', status: 'active', uploadTime: '2024-09-28', selected: false },
        { id: 'per_5', name: '孙七', position: '其他人员', status: 'resigned', uploadTime: '2024-08-10', selected: false },
        { id: 'per_6', name: '周八', position: '其他人员', status: 'active', uploadTime: '2024-09-15', selected: false },
        { id: 'per_7', name: '吴九', position: '其他人员', status: 'active', uploadTime: '2024-09-01', selected: false }
      ],
    },
    {
      id: 'otherPersonnel',
      name: '人员信息 - 其他人员',
      items: [
        { id: 'per_1', name: '张三', position: '其他人员', projectPosition: '项目经理', status: 'active', uploadTime: '2024-10-22', selected: true },
        { id: 'per_2', name: '李四', position: '其他人员', projectPosition: '技术总监', status: 'active', uploadTime: '2024-10-20', selected: true },
        { id: 'per_3', name: '王五', position: '其他人员', projectPosition: '', status: 'active', uploadTime: '2024-10-15', selected: false },
        { id: 'per_4', name: '赵六', position: '其他人员', projectPosition: '', status: 'active', uploadTime: '2024-09-28', selected: false },
        { id: 'per_5', name: '孙七', position: '其他人员', projectPosition: '', status: 'resigned', uploadTime: '2024-08-10', selected: false },
        { id: 'per_6', name: '周八', position: '其他人员', projectPosition: '', status: 'active', uploadTime: '2024-09-15', selected: false },
        { id: 'per_7', name: '吴九', position: '其他人员', projectPosition: '', status: 'active', uploadTime: '2024-09-01', selected: false }
      ],
    },
    {
      id: 'productionEquipment',
      name: '产品信息 - 生产设备',
      items: [
        { id: 'prod_1', name: '数控机床 CNC-5000', productCategory: '加工设备', productBrand: '某某机械', productSpec: '五轴联动', productModel: 'CNC-5000', selected: true },
        { id: 'prod_2', name: '注塑机 INJ-800T', productCategory: '成型设备', productBrand: '某某塑机', productSpec: '800吨锁模力', productModel: 'INJ-800T', selected: false },
        { id: 'prod_3', name: '激光切割机 LC-3015', productCategory: '切割设备', productBrand: '某某激光', productSpec: '3000W', productModel: 'LC-3015', selected: true }
      ],
      filters: {
        productCategory: ['加工设备', '成型设备', '切割设备', '焊接设备']
      }
    },
    {
      id: 'testingEquipment',
      name: '产品信息 - 检测设备',
      items: [
        { id: 'test_1', name: '三坐标测量仪 CMM-7106', productCategory: '精密测量', productBrand: '某某测量', productSpec: '700x1000x600mm', productModel: 'CMM-7106', selected: true },
        { id: 'test_2', name: '硬度计 HR-150A', productCategory: '硬度检测', productBrand: '某某仪器', productSpec: '洛氏硬度', productModel: 'HR-150A', selected: false },
        { id: 'test_3', name: '光谱仪 OES-2000', productCategory: '成分分析', productBrand: '某某光学', productSpec: '全谱直读', productModel: 'OES-2000', selected: true }
      ],
      filters: {
        productCategory: ['精密测量', '硬度检测', '成分分析', '无损检测']
      }
    },
    {
      id: 'companyProducts',
      name: '产品信息 - 企业产品',
      items: [
        { id: 'cprod_1', name: '企业级路由器 ER8300G', productCategory: '自由产品', productBrand: '华为', productSpec: '企业级', productModel: 'ER8300G', selected: true },
        { id: 'cprod_2', name: '高性能交换机 S5720-SI', productCategory: '自由产品', productBrand: '华为', productSpec: '千兆24口', productModel: 'S5720-28P-SI', selected: true },
        { id: 'cprod_3', name: 'Dell PowerEdge R740 服务器', productCategory: '代理产品', productBrand: 'Dell', productSpec: '2U机架式', productModel: 'R740', selected: true }
      ],
      filters: {
        productCategory: ['网络设备', '计算机设备', '服务器', '办公设备']
      }
    },
    {
      id: 'templates',
      name: '历史投标文件',
      items: [
        { id: 'temp_1', name: '类似项目投标文件模板', uploadTime: '2024-10-21', selected: true },
        { id: 'temp_2', name: '技术方案参考文档', uploadTime: '2024-10-18', selected: true },
        { id: 'temp_3', name: '售后服务方案模板', uploadTime: '2024-10-12', selected: false },
        { id: 'temp_4', name: '项目实施计划模板', uploadTime: '2024-09-25', selected: false },
        { id: 'temp_5', name: '培训方案模板', uploadTime: '2024-09-10', selected: false }
      ]
    },
    {
      id: 'otherFiles',
      name: '其他参考文件',
      items: [
        { id: 'other_1', name: '行业标准规范文档', uploadTime: '2024-10-20', selected: false },
        { id: 'other_2', name: '产品说明书', uploadTime: '2024-10-15', selected: false },
        { id: 'other_3', name: '技术白皮书', uploadTime: '2024-10-10', selected: false },
        { id: 'other_4', name: '合作协议模板', uploadTime: '2024-09-30', selected: false },
        { id: 'other_5', name: '项目案例分析报告', uploadTime: '2024-09-20', selected: false }
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
        generationMode: 'detailed',
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

  const handleProjectSelect = useCallback((project: BiddingProject) => {
    setSelectedProject(project);
    setIsProjectDropdownOpen(false);

    if (project.documentDirectory?.commercial) {
      setCommercialDirectory(parseDirectory(project.documentDirectory.commercial));
    }
    if (project.documentDirectory?.technical) {
      setTechnicalDirectory(parseDirectory(project.documentDirectory.technical));
    }
  }, []);

  const handleChangeProject = () => {
    setSelectedProject(null);
    setProjectSearch('');
    setIsProjectDropdownOpen(false);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setKnowledgeCategories(MOCK_KNOWLEDGE);
    const companyFormats = MOCK_FORMATS.filter(fmt => fmt.company_id === company.id);
    setDocumentFormats(companyFormats);
    const defaultFormat = companyFormats.find(fmt => fmt.is_default);
    setSelectedFormat(defaultFormat || companyFormats[0] || null);
  };

  const updateGenerationMode = (itemId: string, mode: 'copy' | 'brief' | 'detailed', items: DirectoryItem[]): DirectoryItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, generationMode: mode };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateGenerationMode(itemId, mode, item.children) };
      }
      return item;
    });
  };

  const updateCommercialGenerationMode = (itemId: string, mode: 'copy' | 'brief' | 'detailed') => {
    setCommercialDirectory(prev => updateGenerationMode(itemId, mode, prev));
  };

  const updateTechnicalGenerationMode = (itemId: string, mode: 'copy' | 'brief' | 'detailed') => {
    setTechnicalDirectory(prev => updateGenerationMode(itemId, mode, prev));
  };

  const toggleKnowledgeItem = (categoryId: string, itemId: string) => {
    setKnowledgeCategories(prev =>
      prev.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map(item => {
              if (item.id === itemId) {
                const isPersonnelCategory = categoryId === 'legalPerson' || categoryId === 'authorizedDelegate' || categoryId === 'otherPersonnel';
                if (isPersonnelCategory && item.status === 'resigned' && !item.selected) {
                  return item;
                }
                return { ...item, selected: !item.selected };
              }
              return item;
            })
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

  const handleCompanySelectFromDropdown = (company: Company) => {
    handleCompanySelect(company);
    setIsCompanyDropdownOpen(false);
    setCompanySearch('');
  };

  const handleChangeCompany = () => {
    setSelectedCompany(null);
    setCompanySearch('');
    setIsCompanyDropdownOpen(true);
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
        return selectedProject !== null && fileTypes.length > 0;
      case 3:
        return selectedCompany !== null;
      case 4:
        return true;
      case 5:
        return selectedFormat !== null;
      default:
        return true;
    }
  };

  const renderDirectoryTree = (items: DirectoryItem[], level: number = 0, onUpdate: (id: string, mode: 'copy' | 'brief' | 'detailed') => void, directoryType: 'commercial' | 'technical' = 'commercial') => {
    return items.map(item => {
      const selectedCount = item.selectedKnowledgeItems?.length || 0;

      const getModeLabel = (mode: 'copy' | 'brief' | 'detailed') => {
        switch (mode) {
          case 'copy': return '仅复制';
          case 'brief': return '简要生成';
          case 'detailed': return '详细生成';
        }
      };

      return (
        <div key={item.id} style={{ paddingLeft: `${level * 24}px` }}>
          <div className="flex items-center justify-between py-2 border-b border-neutral-100 gap-3">
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${level === 0 ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}>
                {item.title}
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => {
                  setCurrentDirectoryItem(item);
                  setCurrentDirectoryType(directoryType);
                  setTempSelectedKnowledgeIds(item.selectedKnowledgeItems || []);
                  setIsKnowledgeModalOpen(true);
                }}
                disabled={isViewMode}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  selectedCount > 0
                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="选择知识库资料"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{selectedCount > 0 ? `已选${selectedCount}` : '选择资料'}</span>
              </button>
              <select
                value={item.generationMode}
                onChange={(e) => {
                  onUpdate(item.id, e.target.value as 'copy' | 'brief' | 'detailed');
                }}
                disabled={isViewMode}
                className="px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
              >
                <option value="copy">仅复制</option>
                <option value="brief">简要生成</option>
                <option value="detailed">详细生成</option>
              </select>
            </div>
          </div>
          {item.children.length > 0 && renderDirectoryTree(item.children, level + 1, onUpdate, directoryType)}
        </div>
      );
    });
  };

  const steps = [
    { number: 1, name: '项目名称' },
    { number: 2, name: '招标项目' },
    { number: 3, name: '企业知识库' },
    { number: 4, name: '章节设置' },
    { number: 5, name: '文件格式' },
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
            第三步：选择对应的招标项目，系统将根据该项目解析的文件目录结构生成投标文件。
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
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          第四步：为每个章节设置生成字数，并可选择对应的知识库资料。如果不选择，系统将自动匹配最合适的资料。
        </p>
      </div>

      {fileTypes.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-amber-800">请先在第三步选择需要生成的文件类型</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-neutral-900">目录章节设置</h3>

          {fileTypes.includes('commercial') && (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                <span className="text-sm font-semibold text-green-900">商务文件目录结构</span>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {commercialDirectory.length > 0 ? (
                  renderDirectoryTree(commercialDirectory, 0, updateCommercialGenerationMode, 'commercial')
                ) : (
                  <p className="text-center text-neutral-500 py-8">该项目暂无商务文件目录</p>
                )}
              </div>
            </div>
          )}

          {fileTypes.includes('technical') && (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                <span className="text-sm font-semibold text-blue-900">技术文件目录结构</span>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {technicalDirectory.length > 0 ? (
                  renderDirectoryTree(technicalDirectory, 0, updateTechnicalGenerationMode, 'technical')
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
            第二步：选择企业知识库，系统将使用该企业的基础信息、资质、业绩等资料生成投标文件。
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

  const handleSearchChange = (categoryId: string, field: string, value: string) => {
    setCategorySearches(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value
      }
    }));
  };

  const getFilteredItems = (category: KnowledgeCategory) => {
    const filters = categoryFilters[category.id] || {};
    const searches = categorySearches[category.id] || {};

    let filteredItems = category.items.filter(item => {
      if (filters.year && item.year && item.year !== filters.year) return false;
      if (filters.rating && item.rating && item.rating !== filters.rating) return false;
      if (filters.status && item.status && item.status !== filters.status) return false;
      if (filters.position && item.position && item.position !== filters.position) return false;
      if (filters.productCategory && item.productCategory && item.productCategory !== filters.productCategory) return false;

      if (category.id === 'company') {
        if (searches.name && !item.name?.toLowerCase().includes(searches.name.toLowerCase())) return false;
      }

      if (category.id === 'qualification') {
        if (searches.name && !item.name?.toLowerCase().includes(searches.name.toLowerCase())) return false;
        if (searches.certNumber && !item.certNumber?.toLowerCase().includes(searches.certNumber.toLowerCase())) return false;
        if (searches.rating && !item.rating?.toLowerCase().includes(searches.rating.toLowerCase())) return false;
      }

      if (category.id === 'financial') {
        if (searches.name && !item.name?.toLowerCase().includes(searches.name.toLowerCase())) return false;
      }

      if (category.id === 'performance') {
        if (searches.projectName && !item.projectName?.toLowerCase().includes(searches.projectName.toLowerCase())) return false;
        if (searches.contractNumber && !item.contractNumber?.toLowerCase().includes(searches.contractNumber.toLowerCase())) return false;
        if (searches.contractAmountMin) {
          const minAmount = parseFloat(searches.contractAmountMin);
          const itemAmount = parseFloat(item.contractAmount?.replace(/[^\d.]/g, '') || '0');
          if (itemAmount <= minAmount) return false;
        }
        if (searches.productName && !item.productName?.toLowerCase().includes(searches.productName.toLowerCase())) return false;
        if (searches.productBrand && !item.productBrand?.toLowerCase().includes(searches.productBrand.toLowerCase())) return false;
        if (searches.productModel && !item.productModel?.toLowerCase().includes(searches.productModel.toLowerCase())) return false;
        if (searches.productQuantity && !item.productQuantity?.toLowerCase().includes(searches.productQuantity.toLowerCase())) return false;
      }

      if (category.id === 'legalPerson' || category.id === 'authorizedDelegate' || category.id === 'otherPersonnel') {
        if (searches.name && !item.name?.toLowerCase().includes(searches.name.toLowerCase())) return false;
      }

      if (category.id === 'productionEquipment' || category.id === 'testingEquipment' || category.id === 'companyProducts') {
        if (searches.name && !item.name?.toLowerCase().includes(searches.name.toLowerCase())) return false;
        if (searches.productBrand && !item.productBrand?.toLowerCase().includes(searches.productBrand.toLowerCase())) return false;
        if (searches.productModel && !item.productModel?.toLowerCase().includes(searches.productModel.toLowerCase())) return false;
      }

      if (category.id === 'templates') {
        if (searches.name && !item.name?.toLowerCase().includes(searches.name.toLowerCase())) return false;
      }

      return true;
    });

    if (category.id === 'qualification' && filteredItems.length > 0) {
      filteredItems = filteredItems.sort((a, b) => {
        if (!a.uploadTime || !b.uploadTime) return 0;
        return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
      });
    }

    if (category.id === 'financial' && filteredItems.length > 0) {
      filteredItems = filteredItems.sort((a, b) => {
        if (!a.year || !b.year) return 0;
        return parseInt(b.year) - parseInt(a.year);
      });
    }

    if (category.id === 'performance' && filteredItems.length > 0) {
      filteredItems = filteredItems.sort((a, b) => {
        if (!a.signYear || !b.signYear) return 0;
        return parseInt(b.signYear) - parseInt(a.signYear);
      });
    }

    if ((category.id === 'legalPerson' || category.id === 'authorizedDelegate' || category.id === 'otherPersonnel') && filteredItems.length > 0) {
      filteredItems = filteredItems.sort((a, b) => {
        if (!a.uploadTime || !b.uploadTime) return 0;
        return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
      });
    }

    if (category.id === 'templates' && filteredItems.length > 0) {
      filteredItems = filteredItems.sort((a, b) => {
        if (!a.uploadTime || !b.uploadTime) return 0;
        return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
      });
    }

    if (category.id === 'otherFiles' && filteredItems.length > 0) {
      filteredItems = filteredItems.sort((a, b) => {
        if (!a.uploadTime || !b.uploadTime) return 0;
        return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
      });
    }

    return filteredItems;
  };

  const renderSearchFields = (category: KnowledgeCategory) => {
    const searches = categorySearches[category.id] || {};
    const filters = categoryFilters[category.id] || {};

    if (category.id === 'company') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="公司名称"
            value={searches.name || ''}
            onChange={(e) => handleSearchChange(category.id, 'name', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-40"
          />
        </div>
      );
    }

    if (category.id === 'qualification') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="资质名称"
            value={searches.name || ''}
            onChange={(e) => handleSearchChange(category.id, 'name', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-32"
          />
          <input
            type="text"
            placeholder="资质编号"
            value={searches.certNumber || ''}
            onChange={(e) => handleSearchChange(category.id, 'certNumber', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-32"
          />
          <input
            type="text"
            placeholder="证书级别"
            value={searches.rating || ''}
            onChange={(e) => handleSearchChange(category.id, 'rating', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-24"
          />
          {category.filters?.rating && (
            <select
              value={filters.rating || ''}
              onChange={(e) => handleCategoryFilterChange(category.id, 'rating', e.target.value)}
              className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
            >
              <option value="">所有等级</option>
              {category.filters.rating.map(rating => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          )}
          {category.filters?.status && (
            <select
              value={filters.status || ''}
              onChange={(e) => handleCategoryFilterChange(category.id, 'status', e.target.value)}
              className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
            >
              <option value="">所有状态</option>
              {category.filters.status.map(status => (
                <option key={status} value={status}>
                  {status === 'valid' ? '有效' : status === 'expired' ? '已过期' : status === 'active' ? '可用' : '不可用'}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    }

    if (category.id === 'financial') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="财务信息名称"
            value={searches.name || ''}
            onChange={(e) => handleSearchChange(category.id, 'name', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-40"
          />
          {category.filters?.year && (
            <select
              value={filters.year || ''}
              onChange={(e) => handleCategoryFilterChange(category.id, 'year', e.target.value)}
              className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
            >
              <option value="">所有年份</option>
              {category.filters.year.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          )}
        </div>
      );
    }

    if (category.id === 'performance') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="项目名称"
            value={searches.projectName || ''}
            onChange={(e) => handleSearchChange(category.id, 'projectName', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-28"
          />
          <input
            type="text"
            placeholder="合同编号"
            value={searches.contractNumber || ''}
            onChange={(e) => handleSearchChange(category.id, 'contractNumber', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-28"
          />
          <input
            type="number"
            placeholder="金额大于"
            value={searches.contractAmountMin || ''}
            onChange={(e) => handleSearchChange(category.id, 'contractAmountMin', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-24"
          />
          <input
            type="text"
            placeholder="产品名称"
            value={searches.productName || ''}
            onChange={(e) => handleSearchChange(category.id, 'productName', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-24"
          />
          <input
            type="text"
            placeholder="产品品牌"
            value={searches.productBrand || ''}
            onChange={(e) => handleSearchChange(category.id, 'productBrand', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-24"
          />
          <input
            type="text"
            placeholder="产品型号"
            value={searches.productModel || ''}
            onChange={(e) => handleSearchChange(category.id, 'productModel', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-24"
          />
          <input
            type="text"
            placeholder="产品数量"
            value={searches.productQuantity || ''}
            onChange={(e) => handleSearchChange(category.id, 'productQuantity', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-24"
          />
        </div>
      );
    }

    if (category.id === 'legalPerson' || category.id === 'authorizedDelegate' || category.id === 'otherPersonnel') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="人员姓名"
            value={searches.name || ''}
            onChange={(e) => handleSearchChange(category.id, 'name', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-32"
          />
          {category.filters?.status && (
            <select
              value={filters.status || ''}
              onChange={(e) => handleCategoryFilterChange(category.id, 'status', e.target.value)}
              className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
            >
              <option value="">所有状态</option>
              {category.filters.status.map(status => (
                <option key={status} value={status}>
                  {status === 'valid' ? '有效' : status === 'expired' ? '已过期' : status === 'active' ? '可用' : '不可用'}
                </option>
              ))}
            </select>
          )}
          {category.filters?.position && (
            <select
              value={filters.position || ''}
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
      );
    }

    if (category.id === 'productionEquipment' || category.id === 'testingEquipment' || category.id === 'companyProducts') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="产品名称"
            value={searches.name || ''}
            onChange={(e) => handleSearchChange(category.id, 'name', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-28"
          />
          <input
            type="text"
            placeholder="产品品牌"
            value={searches.productBrand || ''}
            onChange={(e) => handleSearchChange(category.id, 'productBrand', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-24"
          />
          <input
            type="text"
            placeholder="产品型号"
            value={searches.productModel || ''}
            onChange={(e) => handleSearchChange(category.id, 'productModel', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-24"
          />
          {category.filters?.productCategory && (
            <select
              value={filters.productCategory || ''}
              onChange={(e) => handleCategoryFilterChange(category.id, 'productCategory', e.target.value)}
              className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
            >
              <option value="">所有分类</option>
              {category.filters.productCategory.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      );
    }

    if (category.id === 'templates') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="文件名称"
            value={searches.name || ''}
            onChange={(e) => handleSearchChange(category.id, 'name', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-40"
          />
        </div>
      );
    }

    if (category.id === 'otherFiles') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="文件名称"
            value={searches.name || ''}
            onChange={(e) => handleSearchChange(category.id, 'name', e.target.value)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 w-40"
          />
        </div>
      );
    }

    return null;
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

    if (category.id === 'legalPerson' || category.id === 'authorizedDelegate') {
      return (
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-900">{item.name}</span>
            <div className="flex items-center space-x-3 text-xs text-neutral-600">
              <span>{item.position}</span>
              <span className={`px-2 py-0.5 rounded ${
                item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {item.status === 'active' ? '可用' : '不可用'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (category.id === 'otherPersonnel') {
      return (
        <div className="ml-3 flex-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-900">{item.name}</span>
              <div className="flex items-center space-x-3 text-xs text-neutral-600">
                <span>职位：{item.position}</span>
                <span className={`px-2 py-0.5 rounded ${
                  item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {item.status === 'active' ? '可用' : '不可用'}
                </span>
              </div>
            </div>
            {item.selected && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 flex-shrink-0">项目职位：</span>
                <input
                  type="text"
                  value={item.projectPosition || ''}
                  onChange={(e) => {
                    setKnowledgeCategories(prev =>
                      prev.map(cat => {
                        if (cat.id === category.id) {
                          return {
                            ...cat,
                            items: cat.items.map(i =>
                              i.id === item.id ? { ...i, projectPosition: e.target.value } : i
                            )
                          };
                        }
                        return cat;
                      })
                    );
                  }}
                  placeholder="请输入在本项目中的职位"
                  disabled={isViewMode}
                  className="flex-1 px-2 py-1 text-xs border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (category.id === 'productionEquipment' || category.id === 'testingEquipment' || category.id === 'companyProducts') {
      return (
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-900">{item.name}</span>
            <div className="flex items-center space-x-3 text-xs text-neutral-600">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{item.productCategory}</span>
              <span>品牌：{item.productBrand}</span>
              <span>型号：{item.productModel}</span>
            </div>
          </div>
        </div>
      );
    }

    return <span className="ml-3 text-sm text-neutral-900">{item.name}</span>;
  };

  const renderStep5 = () => {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            第五步：选择投标文件格式，系统将使用该格式生成投标文件。
          </p>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-4">
          选择文件格式 <span className="text-red-500">*</span>
        </h3>

        {documentFormats.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <p className="text-amber-800">该企业暂无文件格式配置</p>
            <p className="text-sm text-amber-600 mt-2">请前往格式设置页面添加文件格式</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentFormats.map((format) => (
              <div
                key={format.id}
                onClick={() => !isViewMode && setSelectedFormat(format)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isViewMode ? 'cursor-not-allowed' : 'cursor-pointer hover:border-primary-300'
                } ${
                  selectedFormat?.id === format.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium text-neutral-900">{format.name}</h4>
                      {format.is_default && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded">
                          默认
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-neutral-600">
                      {/*<div className="flex items-center gap-4">*/}
                        {/*<span>页眉: {format.header || '无'}</span>*/}
                        {/*<span>页脚: {format.footer}</span>*/}
                      {/*</div>*/}
                      {/*<div className="flex items-center gap-4">*/}
                        {/*<span>边距: 上{format.margin_top}mm 下{format.margin_bottom}mm 左{format.margin_left}mm 右{format.margin_right}mm</span>*/}
                      {/*</div>*/}
                      {/*<div className="flex items-center gap-4">*/}
                        {/*<span>正文字体: {format.body_text_style.fontFamily} {format.body_text_style.fontSize}号</span>*/}
                        {/*<span>行距: {format.body_text_style.lineSpacing}</span>*/}
                      {/*</div>*/}
                    </div>
                  </div>
                  {selectedFormat?.id === format.id && (
                    <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 ml-3" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStep6 = () => {
    const productCategories = ['productionEquipment', 'testingEquipment', 'companyProducts'];
    const personnelCategories = ['legalPerson', 'authorizedDelegate', 'otherPersonnel'];
    const isProductTab = activeKnowledgeTab === 'product';
    const isPersonnelTab = activeKnowledgeTab === 'personnel';

    const activeCategory = isProductTab
      ? knowledgeCategories.find(cat => cat.id === activeProductTab)
      : isPersonnelTab
      ? knowledgeCategories.find(cat => cat.id === activePersonnelTab)
      : knowledgeCategories.find(cat => cat.id === activeKnowledgeTab);

    if (!activeCategory) return null;

    const filteredItems = getFilteredItems(activeCategory);
    const selectedCount = filteredItems.filter(item => item.selected).length;

    const displayCategories = knowledgeCategories.filter(cat => !productCategories.includes(cat.id) && !personnelCategories.includes(cat.id));
    const categoriesBeforeProduct = displayCategories.filter(cat => cat.id !== 'templates' && cat.id !== 'otherFiles');
    const templatesCategory = displayCategories.find(cat => cat.id === 'templates');
    const otherFilesCategory = displayCategories.find(cat => cat.id === 'otherFiles');

    const allProductCategories = knowledgeCategories.filter(cat => productCategories.includes(cat.id));
    const totalProductSelected = allProductCategories.reduce((sum, cat) => sum + cat.items.filter(item => item.selected).length, 0);
    const totalProductCount = allProductCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    const allPersonnelCategories = knowledgeCategories.filter(cat => personnelCategories.includes(cat.id));
    const totalPersonnelSelected = allPersonnelCategories.reduce((sum, cat) => sum + cat.items.filter(item => item.selected).length, 0);
    const totalPersonnelCount = allPersonnelCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            第五步：选择需要使用的企业知识库资料，勾选的资料将作为生成投标文件的数据来源。支持按类型筛选查找。
          </p>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-4">选择知识库资料 <span className="text-red-500">*</span></h3>

        <div className="border-b border-neutral-200 mb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {categoriesBeforeProduct.map(category => {
              const categorySelectedCount = category.items.filter(item => item.selected).length;
              const categoryTotalCount = category.items.length;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveKnowledgeTab(category.id)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeKnowledgeTab === category.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                  }`}
                >
                  {category.name}
                  {categorySelectedCount > 0 && (
                    <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                      activeKnowledgeTab === category.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {categorySelectedCount}/{categoryTotalCount}
                    </span>
                  )}
                </button>
              );
            })}
            {allPersonnelCategories.length > 0 && (
              <button
                onClick={() => {
                  setActiveKnowledgeTab('personnel');
                }}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isPersonnelTab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                人员信息
                {totalPersonnelSelected > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                    isPersonnelTab
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {totalPersonnelSelected}/{totalPersonnelCount}
                  </span>
                )}
              </button>
            )}
            {allProductCategories.length > 0 && (
              <button
                onClick={() => {
                  setActiveKnowledgeTab('product');
                }}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isProductTab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                产品信息
                {totalProductSelected > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                    isProductTab
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {totalProductSelected}/{totalProductCount}
                  </span>
                )}
              </button>
            )}
            {templatesCategory && (
              <button
                key={templatesCategory.id}
                onClick={() => setActiveKnowledgeTab(templatesCategory.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeKnowledgeTab === templatesCategory.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                {templatesCategory.name}
                {templatesCategory.items.filter(item => item.selected).length > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                    activeKnowledgeTab === templatesCategory.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {templatesCategory.items.filter(item => item.selected).length}/{templatesCategory.items.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {isPersonnelTab && (
          <div className="mb-4">
            <div className="border-b border-neutral-200">
              <div className="flex space-x-2">
                {allPersonnelCategories.map(category => {
                  const categorySelectedCount = category.items.filter(item => item.selected).length;
                  const categoryTotalCount = category.items.length;
                  const personnelTabNames = {
                    legalPerson: '法人',
                    authorizedDelegate: '授权委托人',
                    otherPersonnel: '其他人员'
                  };

                  return (
                    <button
                      key={category.id}
                      onClick={() => setActivePersonnelTab(category.id as any)}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-t ${
                        activePersonnelTab === category.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {personnelTabNames[category.id as keyof typeof personnelTabNames]}
                      {categorySelectedCount > 0 && (
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                          activePersonnelTab === category.id
                            ? 'bg-primary-700 text-white'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}>
                          {categorySelectedCount}/{categoryTotalCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {activePersonnelTab === 'authorizedDelegate' && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">提示：</span>授权委托人可从企业所有人员（除法人外）中选择，选中的人员将作为投标项目的授权委托人。
                </p>
              </div>
            )}
          </div>
        )}

        {isProductTab && (
          <div className="mb-4 border-b border-neutral-200">
            <div className="flex space-x-2">
              {allProductCategories.map(category => {
                const categorySelectedCount = category.items.filter(item => item.selected).length;
                const categoryTotalCount = category.items.length;
                const productTabNames = {
                  productionEquipment: '生产设备',
                  testingEquipment: '检测设备',
                  companyProducts: '企业产品'
                };

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveProductTab(category.id as any)}
                    className={`px-4 py-2 text-sm font-medium transition-colors rounded-t ${
                      activeProductTab === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {productTabNames[category.id as keyof typeof productTabNames]}
                    {categorySelectedCount > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                        activeProductTab === category.id
                          ? 'bg-primary-700 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {categorySelectedCount}/{categoryTotalCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-neutral-900">{activeCategory.name}</span>
                <span className="text-xs text-neutral-600">({selectedCount}/{filteredItems.length})</span>
              </div>
              {!isViewMode && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleCategoryAll(activeCategory.id, true)}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    全选
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    onClick={() => toggleCategoryAll(activeCategory.id, false)}
                    className="text-xs text-neutral-600 hover:text-neutral-800"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3">
              {renderSearchFields(activeCategory)}
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-center text-neutral-500 py-4">暂无符合条件的资料</p>
            ) : (
              filteredItems.map(item => {
                const isExpired = (activeCategory.id === 'qualification' && item.status === 'expired');
                const isPersonnelCategory = activeCategory.id === 'legalPerson' || activeCategory.id === 'authorizedDelegate' || activeCategory.id === 'otherPersonnel';
                const isResigned = (isPersonnelCategory && item.status === 'resigned');
                const isDisabled = isViewMode || isExpired || isResigned;

                return (
                  <label
                    key={item.id}
                    className={`flex items-center p-3 rounded border border-transparent ${
                      !isDisabled ? 'hover:bg-neutral-50 hover:border-neutral-200 cursor-pointer' : 'cursor-not-allowed bg-neutral-50 opacity-60'
                    } ${item.selected ? 'bg-primary-50 border-primary-200' : ''}`}
                    title={isExpired ? '已过期资质无法选择' : isResigned ? '不可用人员无法选择' : ''}
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleKnowledgeItem(activeCategory.id, item.id)}
                      disabled={isDisabled}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 disabled:cursor-not-allowed flex-shrink-0"
                    />
                    {renderItemDisplay(item, activeCategory)}
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep2Combined = () => {
    const filteredCompanies = MOCK_COMPANIES.filter(company =>
      company.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    const productCategories = ['productionEquipment', 'testingEquipment', 'companyProducts'];
    const personnelCategories = ['legalPerson', 'authorizedDelegate', 'otherPersonnel'];
    const isProductTab = activeKnowledgeTab === 'product';
    const isPersonnelTab = activeKnowledgeTab === 'personnel';

    const activeCategory = isProductTab
      ? knowledgeCategories.find(cat => cat.id === activeProductTab)
      : isPersonnelTab
      ? knowledgeCategories.find(cat => cat.id === activePersonnelTab)
      : knowledgeCategories.find(cat => cat.id === activeKnowledgeTab);

    const filteredItems = activeCategory ? getFilteredItems(activeCategory) : [];
    const selectedCount = filteredItems.filter(item => item.selected).length;

    const displayCategories = knowledgeCategories.filter(cat => !productCategories.includes(cat.id) && !personnelCategories.includes(cat.id));
    const categoriesBeforeProduct = displayCategories.filter(cat => cat.id !== 'templates' && cat.id !== 'otherFiles');
    const templatesCategory = displayCategories.find(cat => cat.id === 'templates');
    const otherFilesCategory = displayCategories.find(cat => cat.id === 'otherFiles');

    const allProductCategories = knowledgeCategories.filter(cat => productCategories.includes(cat.id));
    const totalProductSelected = allProductCategories.reduce((sum, cat) => sum + cat.items.filter(item => item.selected).length, 0);
    const totalProductCount = allProductCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    const allPersonnelCategories = knowledgeCategories.filter(cat => personnelCategories.includes(cat.id));
    const totalPersonnelSelected = allPersonnelCategories.reduce((sum, cat) => sum + cat.items.filter(item => item.selected).length, 0);
    const totalPersonnelCount = allPersonnelCategories.reduce((sum, cat) => sum + cat.items.length, 0);

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-32">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            第三步：选择企业知识库，并选择需要使用的企业资料。系统将使用该企业的基础信息、资质、业绩等资料生成投标文件。
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">选择企业知识库 <span className="text-red-500">*</span></h3>

          {!selectedCompany ? (
            <div className="relative mb-4" ref={companyDropdownRef}>
              <input
                type="text"
                placeholder="点击选择企业或输入企业名称搜索..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                onFocus={() => setIsCompanyDropdownOpen(true)}
                disabled={isViewMode}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed text-base"
              />

              {isCompanyDropdownOpen && !isViewMode && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-neutral-300 rounded-lg shadow-xl overflow-hidden max-h-[400px]">
                  {filteredCompanies.length === 0 ? (
                    <div className="p-4 text-center text-neutral-500">
                      未找到匹配的企业
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      {filteredCompanies.map(company => (
                        <div
                          key={company.id}
                          onClick={() => handleCompanySelectFromDropdown(company)}
                          className="px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <Building2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            <span className="text-sm text-neutral-900">{company.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-3 bg-primary-50 border border-primary-300 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded shadow-sm">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500">已选择的企业</div>
                  <div className="font-medium text-neutral-900">{selectedCompany.name}</div>
                </div>
              </div>
              {!isViewMode && (
                <button
                  onClick={handleChangeCompany}
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white hover:bg-primary-50 border border-primary-300 rounded transition-colors"
                >
                  更换企业
                </button>
              )}
            </div>
          )}
        </div>

        {selectedCompany && (
          <div className="bg-white rounded-lg border border-neutral-200 p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-neutral-900">选择知识库资料 <span className="text-red-500">*</span></h3>
              <span className="text-xs text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                为 {selectedCompany.name} 选择资料
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                请选择需要使用的企业知识库资料，勾选的资料将作为生成投标文件的数据来源。支持按类型筛选查找。
              </p>
            </div>

            <div className="border-b border-neutral-200 mb-4">
              <div className="flex space-x-1 overflow-x-auto">
                {categoriesBeforeProduct.map(category => {
                  const categorySelectedCount = category.items.filter(item => item.selected).length;
                  const categoryTotalCount = category.items.length;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveKnowledgeTab(category.id)}
                      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeKnowledgeTab === category.id
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                      }`}
                    >
                      {category.name}
                      {categorySelectedCount > 0 && (
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                          activeKnowledgeTab === category.id
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {categorySelectedCount}/{categoryTotalCount}
                        </span>
                      )}
                    </button>
                  );
                })}
                {allPersonnelCategories.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveKnowledgeTab('personnel');
                    }}
                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      isPersonnelTab
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    人员信息
                    {totalPersonnelSelected > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                        isPersonnelTab
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {totalPersonnelSelected}/{totalPersonnelCount}
                      </span>
                    )}
                  </button>
                )}
                {allProductCategories.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveKnowledgeTab('product');
                    }}
                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      isProductTab
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    产品信息
                    {totalProductSelected > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                        isProductTab
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {totalProductSelected}/{totalProductCount}
                      </span>
                    )}
                  </button>
                )}
                {templatesCategory && (
                  <button
                    key={templatesCategory.id}
                    onClick={() => setActiveKnowledgeTab(templatesCategory.id)}
                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeKnowledgeTab === templatesCategory.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    {templatesCategory.name}
                    {templatesCategory.items.filter(item => item.selected).length > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                        activeKnowledgeTab === templatesCategory.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {templatesCategory.items.filter(item => item.selected).length}/{templatesCategory.items.length}
                      </span>
                    )}
                  </button>
                )}
                {otherFilesCategory && (
                  <button
                    key={otherFilesCategory.id}
                    onClick={() => setActiveKnowledgeTab(otherFilesCategory.id)}
                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeKnowledgeTab === otherFilesCategory.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                    }`}
                  >
                    {otherFilesCategory.name}
                    {otherFilesCategory.items.filter(item => item.selected).length > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                        activeKnowledgeTab === otherFilesCategory.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {otherFilesCategory.items.filter(item => item.selected).length}/{otherFilesCategory.items.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {isPersonnelTab && (
              <div className="mb-4">
                <div className="border-b border-neutral-200">
                  <div className="flex space-x-2">
                    {allPersonnelCategories.map(category => {
                      const categorySelectedCount = category.items.filter(item => item.selected).length;
                      const categoryTotalCount = category.items.length;
                      const personnelTabNames = {
                        legalPerson: '法人',
                        authorizedDelegate: '授权委托人',
                        otherPersonnel: '其他人员'
                      };

                      return (
                        <button
                          key={category.id}
                          onClick={() => setActivePersonnelTab(category.id as any)}
                          className={`px-4 py-2 text-sm font-medium transition-colors rounded-t ${
                            activePersonnelTab === category.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {personnelTabNames[category.id as keyof typeof personnelTabNames]}
                          {categorySelectedCount > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                              activePersonnelTab === category.id
                                ? 'bg-primary-700 text-white'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {categorySelectedCount}/{categoryTotalCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {activePersonnelTab === 'authorizedDelegate' && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs text-blue-800">
                      <span className="font-medium">提示：</span>授权委托人可从企业所有人员（除法人外）中选择，选中的人员将作为投标项目的授权委托人。
                    </p>
                  </div>
                )}
              </div>
            )}

            {isProductTab && (
              <div className="mb-4 border-b border-neutral-200">
                <div className="flex space-x-2">
                  {allProductCategories.map(category => {
                    const categorySelectedCount = category.items.filter(item => item.selected).length;
                    const categoryTotalCount = category.items.length;
                    const productTabNames = {
                      productionEquipment: '生产设备',
                      testingEquipment: '检测设备',
                      companyProducts: '企业产品'
                    };

                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveProductTab(category.id as any)}
                        className={`px-4 py-2 text-sm font-medium transition-colors rounded-t ${
                          activeProductTab === category.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {productTabNames[category.id as keyof typeof productTabNames]}
                        {categorySelectedCount > 0 && (
                          <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                            activeProductTab === category.id
                              ? 'bg-primary-700 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {categorySelectedCount}/{categoryTotalCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategory && (
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-neutral-900">{activeCategory.name}</span>
                      <span className="text-xs text-neutral-600">({selectedCount}/{filteredItems.length})</span>
                    </div>
                    {!isViewMode && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleCategoryAll(activeCategory.id, true)}
                          className="text-xs text-primary-600 hover:text-primary-800"
                        >
                          全选
                        </button>
                        <span className="text-neutral-300">|</span>
                        <button
                          onClick={() => toggleCategoryAll(activeCategory.id, false)}
                          className="text-xs text-neutral-600 hover:text-neutral-800"
                        >
                          取消
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    {renderSearchFields(activeCategory)}
                  </div>
                </div>
                <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <p className="text-center text-neutral-500 py-4">暂无符合条件的资料</p>
                  ) : (
                    filteredItems.map(item => {
                      const isExpired = (activeCategory.id === 'qualification' && item.status === 'expired');
                      const isPersonnelCategory = activeCategory.id === 'legalPerson' || activeCategory.id === 'authorizedDelegate' || activeCategory.id === 'otherPersonnel';
                      const isResigned = (isPersonnelCategory && item.status === 'resigned');
                      const isDisabled = isViewMode || isExpired || isResigned;

                      return (
                        <label
                          key={item.id}
                          className={`flex items-center p-3 rounded border border-transparent ${
                            !isDisabled ? 'hover:bg-neutral-50 hover:border-neutral-200 cursor-pointer' : 'cursor-not-allowed bg-neutral-50 opacity-60'
                          } ${item.selected ? 'bg-primary-50 border-primary-200' : ''}`}
                          title={isExpired ? '已过期资质无法选择' : isResigned ? '不可用人员无法选择' : ''}
                        >
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleKnowledgeItem(activeCategory.id, item.id)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 disabled:cursor-not-allowed flex-shrink-0"
                          />
                          {renderItemDisplay(item, activeCategory)}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStep3Combined = () => {
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

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-32">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            第二步：选择对应的招标项目，并选择需要生成的投标文件类型。系统将根据该项目解析的文件目录结构生成投标文件。
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">选择招标项目 <span className="text-red-500">*</span></h3>

          {!selectedProject && !preSelectedProject ? (
            <div className="relative mb-4" ref={projectDropdownRef}>
              <input
                type="text"
                placeholder="点击选择招标项目或输入项目名称搜索..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                onFocus={() => setIsProjectDropdownOpen(true)}
                disabled={isViewMode}
                className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:cursor-not-allowed text-base"
              />

              {isProjectDropdownOpen && !isViewMode && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-neutral-300 rounded-lg shadow-xl overflow-hidden max-h-[400px]">
                  {filteredProjects.length === 0 ? (
                    <div className="p-4 text-center text-neutral-500">
                      未找到匹配的项目
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      {filteredProjects.map(project => (
                        <div
                          key={project.id}
                          onClick={() => handleProjectSelect(project)}
                          className="px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <FolderTree className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-neutral-900 font-medium">{project.projectName}</div>
                              <div className="text-xs text-neutral-500 mt-0.5">上传时间：{project.uploadTime}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-3 bg-primary-50 border border-primary-300 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded shadow-sm">
                  <FolderTree className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500">已选择的招标项目</div>
                  <div className="font-medium text-neutral-900">{(selectedProject || preSelectedProject)?.projectName}</div>
                </div>
              </div>
              {!isViewMode && !preSelectedProject && (
                <button
                  onClick={handleChangeProject}
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-white hover:bg-primary-50 border border-primary-300 rounded transition-colors"
                >
                  更换项目
                </button>
              )}
            </div>
          )}
        </div>

        {(selectedProject || preSelectedProject) && (
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">选择需要生成的文件类型 <span className="text-red-500">*</span></h3>
            <div className="space-y-3">
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
                <span className="ml-3 font-medium text-neutral-900">商务文件</span>
              </label>
              <label className={`flex items-center p-4 border-2 rounded-lg ${!isViewMode ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-not-allowed bg-neutral-50'} transition-colors ${
                fileTypes.includes('technical') ? 'border-primary-600 bg-primary-50' : 'border-neutral-300'
              }`}>
                <input
                  type="checkbox"
                  checked={fileTypes.includes('technical')}
                  onChange={() => handleFileTypeToggle('technical')}
                  disabled={isViewMode}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 disabled:cursor-not-allowed"
                />
                <span className="ml-3 font-medium text-neutral-900">技术文件</span>
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep4New = () => {
    return renderStep3();
  };

  const renderStep7 = () => {
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

        <div className="bg-neutral-50 rounded-lg p-6 space-y-4 mb-6">
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
            <span className="text-sm text-neutral-600">文件格式：</span>
            <span className="text-sm font-medium text-neutral-900">{selectedFormat?.name}</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
            <h4 className="text-sm font-semibold text-neutral-900">已选知识库资料</h4>
            <span className="text-sm font-semibold text-primary-600">
              共 {knowledgeCategories.reduce((acc, cat) => acc + cat.items.filter(i => i.selected).length, 0)} 份
            </span>
          </div>
          {(() => {
            const getCategoryDisplayName = (categoryId: string): string => {
              const nameMap: { [key: string]: string } = {
                'company': '公司基础信息',
                'qualification': '资质信息',
                'financial': '财务信息',
                'performance': '业绩信息',
                'legalPerson': '法人信息',
                'authorizedDelegate': '授权委托人信息',
                'otherPersonnel': '其他人员信息',
                'productionEquipment': '生产设备',
                'testingEquipment': '检测设备',
                'companyProducts': '企业产品',
                'templates': '历史投标文件'
              };
              return nameMap[categoryId] || categoryId;
            };

            const selectedByCategory = knowledgeCategories
              .map(cat => ({
                id: cat.id,
                name: getCategoryDisplayName(cat.id),
                count: cat.items.filter(item => item.selected).length
              }))
              .filter(cat => cat.count > 0);

            return selectedByCategory.length === 0 ? (
              <div className="text-center py-4 text-neutral-500 text-sm">
                暂未选择任何资料
              </div>
            ) : (
              <div className="space-y-2">
                {selectedByCategory.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center py-2 px-3 bg-neutral-50 rounded">
                    <span className="text-sm text-neutral-700">{cat.name}</span>
                    <span className="text-sm font-medium text-primary-600">{cat.count} 份</span>
                  </div>
                ))}
              </div>
            );
          })()}
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
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handlePrevStep}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一步
            </button>
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

  const handleKnowledgeSelection = (selectedIds: string[]) => {
    if (!currentDirectoryItem) return;

    const updateDirectory = (items: DirectoryItem[]): DirectoryItem[] => {
      return items.map(item => {
        if (item.id === currentDirectoryItem.id) {
          return { ...item, selectedKnowledgeItems: selectedIds };
        }
        if (item.children.length > 0) {
          return { ...item, children: updateDirectory(item.children) };
        }
        return item;
      });
    };

    if (currentDirectoryType === 'commercial') {
      setCommercialDirectory(updateDirectory(commercialDirectory));
    } else {
      setTechnicalDirectory(updateDirectory(technicalDirectory));
    }

    setIsKnowledgeModalOpen(false);
  };

  const renderKnowledgeModal = () => {
    if (!isKnowledgeModalOpen || !currentDirectoryItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              为"{currentDirectoryItem.title}"选择知识库资料
            </h3>
            <button
              onClick={() => setIsKnowledgeModalOpen(false)}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {knowledgeCategories.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                请先在步骤3选择企业知识库
              </div>
            ) : (
              <div className="space-y-4">
                {knowledgeCategories.map(category => {
                  const categoryItems = getFilteredItems(category);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-neutral-900">{category.name}</h4>
                        </div>
                        <div className="mt-2">
                          {renderSearchFields(category)}
                        </div>
                      </div>
                      <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                        {categoryItems.map(item => (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 p-3 border border-neutral-200 rounded hover:bg-neutral-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={tempSelectedKnowledgeIds.includes(item.id)}
                              onChange={(e) => {
                                const newIds = e.target.checked
                                  ? [...tempSelectedKnowledgeIds, item.id]
                                  : tempSelectedKnowledgeIds.filter(id => id !== item.id);
                                setTempSelectedKnowledgeIds(newIds);
                              }}
                              className="mt-0.5 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-neutral-900">{item.name}</div>
                              {(item.certNumber || item.projectName || item.year) && (
                                <div className="text-xs text-neutral-500 mt-1 space-x-2">
                                  {item.certNumber && <span>证书号: {item.certNumber}</span>}
                                  {item.projectName && <span>项目: {item.projectName}</span>}
                                  {item.year && <span>年份: {item.year}</span>}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 flex justify-between items-center">
            <div className="text-sm text-neutral-600">
              已选择 <span className="font-semibold text-primary-600">{tempSelectedKnowledgeIds.length}</span> 项资料
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsKnowledgeModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleKnowledgeSelection(tempSelectedKnowledgeIds)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleReferenceSelection = (selectedIds: string[]) => {
    if (!currentDirectoryItem) return;

    const updateDirectory = (items: DirectoryItem[]): DirectoryItem[] => {
      return items.map(item => {
        if (item.id === currentDirectoryItem.id) {
          return { ...item, selectedReferenceItems: selectedIds };
        }
        if (item.children.length > 0) {
          return { ...item, children: updateDirectory(item.children) };
        }
        return item;
      });
    };

    if (currentDirectoryType === 'commercial') {
      setCommercialDirectory(updateDirectory(commercialDirectory));
    } else {
      setTechnicalDirectory(updateDirectory(technicalDirectory));
    }

    setIsReferenceModalOpen(false);
  };

  const renderReferenceModal = () => {
    if (!isReferenceModalOpen || !currentDirectoryItem) return null;

    const referenceCategory = knowledgeCategories.find(cat => cat.id === 'templates');
    const referenceItems = referenceCategory?.items || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">
              为"{currentDirectoryItem.title}"选择参考资料
            </h3>
            <button
              onClick={() => setIsReferenceModalOpen(false)}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {referenceItems.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                暂无历史投标文件
              </div>
            ) : (
              <div className="space-y-2">
                {referenceItems.map(item => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3 border border-neutral-200 rounded hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedReferenceIds.includes(item.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...tempSelectedReferenceIds, item.id]
                          : tempSelectedReferenceIds.filter(id => id !== item.id);
                        setTempSelectedReferenceIds(newIds);
                      }}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900">{item.name}</div>
                      {item.uploadTime && (
                        <div className="text-xs text-neutral-500 mt-1">
                          上传时间: {item.uploadTime}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 flex justify-between items-center">
            <div className="text-sm text-neutral-600">
              已选择 <span className="font-semibold text-blue-600">{tempSelectedReferenceIds.length}</span> 项资料
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsReferenceModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleReferenceSelection(tempSelectedReferenceIds)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep3Combined();
      case 3:
        return renderStep2Combined();
      case 4:
        return renderStep4New();
      case 5:
        return renderStep5();
      case 6:
        return renderStep7();
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

      {currentStep < 6 && (
        <div className="relative z-10 border-t border-neutral-200 bg-white px-6 py-4 flex justify-between flex-shrink-0 shadow-lg">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-6 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一步
          </button>
          <button
            onClick={isViewMode ? () => setCurrentStep(Math.min(currentStep + 1, 6)) : handleNextStep}
            disabled={isViewMode ? currentStep >= 6 : !canProceedToNextStep()}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
          >
            下一步
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      {renderKnowledgeModal()}
      {renderReferenceModal()}
    </div>
  );
};

export default DocumentGenerator;
