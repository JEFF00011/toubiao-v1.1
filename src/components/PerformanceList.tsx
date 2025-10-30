import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, FileText, Trash2, Edit, AlertTriangle, FileSpreadsheet, ChevronRight, Check, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

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
}

interface PerformanceProject {
  id: string;
  contractNumber: string;
  contractType: 'total' | 'unit';
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
  const [searchDateStart, setSearchDateStart] = useState('');
  const [searchDateEnd, setSearchDateEnd] = useState('');
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
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [productItemsPerPage, setProductItemsPerPage] = useState(5);
  const [productJumpPage, setProductJumpPage] = useState('');
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
  const [invoiceItemsPerPage, setInvoiceItemsPerPage] = useState(5);
  const [invoiceJumpPage, setInvoiceJumpPage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isEdit, setIsEdit] = useState(false);
  const [showBatchUploadModal, setShowBatchUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleReset = () => {
    setSearchContractNumber('');
    setSearchProjectName('');
    setSearchClientName('');
    setSearchAmountMin('');
    setSearchDateStart('');
    setSearchDateEnd('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    console.log('Searching:', searchContractNumber, searchProjectName, searchClientName);
  };

  const handleAdd = () => {
    setEditingItem({
      id: '',
      contractNumber: '',
      contractType: 'total',
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
    setProductCurrentPage(1);
    setCurrentStep(1);
    setIsEdit(false);
    setShowAddModal(true);
  };

  const handleEdit = (item: PerformanceProject) => {
    setEditingItem({ ...item });
    setProductCurrentPage(1);
    setCurrentStep(1);
    setIsEdit(true);
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
      setCurrentStep(1);
    }
  };

  const confirmEdit = () => {
    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id ? editingItem : item
      ));
      setShowEditModal(false);
      setCurrentStep(1);
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
      invoiceAmount: '',
      invoiceFile: undefined,
      verificationFile: undefined
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
      remarks: ''
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (editingItem) {
      const newProducts = editingItem.products.filter(prod => prod.id !== productId);
      setEditingItem({
        ...editingItem,
        products: newProducts
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

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          setUploadError('Excel文件为空，请检查文件内容');
          return;
        }

        const newProducts: Product[] = jsonData.map((row, index) => {
          const quantity = String(row['数量'] || row['quantity'] || '');
          const unitPrice = String(row['单价'] || row['unitPrice'] || '');
          const quantityNum = parseFloat(quantity) || 0;
          const unitPriceNum = parseFloat(unitPrice) || 0;
          const totalPrice = (quantityNum * unitPriceNum).toFixed(2);

          return {
            id: String(Date.now() + index),
            productName: String(row['产品名称'] || row['productName'] || ''),
            productSpec: String(row['产品规格'] || row['productSpec'] || ''),
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            remarks: String(row['备注'] || row['remarks'] || '')
          };
        });

        const validProducts = newProducts.filter(p => p.productName);

        if (validProducts.length === 0) {
          setUploadError('未找到有效的产品数据，请检查Excel格式');
          return;
        }

        if (editingItem) {
          setEditingItem({
            ...editingItem,
            products: [...editingItem.products, ...validProducts]
          });
        }

        setShowBatchUploadModal(false);
        alert(`成功导入 ${validProducts.length} 条产品信息`);
      } catch (error) {
        console.error('Excel解析错误:', error);
        setUploadError('Excel文件解析失败，请检查文件格式');
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const template = [
      {
        '产品名称': '示例产品A',
        '产品规格': 'V1.0标准版',
        '数量': '10',
        '单价': '5000',
        '备注': '第一批采购'
      },
      {
        '产品名称': '示例产品B',
        '产品规格': 'V2.0专业版',
        '数量': '5',
        '单价': '8000',
        '备注': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '产品信息模板');

    const colWidths = [
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 }
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, '产品信息导入模板.xlsx');
  };

  const handleUploadFile = (category: keyof PerformanceProject['attachments'], file: File) => {
    if (editingItem) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile = { url: reader.result as string, name: file.name };
        setEditingItem({
          ...editingItem,
          attachments: {
            ...editingItem.attachments,
            [category]: [...editingItem.attachments[category], newFile]
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (category: keyof PerformanceProject['attachments'], index: number) => {
    if (editingItem) {
      const updatedFiles = editingItem.attachments[category].filter((_, i) => i !== index);
      setEditingItem({
        ...editingItem,
        attachments: {
          ...editingItem.attachments,
          [category]: updatedFiles
        }
      });
    }
  };

  const handleUploadInvoiceFile = (field: 'invoiceFile' | 'verificationFile', file: File) => {
    if (editingInvoice) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingInvoice({
          ...editingInvoice,
          [field]: { url: reader.result as string, name: file.name }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveInvoiceFile = (field: 'invoiceFile' | 'verificationFile') => {
    if (editingInvoice) {
      setEditingInvoice({
        ...editingInvoice,
        [field]: undefined
      });
    }
  };


  const filteredItems = items.filter(item => {
    const matchesContract = !searchContractNumber || item.contractNumber.toLowerCase().includes(searchContractNumber.toLowerCase());
    const matchesProject = !searchProjectName || item.projectName.toLowerCase().includes(searchProjectName.toLowerCase());
    const matchesClient = !searchClientName || item.clientName.toLowerCase().includes(searchClientName.toLowerCase());
    const matchesAmount = !searchAmountMin || (parseFloat(item.projectAmount.replace(/[^\d.]/g, '')) >= parseFloat(searchAmountMin));

    let matchesDate = true;
    if (searchDateStart || searchDateEnd) {
      const itemDate = item.contractEffectiveDate ? new Date(item.contractEffectiveDate) : null;
      if (itemDate) {
        if (searchDateStart && searchDateEnd) {
          const startDate = new Date(searchDateStart);
          const endDate = new Date(searchDateEnd);
          matchesDate = itemDate >= startDate && itemDate <= endDate;
        } else if (searchDateStart) {
          const startDate = new Date(searchDateStart);
          matchesDate = itemDate >= startDate;
        } else if (searchDateEnd) {
          const endDate = new Date(searchDateEnd);
          matchesDate = itemDate <= endDate;
        }
      } else {
        matchesDate = false;
      }
    }

    return matchesContract && matchesProject && matchesClient && matchesAmount && matchesDate;
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

  const paginatedProducts = () => {
    if (!editingItem) return [];
    const startIndex = (productCurrentPage - 1) * productItemsPerPage;
    const endIndex = startIndex + productItemsPerPage;
    return editingItem.products.slice(startIndex, endIndex);
  };

  const productTotalPages = editingItem ? Math.ceil(editingItem.products.length / productItemsPerPage) : 0;

  const handleProductPageSizeChange = (newSize: number) => {
    setProductItemsPerPage(newSize);
    setProductCurrentPage(1);
  };

  const handleProductJumpToPage = () => {
    const page = parseInt(productJumpPage);
    if (page >= 1 && page <= productTotalPages) {
      setProductCurrentPage(page);
      setProductJumpPage('');
    }
  };

  const invoiceTotalPages = editingItem ? Math.ceil(editingItem.invoices.length / invoiceItemsPerPage) : 1;

  const paginatedInvoices = () => {
    if (!editingItem) return [];
    const startIndex = (invoiceCurrentPage - 1) * invoiceItemsPerPage;
    return editingItem.invoices.slice(startIndex, startIndex + invoiceItemsPerPage);
  };

  const handleInvoicePageSizeChange = (newSize: number) => {
    setInvoiceItemsPerPage(newSize);
    setInvoiceCurrentPage(1);
  };

  const handleInvoiceJumpToPage = () => {
    const page = parseInt(invoiceJumpPage);
    if (page >= 1 && page <= invoiceTotalPages) {
      setInvoiceCurrentPage(page);
      setInvoiceJumpPage('');
    }
  };

  const getTotalSteps = () => {
    if (!editingItem) return 4;
    return editingItem.contractType === 'total' ? 3 : 4;
  };

  const getStepTitle = (step: number) => {
    if (!editingItem) return '';
    const totalSteps = getTotalSteps();

    if (step === 1) return '基础信息和联系人信息';
    if (editingItem.contractType === 'total') {
      if (step === 2) return '上传合同附件、验收证明';
      if (step === 3) return '上传发票信息';
    } else {
      if (step === 2) return '录入合同产品信息';
      if (step === 3) return '上传合同附件、验收证明';
      if (step === 4) return '上传发票信息';
    }
    return '';
  };

  const canGoNextStep = () => {
    if (!editingItem) return false;

    if (currentStep === 1) {
      return editingItem.contractNumber && editingItem.projectName && editingItem.clientName &&
             editingItem.contractEffectiveDate && editingItem.projectAmount;
    }

    return true;
  };

  const handleNextStep = () => {
    const totalSteps = getTotalSteps();
    if (currentStep < totalSteps && canGoNextStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (isEdit) {
      confirmEdit();
    } else {
      confirmAdd();
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = getTotalSteps();
    const steps = [];

    for (let i = 1; i <= totalSteps; i++) {
      steps.push(
        <div key={i} className="flex items-center">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
              i < currentStep ? 'bg-green-500 border-green-500 text-white' :
              i === currentStep ? 'bg-blue-600 border-blue-600 text-white' :
              'bg-white border-neutral-300 text-neutral-500'
            }`}>
              {i < currentStep ? <Check className="w-4 h-4" /> : i}
            </div>
            <div className="ml-2">
              <div className={`text-sm font-medium ${
                i === currentStep ? 'text-blue-900' : 'text-neutral-600'
              }`}>
                {getStepTitle(i)}
              </div>
            </div>
          </div>
          {i < totalSteps && (
            <ChevronRight className="w-5 h-5 mx-4 text-neutral-400" />
          )}
        </div>
      );
    }

    return (
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          {steps}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          第一步：填写项目的基础信息和联系人信息。合同类型分为总价合同和单价合同，总价合同无需录入产品信息。
        </p>
      </div>

      <div className="border-b border-neutral-200 pb-4">
        <h4 className="text-sm font-semibold text-neutral-900 mb-3">基础信息</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              合同编号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editingItem?.contractNumber || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, contractNumber: e.target.value } : null)}
              placeholder="请输入合同编号"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              合同类型 <span className="text-red-500">*</span>
            </label>
            <select
              value={editingItem?.contractType || 'total'}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, contractType: e.target.value as 'total' | 'unit' } : null)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="total">总价合同</option>
              <option value="unit">单价合同</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              项目名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editingItem?.projectName || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, projectName: e.target.value } : null)}
              placeholder="请输入项目名称"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              客户名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editingItem?.clientName || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, clientName: e.target.value } : null)}
              placeholder="请输入客户名称"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              合同生效日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={editingItem?.contractEffectiveDate || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, contractEffectiveDate: e.target.value } : null)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              项目金额 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editingItem?.projectAmount || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, projectAmount: e.target.value } : null)}
              placeholder="如：100万元"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            合同描述
          </label>
          <textarea
            value={editingItem?.contractDescription || ''}
            onChange={(e) => setEditingItem(editingItem ? { ...editingItem, contractDescription: e.target.value } : null)}
            placeholder="请输入合同描述"
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-neutral-900 mb-3">联系人信息</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              甲方联系人
            </label>
            <input
              type="text"
              value={editingItem?.partyAContact || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, partyAContact: e.target.value } : null)}
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
              value={editingItem?.partyAContactInfo || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, partyAContactInfo: e.target.value } : null)}
              placeholder="请输入联系方式"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              乙方联系人
            </label>
            <input
              type="text"
              value={editingItem?.partyBContact || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, partyBContact: e.target.value } : null)}
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
              value={editingItem?.partyBContactInfo || ''}
              onChange={(e) => setEditingItem(editingItem ? { ...editingItem, partyBContactInfo: e.target.value } : null)}
              placeholder="请输入联系方式"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2Products = () => (
    <div className="p-6 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          第二步：录入合同产品信息，包括产品名称、规格、数量、单价等详细信息。
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-900">合同产品列表</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBatchUploadModal(true)}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            批量上传
          </button>
          <button
            onClick={handleAddProduct}
            className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            新增产品
          </button>
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品名称</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品规格</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">数量</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">单价</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">总价</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {editingItem && paginatedProducts().length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  暂无产品，请点击"新增产品"添加
                </td>
              </tr>
            ) : (
              paginatedProducts().map((product, index) => (
                <tr key={product.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm text-neutral-900">
                    {(productCurrentPage - 1) * productItemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900">{product.productName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{product.productSpec || '-'}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{product.quantity}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{product.unitPrice}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{product.totalPrice}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-primary-600 hover:text-primary-800"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingItem && editingItem.products.length > 0 && (
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-neutral-200">
          <div className="text-sm text-neutral-700">
            共 {editingItem.products.length} 条
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setProductCurrentPage(Math.max(1, productCurrentPage - 1))}
              disabled={productCurrentPage === 1}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                productCurrentPage === 1
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              &lt;
            </button>

            {Array.from({ length: Math.min(5, productTotalPages) }, (_, i) => {
              let pageNum;
              if (productTotalPages <= 5) {
                pageNum = i + 1;
              } else if (productCurrentPage <= 3) {
                pageNum = i + 1;
              } else if (productCurrentPage >= productTotalPages - 2) {
                pageNum = productTotalPages - 4 + i;
              } else {
                pageNum = productCurrentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setProductCurrentPage(pageNum)}
                  className={`px-2.5 py-1 text-sm rounded transition-colors ${
                    productCurrentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setProductCurrentPage(Math.min(productTotalPages, productCurrentPage + 1))}
              disabled={productCurrentPage === productTotalPages}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                productCurrentPage === productTotalPages
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              &gt;
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={productItemsPerPage}
              onChange={(e) => handleProductPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={5}>5条/页</option>
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
            </select>
            <span className="text-sm text-neutral-700">前往</span>
            <input
              type="number"
              value={productJumpPage}
              onChange={(e) => setProductJumpPage(e.target.value)}
              placeholder="页"
              className="w-12 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              min={1}
              max={productTotalPages}
            />
            <button
              onClick={handleProductJumpToPage}
              className="px-3 py-1 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
            >
              页
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStepAttachments = () => (
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          {editingItem?.contractType === 'total' ? '第二步' : '第三步'}：上传合同附件和验收证明。您可以选择上传完整合同或关键页。
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            请选择上传方式 <span className="text-red-500">*</span>
            <span className="text-xs text-neutral-500 ml-2">(可多选)</span>
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWholeContract}
                onChange={(e) => setShowWholeContract(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium text-neutral-700">上传完整合同</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showKeyPages}
                onChange={(e) => setShowKeyPages(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium text-neutral-700">上传关键页</span>
            </label>
          </div>
        </div>

        {showWholeContract && (
          <div className="border border-neutral-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              完整合同 <span className="text-neutral-500 text-xs">(支持多文件上传)</span>
            </label>
            <div
              className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById('whole-contract-upload')?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-600">点击或拖拽文件到此处上传（支持多选）</p>
              <p className="text-xs text-neutral-500 mt-1">支持 PDF、Word 格式</p>
              <input
                id="whole-contract-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach(file => handleUploadFile('wholeContract', file));
                  }
                }}
              />
            </div>
            {editingItem && editingItem.attachments.wholeContract.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-neutral-700">已上传文件：</p>
                {editingItem.attachments.wholeContract.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                      <span className="text-sm text-neutral-900 truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile('wholeContract', index)}
                      className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showKeyPages && (
          <div className="space-y-4">
            {[
              { key: 'contractFirstPage' as const, label: '合同首页' },
              { key: 'contractMainTerms' as const, label: '合同主要条款页' },
              { key: 'contractSealPage' as const, label: '合同盖章页' }
            ].map(({ key, label }) => (
              <div key={key} className="border border-neutral-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {label} <span className="text-neutral-500 text-xs">(支持多文件上传)</span>
                </label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById(`${key}-upload`)?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">点击或拖拽文件到此处上传（支持多选）</p>
                  <p className="text-xs text-neutral-500 mt-1">支持 PDF、Word、图片 格式</p>
                  <input
                    id={`${key}-upload`}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(file => handleUploadFile(key, file));
                      }
                    }}
                  />
                </div>
                {editingItem && editingItem.attachments[key].length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-neutral-700">已上传文件：</p>
                    {editingItem.attachments[key].map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                          <span className="text-sm text-neutral-900 truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(key, index)}
                          className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            验收证明 <span className="text-neutral-500 text-xs">(支持多文件上传)</span>
          </label>
          <div
            className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('acceptance-upload')?.click()}
          >
            <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
            <p className="text-sm text-neutral-600">点击或拖拽文件到此处上传（支持多选）</p>
            <p className="text-xs text-neutral-500 mt-1">支持 PDF、Word、图片 格式</p>
            <input
              id="acceptance-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  Array.from(e.target.files).forEach(file => handleUploadFile('acceptanceCertificate', file));
                }
              }}
            />
          </div>
          {editingItem && editingItem.attachments.acceptanceCertificate.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-neutral-700">已上传文件：</p>
              {editingItem.attachments.acceptanceCertificate.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-900 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile('acceptanceCertificate', index)}
                    className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-neutral-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            客户证明材料 <span className="text-neutral-500 text-xs">(支持多文件上传)</span>
          </label>
          <div
            className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('client-proof-upload')?.click()}
          >
            <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
            <p className="text-sm text-neutral-600">点击或拖拽文件到此处上传（支持多选）</p>
            <p className="text-xs text-neutral-500 mt-1">支持 PDF、Word、图片 格式</p>
            <input
              id="client-proof-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  Array.from(e.target.files).forEach(file => handleUploadFile('clientProof', file));
                }
              }}
            />
          </div>
          {editingItem && editingItem.attachments.clientProof.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-neutral-700">已上传文件：</p>
              {editingItem.attachments.clientProof.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-900 truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile('clientProof', index)}
                    className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepInvoices = () => (
    <div className="p-6 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          {editingItem?.contractType === 'total' ? '第三步' : '第四步'}：上传发票信息，包括发票编号、金额及发票文件。
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-neutral-900">发票列表</h4>
        <button
          onClick={handleAddInvoice}
          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          新增发票
        </button>
      </div>

      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">发票编号</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">发票金额</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">发票文件</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {editingItem && editingItem.invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  暂无发票，请点击"新增发票"添加
                </td>
              </tr>
            ) : (
              paginatedInvoices().map((invoice, index) => (
                <tr key={invoice.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-sm text-neutral-900">
                    {(invoiceCurrentPage - 1) * invoiceItemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{invoice.invoiceAmount}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {invoice.invoiceFile ? '已上传' : '未上传'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-primary-600 hover:text-primary-800"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-800"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingItem && editingItem.invoices.length > 0 && (
        <div className="flex items-center justify-center gap-6 pt-3 border-t border-neutral-200">
          <div className="text-sm text-neutral-700">
            共 {editingItem.invoices.length} 条
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setInvoiceCurrentPage(Math.max(1, invoiceCurrentPage - 1))}
              disabled={invoiceCurrentPage === 1}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                invoiceCurrentPage === 1
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              &lt;
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(10, invoiceTotalPages) }, (_, i) => {
                let pageNum;
                if (invoiceTotalPages <= 10) {
                  pageNum = i + 1;
                } else if (invoiceCurrentPage <= 5) {
                  pageNum = i + 1;
                } else if (invoiceCurrentPage >= invoiceTotalPages - 4) {
                  pageNum = invoiceTotalPages - 9 + i;
                } else {
                  pageNum = invoiceCurrentPage - 4 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setInvoiceCurrentPage(pageNum)}
                    className={`px-2.5 py-1 text-sm rounded transition-colors ${
                      invoiceCurrentPage === pageNum
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
              onClick={() => setInvoiceCurrentPage(Math.min(invoiceTotalPages, invoiceCurrentPage + 1))}
              disabled={invoiceCurrentPage === invoiceTotalPages}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                invoiceCurrentPage === invoiceTotalPages
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              &gt;
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={invoiceItemsPerPage}
              onChange={(e) => handleInvoicePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={5}>5条/页</option>
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
            </select>
            <span className="text-sm text-neutral-700">前往</span>
            <input
              type="number"
              value={invoiceJumpPage}
              onChange={(e) => setInvoiceJumpPage(e.target.value)}
              placeholder="页"
              className="w-12 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              min={1}
              max={invoiceTotalPages}
            />
            <button
              onClick={handleInvoiceJumpToPage}
              className="px-3 py-1 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
            >
              页
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderModalContent = () => {
    if (!editingItem) return null;

    if (currentStep === 1) return renderStep1();
    if (editingItem.contractType === 'unit' && currentStep === 2) return renderStep2Products();
    if ((editingItem.contractType === 'total' && currentStep === 2) ||
        (editingItem.contractType === 'unit' && currentStep === 3)) return renderStepAttachments();
    if ((editingItem.contractType === 'total' && currentStep === 3) ||
        (editingItem.contractType === 'unit' && currentStep === 4)) return renderStepInvoices();

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">业绩信息</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              该模块用于管理企业的历史业绩和项目经验，包括合同信息、项目详情、项目产品、发票信息等。业绩信息是证明企业实力和项目经验的重要依据，在投标时将自动匹配相关项目要求。请详细填写项目信息。
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-neutral-700">合同时间</span>
              <input
                type="date"
                value={searchDateStart}
                onChange={(e) => setSearchDateStart(e.target.value)}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-sm text-neutral-500">至</span>
              <input
                type="date"
                value={searchDateEnd}
                onChange={(e) => setSearchDateEnd(e.target.value)}
                className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-sm text-neutral-700">合同编号</span>
              <input
                type="text"
                placeholder="请输入合同编号"
                value={searchContractNumber}
                onChange={(e) => setSearchContractNumber(e.target.value)}
                className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-sm text-neutral-700">项目名称</span>
              <input
                type="text"
                placeholder="请输入项目名称"
                value={searchProjectName}
                onChange={(e) => setSearchProjectName(e.target.value)}
                className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-sm text-neutral-700">客户名称</span>
              <input
                type="text"
                placeholder="请输入客户名称"
                value={searchClientName}
                onChange={(e) => setSearchClientName(e.target.value)}
                className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-sm text-neutral-700">最低金额</span>
              <input
                type="text"
                placeholder="如：100"
                value={searchAmountMin}
                onChange={(e) => setSearchAmountMin(e.target.value)}
                className="w-32 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
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
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">合同类型</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">项目名称</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">客户名称</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">合同时间</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">项目金额</th>
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
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-900">{item.contractNumber}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.contractType === 'total' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.contractType === 'total' ? '总价合同' : '单价合同'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-900">{item.projectName}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{item.clientName}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{item.contractEffectiveDate || '-'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{item.projectAmount}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-primary-600 hover:text-primary-800"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!readOnly && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-800"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-center gap-6">
          <div className="text-sm text-neutral-700">
            共 {filteredItems.length} 条
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
      </div>

      {(showAddModal || showEditModal) && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-neutral-900">
                {isEdit ? '编辑业绩信息' : '新增业绩信息'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setCurrentStep(1);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {renderStepIndicator()}

            <div className="flex-1 overflow-y-auto">
              {renderModalContent()}
            </div>

            <div className="px-6 py-4 border-t border-neutral-200 flex justify-between flex-shrink-0">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-neutral-50'
                }`}
              >
                上一步
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  取消
                </button>
                {currentStep < getTotalSteps() ? (
                  <button
                    onClick={handleNextStep}
                    disabled={!canGoNextStep()}
                    className={`px-4 py-2 bg-primary-600 text-white rounded-lg transition-colors ${
                      canGoNextStep()
                        ? 'hover:bg-primary-700'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    完成
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingProduct.id && editingItem?.products.some(p => p.id === editingProduct.id) ? '编辑产品' : '新增产品'}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
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
                    产品规格
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
                    数量 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.quantity}
                    onChange={(e) => {
                      const newQuantity = e.target.value;
                      setEditingProduct({ ...editingProduct, quantity: newQuantity });

                      const quantityNum = parseFloat(newQuantity.replace(/[^0-9.]/g, ''));
                      const unitPriceNum = parseFloat(editingProduct.unitPrice.replace(/[^0-9.]/g, ''));

                      if (!isNaN(quantityNum) && !isNaN(unitPriceNum)) {
                        const total = quantityNum * unitPriceNum;
                        setEditingProduct(prev => ({ ...prev, quantity: newQuantity, totalPrice: total.toFixed(2) + '元' }));
                      }
                    }}
                    placeholder="如：100台"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    单价 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unitPrice}
                    onChange={(e) => {
                      const newUnitPrice = e.target.value;
                      setEditingProduct({ ...editingProduct, unitPrice: newUnitPrice });

                      const quantityNum = parseFloat(editingProduct.quantity.replace(/[^0-9.]/g, ''));
                      const unitPriceNum = parseFloat(newUnitPrice.replace(/[^0-9.]/g, ''));

                      if (!isNaN(quantityNum) && !isNaN(unitPriceNum)) {
                        const total = quantityNum * unitPriceNum;
                        setEditingProduct(prev => ({ ...prev, unitPrice: newUnitPrice, totalPrice: total.toFixed(2) + '元' }));
                      }
                    }}
                    placeholder="如：5000元/台"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    总价 <span className="text-red-500">*</span>
                    <span className="text-xs text-neutral-500 ml-2">(自动计算)</span>
                  </label>
                  <input
                    type="text"
                    value={editingProduct.totalPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, totalPrice: e.target.value })}
                    placeholder="如：50万元"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-neutral-50"
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
                disabled={!editingProduct.productName || !editingProduct.quantity || !editingProduct.unitPrice || !editingProduct.totalPrice}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900">批量上传产品信息</h3>
              <button
                onClick={() => {
                  setShowBatchUploadModal(false);
                  setUploadError('');
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">上传说明</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>请先下载模板，按照模板格式填写产品信息</li>
                  <li>必填字段：产品名称、数量、单价</li>
                  <li>支持格式：.xlsx, .xls</li>
                  <li>系统会自动计算总价</li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载模板
                </button>
              </div>

              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8">
                <label className="flex flex-col items-center cursor-pointer hover:border-primary-500 transition-colors">
                  <FileSpreadsheet className="w-12 h-12 text-neutral-400 mb-3" />
                  <span className="text-sm font-medium text-neutral-700 mb-1">点击选择Excel文件</span>
                  <span className="text-xs text-neutral-500">支持 .xlsx, .xls 格式</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleBatchUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{uploadError}</p>
                </div>
              )}

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                <h5 className="text-xs font-semibold text-neutral-700 mb-2">Excel列名要求：</h5>
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                  <div>• 产品名称 (必填)</div>
                  <div>• 产品规格</div>
                  <div>• 数量 (必填)</div>
                  <div>• 单价 (必填)</div>
                  <div>• 备注</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg">
              <button
                onClick={() => {
                  setShowBatchUploadModal(false);
                  setUploadError('');
                }}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingInvoice.id && editingItem?.invoices.some(inv => inv.id === editingInvoice.id) ? '编辑发票' : '新增发票'}
              </h3>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setEditingInvoice(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="如：10万元"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  发票文件
                </label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('invoice-file-upload')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">点击或拖拽文件到此处上传</p>
                  <p className="text-xs text-neutral-500 mt-1">支持 PDF、图片 格式</p>
                  <input
                    id="invoice-file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => e.target.files?.[0] && handleUploadInvoiceFile('invoiceFile', e.target.files[0])}
                  />
                </div>
                {editingInvoice.invoiceFile && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-neutral-700 mb-2">已上传文件：</p>
                    <div className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-900 truncate">{editingInvoice.invoiceFile.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveInvoiceFile('invoiceFile')}
                        className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  验证材料
                </label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('verification-file-upload')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">点击或拖拽文件到此处上传</p>
                  <p className="text-xs text-neutral-500 mt-1">支持 PDF、图片 格式</p>
                  <input
                    id="verification-file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => e.target.files?.[0] && handleUploadInvoiceFile('verificationFile', e.target.files[0])}
                  />
                </div>
                {editingInvoice.verificationFile && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-neutral-700 mb-2">已上传文件：</p>
                    <div className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm text-neutral-900 truncate">{editingInvoice.verificationFile.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveInvoiceFile('verificationFile')}
                        className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg sticky bottom-0">
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
                disabled={!editingInvoice.invoiceNumber || !editingInvoice.invoiceAmount}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-neutral-900">确认删除</h3>
            </div>

            <div className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-neutral-700">
                    确定要删除业绩项目 <strong>{selectedItem.projectName}</strong> 吗？
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    删除后将无法恢复，请谨慎操作。
                  </p>
                </div>
              </div>
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
    </div>
  );
};

export default PerformanceList;
