import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, FileText, Trash2, Edit, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceAmount: string;
  invoiceFile?: { url: string; name: string };
  verificationFile?: { url: string; name: string };
}

interface Product {
  id: string;
  productName: string;
  productSpec: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  remarks: string;
  attachments: { url: string; name: string }[];
}

interface PerformanceProject {
  id: string;
  contractNumber: string;
  projectName: string;
  clientName: string;
  contractEffectiveDate: string;
  projectAmount: string;
  contractDescription: string;
  partyAContact: string;
  partyAContactInfo: string;
  partyBContact: string;
  partyBContactInfo: string;
  attachments: {
    wholeContract: { url: string; name: string }[];
    contractFirstPage: { url: string; name: string }[];
    contractMainTerms: { url: string; name: string }[];
    contractSealPage: { url: string; name: string }[];
    acceptanceCertificate: { url: string; name: string }[];
    clientProof: { url: string; name: string }[];
  };
  products: Product[];
  invoices: Invoice[];
  createdAt?: string;
}

interface PerformanceListProps {
  readOnly?: boolean;
  companyId: string;
}

const PerformanceList: React.FC<PerformanceListProps> = ({ companyId, readOnly = false }) => {
  const [items, setItems] = useState<PerformanceProject[]>(() => {
    const savedData = localStorage.getItem(`performance_${companyId}`);
    return savedData ? JSON.parse(savedData) : [];
  });

  useEffect(() => {
    localStorage.setItem(`performance_${companyId}`, JSON.stringify(items));
  }, [items, companyId]);

  const [searchContractNumber, setSearchContractNumber] = useState('');
  const [searchProjectName, setSearchProjectName] = useState('');
  const [searchClientName, setSearchClientName] = useState('');
  const [searchAmountMin, setSearchAmountMin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PerformanceProject | null>(null);
  const [editingItem, setEditingItem] = useState<PerformanceProject | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showWholeContract, setShowWholeContract] = useState(true);
  const [showKeyPages, setShowKeyPages] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleReset = () => {
    setSearchContractNumber('');
    setSearchProjectName('');
    setSearchClientName('');
    setSearchAmountMin('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    console.log('Searching:', searchContractNumber, searchProjectName, searchClientName);
  };

  const handleAdd = () => {
    setEditingItem({
      id: '',
      contractNumber: '',
      projectName: '',
      clientName: '',
      contractEffectiveDate: '',
      projectAmount: '',
      contractDescription: '',
      partyAContact: '',
      partyAContactInfo: '',
      partyBContact: '',
      partyBContactInfo: '',
      attachments: {
        wholeContract: [],
        contractFirstPage: [],
        contractMainTerms: [],
        contractSealPage: [],
        acceptanceCertificate: [],
        clientProof: []
      },
      products: [],
      invoices: []
    });
    setShowAddModal(true);
  };

  const handleEdit = (item: PerformanceProject) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = (item: PerformanceProject) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmAdd = () => {
    if (editingItem) {
      const newItem: PerformanceProject = {
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

  const handleAddInvoice = () => {
    setEditingInvoice({
      id: String(Date.now()),
      invoiceNumber: '',
      invoiceAmount: ''
    });
    setShowInvoiceModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice({ ...invoice });
    setShowInvoiceModal(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        invoices: editingItem.invoices.filter(inv => inv.id !== invoiceId)
      });
    }
  };

  const confirmInvoice = () => {
    if (editingItem && editingInvoice) {
      const existingIndex = editingItem.invoices.findIndex(inv => inv.id === editingInvoice.id);
      if (existingIndex >= 0) {
        const updatedInvoices = [...editingItem.invoices];
        updatedInvoices[existingIndex] = editingInvoice;
        setEditingItem({ ...editingItem, invoices: updatedInvoices });
      } else {
        setEditingItem({
          ...editingItem,
          invoices: [...editingItem.invoices, editingInvoice]
        });
      }
      setShowInvoiceModal(false);
      setEditingInvoice(null);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct({
      id: String(Date.now()),
      productName: '',
      productSpec: '',
      quantity: '',
      unitPrice: '',
      totalPrice: '',
      remarks: '',
      attachments: []
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        products: editingItem.products.filter(prod => prod.id !== productId)
      });
    }
  };

  const confirmProduct = () => {
    if (editingItem && editingProduct) {
      const existingIndex = editingItem.products.findIndex(prod => prod.id === editingProduct.id);
      if (existingIndex >= 0) {
        const updatedProducts = [...editingItem.products];
        updatedProducts[existingIndex] = editingProduct;
        setEditingItem({ ...editingItem, products: updatedProducts });
      } else {
        setEditingItem({
          ...editingItem,
          products: [...editingItem.products, editingProduct]
        });
      }
      setShowProductModal(false);
      setEditingProduct(null);
    }
  };

  const handleProductFileUpload = (files: FileList | null) => {
    if (!files || !editingProduct) return;

    const newFiles = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setEditingProduct({
      ...editingProduct,
      attachments: [...editingProduct.attachments, ...newFiles]
    });
  };

  const handleRemoveProductFile = (index: number) => {
    if (!editingProduct) return;

    const newFiles = editingProduct.attachments.filter((_, i) => i !== index);
    setEditingProduct({
      ...editingProduct,
      attachments: newFiles
    });
  };

  const calculateTotalPrice = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleBatchUpload = (file: File) => {
    if (!editingItem) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = parseCSV(text);

        if (jsonData.length === 0) {
          alert('文件为空或格式不正确');
          return;
        }

        const newProducts: Product[] = jsonData.map((row, index) => {
          const quantity = String(row['产品数量'] || row['数量'] || '');
          const unitPrice = String(row['产品单价'] || row['单价'] || '');
          return {
            id: String(Date.now() + index),
            productName: String(row['产品名称'] || ''),
            productSpec: String(row['产品规格'] || row['规格'] || ''),
            quantity,
            unitPrice,
            totalPrice: calculateTotalPrice(quantity, unitPrice),
            remarks: String(row['备注'] || ''),
            attachments: []
          };
        });

        setEditingItem({
          ...editingItem,
          products: [...editingItem.products, ...newProducts]
        });

        alert(`成功导入 ${newProducts.length} 个产品`);
      } catch (error) {
        console.error('解析文件失败:', error);
        alert('文件解析失败，请检查文件格式');
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  const downloadTemplate = () => {
    const csvContent = '产品名称,产品规格,产品数量,产品单价,备注\n示例产品,规格说明,10,100.00,备注信息';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '产品批量导入模板.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (category: string, files: FileList | null) => {
    if (!files || !editingItem) return;

    const newFiles = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      name: file.name
    }));

    const categoryKey = category as keyof typeof editingItem.attachments;
    setEditingItem({
      ...editingItem,
      attachments: {
        ...editingItem.attachments,
        [categoryKey]: [...editingItem.attachments[categoryKey], ...newFiles]
      }
    });
  };

  const handleRemoveFile = (category: string, index: number) => {
    if (!editingItem) return;

    const categoryKey = category as keyof typeof editingItem.attachments;
    const newFiles = editingItem.attachments[categoryKey].filter((_, i) => i !== index);
    setEditingItem({
      ...editingItem,
      attachments: {
        ...editingItem.attachments,
        [categoryKey]: newFiles
      }
    });
  };

  const filteredItems = items.filter(item => {
    const matchesContract = !searchContractNumber || item.contractNumber.toLowerCase().includes(searchContractNumber.toLowerCase());
    const matchesProject = !searchProjectName || item.projectName.toLowerCase().includes(searchProjectName.toLowerCase());
    const matchesClient = !searchClientName || item.clientName.toLowerCase().includes(searchClientName.toLowerCase());

    let matchesAmount = true;
    if (searchAmountMin) {
      const minAmount = parseFloat(searchAmountMin);
      const itemAmount = parseFloat(item.projectAmount?.replace(/[^\d.]/g, '') || '0');
      matchesAmount = itemAmount > minAmount;
    }

    return matchesContract && matchesProject && matchesClient && matchesAmount;
  }).sort((a, b) => {
    const aYear = a.contractEffectiveDate ? parseInt(a.contractEffectiveDate.split('-')[0]) : 0;
    const bYear = b.contractEffectiveDate ? parseInt(b.contractEffectiveDate.split('-')[0]) : 0;
    return bYear - aYear;
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
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpPage('');
    }
  };

  const renderAttachmentSection = (
    title: string,
    category: string,
    files: { url: string; name: string }[],
    required: boolean = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      {files.length > 0 && (
        <div className="mb-3 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-900">{file.name}</span>
              </div>
              <button
                onClick={() => handleRemoveFile(category, index)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer bg-neutral-50"
        onClick={() => document.getElementById(`upload-${category}`)?.click()}
      >
        <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
        <p className="text-sm text-neutral-600">点击上传文件</p>
        <p className="text-xs text-neutral-500 mt-1">支持 JPG、PNG、PDF 格式</p>
        <input
          id={`upload-${category}`}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          onChange={(e) => handleFileUpload(category, e.target.files)}
        />
      </div>
    </div>
  );

  const renderFormModal = (isEdit: boolean) => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="text-lg font-medium text-neutral-900">
              {isEdit ? '编辑业绩信息' : '新增业绩信息'}
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
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">基础信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    合同编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.contractNumber}
                    onChange={(e) => setEditingItem({ ...editingItem, contractNumber: e.target.value })}
                    placeholder="请输入合同编号"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    项目名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.projectName}
                    onChange={(e) => setEditingItem({ ...editingItem, projectName: e.target.value })}
                    placeholder="请输入项目名称"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    单位名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.clientName}
                    onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })}
                    placeholder="请输入单位名称"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    合同生效日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingItem.contractEffectiveDate}
                    onChange={(e) => setEditingItem({ ...editingItem, contractEffectiveDate: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    项目金额 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.projectAmount}
                    onChange={(e) => setEditingItem({ ...editingItem, projectAmount: e.target.value })}
                    placeholder="请输入项目金额"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    合同描述
                  </label>
                  <textarea
                    value={editingItem.contractDescription}
                    onChange={(e) => setEditingItem({ ...editingItem, contractDescription: e.target.value })}
                    placeholder="请输入合同描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-neutral-200 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-neutral-900">产品列表</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>下载模板</span>
                  </button>
                  <button
                    onClick={() => document.getElementById('batch-upload-input')?.click()}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>批量导入</span>
                  </button>
                  <input
                    id="batch-upload-input"
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleBatchUpload(file);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>新增产品</span>
                  </button>
                </div>
              </div>
              {editingItem.products.length > 0 ? (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品名称</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品规格</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">数量</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">单价</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">单项价格</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">附件</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {editingItem.products.map((product, index) => (
                        <tr key={product.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{index + 1}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{product.productName}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{product.productSpec}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{product.quantity}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{product.unitPrice}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{product.totalPrice}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">
                            {product.attachments.length > 0 ? (
                              <span className="text-green-600">{product.attachments.length} 个文件</span>
                            ) : (
                              <span className="text-neutral-400">未上传</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-primary-600 hover:text-primary-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
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
                  暂无产品信息
                </div>
              )}
            </div>

            <div className="border-b border-neutral-200 pb-4">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">联系人信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    甲方联系人
                  </label>
                  <input
                    type="text"
                    value={editingItem.partyAContact}
                    onChange={(e) => setEditingItem({ ...editingItem, partyAContact: e.target.value })}
                    placeholder="请输入甲方联系人"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    甲方联系方式
                  </label>
                  <input
                    type="text"
                    value={editingItem.partyAContactInfo}
                    onChange={(e) => setEditingItem({ ...editingItem, partyAContactInfo: e.target.value })}
                    placeholder="请输入甲方联系方式"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    乙方联系人
                  </label>
                  <input
                    type="text"
                    value={editingItem.partyBContact}
                    onChange={(e) => setEditingItem({ ...editingItem, partyBContact: e.target.value })}
                    placeholder="请输入乙方联系人"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    乙方联系方式
                  </label>
                  <input
                    type="text"
                    value={editingItem.partyBContactInfo}
                    onChange={(e) => setEditingItem({ ...editingItem, partyBContactInfo: e.target.value })}
                    placeholder="请输入乙方联系方式"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-neutral-200 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-neutral-900">合同附件 <span className="text-xs font-normal text-neutral-500">(可选，可同时上传整份合同和关键页)</span></h4>
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWholeContract}
                      onChange={(e) => setShowWholeContract(e.target.checked)}
                      className="mr-2 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">整份合同</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showKeyPages}
                      onChange={(e) => setShowKeyPages(e.target.checked)}
                      className="mr-2 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">合同关键页</span>
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                {showWholeContract && (
                  <div>
                    <h5 className="text-sm font-medium text-neutral-700 mb-2">整份合同</h5>
                    {renderAttachmentSection('整份合同', 'wholeContract', editingItem.attachments.wholeContract)}
                  </div>
                )}
                {showKeyPages && (
                  <div>
                    <h5 className="text-sm font-medium text-neutral-700 mb-2">合同关键页</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        {renderAttachmentSection('合同首页', 'contractFirstPage', editingItem.attachments.contractFirstPage)}
                      </div>
                      <div>
                        {renderAttachmentSection('主要条款页', 'contractMainTerms', editingItem.attachments.contractMainTerms)}
                      </div>
                      <div>
                        {renderAttachmentSection('合同盖章页', 'contractSealPage', editingItem.attachments.contractSealPage)}
                      </div>
                    </div>
                  </div>
                )}
                {!showWholeContract && !showKeyPages && (
                  <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-300 rounded-lg">
                    请至少选择一种合同上传方式
                  </div>
                )}
              </div>
            </div>

            <div className="border-b border-neutral-200 pb-4">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">验收证明</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {renderAttachmentSection('验收证明', 'acceptanceCertificate', editingItem.attachments.acceptanceCertificate)}
                </div>
                <div>
                  {renderAttachmentSection('用户证明', 'clientProof', editingItem.attachments.clientProof)}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-neutral-900">发票信息</h4>
                <button
                  onClick={handleAddInvoice}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增发票</span>
                </button>
              </div>
              {editingItem.invoices.length > 0 ? (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">发票编号</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">发票金额</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">核验证明详情</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {editingItem.invoices.map((invoice, index) => (
                        <tr key={invoice.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{index + 1}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">{invoice.invoiceAmount}</td>
                          <td className="px-4 py-2.5 text-sm text-neutral-900">
                            {invoice.verificationFile ? (
                              <span className="text-green-600">已上传</span>
                            ) : (
                              <span className="text-neutral-400">未上传</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditInvoice(invoice)}
                                className="text-primary-600 hover:text-primary-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(invoice.id)}
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
                  暂无发票信息
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
              确定
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">业绩信息</h2>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              合同编号
              <input
                type="text"
                placeholder="请输入合同编号"
                value={searchContractNumber}
                onChange={(e) => setSearchContractNumber(e.target.value)}
                className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              项目名称
              <input
                type="text"
                placeholder="请输入项目名称"
                value={searchProjectName}
                onChange={(e) => setSearchProjectName(e.target.value)}
                className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              单位名称
              <input
                type="text"
                placeholder="请输入单位名称"
                value={searchClientName}
                onChange={(e) => setSearchClientName(e.target.value)}
                className="w-48 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              金额大于
              <input
                type="number"
                placeholder="请输入金额"
                value={searchAmountMin}
                onChange={(e) => setSearchAmountMin(e.target.value)}
                className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
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

        {!readOnly && (
          <div className="px-6 py-3 border-b border-neutral-200">
            <button
              onClick={handleAdd}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增业绩
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">合同编号</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">项目名称</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">单位名称</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">合同生效日期</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">项目金额</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">发票数量</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedItems().length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                paginatedItems().map((item, index) => (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                      {item.contractNumber}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-neutral-900">
                      <div className="max-w-xs truncate" title={item.projectName}>
                        {item.projectName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-neutral-900">
                      <div className="max-w-xs truncate" title={item.clientName}>
                        {item.clientName}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                      {item.contractEffectiveDate}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                      {item.projectAmount}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900">
                      {item.invoices.length} 张
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
                ))
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

      {showAddModal && renderFormModal(false)}
      {showEditModal && renderFormModal(true)}

      {showInvoiceModal && editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingInvoice.id && editingItem?.invoices.find(inv => inv.id === editingInvoice.id) ? '编辑发票' : '新增发票'}
              </h3>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setEditingInvoice(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  发票编号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingInvoice.invoiceNumber}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, invoiceNumber: e.target.value })}
                  placeholder="请输入发票编号"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  发票金额 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingInvoice.invoiceAmount}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, invoiceAmount: e.target.value })}
                  placeholder="请输入发票金额"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  发票附件 <span className="text-red-500">*</span>
                </label>
                {editingInvoice.invoiceFile && (
                  <div className="mb-3 flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-900">{editingInvoice.invoiceFile.name}</span>
                    </div>
                    <button
                      onClick={() => setEditingInvoice({ ...editingInvoice, invoiceFile: undefined })}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer bg-neutral-50"
                  onClick={() => document.getElementById('invoice-file')?.click()}
                >
                  <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                  <p className="text-sm text-neutral-600">点击上传发票</p>
                  <input
                    id="invoice-file"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditingInvoice({
                          ...editingInvoice,
                          invoiceFile: { url: URL.createObjectURL(file), name: file.name }
                        });
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  发票核验证明 <span className="text-neutral-500 text-xs">(非必须)</span>
                </label>
                {editingInvoice.verificationFile && (
                  <div className="mb-3 flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-900">{editingInvoice.verificationFile.name}</span>
                    </div>
                    <button
                      onClick={() => setEditingInvoice({ ...editingInvoice, verificationFile: undefined })}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer bg-neutral-50"
                  onClick={() => document.getElementById('verification-file')?.click()}
                >
                  <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                  <p className="text-sm text-neutral-600">点击上传核验证明</p>
                  <input
                    id="verification-file"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditingInvoice({
                          ...editingInvoice,
                          verificationFile: { url: URL.createObjectURL(file), name: file.name }
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setEditingInvoice(null);
                }}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmInvoice}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {showProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingProduct.id && editingItem?.products.find(prod => prod.id === editingProduct.id) ? '编辑产品' : '新增产品'}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
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
                    产品名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.productName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                    placeholder="请输入产品名称"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    产品规格 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.productSpec}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productSpec: e.target.value })}
                    placeholder="请输入产品规格"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    产品数量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) => {
                      const newQuantity = e.target.value;
                      const newTotalPrice = calculateTotalPrice(newQuantity, editingProduct.unitPrice);
                      setEditingProduct({
                        ...editingProduct,
                        quantity: newQuantity,
                        totalPrice: newTotalPrice
                      });
                    }}
                    placeholder="请输入数量"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    产品单价 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.unitPrice}
                    onChange={(e) => {
                      const newUnitPrice = e.target.value;
                      const newTotalPrice = calculateTotalPrice(editingProduct.quantity, newUnitPrice);
                      setEditingProduct({
                        ...editingProduct,
                        unitPrice: newUnitPrice,
                        totalPrice: newTotalPrice
                      });
                    }}
                    placeholder="请输入单价"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    单项价格
                  </label>
                  <input
                    type="text"
                    value={editingProduct.totalPrice}
                    readOnly
                    placeholder="自动计算"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    备注
                  </label>
                  <input
                    type="text"
                    value={editingProduct.remarks}
                    onChange={(e) => setEditingProduct({ ...editingProduct, remarks: e.target.value })}
                    placeholder="请输入备注"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {editingProduct.id && editingItem?.products.find(prod => prod.id === editingProduct.id) && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    产品附件 <span className="text-neutral-500 text-xs">(可选)</span>
                  </label>
                  {editingProduct.attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {editingProduct.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-900">{file.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveProductFile(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer bg-neutral-50"
                    onClick={() => document.getElementById('product-file')?.click()}
                  >
                    <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                    <p className="text-sm text-neutral-600">点击上传产品附件</p>
                    <p className="text-xs text-neutral-500 mt-1">支持 JPG、PNG、PDF 格式</p>
                    <input
                      id="product-file"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      onChange={(e) => handleProductFileUpload(e.target.files)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmProduct}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900">确认删除</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  确定要删除业绩项目 "{selectedItem.projectName}" 吗？此操作不可恢复。
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
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
    </div>
  );
};

export default PerformanceList;
