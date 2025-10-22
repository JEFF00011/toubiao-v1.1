import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Loader, AlertCircle } from 'lucide-react';

interface ParsedData {
  basicInfo: {
    tenderer: string;
    agent: string;
    projectInfo: string;
    keyTimeline: string;
    bidBond: string;
  };
  qualificationRequirements: string;
  evaluationCriteria: {
    commercial: string;
    technical: string;
  };
  documentRequirements: string;
  risks: string;
  documentDirectory: {
    commercial: string;
    technical: string;
  };
}

interface BiddingProjectParsingProps {
  projectId: string;
  projectName: string;
  onBack: () => void;
  onParsingComplete: (data: ParsedData) => void;
}

const BiddingProjectParsing: React.FC<BiddingProjectParsingProps> = ({
  projectId,
  projectName,
  onBack,
  onParsingComplete
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);

  const stages = [
    { id: 0, name: '上传文件', description: '正在上传招标文件...' },
    { id: 1, name: '文件预处理', description: '正在解析文件格式...' },
    { id: 2, name: '基础信息提取', description: '正在提取招标人、代理人、项目信息...' },
    { id: 3, name: '资格要求分析', description: '正在分析投标人资格要求...' },
    { id: 4, name: '评审标准提取', description: '正在提取商务和技术评分标准...' },
    { id: 5, name: '文件要求整理', description: '正在整理投标文件格式要求...' },
    { id: 6, name: '风险识别', description: '正在识别风险项和废标条款...' },
    { id: 7, name: '目录生成', description: '正在生成投标文件目录...' },
    { id: 8, name: '完成', description: '解析完成' }
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
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stageProgress = Math.floor(progress / (100 / stages.length));
    if (stageProgress < stages.length) {
      setCurrentStage(stageProgress);
    }

    if (progress === 100) {
      setTimeout(() => {
        const mockData: ParsedData = {
          basicInfo: {
            tenderer: {
              name: '某某市政府采购中心',
              contact: '张先生 / 010-12345678',
              email: 'zhangsan@gov.cn',
              address: '北京市朝阳区某某街道123号',
              zipCode: '100000'
            },
            agent: {
              name: '某某招标代理有限公司',
              contact: '李女士 / 010-87654321',
              email: 'lisi@agency.com',
              address: '北京市海淀区某某路456号',
              zipCode: '100080'
            },
            projectInfo: {
              projectName: '智慧城市信息化建设项目',
              projectNumber: 'ZFCG-2024-001',
              packageName: '信息系统集成服务',
              packageNumber: 'FB-01',
              lotName: '第一标段',
              lotNumber: 'BD-01',
              projectOverview: '本项目旨在建设智慧城市信息化平台，包括数据中心建设、智能交通系统、公共服务平台等内容，预计建设周期12个月。',
              budgetAmount: '人民币 5000 万元',
              allowConsortium: '接受联合体投标'
            },
            keyTimeline: {
              bidDeadline: '2024-02-15 09:00:00',
              submissionMethod: '现场递交',
              openingTime: '2024-02-15 09:30:00',
              openingLocation: '某某市政府采购中心开标室（三楼）'
            },
            bidBond: {
              submissionMethod: '银行转账或银行保函',
              amount: '人民币 50 万元整',
              refundPolicy: '未中标单位的投标保证金在中标通知书发出后5个工作日内退还；中标单位的投标保证金在签订合同后5个工作日内退还。'
            }
          },
          qualificationRequirements: '1. 具有独立法人资格\n2. 具有有效的营业执照\n3. 具有信息系统集成及服务资质三级及以上\n4. 近三年无重大违法记录\n5. 具有良好的财务状况\n6. 具有相关项目实施经验',
          evaluationCriteria: {
            commercial: '价格分：30分\n资质业绩：20分\n企业实力：10分\n财务状况：5分',
            technical: '技术方案：25分\n实施方案：10分\n项目团队：5分\n售后服务：5分'
          },
          documentRequirements: '1. 投标文件需包含商务标和技术标\n2. 采用A4纸打印，双面打印\n3. 正本1份，副本5份\n4. 电子版U盘1份\n5. 投标文件需密封并加盖公章',
          risks: '1. 联合体投标需提供联合体协议\n2. 投标文件逾期送达将被拒收\n3. 投标保证金未按时到账视为无效投标\n4. 投标文件未按要求密封将被拒收\n5. 投标人不得串通投标',
          documentDirectory: {
            commercial: '一、资格证明文件\n  1.1 营业执照副本\n  1.2 资质证书\n二、商务响应文件\n  2.1 投标函\n  2.2 法定代表人授权书\n三、报价文件\n  3.1 投标报价表\n  3.2 报价说明\n四、其他材料',
            technical: ''
          }
        };
        onParsingComplete(mockData);
      }, 1000);
    }
  }, [progress, onParsingComplete, stages.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-medium text-neutral-900">解析进度</h2>
                <p className="text-sm text-neutral-500">{projectName}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">
                  解析进度
                </span>
                <span className="text-sm font-medium text-primary-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
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
                    className={`flex items-start space-x-3 p-4 rounded-lg transition-colors ${
                      isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-neutral-50'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {isCurrent && (
                        <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                      )}
                      {isPending && (
                        <div className="w-5 h-5 rounded-full border-2 border-neutral-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        isCurrent ? 'text-blue-900' : isCompleted ? 'text-neutral-900' : 'text-neutral-500'
                      }`}>
                        {stage.name}
                      </h4>
                      {(isCurrent || isCompleted) && (
                        <p className={`text-xs mt-1 ${
                          isCurrent ? 'text-blue-700' : 'text-neutral-500'
                        }`}>
                          {stage.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">解析失败</h4>
                    <p className="text-sm text-red-700 mt-1">
                      文件格式不支持或内容无法识别，请检查文件后重新上传。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-neutral-50 flex justify-between gap-2 border-t border-neutral-200">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-100 transition-colors"
            >
              返回列表
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingProjectParsing;
