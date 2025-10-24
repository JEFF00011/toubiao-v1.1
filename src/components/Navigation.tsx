import React, { useState } from 'react';
import { FileText, User, Bell, LogOut, Key, X } from 'lucide-react';

interface NavigationProps {
  username?: string;
  role?: string;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ username = '管理员', role = '未知角色', onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotificationDetail, setShowNotificationDetail] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const notifications = [
    { id: 1, type: 'warning', title: '证书即将过期', message: '企业资质证书将于7天后过期，请及时更新', time: '2小时前', detail: '您的企业资质证书（编号：ZZ202301001）将于2024年10月31日到期。为避免影响投标活动，请尽快准备相关材料进行续期。续期所需材料包括：营业执照副本、组织机构代码证、税务登记证等。' },
    { id: 2, type: 'warning', title: '投标保证金到期提醒', message: '某医院项目保证金将于3天后到期', time: '5小时前', detail: '项目名称：某市人民医院医疗设备采购项目\n项目编号：BID2024001\n保证金金额：50,000元\n到期时间：2024年10月27日\n\n请及时办理保证金退还手续，如需延期请联系项目负责人。' },
  ];

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      setShowUserMenu(false);
      if (onLogout) {
        onLogout();
      }
    } else {
      setShowUserMenu(false);
    }
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('请填写完整信息');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('两次输入的新密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      alert('新密码长度不能少于6位');
      return;
    }
    alert('密码修改成功');
    setShowChangePassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    setShowAllNotifications(true);
  };

  const handleNotificationClick = (notif: any) => {
    setSelectedNotification(notif);
    setShowNotifications(false);
    setShowNotificationDetail(true);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-500';
      case 'success':
        return 'bg-green-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <nav className="h-16 flex-shrink-0 bg-white border-b border-neutral-200 z-50">
      <div className="h-full px-6 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">AI投标助手 v1.0</h1>
              <p className="text-xs text-neutral-500">智能标书生成系统</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-neutral-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 z-50">
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-neutral-900">通知中心</h3>
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                        {notifications.length}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 px-4 text-center">
                        <Bell className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                        <p className="text-sm text-neutral-500">暂无通知</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-all duration-150 last:border-b-0 cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${getNotificationIcon(notif.type)}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-900 text-sm leading-snug">{notif.title}</p>
                              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{notif.message}</p>
                              <p className="text-xs text-neutral-400 mt-1.5">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
                    <button
                      onClick={handleViewAllNotifications}
                      className="w-full text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      查看全部通知
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-3 hover:bg-neutral-50 rounded-lg p-2 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-700">{username}</p>
                  <p className="text-xs text-neutral-500">{role}</p>
                </div>
                <div className="bg-neutral-100 p-2 rounded-full">
                  <User className="w-4.5 h-4.5 text-neutral-600" />
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                  <button
                    onClick={() => {
                      setShowChangePassword(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <Key className="w-4 h-4 mr-3 text-neutral-600" />
                    修改密码
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-neutral-100"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {showNotificationDetail && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getNotificationIcon(selectedNotification.type)}`}></div>
                <h3 className="text-lg font-semibold text-neutral-900">{selectedNotification.title}</h3>
              </div>
              <button
                onClick={() => {
                  setShowNotificationDetail(false);
                  setSelectedNotification(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {selectedNotification.detail}
              </p>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-400">{selectedNotification.time}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowNotificationDetail(false);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  alert('标记为已读');
                  setShowNotificationDetail(false);
                  setSelectedNotification(null);
                }}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                标记为已读
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">全部通知</h3>
              <button
                onClick={() => setShowAllNotifications(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setShowAllNotifications(false);
                      handleNotificationClick(notif);
                    }}
                    className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${getNotificationIcon(notif.type)}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-neutral-900">{notif.title}</p>
                          <span className="text-xs text-neutral-400 ml-4">{notif.time}</span>
                        </div>
                        <p className="text-sm text-neutral-600 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-xl">
              <button
                onClick={() => alert('全部标记为已读')}
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                全部标记为已读
              </button>
              <button
                onClick={() => setShowAllNotifications(false)}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">修改密码</h3>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  旧密码
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="请输入旧密码"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（不少于6位）"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-neutral-200">
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;