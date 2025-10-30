import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, FileText, Trash2, AlertTriangle, Edit } from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  certNumber: string;
  issuingOrganization: string;
  issueDate: string;
  validUntil: string;
  attachments: { url: string; name: string; size: number }[];
}

interface Qualification {
  id: string;
  name: string;
  certNumber: string;
  issuingOrganization: string;
  issueDate: string;
  validUntil: string;
  attachments: { url: string; name: string; size: number }[];
}

interface PersonnelItem {
  id: string;
  name: string;
  gender: string;
  idNumber: string;
  isLegalPerson: boolean;
  isAuthorizedRepresentative: boolean;
  phone: string;
  position: string;
  status: 'active' | 'resigned' | 'suspended';
  projectExperience: string;
  idCardFront: { url: string; name: string; size: number } | null;
  idCardBack: { url: string; name: string; size: number } | null;
  certificates: Certificate[];
  qualifications: Qualification[];
  createdAt?: string;
}

interface PersonnelListProps {
  readOnly?: boolean;
  companyId: string;
}

const PersonnelList: React.FC<PersonnelListProps> = ({ companyId, readOnly = false }) => {
  const [items, setItems] = useState<PersonnelItem[]>(() => {
    const savedData = localStorage.getItem(`personnel_${companyId}`);
    return savedData ? JSON.parse(savedData) : [
    {
      id: '1',
      name: '张三',
      gender: '男',
      idNumber: '110101199001011234',
      isLegalPerson: true,
      isAuthorizedRepresentative: true,
      phone: '13800138000',
      position: '项目经理',
      status: 'active',
      projectExperience: '某某项目、某某项目',
      idCardFront: null,
      idCardBack: null,
      certificates: [
        {
          id: '1',
          name: '本科毕业证',
          certNumber: '20150001234',
          issuingOrganization: '某某大学',
          issueDate: '2015-07-01',
          validUntil: '',
          attachments: [{ url: '', name: '本科毕业证.pdf', size: 1024000 }]
        }
      ],
      qualifications: [
        {
          id: '1',
          name: '一级建造师',
          certNumber: 'JZS2020001234',
          issuingOrganization: '中国建设教育协会',
          issueDate: '2020-05-15',
          validUntil: '2026-05-15',
          attachments: [{ url: '', name: '一建证书.pdf', size: 2048000 }]
        }
      ],
      createdAt: new Date().toISOString()
    }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`personnel_${companyId}`, JSON.stringify(items));
  }, [items, companyId]);

  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');
  const [searchLegalPerson, setSearchLegalPerson] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PersonnelItem | null>(null);
  const [editingItem, setEditingItem] = useState<PersonnelItem | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: '可用',
      resigned: '不可用'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      active: 'text-green-600 bg-green-50',
      resigned: 'text-neutral-600 bg-neutral-50',
      suspended: 'text-red-600 bg-red-50'
    };
    return colorMap[status] || 'text-neutral-600 bg-neutral-50';
  };

  const getCertificateStatus = (person: PersonnelItem): { status: string; color: string } => {
    return { status: '正常', color: 'text-green-600' };
  };

  const handleReset = () => {
    setSearchName('');
    setSearchStatus('all');
    setSearchLegalPerson('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    console.log('Searching:', searchName, searchStatus, searchLegalPerson);
  };

  const handleAdd = () => {
    setEditingItem({
      id: '',
      name: '',
      gender: '男',
      idNumber: '',
      isLegalPerson: false,
      isAuthorizedRepresentative: false,
      phone: '',
      position: '',
      status: 'active',
      projectExperience: '',
      idCardFront: null,
      idCardBack: null,
      certificates: [],
      qualifications: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: PersonnelItem) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = (item: PersonnelItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmAdd = () => {
    if (editingItem) {
      const newItem: PersonnelItem = {
        ...editingItem,
        id: String(Date.now()),
        createdAt: new Date().toISOString()
      };
      setItems([...items, newItem]);
      setShowAddModal(false);
    }
  };

  const confirmEdit = () => {
    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id ? editingItem : item
      ));
      setShowEditModal(false);
    }
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setItems(items.filter(item => item.id !== selectedItem.id));
      setShowDeleteModal(false);
    }
  };

  const handleAddIdCard = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && editingItem) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`文件 "${file.name}" 超过50MB限制，无法上传`);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          const newFile = { url, name: file.name, size: file.size };
          if (type === 'front') {
            setEditingItem({ ...editingItem, idCardFront: newFile });
          } else {
            setEditingItem({ ...editingItem, idCardBack: newFile });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRemoveIdCard = (type: 'front' | 'back') => {
    if (editingItem) {
      if (type === 'front') {
        setEditingItem({ ...editingItem, idCardFront: null });
      } else {
        setEditingItem({ ...editingItem, idCardBack: null });
      }
    }
  };

  const handleAddCertificate = () => {
    setEditingCertificate({
      id: '',
      name: '',
      certNumber: '',
      issuingOrganization: '',
      issueDate: '',
      validUntil: '',
      attachments: []
    });
    setShowCertificateModal(true);
  };

  const handleEditCertificate = (cert: Certificate) => {
    setEditingCertificate({ ...cert });
    setShowCertificateModal(true);
  };

  const handleDeleteCertificate = (certId: string) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        certificates: editingItem.certificates.filter(c => c.id !== certId)
      });
    }
  };

  const confirmSaveCertificate = () => {
    if (editingItem && editingCertificate) {
      if (editingCertificate.id) {
        setEditingItem({
          ...editingItem,
          certificates: editingItem.certificates.map(c =>
            c.id === editingCertificate.id ? editingCertificate : c
          )
        });
      } else {
        const newCert = { ...editingCertificate, id: String(Date.now()) };
        setEditingItem({
          ...editingItem,
          certificates: [...editingItem.certificates, newCert]
        });
      }
      setShowCertificateModal(false);
      setEditingCertificate(null);
    }
  };

  const handleUpdateCertificateField = (field: string, value: any) => {
    if (editingCertificate) {
      setEditingCertificate({ ...editingCertificate, [field]: value });
    }
  };

  const handleAddCertificateFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,application/pdf';
    input.multiple = true;
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files && editingCertificate) {
        const validFiles = Array.from(files).filter(file => {
          if (file.size > MAX_FILE_SIZE) {
            alert(`文件 "${file.name}" 超过50MB限制，无法上传`);
            return false;
          }
          return true;
        });

        const filePromises = validFiles.map(file => {
          return new Promise<{ url: string; name: string; size: number }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                url: event.target?.result as string,
                name: file.name,
                size: file.size
              });
            };
            reader.readAsDataURL(file);
          });
        });

        const newFiles = await Promise.all(filePromises);
        setEditingCertificate({
          ...editingCertificate,
          attachments: [...editingCertificate.attachments, ...newFiles]
        });
      }
    };
    input.click();
  };

  const handleRemoveCertificateFile = (fileIndex: number) => {
    if (editingCertificate) {
      setEditingCertificate({
        ...editingCertificate,
        attachments: editingCertificate.attachments.filter((_, i) => i !== fileIndex)
      });
    }
  };

  const handleAddQualification = () => {
    setEditingQualification({
      id: '',
      name: '',
      certNumber: '',
      issuingOrganization: '',
      issueDate: '',
      validUntil: '',
      attachments: []
    });
    setShowQualificationModal(true);
  };

  const handleEditQualification = (qual: Qualification) => {
    setEditingQualification({ ...qual });
    setShowQualificationModal(true);
  };

  const handleDeleteQualification = (qualId: string) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        qualifications: editingItem.qualifications.filter(q => q.id !== qualId)
      });
    }
  };

  const confirmSaveQualification = () => {
    if (editingItem && editingQualification) {
      if (editingQualification.id) {
        setEditingItem({
          ...editingItem,
          qualifications: editingItem.qualifications.map(q =>
            q.id === editingQualification.id ? editingQualification : q
          )
        });
      } else {
        const newQual = { ...editingQualification, id: String(Date.now()) };
        setEditingItem({
          ...editingItem,
          qualifications: [...editingItem.qualifications, newQual]
        });
      }
      setShowQualificationModal(false);
      setEditingQualification(null);
    }
  };

  const handleUpdateQualificationField = (field: string, value: any) => {
    if (editingQualification) {
      setEditingQualification({ ...editingQualification, [field]: value });
    }
  };

  const handleAddQualificationFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,application/pdf';
    input.multiple = true;
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files && editingQualification) {
        const validFiles = Array.from(files).filter(file => {
          if (file.size > MAX_FILE_SIZE) {
            alert(`文件 "${file.name}" 超过50MB限制，无法上传`);
            return false;
          }
          return true;
        });

        const filePromises = validFiles.map(file => {
          return new Promise<{ url: string; name: string; size: number }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                url: event.target?.result as string,
                name: file.name,
                size: file.size
              });
            };
            reader.readAsDataURL(file);
          });
        });

        const newFiles = await Promise.all(filePromises);
        setEditingQualification({
          ...editingQualification,
          attachments: [...editingQualification.attachments, ...newFiles]
        });
      }
    };
    input.click();
  };

  const handleRemoveQualificationFile = (fileIndex: number) => {
    if (editingQualification) {
      setEditingQualification({
        ...editingQualification,
        attachments: editingQualification.attachments.filter((_, i) => i !== fileIndex)
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesName = !searchName || item.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesStatus = searchStatus === 'all' || item.status === searchStatus;
    const matchesLegalPerson = searchLegalPerson === 'all' ||
      (searchLegalPerson === 'yes' && item.isLegalPerson) ||
      (searchLegalPerson === 'no' && !item.isLegalPerson);
    return matchesName && matchesStatus && matchesLegalPerson;
  }).sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const paginatedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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

  const renderFormModal = (isEdit: boolean) => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="text-lg font-medium text-neutral-900">
              {isEdit ? '编辑人员信息' : '新增人员信息'}
            </h3>
            <button
              onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="border-b border-neutral-200 pb-4">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">基本信息</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="请输入姓名"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    性别 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingItem.gender}
                    onChange={(e) => setEditingItem({ ...editingItem, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    身份证号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.idNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, idNumber: e.target.value })}
                    placeholder="请输入身份证号"
                    maxLength={18}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    联系电话 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editingItem.phone}
                    onChange={(e) => setEditingItem({ ...editingItem, phone: e.target.value })}
                    placeholder="请输入联系电话"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    状态 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="active">可用</option>
                    <option value="resigned">不可用</option>
                  </select>
                </div>
                <div className="col-span-3 flex gap-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingItem.isLegalPerson}
                      onChange={(e) => setEditingItem({ ...editingItem, isLegalPerson: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">是否法人</span>
                  </label>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    项目经历
                  </label>
                  <textarea
                    value={editingItem.projectExperience}
                    onChange={(e) => setEditingItem({ ...editingItem, projectExperience: e.target.value })}
                    placeholder="请输入项目经历"
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-neutral-200 pb-4">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">身份证件</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    身份证人像面 <span className="text-red-500">*</span>
                  </label>
                  {!editingItem.idCardFront ? (
                    <div
                      className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
                      onClick={() => handleAddIdCard('front')}
                    >
                      <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                      <p className="text-xs text-neutral-600">点击上传</p>
                      <p className="text-xs text-neutral-500 mt-0.5">支持JPG、PNG、JPEG格式</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={editingItem.idCardFront.url}
                        alt="身份证人像面"
                        className="w-full h-48 object-cover rounded-lg border border-neutral-200"
                      />
                      <button
                        onClick={() => handleRemoveIdCard('front')}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="mt-2 text-xs text-neutral-600 truncate">{editingItem.idCardFront.name}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    身份证国徽面 <span className="text-red-500">*</span>
                  </label>
                  {!editingItem.idCardBack ? (
                    <div
                      className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer"
                      onClick={() => handleAddIdCard('back')}
                    >
                      <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                      <p className="text-xs text-neutral-600">点击上传</p>
                      <p className="text-xs text-neutral-500 mt-0.5">支持JPG、PNG、JPEG格式</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={editingItem.idCardBack.url}
                        alt="身份证国徽面"
                        className="w-full h-48 object-cover rounded-lg border border-neutral-200"
                      />
                      <button
                        onClick={() => handleRemoveIdCard('back')}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="mt-2 text-xs text-neutral-600 truncate">{editingItem.idCardBack.name}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b border-neutral-200 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-neutral-900">毕业证书</h4>
                <button
                  onClick={handleAddCertificate}
                  className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加证书
                </button>
              </div>
              {editingItem.certificates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-neutral-200 rounded-lg">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">序号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">证书名称</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">证书编号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">颁发机构</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingItem.certificates.map((cert, index) => (
                        <tr key={cert.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{index + 1}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{cert.name}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{cert.certNumber}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{cert.issuingOrganization}</td>
                          <td className="px-4 py-2.5 text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditCertificate(cert)}
                                className="text-primary-600 hover:text-primary-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCertificate(cert.id)}
                                className="text-red-600 hover:text-red-800"
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
              ) : (
                <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-300 rounded-lg">
                  暂无毕业证书
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-neutral-900">资质证书</h4>
                <button
                  onClick={handleAddQualification}
                  className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加资质
                </button>
              </div>
              {editingItem.qualifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-neutral-200 rounded-lg">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">序号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">证书名称</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">证书编号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">颁发机构</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600 border-b">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingItem.qualifications.map((qual, index) => (
                        <tr key={qual.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{index + 1}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{qual.name}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{qual.certNumber}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{qual.issuingOrganization}</td>
                          <td className="px-4 py-2.5 text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditQualification(qual)}
                                className="text-primary-600 hover:text-primary-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQualification(qual.id)}
                                className="text-red-600 hover:text-red-800"
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
              ) : (
                <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-300 rounded-lg">
                  暂无资质证书
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
            <button
              onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
              className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={isEdit ? confirmEdit : confirmAdd}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              {isEdit ? '保存' : '确定'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {readOnly && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <p className="text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            只读模式 - 无法编辑此信息
          </p>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">人员信息</h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                该模块用于管理企业的人员信息，包括员工的基本信息、职称资质、学历证书等。人员信息将用于生成投标文件中的项目团队介绍、人员配备表等内容，并在投标时自动匹配项目对人员的要求。请保持人员信息的准确和完整。
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                姓名
                <input
                  type="text"
                  placeholder="请输入姓名"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                状态
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部</option>
                  <option value="active">可用</option>
                  <option value="resigned">不可用</option>
                </select>
                是否法人
                <select
                  value={searchLegalPerson}
                  onChange={(e) => setSearchLegalPerson(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">全部</option>
                  <option value="yes">是</option>
                  <option value="no">否</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
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

          {!readOnly && (
            <div className="px-6 py-3 border-b border-neutral-200">
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                新增人员
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">姓名</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">性别</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">联系电话</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">是否法人</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">人员状态</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">证书数量</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">证书状态</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {paginatedItems().length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-neutral-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paginatedItems().map((item, index) => {
                    const certStatus = getCertificateStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                          {item.gender}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                          {item.phone}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                          {item.isLegalPerson ? '是' : '否'}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                          {item.certificates.length + item.qualifications.length} 份
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                          <span className={certStatus.color}>
                            {certStatus.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                          {!readOnly && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="px-2 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                编辑
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                删除
                              </button>
                            </div>
                          )}
                          {readOnly && (
                            <span className="text-xs text-neutral-400">只读</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-center gap-6">
            <div className="text-sm text-neutral-700">共 {filteredItems.length} 条</div>
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

      {showAddModal && renderFormModal(false)}
      {showEditModal && renderFormModal(true)}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">确认删除</h3>
            </div>

            <div className="p-6">
              <p className="text-neutral-600">
                确定要删除人员 <span className="font-medium">"{selectedItem.name}"</span> 吗？此操作不可恢复。
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

      {showCertificateModal && editingCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingCertificate.id ? '编辑毕业证书' : '新增毕业证书'}
              </h3>
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setEditingCertificate(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    证书名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCertificate.name}
                    onChange={(e) => handleUpdateCertificateField('name', e.target.value)}
                    placeholder="如：本科毕业证书"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    证书编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCertificate.certNumber}
                    onChange={(e) => handleUpdateCertificateField('certNumber', e.target.value)}
                    placeholder="请输入证书编号"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    颁发机构 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingCertificate.issuingOrganization}
                    onChange={(e) => handleUpdateCertificateField('issuingOrganization', e.target.value)}
                    placeholder="如：某某大学"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    颁发日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingCertificate.issueDate}
                    onChange={(e) => handleUpdateCertificateField('issueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    有效期至（永久有效可留空）
                  </label>
                  <input
                    type="date"
                    value={editingCertificate.validUntil}
                    onChange={(e) => handleUpdateCertificateField('validUntil', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">证书附件</label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer mb-3"
                  onClick={handleAddCertificateFile}
                >
                  <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                  <p className="text-sm text-neutral-600">点击上传（支持多选）</p>
                  <p className="text-xs text-neutral-500 mt-1">仅支持JPG、PNG、JPEG格式</p>
                </div>
                {editingCertificate.attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {editingCertificate.attachments.map((file, fileIndex) => (
                      <div key={fileIndex} className="relative">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                        />
                        <button
                          onClick={() => handleRemoveCertificateFile(fileIndex)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="mt-1 text-xs text-neutral-600 truncate px-1">{file.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setEditingCertificate(null);
                }}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSaveCertificate}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showQualificationModal && editingQualification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingQualification.id ? '编辑资质证书' : '新增资质证书'}
              </h3>
              <button
                onClick={() => {
                  setShowQualificationModal(false);
                  setEditingQualification(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    证书名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingQualification.name}
                    onChange={(e) => handleUpdateQualificationField('name', e.target.value)}
                    placeholder="如：一级建造师"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    证书编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingQualification.certNumber}
                    onChange={(e) => handleUpdateQualificationField('certNumber', e.target.value)}
                    placeholder="请输入证书编号"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    颁发机构 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingQualification.issuingOrganization}
                    onChange={(e) => handleUpdateQualificationField('issuingOrganization', e.target.value)}
                    placeholder="如：中国建设教育协会"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    颁发日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingQualification.issueDate}
                    onChange={(e) => handleUpdateQualificationField('issueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    有效期至 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingQualification.validUntil}
                    onChange={(e) => handleUpdateQualificationField('validUntil', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">证书附件</label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer mb-3"
                  onClick={handleAddQualificationFile}
                >
                  <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                  <p className="text-sm text-neutral-600">点击上传（支持多选）</p>
                  <p className="text-xs text-neutral-500 mt-1">仅支持JPG、PNG、JPEG格式</p>
                </div>
                {editingQualification.attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {editingQualification.attachments.map((file, fileIndex) => (
                      <div key={fileIndex} className="relative">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                        />
                        <button
                          onClick={() => handleRemoveQualificationFile(fileIndex)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="mt-1 text-xs text-neutral-600 truncate px-1">{file.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
              <button
                onClick={() => {
                  setShowQualificationModal(false);
                  setEditingQualification(null);
                }}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmSaveQualification}
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

export default PersonnelList;
