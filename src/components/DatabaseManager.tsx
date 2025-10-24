import React, { useState } from 'react';
import { Building2, Award, DollarSign, Users, FileText, Upload, Eye, ArrowLeft, Package, Settings } from 'lucide-react';
import CompanyBasicInfo from './CompanyBasicInfo';
import CompanyDocumentList from './CompanyDocumentList';
import QualificationList from './QualificationList';
import FinancialList from './FinancialList';
import PerformanceList from './PerformanceList';
import PersonnelList from './PersonnelList';
import ProductInfo from './ProductInfo';
import HistoricalDocuments from './HistoricalDocuments';
import DocumentFormatManager from './DocumentFormatManager';

interface Company {
  id: string;
  name: string;
  created_at: string;
}

const MOCK_COMPANIES: Company[] = [
  { id: '1', name: '北京某某科技有限公司', created_at: '2024-01-15' },
  { id: '2', name: '上海XX信息技术有限公司', created_at: '2024-01-10' },
  { id: '3', name: '深圳YY软件开发公司', created_at: '2024-01-08' },
  { id: '4', name: '广州ZZ网络科技公司', created_at: '2024-01-05' },
];

interface DatabaseManagerProps {
  canEdit?: boolean;
  canDelete?: boolean;
  dataScope?: string;
  readOnly?: boolean;
  currentUser?: { username: string; role: string };
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  canEdit = false,
  canDelete = false,
  dataScope,
  readOnly = false,
  currentUser
}) => {
  const [companies] = useState<Company[]>(MOCK_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySearchTerm, setCompanySearchTerm] = useState('');

  const [activeCategory, setActiveCategory] = useState('company');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [previewingItem, setPreviewingItem] = useState<any>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [categories, setCategories] = useState([
    { id: 'company', label: '公司基础信息', icon: Building2, count: 25 },
    { id: 'qualification', label: '资质信息', icon: Award, count: 18 },
    { id: 'financial', label: '财务信息', icon: DollarSign, count: 15 },
    { id: 'performance', label: '业绩信息', icon: FileText, count: 35 },
    { id: 'personnel', label: '人员信息', icon: Users, count: 28 },
    { id: 'product', label: '产品信息', icon: Package, count: 0 },
    { id: 'templates', label: '历史投标文件', icon: Upload, count: 22 },
    { id: 'documentFormat', label: '投标文件格式管理', icon: Settings, count: 0 }
  ]);


  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleBackToList = () => {
    setSelectedCompany(null);
    setActiveCategory('company');
    setSearchTerm('');
  };

  const filteredCompanies = () => {
    if (!companySearchTerm) return companies;
    return companies.filter(company =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  };

  const handleResetCompanySearch = () => {
    setCompanySearchTerm('');
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: `custom_${Date.now()}`,
        label: newCategoryName.trim(),
        icon: FileText,
        count: 0
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const sampleData = {
    company: [
      { id: 1, name: '公司营业执照', type: 'PDF', date: '2024-01-15', status: '已验证' },
      { id: 2, name: '公司简介', type: 'DOCX', date: '2024-01-10', status: '已验证' },
      { id: 3, name: '组织架构图', type: 'PDF', date: '2024-01-08', status: '待更新' },
      { id: 4, name: '公司资质证书', type: 'PDF', date: '2024-01-12', status: '已验证' },
      { id: 5, name: '企业文化介绍', type: 'DOCX', date: '2024-01-05', status: '已验证' },
    ],
    qualification: [
      { id: 1, name: '软件企业认定证书', type: 'PDF', date: '2024-01-20', status: '已验证' },
      { id: 2, name: 'ISO9001质量管理体系', type: 'PDF', date: '2024-01-18', status: '已验证' },
      { id: 3, name: '信息安全等级保护证书', type: 'PDF', date: '2024-01-16', status: '已验证' },
    ],
    financial: [
      { id: 1, name: '2023年度财务报告', type: 'PDF', date: '2024-01-25', status: '已验证' },
      { id: 2, name: '2022年度财务报告', type: 'PDF', date: '2023-12-20', status: '已验证' },
      { id: 3, name: '审计报告', type: 'PDF', date: '2024-01-20', status: '已验证' },
    ],
    performance: [
      { id: 1, name: '某三甲医院HIS系统项目', type: 'PDF', date: '2024-01-20', status: '已验证' },
      { id: 2, name: '市政府政务服务平台', type: 'PDF', date: '2024-01-18', status: '已验证' },
      { id: 3, name: '智慧城市综合管理平台', type: 'PDF', date: '2024-01-16', status: '已验证' },
    ],
    personnel: [
      { id: 1, name: '项目经理-张三简历', type: 'PDF', date: '2024-01-20', status: '已验证' },
      { id: 2, name: '系统架构师-李四简历', type: 'PDF', date: '2024-01-18', status: '已验证' },
      { id: 3, name: '高级开发工程师-王五简历', type: 'PDF', date: '2024-01-16', status: '已验证' },
    ],
    templates: [
      { id: 1, name: '医院信息化项目投标模板', type: 'DOCX', date: '2024-01-20', status: '已验证' },
      { id: 2, name: '政府采购项目投标模板', type: 'DOCX', date: '2024-01-18', status: '已验证' },
      { id: 3, name: '软件开发项目投标模板', type: 'DOCX', date: '2024-01-16', status: '已验证' },
    ]
  };

  const [data, setData] = useState(sampleData);

  const handleEdit = (item: any) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = (item: any) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handlePreview = (item: any) => {
    setPreviewingItem(item);
    setShowPreviewModal(true);
  };

  const generatePreviewContent = (item: any) => {
    return `
      ${item.name}

      文件类型：${item.type}
      更新日期：${item.date}
      状态：${item.status}

      这是一个示例预览内容。实际文件内容会在这里显示。
    `;
  };

  const confirmEdit = () => {
    if (editingItem) {
      setData(prevData => ({
        ...prevData,
        [activeCategory]: prevData[activeCategory as keyof typeof prevData]?.map((item: any) =>
          item.id === editingItem.id ? editingItem : item
        ) || []
      }));
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  const confirmDelete = () => {
    if (deletingItem) {
      setData(prevData => ({
        ...prevData,
        [activeCategory]: prevData[activeCategory as keyof typeof prevData]?.filter((item: any) =>
          item.id !== deletingItem.id
        ) || []
      }));
      setShowDeleteModal(false);
      setDeletingItem(null);
    }
  };

  const filteredData = () => {
    const currentData = data[activeCategory as keyof typeof data] || [];
    if (!searchTerm) return currentData;

    return currentData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const paginatedData = () => {
    const filtered = filteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredData().length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  if (!selectedCompany) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white rounded-lg border border-neutral-200 flex flex-col h-full">
            <div className="px-6 py-4 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-neutral-900">企业知识库管理</h2>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  企业名称
                  <input
                    type="text"
                    placeholder="请输入企业名称"
                    value={companySearchTerm}
                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                    className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetCompanySearch}
                    className="px-4 py-1.5 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
                  >
                    重置
                  </button>
                  <button
                    onClick={handleResetCompanySearch}
                    className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    查询
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-neutral-200 flex-shrink-0">
              <div className="text-sm text-neutral-500 italic">
                企业列表（仅查看）
              </div>
            </div>

            <div className="p-6 flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCompanies().map(company => (
              <div
                key={company.id}
                className="p-6 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:shadow-md transition-all duration-200 group relative"
              >
                <div
                  onClick={() => handleCompanyClick(company)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    创建时间：{company.created_at}
                  </p>
                </div>
              </div>
            ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  const renderCategoryContent = () => {
    if (!selectedCompany) return null;

    switch (activeCategory) {
      case 'company':
        return <CompanyBasicInfo companyId={selectedCompany.id} readOnly={readOnly} />;
      case 'qualification':
        return <QualificationList companyId={selectedCompany.id} readOnly={readOnly} />;
      case 'financial':
        return <FinancialList companyId={selectedCompany.id} readOnly={readOnly} />;
      case 'performance':
        return <PerformanceList companyId={selectedCompany.id} readOnly={readOnly} />;
      case 'personnel':
        return <PersonnelList companyId={selectedCompany.id} readOnly={readOnly} />;
      case 'product':
        return <ProductInfo companyId={selectedCompany.id} readOnly={readOnly} />;
      case 'templates':
        return <HistoricalDocuments companyId={selectedCompany.id} readOnly={readOnly} />;
      case 'documentFormat':
        return (
          <DocumentFormatManager
            onSelectFormat={(format) => {
              console.log('Selected format:', format);
            }}
          />
        );
      default:
        return <CompanyBasicInfo companyId={selectedCompany.id} readOnly={readOnly} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToList}
            className="text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-medium text-neutral-900">{selectedCompany.name}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                当前企业
              </span>
            </div>
            <p className="text-sm text-neutral-500">企业知识库（数据独立，不与其他企业共享）</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-neutral-200">
        <div className="flex overflow-x-auto">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {renderCategoryContent()}
      </div>
    </div>
  );
};

export default DatabaseManager;
