import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, RefreshCw, X, FileCheck, CheckCircle, AlertCircle, Download } from 'lucide-react';
import CheckPointManager from './CheckPointManager';
import BidDocumentCheckCreate from './BidDocumentCheckCreate';

interface CheckPointDetail {
  name: string;
  category: string;
  status: 'passed' | 'failed';
  description: string;
}

interface CheckRecord {
  id: string;
  name: string;
  documentName: string;
  documentType: 'generated' | 'uploaded';
  status: 'pending' | 'checking' | 'passed' | 'not_passed' | 'failed';
  progress?: number;
  totalCheckPoints: number;
  passedCheckPoints: number;
  failedCheckPoints: number;
  checkPointDetails?: CheckPointDetail[];
  createdAt: string;
  completedAt: string | null;
}

const MOCK_CHECKS: CheckRecord[] = [
  {
    id: '1',
    name: '某医院信息化建设项目投标文件检查',
    documentName: '某医院信息化建设项目投标书.pdf',
    documentType: 'generated',
    status: 'not_passed',
    totalCheckPoints: 25,
    passedCheckPoints: 22,
    failedCheckPoints: 3,
    checkPointDetails: [
      { name: '封面格式检查', category: '格式规范', status: 'passed', description: '封面信息完整，格式符合要求' },
      { name: '目录完整性检查', category: '格式规范', status: 'passed', description: '目录层级清晰，页码准确' },
      { name: '投标函签字盖章', category: '格式规范', status: 'passed', description: '投标函已由法定代表人签字并加盖公章' },
      { name: '法定代表人授权书', category: '资格文件', status: 'passed', description: '授权书格式正确，授权人签字清晰' },
      { name: '营业执照副本', category: '资格文件', status: 'passed', description: '营业执照在有效期内，加盖公章' },
      { name: '资质证书', category: '资格文件', status: 'passed', description: '资质证书齐全有效，满足招标要求' },
      { name: 'ISO质量管理体系认证', category: '资格文件', status: 'passed', description: '质量管理体系认证证书有效' },
      { name: '财务审计报告', category: '资格文件', status: 'passed', description: '提供了2023年度完整财务审计报告' },
      { name: '类似业绩证明', category: '资格文件', status: 'passed', description: '提供了3个类似项目业绩，满足要求' },
      { name: '投标报价表', category: '商务部分', status: 'failed', description: '报价表缺少部分必填项，未填写税率' },
      { name: '报价说明', category: '商务部分', status: 'passed', description: '报价说明详细，费用构成清晰' },
      { name: '投标保证金凭证', category: '商务部分', status: 'passed', description: '提供了银行转账凭证，金额正确' },
      { name: '技术方案完整性', category: '技术部分', status: 'passed', description: '技术方案详细完整，逻辑清晰' },
      { name: '技术参数响应', category: '技术部分', status: 'passed', description: '技术参数完全响应招标文件要求' },
      { name: '实施方案', category: '技术部分', status: 'passed', description: '实施方案合理可行，进度安排明确' },
      { name: '项目组织架构', category: '技术部分', status: 'passed', description: '项目组织架构完整，职责分工明确' },
      { name: '项目经理资格证书', category: '人员资质', status: 'passed', description: '项目经理具有一级建造师资格' },
      { name: '主要技术人员证书', category: '人员资质', status: 'failed', description: '缺少1名技术人员的职称证书' },
      { name: '质量保证措施', category: '技术部分', status: 'passed', description: '质量保证措施完善，符合要求' },
      { name: '安全保障措施', category: '技术部分', status: 'passed', description: '安全措施详细，应急预案完整' },
      { name: '售后服务方案', category: '技术部分', status: 'passed', description: '售后服务承诺明确，响应时间合理' },
      { name: '培训方案', category: '技术部分', status: 'passed', description: '培训方案详细，培训内容全面' },
      { name: '设备清单', category: '技术部分', status: 'passed', description: '设备清单完整，品牌型号明确' },
      { name: '设备制造商授权书', category: '技术部分', status: 'failed', description: '缺少主要设备制造商授权书原件' },
      { name: '投标文件装订', category: '格式规范', status: 'passed', description: '投标文件装订规范，便于查阅' }
    ],
    createdAt: '2024-01-20 14:30:00',
    completedAt: '2024-01-20 14:35:00'
  },
  {
    id: '2',
    name: '智慧城市项目标书质量检查',
    documentName: '智慧城市建设项目技术方案.pdf',
    documentType: 'uploaded',
    status: 'checking',
    totalCheckPoints: 30,
    passedCheckPoints: 0,
    failedCheckPoints: 0,
    createdAt: '2024-01-18 10:15:00',
    completedAt: null
  },
  {
    id: '3',
    name: '教育信息化项目投标文件审核',
    documentName: '教育信息化建设投标书.pdf',
    documentType: 'generated',
    status: 'pending',
    totalCheckPoints: 28,
    passedCheckPoints: 0,
    failedCheckPoints: 0,
    createdAt: '2024-01-15 09:00:00',
    completedAt: null
  },
  {
    id: '4',
    name: '政务系统采购项目投标文件检查',
    documentName: '政务系统采购投标文件.pdf',
    documentType: 'uploaded',
    status: 'failed',
    totalCheckPoints: 32,
    passedCheckPoints: 0,
    failedCheckPoints: 0,
    createdAt: '2024-01-12 16:20:00',
    completedAt: null
  },
  {
    id: '5',
    name: '交通运输系统集成项目投标文件检查',
    documentName: '交通运输系统集成投标书.pdf',
    documentType: 'generated',
    status: 'passed',
    totalCheckPoints: 20,
    passedCheckPoints: 20,
    failedCheckPoints: 0,
    checkPointDetails: [
      { name: '封面格式检查', category: '格式规范', status: 'passed', description: '封面信息完整，格式符合要求' },
      { name: '目录完整性检查', category: '格式规范', status: 'passed', description: '目录层级清晰，页码准确' },
      { name: '投标函签字盖章', category: '格式规范', status: 'passed', description: '投标函已由法定代表人签字并加盖公章' },
      { name: '法定代表人授权书', category: '资格文件', status: 'passed', description: '授权书格式正确，授权人签字清晰' },
      { name: '营业执照副本', category: '资格文件', status: 'passed', description: '营业执照在有效期内，加盖公章' },
      { name: '资质证书', category: '资格文件', status: 'passed', description: '资质证书齐全有效，满足招标要求' },
      { name: '财务审计报告', category: '资格文件', status: 'passed', description: '提供了2023年度完整财务审计报告' },
      { name: '类似业绩证明', category: '资格文件', status: 'passed', description: '提供了2个类似项目业绩，满足要求' },
      { name: '投标报价表', category: '商务部分', status: 'passed', description: '报价表填写完整，格式规范' },
      { name: '报价说明', category: '商务部分', status: 'passed', description: '报价说明详细，费用构成清晰' },
      { name: '投标保证金凭证', category: '商务部分', status: 'passed', description: '提供了银行保函，金额正确' },
      { name: '技术方案完整性', category: '技术部分', status: 'passed', description: '技术方案详细完整，方案可行' },
      { name: '技术参数响应', category: '技术部分', status: 'passed', description: '技术参数完全响应招标文件要求' },
      { name: '实施方案', category: '技术部分', status: 'passed', description: '实施方案合理，进度安排科学' },
      { name: '项目经理资格证书', category: '人员资质', status: 'passed', description: '项目经理具有PMP资格证书' },
      { name: '主要技术人员证书', category: '人员资质', status: 'passed', description: '技术人员证书齐全，满足要求' },
      { name: '质量保证措施', category: '技术部分', status: 'passed', description: '质量保证措施完善，符合要求' },
      { name: '售后服务方案', category: '技术部分', status: 'passed', description: '售后服务承诺明确，响应时间合理' },
      { name: '设备清单', category: '技术部分', status: 'passed', description: '设备清单完整，品牌型号明确' },
      { name: '投标文件装订', category: '格式规范', status: 'passed', description: '投标文件装订规范，便于查阅' }
    ],
    createdAt: '2024-01-22 11:00:00',
    completedAt: '2024-01-22 11:05:00'
  }
];

interface BidDocumentCheckProps {
  canEdit?: boolean;
  canDelete?: boolean;
  dataScope?: string;
}

const BidDocumentCheck: React.FC<BidDocumentCheckProps> = ({ canEdit = true, canDelete = true }) => {
  const [checks, setChecks] = useState<CheckRecord[]>(MOCK_CHECKS);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'checkpointManager'>('list');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<CheckRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleReset = () => {
    setSearchName('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const filteredChecks = () => {
    return checks
      .filter(check => {
        const matchName = !searchName || check.name.toLowerCase().includes(searchName.toLowerCase());
        const matchStatus = statusFilter === 'all' || check.status === statusFilter;
        return matchName && matchStatus;
      })
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  };

  const paginatedChecks = () => {
    const filtered = filteredChecks();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredChecks().length / itemsPerPage);

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: '待检查', color: 'bg-yellow-100 text-yellow-800' },
      checking: { text: '检查中', color: 'bg-blue-100 text-blue-800' },
      passed: { text: '检查通过', color: 'bg-green-100 text-green-800' },
      not_passed: { text: '检查不通过', color: 'bg-orange-100 text-orange-800' },
      failed: { text: '检查失败', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const generateCheckPointDetails = (totalPoints: number, failedCount: number): CheckPointDetail[] => {
    const allCheckPoints = [
      { name: '封面格式检查', category: '格式规范', description: '封面信息完整，格式符合要求' },
      { name: '目录完整性检查', category: '格式规范', description: '目录层级清晰，页码准确' },
      { name: '投标函签字盖章', category: '格式规范', description: '投标函已由法定代表人签字并加盖公章' },
      { name: '法定代表人授权书', category: '资格文件', description: '授权书格式正确，授权人签字清晰' },
      { name: '营业执照副本', category: '资格文件', description: '营业执照在有效期内，加盖公章' },
      { name: '资质证书', category: '资格文件', description: '资质证书齐全有效，满足招标要求' },
      { name: 'ISO质量管理体系认证', category: '资格文件', description: '质量管理体系认证证书有效' },
      { name: '财务审计报告', category: '资格文件', description: '提供了2023年度完整财务审计报告' },
      { name: '类似业绩证明', category: '资格文件', description: '提供了类似项目业绩，满足要求' },
      { name: '投标报价表', category: '商务部分', description: '报价表填写完整，格式规范' },
      { name: '报价说明', category: '商务部分', description: '报价说明详细，费用构成清晰' },
      { name: '投标保证金凭证', category: '商务部分', description: '提供了投标保证金缴纳凭证' },
      { name: '技术方案完整性', category: '技术部分', description: '技术方案详细完整，逻辑清晰' },
      { name: '技术参数响应', category: '技术部分', description: '技术参数完全响应招标文件要求' },
      { name: '实施方案', category: '技术部分', description: '实施方案合理可行，进度安排明确' },
      { name: '项目组织架构', category: '技术部分', description: '项目组织架构完整，职责分工明确' },
      { name: '项目经理资格证书', category: '人员资质', description: '项目经理具有相应资格证书' },
      { name: '主要技术人员证书', category: '人员资质', description: '技术人员证书齐全，满足要求' },
      { name: '质量保证措施', category: '技术部分', description: '质量保证措施完善，符合要求' },
      { name: '安全保障措施', category: '技术部分', description: '安全措施详细，应急预案完整' },
      { name: '售后服务方案', category: '技术部分', description: '售后服务承诺明确，响应时间合理' },
      { name: '培训方案', category: '技术部分', description: '培训方案详细，培训内容全面' },
      { name: '设备清单', category: '技术部分', description: '设备清单完整，品牌型号明确' },
      { name: '设备制造商授权书', category: '技术部分', description: '提供了设备制造商授权书' },
      { name: '投标文件装订', category: '格式规范', description: '投标文件装订规范，便于查阅' }
    ];

    const selectedPoints = allCheckPoints.slice(0, totalPoints);
    const failedIndices = new Set<number>();

    while (failedIndices.size < failedCount) {
      const randomIndex = Math.floor(Math.random() * totalPoints);
      failedIndices.add(randomIndex);
    }

    return selectedPoints.map((point, index) => ({
      ...point,
      status: failedIndices.has(index) ? 'failed' as const : 'passed' as const,
      description: failedIndices.has(index)
        ? point.description.replace('完整', '不完整').replace('齐全', '缺失').replace('有效', '过期').replace('符合', '不符合')
        : point.description
    }));
  };

  const handleDeleteCheck = (check: CheckRecord) => {
    setSelectedCheck(check);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCheck) {
      setChecks(checks.filter(c => c.id !== selectedCheck.id));
    }
    setShowDeleteModal(false);
    setSelectedCheck(null);
  };

  const handleViewDetail = (check: CheckRecord) => {
    setSelectedCheck(check);
    setShowDetailModal(true);
  };

  const handleEdit = (check: CheckRecord) => {
    setCurrentView('create');
  };

  const handleRetry = (check: CheckRecord) => {
    setChecks(checks.map(c =>
      c.id === check.id
        ? { ...c, status: 'checking' as const }
        : c
    ));

    setTimeout(() => {
      const passed = Math.floor(Math.random() * 5) + (check.totalCheckPoints - 5);
      const failed = check.totalCheckPoints - passed;
      const checkPointDetails = generateCheckPointDetails(check.totalCheckPoints, failed);
      setChecks(checks.map(c =>
        c.id === check.id
          ? {
              ...c,
              status: (failed > 0 ? 'not_passed' : 'passed') as const,
              passedCheckPoints: passed,
              failedCheckPoints: failed,
              checkPointDetails,
              completedAt: new Date().toLocaleString('zh-CN')
            }
          : c
      ));
    }, 3000);
  };

  const handleStartCheck = (check: CheckRecord) => {
    setChecks(checks.map(c =>
      c.id === check.id
        ? { ...c, status: 'checking' as const }
        : c
    ));

    setTimeout(() => {
      const passed = Math.floor(Math.random() * 5) + (check.totalCheckPoints - 5);
      const failed = check.totalCheckPoints - passed;
      const checkPointDetails = generateCheckPointDetails(check.totalCheckPoints, failed);
      setChecks(checks.map(c =>
        c.id === check.id
          ? {
              ...c,
              status: (failed > 0 ? 'not_passed' : 'passed') as const,
              passedCheckPoints: passed,
              failedCheckPoints: failed,
              checkPointDetails,
              completedAt: new Date().toLocaleString('zh-CN')
            }
          : c
      ));
    }, 3000);
  };

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpPage('');
    }
  };

  const handleCreateComplete = (newCheck: any) => {
    const failed = newCheck.failedCheckPoints || 0;
    const checkPointDetails = generateCheckPointDetails(newCheck.totalCheckPoints, failed);
    const check: CheckRecord = {
      id: String(Date.now()),
      name: newCheck.name,
      documentName: newCheck.documentName,
      documentType: newCheck.documentType,
      status: failed > 0 ? 'not_passed' : 'passed',
      totalCheckPoints: newCheck.totalCheckPoints,
      passedCheckPoints: newCheck.passedCheckPoints || 0,
      failedCheckPoints: failed,
      checkPointDetails,
      createdAt: new Date().toLocaleString('zh-CN'),
      completedAt: new Date().toLocaleString('zh-CN')
    };
    setChecks([check, ...checks]);
    setCurrentView('list');
  };

  const handleDownload = (check: CheckRecord) => {
    const content = `投标文件检查报告

检查名称：${check.name}
文件名称：${check.documentName}
文件来源：${check.documentType === 'generated' ? '生成文件' : '上传文件'}
检查时间：${check.createdAt}
完成时间：${check.completedAt}

检查结果：
总检查点：${check.totalCheckPoints}
通过：${check.passedCheckPoints}
失败：${check.failedCheckPoints}
通过率：${((check.passedCheckPoints / check.totalCheckPoints) * 100).toFixed(2)}%

详细检查点：
1. 封面格式检查 [通过] - 封面信息完整，格式符合要求
2. 目录完整性检查 [通过] - 目录层级清晰，页码准确
3. 技术方案完整性 [通过] - 技术方案详细完整
4. 报价表格式 [失败] - 报价表缺少部分必填项
5. 资质证书 [通过] - 资质证书齐全有效

生成时间：${new Date().toLocaleString('zh-CN')}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${check.name}_检查报告.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (currentView === 'create') {
    return (
      <BidDocumentCheckCreate
        onClose={() => setCurrentView('list')}
        onComplete={handleCreateComplete}
      />
    );
  }

  if (currentView === 'checkpointManager') {
    return <CheckPointManager onClose={() => setCurrentView('list')} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-neutral-900 flex items-center">
                  <FileCheck className="w-5 h-5 mr-2 text-primary-600" />
                  投标文件检查
                </h2>
                <p className="text-sm text-neutral-500 mt-1">管理投标文件检查记录，配置检查点</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                检查名称
                <input
                  type="text"
                  placeholder="请输入检查名称"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-64 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                状态
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-32 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待检查</option>
                  <option value="checking">检查中</option>
                  <option value="passed">检查通过</option>
                  <option value="not_passed">检查不通过</option>
                  <option value="failed">检查失败</option>
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

          <div className="px-6 py-3 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('create')}
                className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                新增检查
              </button>
              <button
                onClick={() => setCurrentView('checkpointManager')}
                className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                通用检查点管理
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">检查名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">文件名称</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">通过/不通过</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">状态</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">创建时间</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        加载中...
                      </div>
                    </td>
                  </tr>
                ) : paginatedChecks().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedChecks().map((check, index) => (
                    <tr key={check.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={check.name}>
                          {check.name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-neutral-900">
                        <div className="max-w-xs truncate" title={check.documentName}>
                          {check.documentName}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        {(check.status === 'passed' || check.status === 'not_passed') ? (
                          <span>
                            <span className="text-green-600 font-medium">{check.passedCheckPoints}</span>
                            <span className="text-neutral-400 mx-1">/</span>
                            <span className="text-red-600 font-medium">{check.failedCheckPoints}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            getStatusDisplay(check.status).color
                          }`}>
                            {getStatusDisplay(check.status).text}
                          </span>
                          {check.status === 'checking' && check.progress !== undefined && (
                            <span className="text-xs text-blue-600 font-medium">
                              {check.progress}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                        {check.createdAt}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {check.status === 'pending' && (
                            <button
                              onClick={() => handleEdit(check)}
                              className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              编辑
                            </button>
                          )}
                          {(check.status === 'passed' || check.status === 'not_passed') && (
                            <>
                              <button
                                onClick={() => handleViewDetail(check)}
                                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                查看
                              </button>
                              <button
                                onClick={() => handleDownload(check)}
                                className="px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                下载
                              </button>
                            </>
                          )}
                          {check.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(check)}
                              className="px-2 py-1 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors flex items-center gap-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              重试
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCheck(check)}
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
        </div>
      </div>

      <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-center gap-6">
        <div className="text-sm text-neutral-700">
          共 {filteredChecks().length} 条
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
            placeholder="页"
            className="w-12 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            min={1}
            max={totalPages}
          />
          <button
            onClick={handleJumpToPage}
            className="px-3 py-1 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
          >
            页
          </button>
        </div>
      </div>

      {showDeleteModal && selectedCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">删除检查记录</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-neutral-700">
                  确定要删除检查记录 <span className="font-semibold">"{selectedCheck.name}"</span> 吗？
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

      {showDetailModal && selectedCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">检查详情</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h4 className="font-medium text-neutral-900 mb-3">基本信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600">检查名称：</span>
                      <p className="font-medium text-neutral-900 mt-1">{selectedCheck.name}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600">文件名称：</span>
                      <p className="font-medium text-neutral-900 mt-1">{selectedCheck.documentName}</p>
                    </div>
                    <div>
                      <span className="text-neutral-600">文件来源：</span>
                      <p className="font-medium text-neutral-900 mt-1">
                        {selectedCheck.documentType === 'generated' ? '生成文件' : '上传文件'}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-600">创建时间：</span>
                      <p className="font-medium text-neutral-900 mt-1">{selectedCheck.createdAt}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3">检查结果</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{selectedCheck.totalCheckPoints}</p>
                      <p className="text-xs text-neutral-600 mt-1">总检查点</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{selectedCheck.passedCheckPoints}</p>
                      <p className="text-xs text-neutral-600 mt-1">通过</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{selectedCheck.failedCheckPoints}</p>
                      <p className="text-xs text-neutral-600 mt-1">不通过</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">检查点详情</h4>
                  {(!selectedCheck.checkPointDetails || selectedCheck.checkPointDetails.length === 0) ? (
                    <div className="text-center py-8 text-neutral-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-neutral-400" />
                      <p>暂无检查点详情数据</p>
                    </div>
                  ) : (
                  <div className="space-y-2">
                    {selectedCheck.checkPointDetails.map((item, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        item.status === 'passed'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {item.status === 'passed' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium text-neutral-900">{item.name}</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600 ml-6">{item.description}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            item.status === 'passed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status === 'passed' ? '通过' : '失败'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => handleDownload(selectedCheck)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载报告
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidDocumentCheck;
