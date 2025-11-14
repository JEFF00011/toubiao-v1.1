import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, role: string) => void;
}

interface TestAccount {
  username: string;
  password: string;
  role: string;
  displayName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const testAccounts: TestAccount[] = [
    {
      username: 'admin',
      password: 'admin123',
      role: '超级管理员',
      displayName: '超级管理员'
    },
    {
      username: 'project_admin',
      password: 'project123',
      role: '项目管理员',
      displayName: '项目管理员'
    },
    {
      username: 'user',
      password: 'user123',
      role: '普通用户',
      displayName: '普通用户'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const account = testAccounts.find(
        acc => acc.username === username && acc.password === password
      );

      if (account) {
        onLogin(account.username, account.role);
      } else {
        setError('用户名或密码错误');
      }
      setLoading(false);
    }, 500);
  };

  const handleQuickLogin = (account: TestAccount) => {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：系统介绍 */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 text-white">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-neutral-800">
              投标助手智能体软件V1.0
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed">
              通过智能化手段提升投标文件编制效率和质量，
              实现从招标信息获取到投标文件提交的全流程数字化管理。
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">提高投标效率</h3>
                <p className="text-sm text-neutral-600">自动化文件生成，节省大量人工编制时间</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">降低废标风险</h3>
                <p className="text-sm text-neutral-600">智能检查功能，确保投标文件完整合规</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-800">统一知识管理</h3>
                <p className="text-sm text-neutral-600">集中管理企业资质、业绩、人员等核心资料</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900">欢迎登录</h2>
            <p className="text-sm text-neutral-600 mt-1">请使用测试账号登录系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">快速登录</span>
            </div>
          </div>

          <div className="space-y-2">
            {testAccounts.map((account, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleQuickLogin(account)}
                className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-red-500' :
                    index === 1 ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="text-left">
                    <div className="font-medium text-neutral-900 text-sm">
                      {account.displayName}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {account.username} / {account.password}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 group-hover:text-primary-600 transition-colors">
                  点击登录
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center">
              测试账号仅供演示使用，实际使用时请创建正式账号
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
