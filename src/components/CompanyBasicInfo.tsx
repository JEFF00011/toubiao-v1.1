import React, { useState, useEffect } from 'react';
import { Upload, FileText, Edit, AlertTriangle, X, Image, Trash2, Sparkles } from 'lucide-react';

interface FileAttachment {
  id: string;
  url: string;
  name: string;
}

interface BusinessLicense {
  companyName: string;
  creditCode: string;
  legalPerson: string;
  registeredCapital: string;
  establishDate: string;
  registeredAddress: string;
  validUntil: string;
  validFrom?: string;
  businessScope: string;
  isPermanent: boolean;
  attachments: FileAttachment[];
}

interface BankAccount {
  companyName: string;
  bankName: string;
  accountNumber: string;
  attachments: FileAttachment[];
}

interface CompanyIntro {
  introduction: string;
  orgChartAttachments: FileAttachment[];
}

interface CompanyBasicInfoProps {
  companyId: string;
  readOnly?: boolean;
}

const CompanyBasicInfo: React.FC<CompanyBasicInfoProps> = ({ companyId, readOnly = false }) => {
  const [businessLicense, setBusinessLicense] = useState<BusinessLicense | null>(() => {
    const savedData = localStorage.getItem(`company_license_${companyId}`);
    return savedData ? JSON.parse(savedData) : {
      companyName: '北京某某科技有限公司',
      creditCode: '91110000XXXXXXXXXX',
      legalPerson: '张三',
      registeredCapital: '1000万元',
      establishDate: '2020-01-15',
      registeredAddress: '北京市海淀区中关村大街1号',
      validUntil: '2025-01-15',
      validFrom: '2020-01-15',
      businessScope: '技术开发、技术推广、技术转让、技术咨询、技术服务；软件开发；计算机系统服务；数据处理',
      isPermanent: false,
      attachments: []
    };
  });

  const [bankAccount, setBankAccount] = useState<BankAccount | null>(() => {
    const savedData = localStorage.getItem(`company_bank_${companyId}`);
    return savedData ? JSON.parse(savedData) : null;
  });

  const [companyIntro, setCompanyIntro] = useState<CompanyIntro | null>(() => {
    const savedData = localStorage.getItem(`company_intro_${companyId}`);
    return savedData ? JSON.parse(savedData) : null;
  });

  const [showEditLicense, setShowEditLicense] = useState(false);
  const [showEditBank, setShowEditBank] = useState(false);
  const [showEditIntro, setShowEditIntro] = useState(false);

  const [editingLicense, setEditingLicense] = useState<BusinessLicense | null>(null);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [editingIntro, setEditingIntro] = useState<CompanyIntro | null>(null);

  useEffect(() => {
    if (businessLicense) {
      localStorage.setItem(`company_license_${companyId}`, JSON.stringify(businessLicense));
    }
  }, [businessLicense, companyId]);

  useEffect(() => {
    if (bankAccount) {
      localStorage.setItem(`company_bank_${companyId}`, JSON.stringify(bankAccount));
    }
  }, [bankAccount, companyId]);

  useEffect(() => {
    if (companyIntro) {
      localStorage.setItem(`company_intro_${companyId}`, JSON.stringify(companyIntro));
    }
  }, [companyIntro, companyId]);

  const isLicenseExpired = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    return expiryDate < today;
  };

  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleEditLicense = () => {
    setEditingLicense(businessLicense || {
      companyName: '',
      creditCode: '',
      legalPerson: '',
      registeredCapital: '',
      establishDate: '',
      registeredAddress: '',
      validUntil: '',
      validFrom: '',
      businessScope: '',
      isPermanent: false,
      attachments: []
    });
    setShowEditLicense(true);
  };

  const handleSaveLicense = () => {
    if (editingLicense) {
      setBusinessLicense(editingLicense);
      setShowEditLicense(false);
    }
  };

  const handleEditBank = () => {
    setEditingBank(bankAccount || {
      companyName: '',
      bankName: '',
      accountNumber: '',
      attachments: []
    });
    setShowEditBank(true);
  };

  const handleSaveBank = () => {
    if (editingBank) {
      setBankAccount(editingBank);
      setShowEditBank(false);
    }
  };

  const handleEditIntro = () => {
    setEditingIntro(companyIntro || {
      introduction: '',
      orgChartAttachments: []
    });
    setShowEditIntro(true);
  };

  const handleSaveIntro = () => {
    if (editingIntro) {
      setCompanyIntro(editingIntro);
      setShowEditIntro(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {readOnly && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200 rounded-lg mb-4">
          <p className="text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            只读模式 - 无法编辑此信息
          </p>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-medium text-neutral-900">公司基础信息</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h3 className="text-base font-medium text-neutral-900">营业执照</h3>
                </div>
                {!readOnly && (
                  <button
                    onClick={handleEditLicense}
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 text-sm transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{businessLicense ? '编辑' : '添加'}</span>
                  </button>
                )}
              </div>

              {businessLicense ? (
                <div className="p-6 space-y-4 bg-white rounded-b-lg">
                  {!businessLicense.isPermanent && isLicenseExpired(businessLicense.validUntil) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">营业执照已过期</p>
                        <p className="text-sm text-red-600 mt-1">请及时更新营业执照信息</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">企业名称</label>
                      <p className="text-sm text-neutral-900">{businessLicense.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">统一社会信用代码</label>
                      <p className="text-sm text-neutral-900">{businessLicense.creditCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">法定代表人</label>
                      <p className="text-sm text-neutral-900">{businessLicense.legalPerson}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">注册资本</label>
                      <p className="text-sm text-neutral-900">{businessLicense.registeredCapital}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">成立日期</label>
                      <p className="text-sm text-neutral-900">{businessLicense.establishDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">
                        有效期
                        {!businessLicense.isPermanent && isLicenseExpired(businessLicense.validUntil) && (
                          <span className="ml-2 text-red-600">(已过期)</span>
                        )}
                      </label>
                      <p className={`text-sm ${!businessLicense.isPermanent && isLicenseExpired(businessLicense.validUntil) ? 'text-red-600 font-medium' : 'text-neutral-900'}`}>
                        {businessLicense.isPermanent ? '长期' : `${businessLicense.validFrom ? businessLicense.validFrom + ' 至 ' : ''}${businessLicense.validUntil}`}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">注册地址</label>
                      <p className="text-sm text-neutral-900">{businessLicense.registeredAddress}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">经营范围</label>
                      <p className="text-sm text-neutral-900 leading-relaxed">{businessLicense.businessScope}</p>
                    </div>
                    {businessLicense.attachments && businessLicense.attachments.length > 0 && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-neutral-600 mb-2">附件</label>
                        <div className="flex flex-wrap gap-4">
                          {businessLicense.attachments.map((file) => (
                            <div key={file.id} className="relative group">
                              <div className="w-40 rounded-lg border border-neutral-200 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-32 object-contain p-2"
                                />
                              </div>
                              <p className="text-xs text-neutral-500 mt-1.5 truncate max-w-[10rem]">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500 bg-white rounded-b-lg">
                  <FileText className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                  <p className="text-sm">暂无营业执照信息</p>
                  {!readOnly && (
                    <p className="text-xs text-neutral-400 mt-1">点击右上角添加按钮开始填写</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h3 className="text-base font-medium text-neutral-900">企业开户行</h3>
                </div>
                {!readOnly && (
                  <button
                    onClick={handleEditBank}
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 text-sm transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{bankAccount ? '编辑' : '添加'}</span>
                  </button>
                )}
              </div>

              {bankAccount ? (
                <div className="p-6 space-y-4 bg-white rounded-b-lg">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">企业名称</label>
                      <p className="text-sm text-neutral-900">{bankAccount.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">开户银行</label>
                      <p className="text-sm text-neutral-900">{bankAccount.bankName}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-neutral-600 mb-1.5">开户账号</label>
                      <p className="text-sm text-neutral-900 font-mono">{bankAccount.accountNumber}</p>
                    </div>
                    {bankAccount.attachments && bankAccount.attachments.length > 0 && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-neutral-600 mb-2">附件</label>
                        <div className="flex flex-wrap gap-4">
                          {bankAccount.attachments.map((file) => (
                            <div key={file.id} className="relative group">
                              <div className="w-40 rounded-lg border border-neutral-200 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-32 object-contain p-2"
                                />
                              </div>
                              <p className="text-xs text-neutral-500 mt-1.5 truncate max-w-[10rem]">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500 bg-white rounded-b-lg">
                  <FileText className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                  <p className="text-sm">暂无开户行信息</p>
                  {!readOnly && (
                    <p className="text-xs text-neutral-400 mt-1">点击右上角添加按钮开始填写</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-white rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h3 className="text-base font-medium text-neutral-900">企业介绍</h3>
                </div>
                {!readOnly && (
                  <button
                    onClick={handleEditIntro}
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-800 text-sm transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{companyIntro ? '编辑' : '添加'}</span>
                  </button>
                )}
              </div>

              {companyIntro ? (
                <div className="p-6 space-y-4 bg-white rounded-b-lg">
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">公司简介</label>
                    <p className="text-sm text-neutral-900 whitespace-pre-wrap leading-relaxed">{companyIntro.introduction}</p>
                  </div>
                  {companyIntro.orgChartAttachments && companyIntro.orgChartAttachments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-600 mb-2">组织架构图</label>
                      <div className="flex flex-wrap gap-4">
                        {companyIntro.orgChartAttachments.map((file) => (
                          <div key={file.id} className="relative group">
                            <div className="w-40 rounded-lg border border-neutral-200 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-32 object-contain p-2"
                              />
                            </div>
                            <p className="text-xs text-neutral-500 mt-1.5 truncate max-w-[10rem]">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500 bg-white rounded-b-lg">
                  <FileText className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
                  <p className="text-sm">暂无企业介绍</p>
                  {!readOnly && (
                    <p className="text-xs text-neutral-400 mt-1">点击右上角添加按钮开始填写</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditLicense && editingLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-neutral-900">
                {businessLicense ? '编辑营业执照' : '添加营业执照'}
              </h3>
              <button
                onClick={() => setShowEditLicense(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    企业名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingLicense.companyName}
                    onChange={(e) => setEditingLicense({ ...editingLicense, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    统一社会信用代码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingLicense.creditCode}
                    onChange={(e) => setEditingLicense({ ...editingLicense, creditCode: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    法定代表人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingLicense.legalPerson}
                    onChange={(e) => setEditingLicense({ ...editingLicense, legalPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    注册资本 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingLicense.registeredCapital}
                    onChange={(e) => setEditingLicense({ ...editingLicense, registeredCapital: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    成立日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingLicense.establishDate}
                    onChange={(e) => setEditingLicense({ ...editingLicense, establishDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    有效期 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4 mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!editingLicense.isPermanent}
                        onChange={() => setEditingLicense({ ...editingLicense, isPermanent: false })}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700">非长期</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={editingLicense.isPermanent}
                        onChange={() => setEditingLicense({ ...editingLicense, isPermanent: true, validUntil: '', validFrom: '' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-neutral-700">长期</span>
                    </label>
                  </div>
                  {!editingLicense.isPermanent ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">生效日期</label>
                        <input
                          type="date"
                          value={editingLicense.validFrom || ''}
                          onChange={(e) => setEditingLicense({ ...editingLicense, validFrom: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-600 mb-1">失效日期 <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={editingLicense.validUntil}
                          onChange={(e) => setEditingLicense({ ...editingLicense, validUntil: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500">
                      长期有效
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    注册地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingLicense.registeredAddress}
                    onChange={(e) => setEditingLicense({ ...editingLicense, registeredAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    经营范围 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editingLicense.businessScope}
                    onChange={(e) => setEditingLicense({ ...editingLicense, businessScope: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    营业执照 <span className="text-red-500">*</span>
                  </label>
                  {editingLicense.attachments && editingLicense.attachments.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-3 gap-3 relative">
                        {editingLicense.attachments.map((file, index) => (
                          <div key={file.id} className="relative group">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                            />
                            <button
                              onClick={() => {
                                setEditingLicense({
                                  ...editingLicense,
                                  attachments: editingLicense.attachments.filter(f => f.id !== file.id)
                                });
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {index === 0 && (
                              <button
                                onClick={() => {
                                  setEditingLicense({
                                    ...editingLicense,
                                    companyName: '北京智慧科技有限公司',
                                    creditCode: '91110108MA01ABCD12',
                                    legalPerson: '李四',
                                    registeredCapital: '5000万元',
                                    establishDate: '2021-03-20',
                                    registeredAddress: '北京市海淀区科技园区中关村东路88号',
                                    validUntil: '2031-03-20',
                                    isPermanent: false,
                                    businessScope: '技术开发、技术推广、技术转让、技术咨询、技术服务；软件开发；计算机系统服务；数据处理；基础软件服务；应用软件服务'
                                  });
                                  alert('已自动填充营业执照信息');
                                }}
                                className="absolute bottom-1 right-1 flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-md"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>智能填充</span>
                              </button>
                            )}
                            <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('license-upload')?.click()}
                  >
                    <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                    <p className="text-xs text-neutral-600">点击上传</p>
                    <p className="text-xs text-neutral-500 mt-0.5">支持JPG、PNG、JPEG格式</p>
                  </div>
                  <input
                    id="license-upload"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;

                      for (const file of files) {
                        if (file.size > 50 * 1024 * 1024) {
                          alert(`文件 ${file.name} 大小超过50MB`);
                          continue;
                        }
                        try {
                          const dataUrl = await handleFileRead(file);
                          const newFile: FileAttachment = {
                            id: `${Date.now()}-${Math.random()}`,
                            url: dataUrl,
                            name: file.name
                          };
                          setEditingLicense(prev => ({
                            ...prev,
                            attachments: [...(prev.attachments || []), newFile]
                          }));
                        } catch (error) {
                          console.error('文件读取失败:', error);
                          alert(`文件 ${file.name} 读取失败`);
                        }
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
              <button
                onClick={() => setShowEditLicense(false)}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveLicense}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditBank && editingBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900">
                {bankAccount ? '编辑开户行信息' : '添加开户行信息'}
              </h3>
              <button
                onClick={() => setShowEditBank(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  企业名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingBank.companyName}
                  onChange={(e) => setEditingBank({ ...editingBank, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  开户银行 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingBank.bankName}
                  onChange={(e) => setEditingBank({ ...editingBank, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  开户账号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingBank.accountNumber}
                  onChange={(e) => setEditingBank({ ...editingBank, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  开户行证明 <span className="text-red-500">*</span>
                </label>
                {editingBank.attachments && editingBank.attachments.length > 0 && (
                  <div className="mb-3">
                    <div className="grid grid-cols-3 gap-3 relative">
                      {editingBank.attachments.map((file, index) => (
                        <div key={file.id} className="relative group">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                          />
                          <button
                            onClick={() => {
                              setEditingBank({
                                ...editingBank,
                                attachments: editingBank.attachments.filter(f => f.id !== file.id)
                              });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          {index === 0 && (
                            <button
                              onClick={() => {
                                setEditingBank({
                                  ...editingBank,
                                  companyName: '北京智慧科技有限公司',
                                  bankName: '中国工商银行北京海淀支行',
                                  accountNumber: '0200 1234 5678 9012 345'
                                });
                                alert('已自动填充开户行信息');
                              }}
                              className="absolute bottom-1 right-1 flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors shadow-md"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>智能填充</span>
                            </button>
                          )}
                          <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('bank-upload')?.click()}
                >
                  <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                  <p className="text-xs text-neutral-600">点击上传</p>
                  <p className="text-xs text-neutral-500 mt-0.5">支持JPG、PNG、JPEG格式</p>
                </div>
                <input
                  id="bank-upload"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;

                    for (const file of files) {
                      if (file.size > 50 * 1024 * 1024) {
                        alert(`文件 ${file.name} 大小超过50MB`);
                        continue;
                      }
                      try {
                        const dataUrl = await handleFileRead(file);
                        const newFile: FileAttachment = {
                          id: `${Date.now()}-${Math.random()}`,
                          url: dataUrl,
                          name: file.name
                        };
                        setEditingBank(prev => ({
                          ...prev,
                          attachments: [...(prev.attachments || []), newFile]
                        }));
                      } catch (error) {
                        console.error('文件读取失败:', error);
                        alert(`文件 ${file.name} 读取失败`);
                      }
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg">
              <button
                onClick={() => setShowEditBank(false)}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveBank}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditIntro && editingIntro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900">
                {companyIntro ? '编辑企业介绍' : '添加企业介绍'}
              </h3>
              <button
                onClick={() => setShowEditIntro(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  公司简介 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editingIntro.introduction}
                  onChange={(e) => setEditingIntro({ ...editingIntro, introduction: e.target.value })}
                  rows={6}
                  placeholder="请输入公司简介..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  组织架构图
                </label>
                {editingIntro.orgChartAttachments && editingIntro.orgChartAttachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {editingIntro.orgChartAttachments.map((file) => (
                      <div key={file.id} className="relative group">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                        />
                        <button
                          onClick={() => {
                            setEditingIntro({
                              ...editingIntro,
                              orgChartAttachments: editingIntro.orgChartAttachments.filter(f => f.id !== file.id)
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('org-chart-upload')?.click()}
                >
                  <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                  <p className="text-xs text-neutral-600">点击上传</p>
                  <p className="text-xs text-neutral-500 mt-0.5">支持JPG、PNG、JPEG格式</p>
                </div>
                <input
                  id="org-chart-upload"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;

                    for (const file of files) {
                      if (file.size > 50 * 1024 * 1024) {
                        alert(`文件 ${file.name} 大小超过50MB`);
                        continue;
                      }
                      try {
                        const dataUrl = await handleFileRead(file);
                        const newFile: FileAttachment = {
                          id: `${Date.now()}-${Math.random()}`,
                          url: dataUrl,
                          name: file.name
                        };
                        setEditingIntro(prev => ({
                          ...prev,
                          orgChartAttachments: [...(prev.orgChartAttachments || []), newFile]
                        }));
                      } catch (error) {
                        console.error('文件读取失败:', error);
                        alert(`文件 ${file.name} 读取失败`);
                      }
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg">
              <button
                onClick={() => setShowEditIntro(false)}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveIntro}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyBasicInfo;
