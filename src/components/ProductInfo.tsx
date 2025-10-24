import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Upload, AlertTriangle, Settings } from 'lucide-react';

interface ProductAttachment {
  id: string;
  name: string;
  description: string;
  files: { url: string; name: string; size: number }[];
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  brand: string;
  specification: string;
  model: string;
  description: string;
  attachments: ProductAttachment[];
  createdAt?: string;
}

interface CategoryData {
  productionEquipment: Product[];
  testingEquipment: Product[];
  companyProducts: Product[];
}

interface ProductInfoProps {
  companyId: string;
  readOnly?: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ProductInfo: React.FC<ProductInfoProps> = ({ companyId, readOnly = false }) => {
  const [activeCategory, setActiveCategory] = useState<'productionEquipment' | 'testingEquipment' | 'companyProducts'>('productionEquipment');
  const [data, setData] = useState<CategoryData>(() => {
    const savedData = localStorage.getItem(`product_info_${companyId}`);
    if (!savedData) {
      return {
        productionEquipment: [],
        testingEquipment: [],
        companyProducts: []
      };
    }
    return JSON.parse(savedData);
  });

  const [categories, setCategories] = useState<Record<string, ProductCategory[]>>(() => {
    const savedCategories = localStorage.getItem(`product_categories_${companyId}`);
    if (!savedCategories) {
      return {
        productionEquipment: [],
        testingEquipment: [],
        companyProducts: []
      };
    }
    return JSON.parse(savedCategories);
  });

  const [searchName, setSearchName] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchSpecification, setSearchSpecification] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jumpPage, setJumpPage] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<ProductAttachment | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const [showCategoryManagement, setShowCategoryManagement] = useState(false);

  useEffect(() => {
    localStorage.setItem(`product_info_${companyId}`, JSON.stringify(data));
  }, [data, companyId]);

  useEffect(() => {
    localStorage.setItem(`product_categories_${companyId}`, JSON.stringify(categories));
  }, [categories, companyId]);

  const handleAddProduct = () => {
    setEditingProduct({
      id: '',
      categoryId: '',
      name: '',
      brand: '',
      specification: '',
      model: '',
      description: '',
      attachments: []
    });
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setShowModal(true);
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert('请输入产品名称');
      return;
    }

    if (!editingProduct.categoryId) {
      alert('请选择产品分类');
      return;
    }

    const categoryProducts = [...data[activeCategory]];

    if (editingProduct.id) {
      const index = categoryProducts.findIndex(p => p.id === editingProduct.id);
      if (index !== -1) {
        categoryProducts[index] = editingProduct;
      }
    } else {
      categoryProducts.push({
        ...editingProduct,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
    }

    setData({
      ...data,
      [activeCategory]: categoryProducts
    });

    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('确定要删除此产品吗？删除后将无法恢复。')) return;

    setData({
      ...data,
      [activeCategory]: data[activeCategory].filter(p => p.id !== productId)
    });
  };

  const handleAddCategory = () => {
    setEditingCategory({
      id: '',
      name: '',
      description: ''
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory({ ...category });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;

    if (!editingCategory.name.trim()) {
      alert('请输入分类名称');
      return;
    }

    const currentCategories = [...categories[activeCategory]];

    if (editingCategory.id) {
      const index = currentCategories.findIndex(c => c.id === editingCategory.id);
      if (index !== -1) {
        currentCategories[index] = editingCategory;
      }
    } else {
      currentCategories.push({
        ...editingCategory,
        id: Date.now().toString()
      });
    }

    setCategories({
      ...categories,
      [activeCategory]: currentCategories
    });

    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const hasProducts = data[activeCategory].some(p => p.categoryId === categoryId);
    if (hasProducts) {
      alert('该分类下存在产品，无法删除');
      return;
    }

    if (!confirm('确定要删除此分类吗？')) return;

    setCategories({
      ...categories,
      [activeCategory]: categories[activeCategory].filter(c => c.id !== categoryId)
    });
  };

  const handleAddAttachment = () => {
    setEditingAttachment({
      id: '',
      name: '',
      description: '',
      files: []
    });
    setShowAttachmentModal(true);
  };

  const handleEditAttachment = (attachment: ProductAttachment) => {
    setEditingAttachment({ ...attachment });
    setShowAttachmentModal(true);
  };

  const handleSaveAttachment = () => {
    if (!editingAttachment || !editingProduct) return;

    if (!editingAttachment.name.trim()) {
      alert('请输入附件名称');
      return;
    }

    const updatedAttachments = [...editingProduct.attachments];

    if (editingAttachment.id) {
      const index = updatedAttachments.findIndex(a => a.id === editingAttachment.id);
      if (index !== -1) {
        updatedAttachments[index] = editingAttachment;
      }
    } else {
      updatedAttachments.push({
        ...editingAttachment,
        id: Date.now().toString()
      });
    }

    setEditingProduct({
      ...editingProduct,
      attachments: updatedAttachments
    });

    setShowAttachmentModal(false);
    setEditingAttachment(null);
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    if (!editingProduct) return;
    if (!confirm('确定要删除此附件吗？')) return;

    setEditingProduct({
      ...editingProduct,
      attachments: editingProduct.attachments.filter(a => a.id !== attachmentId)
    });
  };

  const handleAddAttachmentFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,application/pdf';
    input.multiple = true;
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files && editingAttachment) {
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
        setEditingAttachment({
          ...editingAttachment,
          files: [...editingAttachment.files, ...newFiles]
        });
      }
    };
    input.click();
  };

  const handleRemoveAttachmentFile = (fileIndex: number) => {
    if (editingAttachment) {
      setEditingAttachment({
        ...editingAttachment,
        files: editingAttachment.files.filter((_, i) => i !== fileIndex)
      });
    }
  };

  const filteredProducts = () => {
    return data[activeCategory].filter(product => {
      const matchesName = !searchName || product.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesBrand = !searchBrand || product.brand.toLowerCase().includes(searchBrand.toLowerCase());
      const matchesSpecification = !searchSpecification || product.specification.toLowerCase().includes(searchSpecification.toLowerCase());
      const matchesModel = !searchModel || product.model.toLowerCase().includes(searchModel.toLowerCase());
      const matchesCategory = searchCategory === 'all' || product.categoryId === searchCategory;
      return matchesName && matchesBrand && matchesSpecification && matchesModel && matchesCategory;
    }).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  };

  const paginatedProducts = () => {
    const filtered = filteredProducts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProducts().length / itemsPerPage);

  const handleReset = () => {
    setSearchName('');
    setSearchBrand('');
    setSearchSpecification('');
    setSearchModel('');
    setSearchCategory('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

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

  const getCategoryName = (categoryId: string) => {
    const category = categories[activeCategory].find(c => c.id === categoryId);
    return category ? category.name : '-';
  };

  const categoryNames = {
    productionEquipment: '生产设备',
    testingEquipment: '检测设备',
    companyProducts: '企业产品'
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-neutral-900">产品信息</h2>
              </div>

              <div className="flex space-x-2 mb-4">
                {(Object.keys(categoryNames) as Array<keyof typeof categoryNames>).map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setCurrentPage(1);
                      handleReset();
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors rounded ${
                      activeCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {categoryNames[category]}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  产品名称
                  <input
                    type="text"
                    placeholder="请输入产品名称"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  产品品牌
                  <input
                    type="text"
                    placeholder="请输入产品品牌"
                    value={searchBrand}
                    onChange={(e) => setSearchBrand(e.target.value)}
                    className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  产品规格
                  <input
                    type="text"
                    placeholder="请输入产品规格"
                    value={searchSpecification}
                    onChange={(e) => setSearchSpecification(e.target.value)}
                    className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  产品型号
                  <input
                    type="text"
                    placeholder="请输入产品型号"
                    value={searchModel}
                    onChange={(e) => setSearchModel(e.target.value)}
                    className="w-40 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  产品分类
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">全部</option>
                    {categories[activeCategory].map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
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
              <div className="px-6 py-3 border-b border-neutral-200 flex items-center gap-2">
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  新增{categoryNames[activeCategory]}
                </button>
                <button
                  onClick={() => setShowCategoryManagement(true)}
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  产品分类管理
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品分类</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品名称</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品品牌</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品规格</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">产品型号</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">相关附件</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedProducts().length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts().map((product, index) => (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-sm text-neutral-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{getCategoryName(product.categoryId)}</td>
                        <td className="px-4 py-3 text-sm text-neutral-900">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{product.brand || '-'}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{product.specification || '-'}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{product.model || '-'}</td>
                        <td className="px-4 py-3 text-sm text-neutral-600">{product.attachments.length}个</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-primary-600 hover:text-primary-800"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!readOnly && (
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
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

            {filteredProducts().length > 0 && (
              <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <span>每页显示</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>条</span>
                  <span className="ml-4">
                    共 {filteredProducts().length} 条数据
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-neutral-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                  >
                    上一页
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
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
                    className="px-3 py-1 text-sm border border-neutral-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                  >
                    下一页
                  </button>

                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-sm text-neutral-600">跳至</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={jumpPage}
                      onChange={(e) => setJumpPage(e.target.value)}
                      className="w-16 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-primary-500"
                      placeholder="页码"
                    />
                    <button
                      onClick={handleJumpToPage}
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                    >
                      跳转
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCategoryManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-neutral-900">产品分类管理</h3>
              <button
                onClick={() => setShowCategoryManagement(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  新增分类
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">分类名称</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">分类描述</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {categories[activeCategory].length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                          暂无分类
                        </td>
                      </tr>
                    ) : (
                      categories[activeCategory].map((category, index) => (
                        <tr key={category.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-neutral-900">{category.name}</td>
                          <td className="px-4 py-3 text-sm text-neutral-600">{category.description || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="text-primary-600 hover:text-primary-800"
                                title="编辑"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
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
            </div>

            <div className="sticky bottom-0 bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setShowCategoryManagement(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingProduct.id ? '编辑' : '添加'}{categoryNames[activeCategory]}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="border-b border-neutral-200 pb-4">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">基本信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      产品分类 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingProduct.categoryId}
                      onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">请选择分类</option>
                      {categories[activeCategory].map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      产品名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="请输入产品名称"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      产品品牌
                    </label>
                    <input
                      type="text"
                      value={editingProduct.brand}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      placeholder="请输入产品品牌"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      产品规格
                    </label>
                    <input
                      type="text"
                      value={editingProduct.specification}
                      onChange={(e) => setEditingProduct({ ...editingProduct, specification: e.target.value })}
                      placeholder="请输入产品规格"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      产品型号
                    </label>
                    <input
                      type="text"
                      value={editingProduct.model}
                      onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                      placeholder="请输入产品型号"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    产品描述
                  </label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="请输入产品描述"
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-neutral-900">相关附件</h4>
                  <button
                    onClick={handleAddAttachment}
                    className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    新增附件
                  </button>
                </div>

                {editingProduct.attachments.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-200">
                    暂无附件
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">序号</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">附件名称</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">附件描述</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-600">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {editingProduct.attachments.map((attachment, index) => (
                          <tr key={attachment.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3 text-sm text-neutral-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-neutral-900">{attachment.name}</td>
                            <td className="px-4 py-3 text-sm text-neutral-600">{attachment.description || '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditAttachment(attachment)}
                                  className="text-primary-600 hover:text-primary-800"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAttachment(attachment.id)}
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
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveProduct}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingCategory.id ? '编辑分类' : '新增分类'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  分类名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="请输入分类名称"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  分类描述
                </label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="请输入分类描述"
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-neutral-50 flex justify-end gap-2 rounded-b-lg">
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showAttachmentModal && editingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-neutral-900">
                {editingAttachment.id ? '编辑附件' : '新增附件'}
              </h3>
              <button
                onClick={() => {
                  setShowAttachmentModal(false);
                  setEditingAttachment(null);
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  附件名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingAttachment.name}
                  onChange={(e) => setEditingAttachment({ ...editingAttachment, name: e.target.value })}
                  placeholder="如：产品检测报告"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  附件描述
                </label>
                <textarea
                  value={editingAttachment.description}
                  onChange={(e) => setEditingAttachment({ ...editingAttachment, description: e.target.value })}
                  placeholder="请输入附件描述"
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">附件文件</label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer mb-3"
                  onClick={handleAddAttachmentFile}
                >
                  <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-1" />
                  <p className="text-sm text-neutral-600">点击上传（支持多选）</p>
                  <p className="text-xs text-neutral-500 mt-1">仅支持JPG、PNG、JPEG、PDF格式</p>
                </div>
                {editingAttachment.files.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {editingAttachment.files.map((file, fileIndex) => (
                      <div key={fileIndex} className="relative">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                        />
                        <button
                          onClick={() => handleRemoveAttachmentFile(fileIndex)}
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
                  setShowAttachmentModal(false);
                  setEditingAttachment(null);
                }}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveAttachment}
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

export default ProductInfo;
