import React, { useState, useEffect } from 'react';
import { Upload, Settings, Database, Brain, Award, Users, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import Login from './components/Login';
import Navigation from './components/Navigation';
import DatabaseManager from './components/DatabaseManager';
import BiddingProjectManager from './components/BiddingProjectManager';
import GeneratedDocumentManager from './components/GeneratedDocumentManager';
import BidDocumentCheck from './components/BidDocumentCheck';
import FormatSettings from './components/FormatSettings';
import UserManagement from './components/UserManagement';
import CompanyManagement from './components/CompanyManagement';

export type TabType = 'database' | 'upload' | 'generate' | 'check' | 'settings' | 'users' | 'companies';

interface MenuItem {
  id: TabType;
  label: string;
  icon: any;
  children?: MenuItem[];
  roles?: string[];
}

const rolePermissions = {
  '超级管理员': {
    view: ['database', 'upload', 'generate', 'check', 'settings', 'users', 'companies'],
    edit: ['database', 'upload', 'generate', 'check', 'settings', 'users', 'companies'],
    delete: ['upload', 'generate', 'check', 'companies', 'database'],
    canDeleteSelf: false
  },
  '项目管理员': {
    view: ['database', 'upload', 'generate', 'check', 'settings', 'users', 'companies'],
    edit: ['database', 'upload', 'generate', 'check', 'users'],
    delete: ['upload', 'generate', 'check', 'database', 'users'],
    dataScope: 'company',
    canDeleteSelf: false
  },
  '普通用户': {
    view: ['database', 'upload', 'generate', 'check'],
    edit: ['upload', 'generate', 'check'],
    delete: ['upload', 'generate', 'check'],
    viewOwnProfileOnly: true,
    canDeleteSelf: false,
    readOnlyDatabase: true
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ username: '', role: '' });
  const [activeTab, setActiveTab] = useState<TabType>('database');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [documentFormat, setDocumentFormat] = useState({
    fontSize: 14,
    fontFamily: 'SimSun',
    lineHeight: 1.5,
    margin: 25,
    alignment: 'left'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (username: string, role: string) => {
    const user = { username, role };
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser({ username: '', role: '' });
    localStorage.removeItem('currentUser');
  };

  React.useEffect(() => {
    const handleNavigateToGenerate = () => {
      setActiveTab('generate');
    };

    window.addEventListener('navigate-to-generate', handleNavigateToGenerate);
    return () => {
      window.removeEventListener('navigate-to-generate', handleNavigateToGenerate);
    };
  }, []);

  const allMenuItems: MenuItem[] = [
    { id: 'database' as TabType, label: '企业知识库', icon: Database, roles: ['超级管理员', '项目管理员', '普通用户'] },
    { id: 'upload' as TabType, label: '招标项目管理', icon: Upload, roles: ['超级管理员', '项目管理员', '普通用户'] },
    { id: 'generate' as TabType, label: '投标文件生成', icon: Brain, roles: ['超级管理员', '项目管理员', '普通用户'] },
    { id: 'check' as TabType, label: '投标文件检查', icon: Award, roles: ['超级管理员', '项目管理员', '普通用户'] },
    {
      id: 'settings' as TabType,
      label: '系统管理',
      icon: Settings,
      roles: ['超级管理员', '项目管理员'],
      children: [
        { id: 'users' as TabType, label: '用户管理', icon: Users, roles: ['超级管理员', '项目管理员'] },
        { id: 'companies' as TabType, label: '企业管理', icon: Building2, roles: ['超级管理员', '项目管理员'] }
      ]
    },
  ];

  const hasPermission = (tabId: TabType, action: 'view' | 'edit' | 'delete' = 'view'): boolean => {
    const permissions = rolePermissions[currentUser.role as keyof typeof rolePermissions];
    if (!permissions) return false;
    return permissions[action]?.includes(tabId) || false;
  };

  const canDeleteAccount = (): boolean => {
    const permissions = rolePermissions[currentUser.role as keyof typeof rolePermissions];
    return permissions?.canDeleteSelf !== false;
  };

  const getDataScope = (): string | undefined => {
    const permissions = rolePermissions[currentUser.role as keyof typeof rolePermissions];
    return permissions?.dataScope;
  };

  const isViewOwnProfileOnly = (): boolean => {
    const permissions = rolePermissions[currentUser.role as keyof typeof rolePermissions];
    return permissions?.viewOwnProfileOnly === true;
  };

  const isReadOnlyDatabase = (): boolean => {
    const permissions = rolePermissions[currentUser.role as keyof typeof rolePermissions];
    return permissions?.readOnlyDatabase === true;
  };

  const filterMenuByRole = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      if (!item.roles || item.roles.includes(currentUser.role)) {
        if (item.children) {
          const filteredChildren = filterMenuByRole(item.children);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          return false;
        }
        return true;
      }
      return false;
    }).map(item => {
      if (item.children) {
        return { ...item, children: filterMenuByRole(item.children) };
      }
      return item;
    });
  };

  const menuItems = filterMenuByRole(allMenuItems);

  useEffect(() => {
    if (isLoggedIn && !hasPermission(activeTab, 'view')) {
      const firstAvailableTab = menuItems[0]?.id || 'database';
      setActiveTab(firstAvailableTab);
    }
  }, [currentUser.role, isLoggedIn]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const renderActiveTab = () => {
    if (!hasPermission(activeTab, 'view')) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">权限不足</h3>
            <p className="text-neutral-600">您没有权限访问该功能模块</p>
          </div>
        </div>
      );
    }

    const canEdit = hasPermission(activeTab, 'edit');
    const canDelete = hasPermission(activeTab, 'delete');
    const dataScope = getDataScope();
    const viewOwnOnly = isViewOwnProfileOnly();
    const readOnlyDatabase = isReadOnlyDatabase();

    switch (activeTab) {
      case 'database':
        return <DatabaseManager canEdit={canEdit} canDelete={canDelete} dataScope={dataScope} readOnly={readOnlyDatabase} currentUser={currentUser} />;
      case 'upload':
        return <BiddingProjectManager canEdit={canEdit} canDelete={canDelete} dataScope={dataScope} />;
      case 'generate':
        return <GeneratedDocumentManager canEdit={canEdit} canDelete={canDelete} dataScope={dataScope} />;
      case 'check':
        return <BidDocumentCheck canEdit={canEdit} canDelete={canDelete} dataScope={dataScope} />;
      case 'settings':
        return <FormatSettings format={documentFormat} onUpdate={setDocumentFormat} />;
      case 'users':
        return <UserManagement canEdit={canEdit} canDelete={canDelete} viewOwnOnly={viewOwnOnly} currentUser={currentUser} dataScope={dataScope} />;
      case 'companies':
        return <CompanyManagement canEdit={canEdit} canDelete={canDelete} dataScope={dataScope} />;
      default:
        return <BiddingProjectManager canEdit={canEdit} canDelete={canDelete} dataScope={dataScope} />;
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = activeTab === item.id;
    const isSubmenu = level > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              setActiveTab(item.id);
            }
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left rounded-lg transition-all duration-150 ${
            isSubmenu ? 'pl-9' : ''
          } ${
            isActive && !hasChildren
              ? 'bg-primary-50 text-primary-700 font-medium'
              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
          }`}
        >
          <div className="flex items-center">
            {!isSubmenu && <Icon className={`w-4.5 h-4.5 mr-2.5 ${isActive && !hasChildren ? 'text-primary-600' : 'text-neutral-400'}`} />}
            {item.label}
          </div>
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-50 flex flex-col">
      {/* Top Navigation - Fixed Height */}
      <Navigation username={currentUser.username} role={currentUser.role} onLogout={handleLogout} />

      {/* Bottom Container - Split Left/Right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Fixed Width */}
        <div className="w-64 bg-white border-r border-neutral-200 overflow-y-auto flex-shrink-0">
          <div className="py-6 px-3">
            <nav className="space-y-1">
              {menuItems.map(item => renderMenuItem(item))}
            </nav>
          </div>
        </div>

        {/* Right Main Content - Fixed Width, No Horizontal Scroll */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-6 max-w-full">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;