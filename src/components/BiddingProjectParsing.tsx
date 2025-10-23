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
            projectInfo: {
              projectName: '智慧城市信息化建设项目',
              projectNumber: 'ZFCG-2024-001',
              packageName: '信息系统集成服务包',
              packageNumber: 'FB-01',
              lotName: '第一标段',
              lotNumber: 'BD-01',
              projectOverview: '本项目旨在建设智慧城市信息化平台，包括数据中心建设、智能交通系统、公共服务平台等内容。项目建设内容包括：服务器及存储设备采购、网络设备配置、软件系统开发、系统集成实施、人员培训及售后服务等。预计建设周期12个月，分为需求分析、系统设计、开发实施、测试验收四个阶段。',
              budgetAmount: '人民币 5000 万元',
              allowConsortium: '本项目接受联合体投标，联合体成员不得超过3家'
            },
            tenderer: {
              name: '北京市朝阳区人民政府',
              contact: '张先生 / 010-12345678',
              email: 'zhangsan@bjcy.gov.cn',
              address: '北京市朝阳区朝外大街123号',
              zipCode: '100020'
            },
            agent: {
              name: '北京中诚招标代理有限公司',
              contact: '李女士 / 010-87654321',
              email: 'lisi@zcbidding.com',
              address: '北京市海淀区中关村大街456号科技大厦10层',
              zipCode: '100080'
            },
            keyTimeline: {
              bidDeadline: '2024年12月15日 09:00:00（北京时间）',
              submissionMethod: '现场递交纸质投标文件并同时提交电子版',
              openingTime: '2024年12月15日 09:30:00（北京时间）',
              openingLocation: '北京市朝阳区朝外大街123号政府采购中心开标室（三楼301室）'
            },
            bidBond: {
              submissionMethod: '银行转账、银行保函或保险保函（任选其一）',
              amount: '人民币 50 万元整（¥500,000.00）',
              refundPolicy: '1. 未中标单位的投标保证金在中标通知书发出后5个工作日内无息退还；\n2. 中标单位的投标保证金在签订合同并缴纳履约保证金后5个工作日内无息退还；\n3. 投标保证金账户信息：\n   开户名称：北京中诚招标代理有限公司\n   开户银行：中国工商银行北京中关村支行\n   账号：0200 1234 5678 9012 3456\n   用途：项目编号+投标单位名称'
            }
          },
          qualificationRequirements: '1. 具有独立承担民事责任的能力（提供有效的营业执照或事业单位法人证书）\n2. 具有良好的商业信誉和健全的财务会计制度（提供2023年度财务审计报告）\n3. 具有履行合同所必需的设备和专业技术能力（提供设备清单及技术人员证明）\n4. 具有信息系统集成及服务资质三级及以上或同等能力证明\n5. 参加政府采购活动前三年内，在经营活动中没有重大违法记录（提供声明函）\n6. 近三年内至少完成过2个类似信息化项目，单个合同金额不低于1000万元（提供合同复印件及验收证明）\n7. 本项目不接受联合体投标人之间存在控股、管理关系',
          evaluationCriteria: {
            commercial: '1. 投标报价（30分）：以有效投标报价最低价为基准价，得满分30分。其他投标人得分=（基准价/投标报价）×30分\n2. 企业资质（15分）：信息系统集成资质一级15分，二级10分，三级5分\n3. 类似业绩（20分）：近三年每提供1个合同金额3000万以上的类似项目得5分，最高20分\n4. 企业实力（10分）：注册资本5000万以上10分，3000-5000万8分，1000-3000万5分\n5. 财务状况（5分）：2023年营业收入1亿以上5分，5000万-1亿3分，5000万以下1分',
            technical: '1. 技术方案（25分）：方案完整性、可行性、创新性、符合程度\n2. 实施方案（15分）：实施计划合理性、进度安排、质量保证措施、风险应对\n3. 项目团队（10分）：项目经理具有PMP或同等资格5分，团队成员专业配置合理性5分\n4. 售后服务（10分）：质保期、响应时间、培训方案、维护方案\n5. 演示答辩（20分）：现场演示系统功能、回答评委提问'
          },
          documentRequirements: '1. 投标文件需包含商务标和技术标两个部分，分别独立密封包装\n2. 采用A4纸打印或打印，双面打印，左侧装订\n3. 商务标：正本1份，副本5份；技术标：正本1份，副本5份\n4. 电子版光盘或U盘2份（PDF格式，不得加密）\n5. 投标文件需使用密封袋密封，并在封口处加盖投标人公章\n6. 封面标注项目名称、项目编号、投标人名称、标段号\n7. 投标文件每页需加盖投标人公章或骑缝章\n8. 所有证明材料需提供原件备查或加盖公章的复印件',
          risks: '1. 投标文件逾期送达或未按要求密封的将被拒收\n2. 投标保证金未按时到账或金额不足视为无效投标\n3. 联合体投标未提供联合体协议或协议不符合要求将被拒绝\n4. 投标文件出现以下情况将作废标处理：\n   - 未按规定格式填写、内容不全或关键字迹模糊导致无法辨认\n   - 投标人名称或组织结构与营业执照不一致\n   - 投标文件未加盖公章或关键内容未签字盖章\n   - 报价超过招标控制价\n   - 不同投标人的投标文件出现实质性雷同\n5. 投标人不得串通投标、弄虚作假、行贿等违法行为，一经发现将取消资格并记入不良行为记录',
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
