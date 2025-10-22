import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader, Download, X } from 'lucide-react';

interface CheckStage {
  id: number;
  name: string;
  description: string;
}

interface BidDocumentCheckProgressProps {
  checkName: string;
  totalCheckPoints: number;
  onComplete: (results: CheckResults) => void;
  onClose: () => void;
}

interface CheckResults {
  passed: number;
  failed: number;
  details: CheckPointResult[];
}

interface CheckPointResult {
  id: string;
  name: string;
  status: 'passed' | 'failed';
  message: string;
}

const BidDocumentCheckProgress: React.FC<BidDocumentCheckProgressProps> = ({
  checkName,
  totalCheckPoints,
  onComplete,
  onClose
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<CheckResults | null>(null);

  const stages: CheckStage[] = [
    { id: 0, name: '初始化检查', description: '正在准备检查环境...' },
    { id: 1, name: '文件加载', description: '正在加载投标文件...' },
    { id: 2, name: '解析文档结构', description: '正在解析文档结构和内容...' },
    { id: 3, name: '基础信息检查', description: '正在检查项目基础信息...' },
    { id: 4, name: '资格要求检查', description: '正在核对资格要求符合性...' },
    { id: 5, name: '评审要求检查', description: '正在检查评审标准对应性...' },
    { id: 6, name: '文件完整性检查', description: '正在检查投标文件完整性...' },
    { id: 7, name: '风险项检查', description: '正在识别风险项和废标项...' },
    { id: 8, name: '目录完整性检查', description: '正在核对投标文件目录...' },
    { id: 9, name: '生成检查报告', description: '正在生成详细检查报告...' },
    { id: 10, name: '完成', description: '检查完成' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stageProgress = Math.floor(progress / (100 / stages.length));
    if (stageProgress < stages.length) {
      setCurrentStage(stageProgress);
    }

    if (progress === 100) {
      setTimeout(() => {
        const passed = Math.floor(Math.random() * 5) + (totalCheckPoints - 5);
        const failed = totalCheckPoints - passed;

        const mockDetails: CheckPointResult[] = Array.from({ length: totalCheckPoints }, (_, i) => ({
          id: `cp-${i + 1}`,
          name: `检查点 ${i + 1}`,
          status: i < passed ? 'passed' : 'failed',
          message: i < passed ? '检查通过' : '检查未通过，请核对相关内容'
        }));

        const checkResults: CheckResults = {
          passed,
          failed,
          details: mockDetails
        };

        setResults(checkResults);
        setIsCompleted(true);
        onComplete(checkResults);
      }, 500);
    }
  }, [progress, stages.length, totalCheckPoints, onComplete]);

  const handleExport = () => {
    alert('导出检查报告功能开发中...');
  };

  if (isCompleted && results) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">投标文件检查</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-neutral-900 mb-2">检查完成</h3>
              <p className="text-neutral-600 mb-8">投标文件检查已完成，可以导出检查报告。</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleExport}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  导出报告
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6 space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">检查名称：</span>
                <span className="text-sm font-medium text-neutral-900">{checkName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">总检查点：</span>
                <span className="text-sm font-medium text-neutral-900">{totalCheckPoints} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">通过检查点：</span>
                <span className="text-sm font-medium text-green-600">{results.passed} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">失败检查点：</span>
                <span className="text-sm font-medium text-red-600">{results.failed} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">通过率：</span>
                <span className="text-sm font-medium text-neutral-900">
                  {Math.round((results.passed / totalCheckPoints) * 100)}%
                </span>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-lg p-6">
              <h4 className="font-medium text-neutral-900 mb-4">检查详情</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.details.map((detail) => (
                  <div
                    key={detail.id}
                    className={`flex items-start p-3 rounded-lg ${
                      detail.status === 'passed' ? 'bg-white border border-green-200' : 'bg-white border border-red-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                      detail.status === 'passed' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {detail.status === 'passed' ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <X className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 text-sm">{detail.name}</div>
                      <div className={`text-xs mt-1 ${
                        detail.status === 'passed' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {detail.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">正在检查投标文件</h3>
        <p className="text-sm text-neutral-600 mt-1">{checkName}</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">检查进度</span>
              <span className="text-sm font-medium text-primary-600">{progress}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isCompleted = index < currentStage;
              const isCurrent = index === currentStage;
              const isPending = index > currentStage;

              return (
                <div
                  key={stage.id}
                  className={`flex items-start p-4 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-primary-50 border-2 border-primary-200'
                      : isCompleted
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    isCurrent
                      ? 'bg-primary-600'
                      : isCompleted
                      ? 'bg-green-600'
                      : 'bg-neutral-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : isCurrent ? (
                      <Loader className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <span className="text-sm font-medium text-white">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium mb-1 ${
                      isCurrent
                        ? 'text-primary-900'
                        : isCompleted
                        ? 'text-green-900'
                        : 'text-neutral-600'
                    }`}>
                      {stage.name}
                    </div>
                    <div className={`text-sm ${
                      isCurrent
                        ? 'text-primary-700'
                        : isCompleted
                        ? 'text-green-700'
                        : 'text-neutral-500'
                    }`}>
                      {isCurrent ? stage.description : isCompleted ? '已完成' : '等待中'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidDocumentCheckProgress;
