import React, { useState, useEffect } from 'react';
import GeneratedDocumentList from './GeneratedDocumentList';
import DocumentGenerator from './DocumentGenerator';

interface GeneratedDocument {
  id: string;
  name: string;
  fileTypes: string[];
  projectName: string;
  companyName: string;
  status: 'draft' | 'generating' | 'completed';
  createdAt: string;
  generationProgress?: number;
}

interface BiddingProject {
  id: string;
  projectName: string;
  status: string;
  uploadTime: string;
  parsedData?: any;
  documentDirectory?: {
    commercial: string;
    technical: string;
  };
}

interface GeneratedDocumentManagerProps {
  preSelectedProject?: BiddingProject | null;
  canEdit?: boolean;
  canDelete?: boolean;
  dataScope?: string;
}

const GeneratedDocumentManager: React.FC<GeneratedDocumentManagerProps> = ({
  preSelectedProject: propPreSelectedProject,
  canEdit = true,
  canDelete = true
}) => {
  const [documents, setDocuments] = useState<GeneratedDocument[]>(() => {
    const savedData = localStorage.getItem('generated_documents');
    const savedVersion = localStorage.getItem('generated_documents_version');
    const currentVersion = '1.2';

    // 如果版本不匹配，使用新的默认数据
    if (savedData && savedVersion === currentVersion) {
      return JSON.parse(savedData);
    }

    // 更新版本号
    localStorage.setItem('generated_documents_version', currentVersion);

    // 返回包含3条示例数据（包括生成中状态）
    return [
      {
        id: '1',
        name: '某市智慧城市建设项目投标文件',
        fileTypes: ['commercial', 'technical'],
        projectName: '某市智慧城市建设项目',
        companyName: '北京某某科技有限公司',
        status: 'completed',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: '教育信息化平台投标文件',
        fileTypes: ['commercial'],
        projectName: '教育信息化平台采购项目',
        companyName: '上海XX信息技术有限公司',
        status: 'draft',
        createdAt: '2024-01-16'
      },
      {
        id: '3',
        name: '医院设备采购项目投标文件',
        fileTypes: ['commercial', 'technical'],
        projectName: '医院设备采购项目',
        companyName: '深圳某某医疗科技有限公司',
        status: 'generating',
        createdAt: '2024-01-17',
        generationProgress: 45
      }
    ];
  });

  const [preSelectedProject, setPreSelectedProject] = useState<BiddingProject | null>(() => {
    if (propPreSelectedProject) return propPreSelectedProject;
    const stored = localStorage.getItem('preselected_bidding_project');
    if (stored) {
      localStorage.removeItem('preselected_bidding_project');
      return JSON.parse(stored);
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'view'>(() => {
    return preSelectedProject ? 'create' : 'list';
  });
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);

  useEffect(() => {
    localStorage.setItem('generated_documents', JSON.stringify(documents));
  }, [documents]);

  const handleCreateDocument = () => {
    setCurrentView('create');
  };

  const handleViewDocument = (doc: GeneratedDocument) => {
    setSelectedDocument(doc);
    setCurrentView('view');
  };

  const handleEditDocument = (doc: GeneratedDocument) => {
    setSelectedDocument(doc);
    setCurrentView('edit');
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId));
  };

  const handleDownloadDocument = (doc: GeneratedDocument) => {
    alert(`下载文件: ${doc.name}`);
  };

  const handleCloseGenerator = () => {
    setCurrentView('list');
    setSelectedDocument(null);
  };

  const handleSaveDocument = (documentData: any) => {
    const newDocument: GeneratedDocument = {
      id: String(Date.now()),
      name: documentData.name,
      fileTypes: documentData.fileTypes,
      projectName: documentData.projectName,
      companyName: documentData.companyName,
      status: 'completed',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDocuments([...documents, newDocument]);
    setCurrentView('list');
  };

  if (currentView === 'create') {
    return <DocumentGenerator onClose={handleCloseGenerator} preSelectedProject={preSelectedProject} mode="create" />;
  }

  if (currentView === 'edit') {
    return <DocumentGenerator onClose={handleCloseGenerator} preSelectedProject={null} mode="edit" existingDocument={selectedDocument} />;
  }

  if (currentView === 'view') {
    return <DocumentGenerator onClose={handleCloseGenerator} preSelectedProject={null} mode="view" existingDocument={selectedDocument} />;
  }

  return (
    <GeneratedDocumentList
      documents={documents}
      onCreateClick={handleCreateDocument}
      onViewDocument={handleViewDocument}
      onEditDocument={handleEditDocument}
      onDeleteDocument={handleDeleteDocument}
      onDownloadDocument={handleDownloadDocument}
    />
  );
};

export default GeneratedDocumentManager;
