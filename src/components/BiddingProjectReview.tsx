import React, { useState } from 'react';
import { ArrowLeft, CreditCard as Edit2, Save, X, FileText, AlertTriangle, CheckCircle, FolderTree, Plus, Trash2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface DocumentDirectoryItem {
  title: string;
  description: string;
  contentFormat?: string;
  children?: DocumentDirectoryItem[];
}

interface ParsedData {
  basicInfo: {
    tenderer: {
      name: string;
      contact: string;
      email: string;
      address: string;
      zipCode: string;
    };
    agent: {
      name: string;
      contact: string;
      email: string;
      address: string;
      zipCode: string;
    };
    projectInfo: {
      projectName: string;
      projectNumber: string;
      packageName: string;
      packageNumber: string;
      lotName: string;
      lotNumber: string;
      projectOverview: string;
      budgetAmount: string;
      allowConsortium: string;
    };
    keyTimeline: {
      bidDeadline: string;
      submissionMethod: string;
      openingTime: string;
      openingLocation: string;
    };
    bidBond: {
      submissionMethod: string;
      amount: string;
      refundPolicy: string;
    };
  };
  qualificationRequirements: string;
  evaluationCriteria: {
    commercial: string;
    technical: string;
  };
  documentRequirements: string;
  risks: string;
  documentDirectory: {
    summary: string;
    files: {
      name: string;
      items: DocumentDirectoryItem[];
    }[];
  };
}

interface BiddingProjectReviewProps {
  projectId: string;
  projectName: string;
  initialData: ParsedData;
  projectStatus?: 'pending' | 'parsing' | 'parsed' | 'failed' | 'completed';
  onBack: () => void;
  onSave: (data: ParsedData) => void;
  onConfirm: (data: ParsedData) => void;
}

const BiddingProjectReview: React.FC<BiddingProjectReviewProps> = ({
  projectId,
  projectName,
  initialData,
  projectStatus = 'parsed',
  onBack,
  onSave,
  onConfirm
}) => {
  const getFormatTemplate = (title: string): string => {
    const normalizedTitle = title.toLowerCase().replace(/\s+/g, '');

    if (normalizedTitle.includes('投标函') || normalizedTitle.includes('投标涵')) {
      return `<p><strong>投标函</strong></p>
<p><br></p>
<p>致：[招标人名称]</p>
<p><br></p>
<p>我方确认收到贵方<strong>[项目名称]</strong>（项目编号：<strong>[项目编号]</strong>）的招标文件，经认真研究，我方愿意按招标文件的要求参加投标，提交投标文件，并承诺如下：</p>
<p><br></p>
<p><strong>一、我方完全接受招标文件的各项条款和要求。</strong></p>
<p><br></p>
<p><strong>二、我方承诺按照招标文件要求完成本项目，质量符合国家现行相关标准及招标文件要求。</strong></p>
<p><br></p>
<p><strong>三、投标有效期：</strong>自开标之日起[XX]天内有效。</p>
<p><br></p>
<p><strong>四、如果我方中标：</strong></p>
<ol>
<li>我方将在收到中标通知书后，在中标通知书规定的时间内与贵方签订合同。</li>
<li>我方将按照招标文件和合同约定履行全部义务。</li>
<li>我方将按招标文件要求提交履约保证金。</li>
</ol>
<p><br></p>
<p><strong>五、我方理解贵方不一定接受最低报价的投标或收到的任何投标。</strong></p>
<p><br></p>
<p>投标人：[投标人名称]（盖章）</p>
<p>法定代表人或授权代表：_________（签字或盖章）</p>
<p>日期：____年____月____日</p>`;
    }

    if (normalizedTitle.includes('授权委托书') || normalizedTitle.includes('委托书')) {
      return `<p><strong>法定代表人授权委托书</strong></p>
<p><br></p>
<p>本授权委托书声明：注册于<strong>[注册地址]</strong>的<strong>[投标人全称]</strong>（以下简称"我公司"）的法定代表人<strong>[法定代表人姓名]</strong>代表我公司授权<strong>[被授权人姓名]</strong>为我公司的合法代理人，就<strong>[项目名称]</strong>（项目编号：<strong>[项目编号]</strong>）投标及合同执行事宜，以我公司名义处理一切与之有关的事务。</p>
<p><br></p>
<p><strong>授权范围：</strong></p>
<ol>
<li>参加该项目的投标活动；</li>
<li>签署、提交投标文件、签订合同及处理有关事宜；</li>
<li>参加开标、谈判、签约等活动；</li>
<li>处理与本项目投标有关的一切事务。</li>
</ol>
<p><br></p>
<p>被授权人在授权范围内签署的一切文件和处理的一切事务，我公司均予以认可。</p>
<p><br></p>
<p>本授权书自签署之日起生效，有效期至本项目履行完毕止。</p>
<p><br></p>
<p><strong>附：</strong></p>
<ul>
<li>法定代表人身份证复印件</li>
<li>被授权人身份证复印件</li>
</ul>
<p><br></p>
<p>投标人：[投标人全称]（盖章）</p>
<p>法定代表人：_________（签字或盖章）</p>
<p>被授权人：_________（签字）</p>
<p><br></p>
<p>法定代表人身份证号：__________________</p>
<p>被授权人身份证号：__________________</p>
<p><br></p>
<p>日期：____年____月____日</p>`;
    }

    return '';
  };

  const normalizeData = (data: any): ParsedData => {
    const normalizedBasicInfo = {
      projectInfo: {
        projectName: data?.basicInfo?.projectInfo?.projectName || '',
        projectNumber: data?.basicInfo?.projectInfo?.projectNumber || '',
        packageName: data?.basicInfo?.projectInfo?.packageName || '',
        packageNumber: data?.basicInfo?.projectInfo?.packageNumber || '',
        lotName: data?.basicInfo?.projectInfo?.lotName || '',
        lotNumber: data?.basicInfo?.projectInfo?.lotNumber || '',
        projectOverview: data?.basicInfo?.projectInfo?.projectOverview || '',
        budgetAmount: data?.basicInfo?.projectInfo?.budgetAmount || '',
        allowConsortium: data?.basicInfo?.projectInfo?.allowConsortium || ''
      },
      tenderer: {
        name: data?.basicInfo?.tenderer?.name || '',
        contact: data?.basicInfo?.tenderer?.contact || '',
        email: data?.basicInfo?.tenderer?.email || '',
        address: data?.basicInfo?.tenderer?.address || '',
        zipCode: data?.basicInfo?.tenderer?.zipCode || ''
      },
      agent: {
        name: data?.basicInfo?.agent?.name || '',
        contact: data?.basicInfo?.agent?.contact || '',
        email: data?.basicInfo?.agent?.email || '',
        address: data?.basicInfo?.agent?.address || '',
        zipCode: data?.basicInfo?.agent?.zipCode || ''
      },
      keyTimeline: {
        bidDeadline: data?.basicInfo?.keyTimeline?.bidDeadline || '',
        submissionMethod: data?.basicInfo?.keyTimeline?.submissionMethod || '',
        openingTime: data?.basicInfo?.keyTimeline?.openingTime || '',
        openingLocation: data?.basicInfo?.keyTimeline?.openingLocation || ''
      },
      bidBond: {
        submissionMethod: data?.basicInfo?.bidBond?.submissionMethod || '',
        amount: data?.basicInfo?.bidBond?.amount || '',
        refundPolicy: data?.basicInfo?.bidBond?.refundPolicy || ''
      }
    };

    if (!data.documentDirectory) {
      return {
        ...data,
        basicInfo: normalizedBasicInfo,
        documentDirectory: {
          summary: `请手动录入${projectStatus === 'parsed' ? '投标文件格式' : '投标文件目录'}。`,
          files: [
            {
              name: '商务文件',
              items: [{ title: '第一章', description: '请输入说明' }]
            }
          ]
        }
      };
    }

    if (data.documentDirectory.files) {
      const processItem = (item: any): any => {
        const template = getFormatTemplate(item.title);
        const newFormat = (item.contentFormat && item.contentFormat.trim()) || template;

        const processedItem: any = {
          ...item,
          contentFormat: newFormat
        };

        if (item.children && item.children.length > 0) {
          processedItem.children = item.children.map(processItem);
        }

        return processedItem;
      };

      const processedFiles = data.documentDirectory.files.map((file: any) => ({
        ...file,
        items: file.items.map(processItem)
      }));

      return {
        ...data,
        basicInfo: normalizedBasicInfo,
        documentDirectory: {
          ...data.documentDirectory,
          files: processedFiles
        }
      };
    }

    const oldCommercial = data.documentDirectory.commercial || '';
    const oldTechnical = data.documentDirectory.technical || '';

    const files = [];

    if (oldCommercial.trim()) {
      files.push({
        name: '商务文件',
        items: oldCommercial.split('\n').filter((line: string) => line.trim()).map((line: string) => {
          const title = line.trim();
          return {
            title,
            description: '',
            contentFormat: getFormatTemplate(title)
          };
        })
      });
    }

    if (oldTechnical.trim()) {
      files.push({
        name: '技术文件',
        items: oldTechnical.split('\n').filter((line: string) => line.trim()).map((line: string) => {
          const title = line.trim();
          return {
            title,
            description: '',
            contentFormat: getFormatTemplate(title)
          };
        })
      });
    }

    if (files.length === 0) {
      files.push({
        name: '商务文件',
        items: [{ title: '第一章', description: '请输入说明' }]
      });
    }

    return {
      ...data,
      basicInfo: normalizedBasicInfo,
      documentDirectory: {
        summary: '本次投标需要提交商务文件和技术文件。',
        files
      }
    };
  };

  const normalizedInitialData = normalizeData(initialData);

  const [data, setData] = useState<ParsedData>(normalizedInitialData);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeCategory, setActiveCategory] = useState('basicInfo');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmedPages, setConfirmedPages] = useState<Set<string>>(new Set());

  const [extraFields, setExtraFields] = useState<{
    projectInfo: Array<{id: string; label: string; value: string}>;
    tenderer: Array<{id: string; label: string; value: string}>;
    agent: Array<{id: string; label: string; value: string}>;
    keyTimeline: Array<{id: string; label: string; value: string}>;
    bidBond: Array<{id: string; label: string; value: string}>;
  }>({
    projectInfo: [],
    tenderer: [],
    agent: [],
    keyTimeline: [],
    bidBond: []
  });

  console.log('BiddingProjectReview - initialData:', initialData);
  console.log('BiddingProjectReview - normalizedInitialData:', normalizedInitialData);
  console.log('BiddingProjectReview - data.basicInfo.projectInfo:', data.basicInfo.projectInfo);

  const categories = [
    { id: 'basicInfo', label: '基础信息', icon: FileText },
    { id: 'qualificationRequirements', label: '资格要求', icon: CheckCircle },
    { id: 'evaluationCriteria', label: '评审要求', icon: CheckCircle },
    { id: 'documentRequirements', label: '投标文件要求', icon: FileText },
    { id: 'risks', label: '风险项/废标项', icon: AlertTriangle },
    { id: 'documentDirectory', label: projectStatus === 'parsed' ? '投标文件格式' : '投标文件目录', icon: FolderTree }
  ];

  const handleEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSaveSection = () => {
    setEditingSection(null);
    setHasChanges(true);
  };

  const addExtraField = (section: 'projectInfo' | 'tenderer' | 'agent' | 'keyTimeline' | 'bidBond') => {
    const newField = {
      id: `field_${Date.now()}`,
      label: '新增字段',
      value: ''
    };
    setExtraFields({
      ...extraFields,
      [section]: [...extraFields[section], newField]
    });
    setHasChanges(true);
  };

  const updateExtraField = (
    section: 'projectInfo' | 'tenderer' | 'agent' | 'keyTimeline' | 'bidBond',
    id: string,
    field: 'label' | 'value',
    newValue: string
  ) => {
    setExtraFields({
      ...extraFields,
      [section]: extraFields[section].map(f =>
        f.id === id ? { ...f, [field]: newValue } : f
      )
    });
    setHasChanges(true);
  };

  const deleteExtraField = (
    section: 'projectInfo' | 'tenderer' | 'agent' | 'keyTimeline' | 'bidBond',
    id: string
  ) => {
    setExtraFields({
      ...extraFields,
      [section]: extraFields[section].filter(f => f.id !== id)
    });
    setHasChanges(true);
  };

  const getCurrentCategoryIndex = () => {
    return categories.findIndex(cat => cat.id === activeCategory);
  };

  const isLastCategory = () => {
    return getCurrentCategoryIndex() === categories.length - 1;
  };

  const handleConfirmCurrentPage = () => {
    const currentIndex = getCurrentCategoryIndex();
    const newConfirmedPages = new Set(confirmedPages);
    newConfirmedPages.add(activeCategory);
    setConfirmedPages(newConfirmedPages);

    if (isLastCategory()) {
      setShowConfirmModal(true);
    } else {
      setActiveCategory(categories[currentIndex + 1].id);
    }
  };

  const handleFinalConfirm = () => {
    setShowConfirmModal(false);
    onConfirm(data);
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  const renderExtraField = (
    section: 'projectInfo' | 'tenderer' | 'agent' | 'keyTimeline' | 'bidBond',
    field: {id: string; label: string; value: string}
  ) => {
    const isEditing = editingSection === section;

    return (
      <div key={field.id} className="px-4 py-3 flex items-start gap-2">
        {isEditing ? (
          <>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateExtraField(section, field.id, 'label', e.target.value)}
              placeholder="字段名称"
              className="w-32 flex-shrink-0 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateExtraField(section, field.id, 'value', e.target.value)}
              placeholder="字段值"
              className="flex-1 px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={() => deleteExtraField(section, field.id)}
              className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <label className="w-32 text-sm font-medium text-neutral-600 flex-shrink-0">{field.label}</label>
            <div className="flex-1 text-sm text-neutral-900 whitespace-pre-wrap">
              {field.value || <span className="text-neutral-400 italic">未填写</span>}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderField = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    section: string,
    type: 'input' | 'textarea' = 'input',
    canDelete: boolean = false,
    onDelete?: () => void,
    hideLabel: boolean = false
  ) => {
    const isEditing = editingSection === section;
    const calculateRows = (text: string) => {
      const lines = text.split('\n').length;
      const estimatedLines = Math.ceil(text.length / 80);
      return Math.max(3, Math.min(15, Math.max(lines, estimatedLines)));
    };

    return (
      <div className="px-4 py-3 flex items-start gap-2">
        {!hideLabel && <label className="w-32 text-sm font-medium text-neutral-600 flex-shrink-0">{label}</label>}
        {isEditing ? (
          <>
            {type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={calculateRows(value)}
                className={`${hideLabel ? 'w-full' : 'flex-1'} px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono`}
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${hideLabel ? 'w-full' : 'flex-1'} px-3 py-1.5 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
              />
            )}
            {canDelete && onDelete && (
              <button
                onClick={onDelete}
                className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className={`${hideLabel ? 'w-full' : 'flex-1'} text-sm text-neutral-900 whitespace-pre-wrap`}>{value}</div>
        )}
      </div>
    );
  };

  const renderSection = (
    title: string,
    section: string,
    children: React.ReactNode,
    canAddFields: boolean = false,
    onAddField?: () => void
  ) => {
    const isEditing = editingSection === section;
    const isCompleted = projectStatus === 'completed';
    return (
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
          {!isCompleted && (
            !isEditing ? (
              <button
                onClick={() => handleEdit(section)}
                className="text-primary-600 hover:text-primary-800 transition-colors flex items-center text-sm"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                编辑
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveSection}
                  className="text-green-600 hover:text-green-800 transition-colors flex items-center text-sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-neutral-600 hover:text-neutral-800 transition-colors flex items-center text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  取消
                </button>
              </div>
            )
          )}
        </div>
        <div className="divide-y divide-neutral-200">
          {children}
        </div>
        {isEditing && canAddFields && onAddField && (
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
            <button
              onClick={onAddField}
              className="w-full px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              新增字段
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderTreeStructure = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="text-sm text-neutral-700 font-mono">
        {lines.map((line, index) => {
          const indent = line.match(/^\s*/)?.[0].length || 0;
          const cleanLine = line.trim();

          if (!cleanLine) return null;

          const isBold = /^[一二三四五六七八九十]+、/.test(cleanLine) || /^\d+\./.test(cleanLine);

          return (
            <div
              key={index}
              style={{ paddingLeft: `${indent * 8}px` }}
              className={`py-1 ${isBold ? 'font-semibold text-neutral-900' : 'text-neutral-700'}`}
            >
              {cleanLine}
            </div>
          );
        })}
      </div>
    );
  };

  const parseContentToList = (content: string): Array<{text: string}> => {
    if (!content || content.trim() === '') return [];

    const lines = content.split('\n').filter(line => line.trim().length > 0);

    return lines.map(line => {
      const trimmed = line.trim();
      return { text: trimmed };
    });
  };

  const renderEditableSection = (
    title: string,
    sectionKey: string,
    content: string,
    onChange: (value: string) => void,
    isDirectory: boolean = false,
    showAsList: boolean = false
  ) => {
    const isEditing = editingSection === sectionKey;
    const isEmpty = !content || content.trim() === '';
    const isCompleted = projectStatus === 'completed';
    const listItems = showAsList ? parseContentToList(content) : [];

    const handleAddListItem = () => {
      const currentContent = content.trim();
      const newContent = currentContent ? currentContent + '\n' : '';
      onChange(newContent);
    };

    const handleDeleteListItem = (index: number) => {
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      lines.splice(index, 1);
      onChange(lines.join('\n'));
    };

    const handleUpdateListItem = (index: number, value: string) => {
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      lines[index] = value;
      onChange(lines.join('\n'));
    };

    return (
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
          {!isCompleted && (
            !isEditing ? (
              <button
                onClick={() => handleEdit(sectionKey)}
                className="text-primary-600 hover:text-primary-800 transition-colors flex items-center text-sm"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                编辑
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveSection}
                  className="text-green-600 hover:text-green-800 transition-colors flex items-center text-sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-neutral-600 hover:text-neutral-800 transition-colors flex items-center text-sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  取消
                </button>
              </div>
            )
          )}
        </div>
        <div className="p-4">
          {isEditing ? (
            <div>
              {isEmpty && isDirectory && (
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>提示：</strong>招标文件中未解析到{projectStatus === 'parsed' ? '投标文件格式' : '投标文件目录'}，请手动输入。建议格式：
                  </p>
                  <div className="mt-2 text-xs text-blue-700 font-mono bg-white rounded p-2">
                    一、资格证明文件<br/>
                    &nbsp;&nbsp;1.1 营业执照副本<br/>
                    &nbsp;&nbsp;1.2 资质证书<br/>
                    二、商务响应文件<br/>
                    &nbsp;&nbsp;2.1 投标函<br/>
                    &nbsp;&nbsp;2.2 法定代表人授权书
                  </div>
                </div>
              )}
              {showAsList ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>编辑提示：</strong>您可以逐项编辑内容，点击"新增"添加新项，点击"删除"移除不需要的项。
                    </p>
                  </div>
                  <div className="space-y-2">
                    {listItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white border border-neutral-200 rounded-lg p-3">
                        <label className="text-sm font-medium text-neutral-600 flex-shrink-0 mt-2 w-20">
                          要求 {index + 1}
                        </label>
                        <textarea
                          value={item.text}
                          onChange={(e) => handleUpdateListItem(index, e.target.value)}
                          rows={2}
                          className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="请输入内容..."
                        />
                        <button
                          onClick={() => handleDeleteListItem(index)}
                          className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors mt-1"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddListItem}
                    className="w-full px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    新增项
                  </button>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  rows={10}
                  placeholder={isDirectory ? `请输入${projectStatus === 'parsed' ? '投标文件格式' : '投标文件目录'}...\n\n建议使用层级格式：\n一、主要章节\n  1.1 子章节\n  1.2 子章节\n二、主要章节\n  2.1 子章节` : ""}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                />
              )}
            </div>
          ) : isEmpty ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 mb-1">未解析到内容</p>
                <p className="text-sm text-yellow-700">
                  招标文件中未找到{isDirectory ? (projectStatus === 'parsed' ? '投标文件格式' : '投标文件目录') : '相关内容'}，请点击"编辑"按钮手动输入。
                </p>
              </div>
            </div>
          ) : isDirectory ? (
            renderTreeStructure(content)
          ) : showAsList ? (
            <div className="divide-y divide-neutral-200">
              {listItems.map((item, index) => (
                <div key={index} className="px-4 py-3 flex items-start">
                  <label className="w-32 text-sm font-medium text-neutral-600 flex-shrink-0">
                    要求 {index + 1}
                  </label>
                  <div className="flex-1 text-sm text-neutral-900">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-700 whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="p-6 space-y-6">
      {projectStatus !== 'completed' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-1">核对提示</h4>
          <p className="text-sm text-blue-700">
            请仔细核对以下解析内容，如有错误或遗漏，请点击"编辑"按钮进行修改。
          </p>
        </div>
      )}

      {renderSection('1. 项目信息', 'projectInfo', (
        <>
          {renderField('项目名称', data.basicInfo.projectInfo.projectName, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, projectName: val } } }), 'projectInfo')}
          {renderField('项目编号', data.basicInfo.projectInfo.projectNumber, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, projectNumber: val } } }), 'projectInfo')}
          {renderField('分标名称', data.basicInfo.projectInfo.packageName, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, packageName: val } } }), 'projectInfo')}
          {renderField('分标编号', data.basicInfo.projectInfo.packageNumber, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, packageNumber: val } } }), 'projectInfo')}
          {renderField('包名称', data.basicInfo.projectInfo.lotName, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, lotName: val } } }), 'projectInfo')}
          {renderField('包号', data.basicInfo.projectInfo.lotNumber, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, lotNumber: val } } }), 'projectInfo')}
          {renderField('招标控制价', data.basicInfo.projectInfo.budgetAmount, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, budgetAmount: val } } }), 'projectInfo')}
          {renderField('是否接受联合体投标', data.basicInfo.projectInfo.allowConsortium, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, allowConsortium: val } } }), 'projectInfo')}
          {renderField('项目概况', data.basicInfo.projectInfo.projectOverview, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, projectInfo: { ...data.basicInfo.projectInfo, projectOverview: val } } }), 'projectInfo', 'textarea')}
          {extraFields.projectInfo.map(field => renderExtraField('projectInfo', field))}
        </>
      ), true, () => addExtraField('projectInfo'))}

      {renderSection('2. 招标人信息', 'tenderer', (
        <>
          {renderField('招标人名称', data.basicInfo.tenderer.name, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, tenderer: { ...data.basicInfo.tenderer, name: val } } }), 'tenderer')}
          {renderField('联系方式', data.basicInfo.tenderer.contact, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, tenderer: { ...data.basicInfo.tenderer, contact: val } } }), 'tenderer')}
          {renderField('邮件', data.basicInfo.tenderer.email, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, tenderer: { ...data.basicInfo.tenderer, email: val } } }), 'tenderer')}
          {renderField('地址', data.basicInfo.tenderer.address, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, tenderer: { ...data.basicInfo.tenderer, address: val } } }), 'tenderer')}
          {renderField('邮编', data.basicInfo.tenderer.zipCode, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, tenderer: { ...data.basicInfo.tenderer, zipCode: val } } }), 'tenderer')}
          {extraFields.tenderer.map(field => renderExtraField('tenderer', field))}
        </>
      ), true, () => addExtraField('tenderer'))}

      {renderSection('3. 代理机构信息', 'agent', (
        <>
          {renderField('代理机构名称', data.basicInfo.agent.name, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, agent: { ...data.basicInfo.agent, name: val } } }), 'agent')}
          {renderField('联系方式', data.basicInfo.agent.contact, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, agent: { ...data.basicInfo.agent, contact: val } } }), 'agent')}
          {renderField('邮件', data.basicInfo.agent.email, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, agent: { ...data.basicInfo.agent, email: val } } }), 'agent')}
          {renderField('地址', data.basicInfo.agent.address, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, agent: { ...data.basicInfo.agent, address: val } } }), 'agent')}
          {renderField('邮编', data.basicInfo.agent.zipCode, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, agent: { ...data.basicInfo.agent, zipCode: val } } }), 'agent')}
          {extraFields.agent.map(field => renderExtraField('agent', field))}
        </>
      ), true, () => addExtraField('agent'))}

      {renderSection('4. 关键时间点及内容', 'keyTimeline', (
        <>
          {renderField('投标截止时间', data.basicInfo.keyTimeline.bidDeadline, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, keyTimeline: { ...data.basicInfo.keyTimeline, bidDeadline: val } } }), 'keyTimeline')}
          {renderField('投标文件递交方式', data.basicInfo.keyTimeline.submissionMethod, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, keyTimeline: { ...data.basicInfo.keyTimeline, submissionMethod: val } } }), 'keyTimeline')}
          {renderField('开标时间', data.basicInfo.keyTimeline.openingTime, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, keyTimeline: { ...data.basicInfo.keyTimeline, openingTime: val } } }), 'keyTimeline')}
          {renderField('开标地点', data.basicInfo.keyTimeline.openingLocation, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, keyTimeline: { ...data.basicInfo.keyTimeline, openingLocation: val } } }), 'keyTimeline')}
          {extraFields.keyTimeline.map(field => renderExtraField('keyTimeline', field))}
        </>
      ), true, () => addExtraField('keyTimeline'))}

      {renderSection('5. 投标保证金', 'bidBond', (
        <>
          {renderField('递交方式', data.basicInfo.bidBond.submissionMethod, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, bidBond: { ...data.basicInfo.bidBond, submissionMethod: val } } }), 'bidBond')}
          {renderField('金额', data.basicInfo.bidBond.amount, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, bidBond: { ...data.basicInfo.bidBond, amount: val } } }), 'bidBond')}
          {renderField('退还规定', data.basicInfo.bidBond.refundPolicy, (val) => setData({ ...data, basicInfo: { ...data.basicInfo, bidBond: { ...data.basicInfo.bidBond, refundPolicy: val } } }), 'bidBond', 'textarea')}
          {extraFields.bidBond.map(field => renderExtraField('bidBond', field))}
        </>
      ), true, () => addExtraField('bidBond'))}
    </div>
  );

  const renderQualificationRequirements = () => {
    const allLines = data.qualificationRequirements.split('\n');
    const requirements = allLines.length === 1 && allLines[0].trim() === '' ? [] : allLines;

    const updateRequirement = (index: number, value: string) => {
      const newRequirements = [...requirements];
      newRequirements[index] = value;
      setData({ ...data, qualificationRequirements: newRequirements.join('\n') });
    };

    const deleteRequirement = (index: number) => {
      const newRequirements = requirements.filter((_, i) => i !== index);
      setData({
        ...data,
        qualificationRequirements: newRequirements.length > 0 ? newRequirements.join('\n') : ''
      });
    };

    const addRequirement = () => {
      const newRequirements = [...requirements, '新增资格要求'];
      setData({ ...data, qualificationRequirements: newRequirements.join('\n') });
    };

    return (
      <div className="p-6 space-y-4">
        {projectStatus !== 'completed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-1">核对提示</h4>
            <p className="text-sm text-blue-700">
              请仔细核对以下解析内容，如有错误或遗漏，请点击"编辑"按钮进行修改。
            </p>
          </div>
        )}
        {renderSection(
          '资格要求',
          'qualificationRequirements',
          (
            <>
              {requirements.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">
                  暂无资格要求，点击"新增字段"添加
                </div>
              ) : (
                requirements.map((req, index) =>
                  renderField(
                    '',
                    req,
                    (val) => updateRequirement(index, val),
                    'qualificationRequirements',
                    'textarea',
                    true,
                    () => deleteRequirement(index),
                    true
                  )
                )
              )}
            </>
          ),
          true,
          addRequirement
        )}
      </div>
    );
  };

  const renderEvaluationCriteria = () => {
    const allCommercialLines = data.evaluationCriteria.commercial.split('\n');
    const commercialItems = allCommercialLines.length === 1 && allCommercialLines[0].trim() === '' ? [] : allCommercialLines;

    const allTechnicalLines = data.evaluationCriteria.technical.split('\n');
    const technicalItems = allTechnicalLines.length === 1 && allTechnicalLines[0].trim() === '' ? [] : allTechnicalLines;

    const updateCommercialItem = (index: number, value: string) => {
      const newItems = [...commercialItems];
      newItems[index] = value;
      setData({
        ...data,
        evaluationCriteria: { ...data.evaluationCriteria, commercial: newItems.join('\n') }
      });
    };

    const deleteCommercialItem = (index: number) => {
      const newItems = commercialItems.filter((_, i) => i !== index);
      setData({
        ...data,
        evaluationCriteria: { ...data.evaluationCriteria, commercial: newItems.length > 0 ? newItems.join('\n') : '' }
      });
    };

    const addCommercialItem = () => {
      const newItems = [...commercialItems, '新增商务评分项'];
      setData({
        ...data,
        evaluationCriteria: { ...data.evaluationCriteria, commercial: newItems.join('\n') }
      });
    };

    const updateTechnicalItem = (index: number, value: string) => {
      const newItems = [...technicalItems];
      newItems[index] = value;
      setData({
        ...data,
        evaluationCriteria: { ...data.evaluationCriteria, technical: newItems.join('\n') }
      });
    };

    const deleteTechnicalItem = (index: number) => {
      const newItems = technicalItems.filter((_, i) => i !== index);
      setData({
        ...data,
        evaluationCriteria: { ...data.evaluationCriteria, technical: newItems.length > 0 ? newItems.join('\n') : '' }
      });
    };

    const addTechnicalItem = () => {
      const newItems = [...technicalItems, '新增技术评分项'];
      setData({
        ...data,
        evaluationCriteria: { ...data.evaluationCriteria, technical: newItems.join('\n') }
      });
    };

    return (
      <div className="p-6 space-y-4">
        {projectStatus !== 'completed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-1">核对提示</h4>
            <p className="text-sm text-blue-700">
              请仔细核对以下解析内容，如有错误或遗漏，请点击"编辑"按钮进行修改。
            </p>
          </div>
        )}
        {renderSection(
          '商务评分标准',
          'evaluationCommercial',
          (
            <>
              {commercialItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">
                  暂无商务评分标准，点击"新增字段"添加
                </div>
              ) : (
                commercialItems.map((item, index) =>
                  renderField(
                    '',
                    item,
                    (val) => updateCommercialItem(index, val),
                    'evaluationCommercial',
                    'textarea',
                    true,
                    () => deleteCommercialItem(index),
                    true
                  )
                )
              )}
            </>
          ),
          true,
          addCommercialItem
        )}
        {renderSection(
          '技术评分标准',
          'evaluationTechnical',
          (
            <>
              {technicalItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">
                  暂无技术评分标准，点击"新增字段"添加
                </div>
              ) : (
                technicalItems.map((item, index) =>
                  renderField(
                    '',
                    item,
                    (val) => updateTechnicalItem(index, val),
                    'evaluationTechnical',
                    'textarea',
                    true,
                    () => deleteTechnicalItem(index),
                    true
                  )
                )
              )}
            </>
          ),
          true,
          addTechnicalItem
        )}
      </div>
    );
  };

  const renderDocumentRequirements = () => {
    const allLines = data.documentRequirements.split('\n');
    const requirements = allLines.length === 1 && allLines[0].trim() === '' ? [] : allLines;

    const updateRequirement = (index: number, value: string) => {
      const newRequirements = [...requirements];
      newRequirements[index] = value;
      setData({ ...data, documentRequirements: newRequirements.join('\n') });
    };

    const deleteRequirement = (index: number) => {
      const newRequirements = requirements.filter((_, i) => i !== index);
      setData({
        ...data,
        documentRequirements: newRequirements.length > 0 ? newRequirements.join('\n') : ''
      });
    };

    const addDocumentRequirement = () => {
      const newRequirements = [...requirements, '新增投标文件要求'];
      setData({ ...data, documentRequirements: newRequirements.join('\n') });
    };

    return (
      <div className="p-6 space-y-4">
        {projectStatus !== 'completed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-1">核对提示</h4>
            <p className="text-sm text-blue-700">
              请仔细核对以下解析内容，如有错误或遗漏，请点击"编辑"按钮进行修改。
            </p>
          </div>
        )}
        {renderSection(
          '投标文件要求',
          'documentRequirements',
          (
            <>
              {requirements.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">
                  暂无投标文件要求，点击"新增字段"添加
                </div>
              ) : (
                requirements.map((req, index) =>
                  renderField(
                    '',
                    req,
                    (val) => updateRequirement(index, val),
                    'documentRequirements',
                    'textarea',
                    true,
                    () => deleteRequirement(index),
                    true
                  )
                )
              )}
            </>
          ),
          true,
          addDocumentRequirement
        )}
      </div>
    );
  };

  const renderRisks = () => {
    const allLines = data.risks.split('\n');
    const allItems = allLines.filter(line => line.trim() !== '');

    const riskItems: string[] = [];
    const invalidItems: string[] = [];

    allItems.forEach(item => {
      const trimmed = item.trim();
      if (trimmed.includes('废标') || trimmed.includes('无效标')) {
        invalidItems.push(trimmed);
      } else {
        riskItems.push(trimmed);
      }
    });

    const updateRiskItem = (index: number, value: string) => {
      const newRisks = [...riskItems];
      newRisks[index] = value;
      const combined = [...newRisks, ...invalidItems];
      setData({ ...data, risks: combined.join('\n') });
    };

    const deleteRiskItem = (index: number) => {
      const newRisks = riskItems.filter((_, i) => i !== index);
      const combined = [...newRisks, ...invalidItems];
      setData({ ...data, risks: combined.length > 0 ? combined.join('\n') : '' });
    };

    const addRiskItem = () => {
      const newRisks = [...riskItems, '新增风险项'];
      const combined = [...newRisks, ...invalidItems];
      setData({ ...data, risks: combined.join('\n') });
    };

    const updateInvalidItem = (index: number, value: string) => {
      const newInvalids = [...invalidItems];
      newInvalids[index] = value;
      const combined = [...riskItems, ...newInvalids];
      setData({ ...data, risks: combined.join('\n') });
    };

    const deleteInvalidItem = (index: number) => {
      const newInvalids = invalidItems.filter((_, i) => i !== index);
      const combined = [...riskItems, ...newInvalids];
      setData({ ...data, risks: combined.length > 0 ? combined.join('\n') : '' });
    };

    const addInvalidItem = () => {
      const newInvalids = [...invalidItems, '新增废标项'];
      const combined = [...riskItems, ...newInvalids];
      setData({ ...data, risks: combined.join('\n') });
    };

    return (
      <div className="p-6 space-y-4">
        {projectStatus !== 'completed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-1">核对提示</h4>
            <p className="text-sm text-blue-700">
              请仔细核对以下解析内容，如有错误或遗漏，请点击"编辑"按钮进行修改。
            </p>
          </div>
        )}
        {renderSection(
          '风险项',
          'riskItems',
          (
            <>
              {riskItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">
                  暂无风险项，点击"新增字段"添加
                </div>
              ) : (
                riskItems.map((risk, index) =>
                  renderField(
                    '',
                    risk,
                    (val) => updateRiskItem(index, val),
                    'riskItems',
                    'textarea',
                    true,
                    () => deleteRiskItem(index),
                    true
                  )
                )
              )}
            </>
          ),
          true,
          addRiskItem
        )}
        {renderSection(
          '废标项',
          'invalidItems',
          (
            <>
              {invalidItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500">
                  暂无废标项，点击"新增字段"添加
                </div>
              ) : (
                invalidItems.map((item, index) =>
                  renderField(
                    '',
                    item,
                    (val) => updateInvalidItem(index, val),
                    'invalidItems',
                    'textarea',
                    true,
                    () => deleteInvalidItem(index),
                    true
                  )
                )
              )}
            </>
          ),
          true,
          addInvalidItem
        )}
      </div>
    );
  };

  const renderDirectoryItem = (item: DocumentDirectoryItem, level: number = 0, fileIndex: number, itemPath: number[]): React.ReactNode => {
    const isEditing = editingSection === 'documentDirectory';
    const indent = level * 24;

    const updateItem = (field: 'title' | 'description' | 'contentFormat', value: string) => {
      const newFiles = [...data.documentDirectory.files];
      let current: any = newFiles[fileIndex].items;

      for (let i = 0; i < itemPath.length - 1; i++) {
        current = current[itemPath[i]].children;
      }

      current[itemPath[itemPath.length - 1]][field] = value;

      setData({
        ...data,
        documentDirectory: { ...data.documentDirectory, files: newFiles }
      });
    };


    const addChild = () => {
      const newFiles = [...data.documentDirectory.files];
      let current: any = newFiles[fileIndex].items;

      for (let i = 0; i < itemPath.length; i++) {
        if (i === itemPath.length - 1) {
          if (!current[itemPath[i]].children) {
            current[itemPath[i]].children = [];
          }
          current[itemPath[i]].children.push({ title: '新增章节', description: '请输入说明' });
        } else {
          current = current[itemPath[i]].children;
        }
      }

      setData({
        ...data,
        documentDirectory: { ...data.documentDirectory, files: newFiles }
      });
    };

    const removeItem = () => {
      const newFiles = [...data.documentDirectory.files];
      let current: any = newFiles[fileIndex].items;

      if (itemPath.length === 1) {
        newFiles[fileIndex].items.splice(itemPath[0], 1);
      } else {
        for (let i = 0; i < itemPath.length - 1; i++) {
          current = current[itemPath[i]].children;
        }
        current.splice(itemPath[itemPath.length - 1], 1);
      }

      setData({
        ...data,
        documentDirectory: { ...data.documentDirectory, files: newFiles }
      });
    };

    return (
      <div key={itemPath.join('-')} className="mb-2">
        <div style={{ paddingLeft: `${indent}px` }} className="border-l-2 border-neutral-200 pl-3">
          {isEditing ? (
            <div className="space-y-2 bg-neutral-50 p-3 rounded border border-neutral-200">
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem('title', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium"
                  placeholder="章节标题"
                />
                <button
                  onClick={addChild}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="添加子章节"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {level > 0 && (
                  <button
                    onClick={removeItem}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="删除章节"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={item.description}
                onChange={(e) => updateItem('description', e.target.value)}
                rows={2}
                className="w-full px-2 py-1 text-xs text-neutral-600 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="说明"
              />

              {projectStatus === 'parsed' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-700">内容格式：</label>
                  <RichTextEditor
                    value={item.contentFormat || ''}
                    onChange={(value) => updateItem('contentFormat', value)}
                    placeholder="输入内容格式要求（支持富文本格式）..."
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="font-medium text-sm text-neutral-900">{item.title}</div>
              {item.description && (
                <div className="text-xs text-neutral-600 mt-0.5">说明：{item.description}</div>
              )}
              {projectStatus === 'parsed' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-blue-900">内容格式：</div>
                    {item.contentFormat && item.contentFormat.replace(/<[^>]*>/g, '').trim() && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                        已设置格式要求
                      </span>
                    )}
                  </div>
                  {item.contentFormat && item.contentFormat.replace(/<[^>]*>/g, '').trim() ? (
                    <div
                      className="text-xs text-neutral-800 prose prose-sm max-w-none bg-white p-3 rounded border border-blue-100"
                      style={{
                        lineHeight: '1.6',
                      }}
                      dangerouslySetInnerHTML={{ __html: item.contentFormat }}
                    />
                  ) : (
                    <div className="text-xs text-blue-600 italic bg-blue-100 p-2 rounded text-center">
                      暂无格式要求
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {item.children && item.children.length > 0 && (
          <div className="mt-2">
            {item.children.map((child, idx) =>
              renderDirectoryItem(child, level + 1, fileIndex, [...itemPath, idx])
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDocumentDirectory = () => {
    const isEditing = editingSection === 'documentDirectory';

    if (!data.documentDirectory || !data.documentDirectory.files) {
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{projectStatus === 'parsed' ? '投标文件格式' : '投标文件目录'}数据格式错误，请重新解析或手动录入。</p>
          </div>
        </div>
      );
    }

    const addFile = () => {
      const newFiles = [...data.documentDirectory.files, {
        name: '新文件',
        items: [{ title: '第一章', description: '请输入说明' }]
      }];
      setData({
        ...data,
        documentDirectory: { ...data.documentDirectory, files: newFiles }
      });
    };

    const removeFile = (index: number) => {
      const newFiles = data.documentDirectory.files.filter((_, i) => i !== index);
      setData({
        ...data,
        documentDirectory: { ...data.documentDirectory, files: newFiles }
      });
    };

    const updateFileName = (index: number, name: string) => {
      const newFiles = [...data.documentDirectory.files];
      newFiles[index].name = name;
      setData({
        ...data,
        documentDirectory: { ...data.documentDirectory, files: newFiles }
      });
    };

    const addItemToFile = (fileIndex: number) => {
      const newFiles = [...data.documentDirectory.files];
      newFiles[fileIndex].items.push({ title: '新增章节', description: '请输入说明' });
      setData({
        ...data,
        documentDirectory: { ...data.documentDirectory, files: newFiles }
      });
    };

    return (
      <div className="p-6 space-y-4">
        {projectStatus !== 'completed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-1">核对提示</h4>
            <p className="text-sm text-blue-700">
              请仔细核对以下解析内容，如有错误或遗漏，请点击"编辑"按钮进行修改。如果招标文件中没有提供{projectStatus === 'parsed' ? '投标文件格式' : '投标文件目录'}，请手动录入。
            </p>
          </div>
        )}

        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-neutral-900">{projectStatus === 'parsed' ? '投标文件格式' : '投标文件目录'}</h4>
            {!projectStatus || projectStatus !== 'completed' ? (
              !isEditing ? (
                <button
                  onClick={() => handleEdit('documentDirectory')}
                  className="text-primary-600 hover:text-primary-800 transition-colors flex items-center text-sm"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  编辑
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveSection}
                    className="text-green-600 hover:text-green-800 transition-colors flex items-center text-sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-neutral-600 hover:text-neutral-800 transition-colors flex items-center text-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </button>
                </div>
              )
            ) : null}
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="text-sm text-amber-900 whitespace-pre-wrap">{data.documentDirectory.summary}</div>
            </div>

            {data.documentDirectory.files.map((file, fileIndex) => (
              <div key={fileIndex} className="border border-neutral-300 rounded-lg overflow-hidden">
                <div className="bg-neutral-100 px-3 py-2 flex items-center justify-between">
                  {isEditing ? (
                    <input
                      type="text"
                      value={file.name}
                      onChange={(e) => updateFileName(fileIndex, e.target.value)}
                      className="flex-1 px-2 py-1 text-sm font-semibold border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="文件名称"
                    />
                  ) : (
                    <h5 className="text-sm font-semibold text-neutral-900">{file.name}</h5>
                  )}
                  {isEditing && (
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => addItemToFile(fileIndex)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded text-xs"
                        title="添加章节"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      {data.documentDirectory.files.length > 1 && (
                        <button
                          onClick={() => removeFile(fileIndex)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
                          title="删除文件"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  {file.items.map((item, itemIndex) =>
                    renderDirectoryItem(item, 0, fileIndex, [itemIndex])
                  )}
                </div>
              </div>
            ))}

            {isEditing && (
              <button
                onClick={addFile}
                className="w-full py-2 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加文件
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'basicInfo':
        return renderBasicInfo();
      case 'qualificationRequirements':
        return renderQualificationRequirements();
      case 'evaluationCriteria':
        return renderEvaluationCriteria();
      case 'documentRequirements':
        return renderDocumentRequirements();
      case 'risks':
        return renderRisks();
      case 'documentDirectory':
        return renderDocumentDirectory();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-medium text-neutral-900">{projectName}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已解析
              </span>
            </div>
            <p className="text-sm text-neutral-500">核对解析内容</p>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-neutral-200">
        <div className="flex overflow-x-auto">
          {categories.map(category => {
            const Icon = category.icon;
            const isConfirmed = confirmedPages.has(category.id);
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap relative ${
                  activeCategory === category.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.label}</span>
                {isConfirmed && projectStatus !== 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {renderCategoryContent()}
      </div>

      <div className="bg-white border-t border-neutral-200 px-6 py-4 flex justify-between gap-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
        >
          返回上一级
        </button>
        {projectStatus !== 'completed' && (
          <button
            onClick={handleConfirmCurrentPage}
            className="px-6 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            {isLastCategory() ? '核对完成' : '下一级'}
          </button>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">确认核对完成</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-neutral-700 mb-4">
                所有页面已核对完成。确认后将无法再次修改解析内容，请确保所有信息已核对无误。
              </p>
              <p className="text-sm text-amber-600 flex items-start">
                <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>此操作不可撤销，是否确认提交？</span>
              </p>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleFinalConfirm}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingProjectReview;
