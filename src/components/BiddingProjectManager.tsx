import React, { useState, useEffect } from 'react';

interface BiddingProject {
  id: string;
  projectName: string;
  status: 'pending' | 'parsing' | 'parsed' | 'failed' | 'completed';
  uploadTime: string;
  fileName: string;
  parseProgress?: number;
  errorMessage?: string;
  parsedData?: any;
}

interface DocumentDirectoryItem {
  title: string;
  description: string;
  children?: DocumentDirectoryItem[];
}

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
    summary: string;
    files: {
      name: string;
      items: DocumentDirectoryItem[];
    }[];
  };
}

import BiddingProjectList from './BiddingProjectList';
import BiddingProjectUpload from './BiddingProjectUpload';
import BiddingProjectParsing from './BiddingProjectParsing';
import BiddingProjectReview from './BiddingProjectReview';

interface BiddingProjectManagerProps {
  canEdit?: boolean;
  canDelete?: boolean;
  dataScope?: string;
}

const BiddingProjectManager: React.FC<BiddingProjectManagerProps> = ({ canEdit = true, canDelete = true }) => {
  const STORAGE_KEY = 'bidding_projects_v3';

  const [projects, setProjects] = useState<BiddingProject[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }

    // 初始示例数据 - 每种状态1条，按上传时间倒序
    return [
      {
        id: '4',
        projectName: '软件系统开发项目',
        status: 'failed',
        uploadTime: '2025-10-12 11:00:00',
        fileName: '软件开发招标文件.pdf',
        parseProgress: 0,
        errorMessage: '文件格式不支持或文件已损坏，请重新上传'
      },
      {
        id: '2',
        projectName: '办公楼智能化系统集成项目',
        status: 'parsed',
        uploadTime: '2025-10-11 14:20:00',
        fileName: '办公楼智能化招标文件.pdf',
        parseProgress: 100,
        parsedData: {
          basicInfo: {
            tenderer: '某某科技园管理委员会',
            agent: '建信招标代理有限公司',
            projectInfo: '办公楼智能化系统集成建设',
            keyTimeline: '投标截止：2025-10-28 09:30',
            bidBond: '80万元'
          },
          qualificationRequirements: '具有建筑智能化工程专业承包一级资质\n注册资金不低于2000万元\n具有ISO9001质量管理体系认证\n近三年完成过不少于2个类似项目业绩',
          evaluationCriteria: {
            commercial: `一、履约能力评价（17-27）
1. 经营状况（1-5）：对企业经营状况进行综合评价：企业资产运营能力、履约能力强，整体经营状况优良【4-5分】；企业资产运营能力、履约能力较强，整体经营状况较好【2-3.5分】；企业资产运营能力、履约能力一般，整体经营状况一般【1-1.5分】。
2. 售后服务（1-5）：对企业售后服务能力进行综合评价：企业售后服务响应时间、售后服务团队、培训、相关保障措施等优良【4-5分】；企业售后服务响应时间、售后服务团队、培训、相关保障措施等较好【2-3.5分】；企业售后服务响应时间、售后服务团队、培训、相关保障措施等一般【1-1.5分】。
3. 应急保供（15-17）：对应急抢险保电物资供应能力进行综合评价：作出突出贡献的【17分】；其余情况【15分】。
二、高质量发展评价（36-65）
1. 绿色发展规划（3-5）：对企业的绿色发展顶层规划及执行情况进行综合评价：建立了科学合理的绿色发展顶层规划并执行优秀【5分】；建立了科学合理的绿色发展顶层规划并执行良好【4分】；建立了科学合理的绿色发展顶层规划并执行一般【3分】。
2. 绿色管理体系认证（3-5）：对国家级能源管理体系、质量管理体系、职业健康安全管理体系及环境管理体系证书认证情况进行评价：取得4项认证【5分】；取得1-3项认证【4分】；其他情况得【3分】。
3. 环境影响评价（3-5）：对企业发布ESG（环境、社会和公司治理）报告，取得环评/能评报告，取得废水/废气/废固报告情况进行评价：具有2类/3类报告【5分】；具有1类报告【4分】；其他情况【3分】。
4. 绿电绿证（3-4）：对企业取得绿色电力证书情况进行评价：取得证书或凭证【4分】；其他情况【3分】。
5. 绿色低碳认证（3-5）：对企业绿码、绿色工厂、绿色供应链管理企业的国家级认证情况进行评价：取得2项及以上认证【5分】；取得1项认证的【4分】；其他情况【3分】。
6. 企业创新成果（5-7）：对企业取得的科技成果情况进行综合评价：企业近3年取得过国家级科技创新成果【7分】；企业近3年取得过省级科技创新成果【6分】；其他情况【5分】。
7. 研发团队规模（4-6）：对企业拥有高级及以上职称人员和高级技师人员数量进行评价：拥有高级及以上职称人员和高级技师人员X≥30人【6分】；拥有高级及以上职称人员和高级技师人员15≤X＜30人【5分】；拥有高级及以上职称人员和高级技师人员X＜15人【4分】。
8. 科研经费占比（3-5）：对企业近3年科研经费占比进行评价：企业近3年任一年研发投入占比达2%以上【5分】；企业近3年有研发投入【4分】；企业近3年无研发投入【3分】。
9. 高新技术企业（0-2）：对企业获得国家级高新技术企业证书进行评价：获得国家级高新技术企业证书【2分】；未取得【0分】。
10. 创新激励机制、供应链保障措施（3-5）：对企业制定创新激励相关政策和机制的情况，有效应对供应链外部系统风险，积极响应落实国家激励或扶持政策，制定供应链保障措施的情况进行综合评价:优秀【5分】；良好【4分】；一般【3分】。
11. 数智化评价（6-8）：对"数字领航"企业、智能制造示范工厂、智能制造优秀场景的国家级认定情况进行评价：取得"数字领航"企业或智能制造示范工厂【8分】；取得智能制造优秀场景【7分】；其他情况得【6分】。
12. 未来工厂、智能工厂、数字化车间（0-3）：对国家级"智能工厂"、"数字化车间"、"未来工厂"认定情况进行评价：取得3项【3分】；取得2项【2分】；取得1项【1分】；未取得【0分】。
13. 中国质量奖（0-2）：对企业获得国家级质量奖情况进行评价：获得国家级质量奖【2分】；未获得【0分】。
14. 专精特新认定（0-1）：对企业"专精特新企业"认定情况进行评价：被国家或地方政府部门认定为专精特新企业的【1分】；未获得【0分】。
15. 实体清单应对举措（0-2）：对积极应对国际贸易壁垒，成功获得国家财政补贴、税收优惠、融资支持等政府帮助和扶持的企业，在招标过程中提供相应证明材料（包括但不限于应对国际贸易壁垒举措、补贴批文、税收优惠证明、融资协议等）进行评价：取得2项【2分】；取得1项【1分】；未取得【0分】。
三、投标响应（4-8）
1. 报价质量（4-8）：对报价文件完整性、准确性、规范性、合理性进行综合评审：报价文件响应情况良好【8分】；报价文件响应情况一般【6分】；报价文件响应情况较差【4分】。
四、诚信评价（-65-0）
1. 不良行为处理情况通报（-30-0）：不存在《国家电网有限公司供应商关系管理办法》中规定的不良行为，或存在《国家电网有限公司供应商关系管理办法》中规定的不良行为，但最近一次受到供应商不良行为处理解除之日，距离投标截止日超过3年【不扣分】；至本项目投标截止日，存在《国家电网有限公司供应商关系管理办法》中规定的不良行为，且最近一次受到供应商不良行为处理解除之日，距离投标截止日超过2年但在3年以内（含）【扣5分】，其中，存在行贿行为的【扣10分】；至本项目投标截止日，存在《国家电网有限公司供应商关系管理办法》中规定的不良行为，且最近一次受到供应商不良行为处理解除之日，距离投标截止日超过1年但在2年以内（含）【扣10分】，其中，存在行贿行为的【扣20分】；至本项目投标截止日，存在《国家电网有限公司供应商关系管理办法》中规定的不良行为，且最近一次受到供应商不良行为处理解除之日，距离投标截止日1年以内（含）【扣15分】，其中，存在行贿行为的【扣30分】。
2. 公共信用信息报告、企业信用信息公示报告（-10-0）：不存在失信行为，或存在质量、诚信、环境行政处罚以外失信行为，情节轻微，行政处罚罚款累计在1万元以下【不扣分】；存在质量、诚信、环境行政处罚以外失信行为，行政处罚罚款累计在1万元及以上30万元以下【扣5分】；存在质量、诚信失信行为，或存在质量、诚信、环境行政处罚以外失信行为，但未纳入失信黑名单，行政处罚罚款累计在30万元及以上【扣10分】。
3. 影响评标工作公正性行为的凭证（-20-0）：投标截止日近一年内，经查证核实，投标人存在打招呼、请托关照等可能影响评标工作公正性行为【扣20分】；【无上述行为的，不扣分】。
4. 环保行政处罚（-5-0）：公共信用信息报告、企业信用信息公示报告中存在环境行政处罚的【扣5分】；【无上述处罚的，不扣分】。`,
            technical: `一、技术水平（30-50）
1. 企业品牌（5-15）：按照企业品牌知名程度分为三档，非常知名品牌15分；比较知名品牌10分；一般知名品牌5分。
2. 产品参数（25-35）：核心参数优于招标文件内设备材料性能指标的:31~35分；一般参数优于招标文件内设备材料性能指标的：26~30分；仅满足招标文件内设备材料性能指标的：25分。
二、市场业绩（12-20）
1. 供货业绩（6-10）：供货业绩高于资质要求的基本供货业绩80%以上的（含80%）:9~10分；供货业绩高于资质要求的基本供货业绩50～80%之间的（含50%）：7~8分；供货业绩高于资质要求的基本供货业绩50%以内的：6分。
2. 运行情况（6-10）：运行情况优秀:9~10分；运行情况良好：7~8分；运行情况一般：6分。
三、资源实力（6-10）
1. 5M1E（人力、设备、工艺、材料、检测、环境）（6-8）：高于招标文件要求:8分；等同于招标文件要求：7分；略有差异，但基本满足招标文件要求：6分。
2. 绿色数智（0-2）：在生产制造过程中统筹考虑环境保护措施，各工序实现能源降耗，资源利用率高、清洁生产工艺，利用互联网和物联网技术提升数智制造水平，应用智能化设计手段、建设智能化生产线或智能车间、构建数字化智能化生产管理体系，强化设备质量管控能力，推进高端制造转型升级的等情况。
四、组件材料（6-10）
1. 外购外协组件材料优秀可靠水平（6-10）：主要原材料或主要部件高于招标文件要求:10分；主要原材料或主要部件等同于招标文件要求：8分；主要原材料或主要部件略有差异，但基本满足招标文件要求：6分。
五、服务合作（6-10）
1. 现场安装调试服务、售后服务、履约评价（6-10）：现场安装及售后服务良好，履约情况良好:9~10分；现场安装及售后服务一般，履约情况一般：7~8分；现场安装及售后服务较差，履约情况较差：6分。`
          },
          documentRequirements: '营业执照副本\n建筑智能化工程专业承包一级资质证书\nISO9001质量管理体系认证证书\n近三年财务审计报告\n类似项目业绩证明材料\n拟派项目经理及主要技术人员资格证书\n设备制造商授权书',
          risks: '项目工期紧张，需在3个月内完成施工\n涉及多个子系统集成，协调难度大\n需与现有办公系统对接，兼容性要求高\n施工期间不能影响办公楼正常使用',
          documentDirectory: {
            summary: '根据招标文件要求，本次投标需要提交3个文件：商务文件、技术文件、授权委托书。',
            files: [
              {
                name: '商务文件',
                items: [
                  {
                    title: '一、资格证明文件',
                    description: '提供企业资质、营业执照等证明文件',
                    children: [
                      { title: '1.1 营业执照副本', description: '提供有效期内的营业执照副本复印件并加盖公章' },
                      { title: '1.2 资质证书', description: '提供建筑智能化工程专业承包一级资质证书复印件并加盖公章' }
                    ]
                  },
                  {
                    title: '二、商务响应文件',
                    description: '投标函及相关商务文件',
                    children: [
                      { title: '2.1 投标函', description: '按照招标文件格式填写投标函' },
                      { title: '2.2 法定代表人授权书', description: '如非法定代表人签字，需提供授权书原件' },
                      { title: '2.3 投标保证金', description: '提供投标保证金缴纳凭证' }
                    ]
                  },
                  {
                    title: '三、报价文件',
                    description: '投标报价及说明',
                    children: [
                      { title: '3.1 投标报价表', description: '按照招标文件格式填写报价表' },
                      { title: '3.2 报价说明', description: '对报价进行详细说明，包括费用构成等' }
                    ]
                  }
                ]
              },
              {
                name: '技术文件',
                items: [
                  {
                    title: '一、技术方案',
                    description: '整体技术解决方案',
                    children: [
                      { title: '1.1 技术方案总体设计', description: '描述整体技术架构和设计思路' },
                      { title: '1.2 综合布线系统方案', description: '详细说明综合布线系统的设计和实施方案' },
                      { title: '1.3 安防监控系统方案', description: '详细说明安防监控系统的设计和实施方案' }
                    ]
                  },
                  {
                    title: '二、实施方案',
                    description: '项目实施计划',
                    children: [
                      { title: '2.1 施工组织设计', description: '详细的施工组织设计方案' },
                      { title: '2.2 施工进度计划', description: '项目施工进度安排及里程碑' },
                      { title: '2.3 质量保证措施', description: '确保项目质量的具体措施' }
                    ]
                  },
                  {
                    title: '三、售后服务',
                    description: '售后服务及培训',
                    children: [
                      { title: '3.1 售后服务方案', description: '详细的售后服务承诺和措施' },
                      { title: '3.2 培训方案', description: '针对使用方的培训计划' }
                    ]
                  }
                ]
              },
              {
                name: '授权委托书',
                items: [
                  { title: '法定代表人授权委托书', description: '如非法定代表人参加投标，需提供授权委托书原件，明确授权范围和期限' }
                ]
              }
            ]
          }
        }
      },
      {
        id: '1',
        projectName: '市政道路改造工程项目',
        status: 'pending',
        uploadTime: '2025-10-10 09:30:00',
        fileName: '市政道路改造工程招标文件.pdf'
      },
      {
        id: '3',
        projectName: '医院设备采购项目',
        status: 'parsed',
        uploadTime: '2025-10-09 16:45:00',
        fileName: '医院设备采购招标文件.pdf',
        parseProgress: 100,
        parsedData: {
          basicInfo: {
            tenderer: '市中心医院',
            agent: '某某招标代理有限公司',
            projectInfo: '医疗设备采购及安装',
            keyTimeline: '投标截止：2025-10-25 09:00',
            bidBond: '50万元'
          },
          qualificationRequirements: '具有医疗器械经营许可证，注册资金不低于500万元',
          evaluationCriteria: {
            commercial: '价格分40分，商务分20分',
            technical: '技术方案30分，售后服务10分'
          },
          documentRequirements: '营业执照、资质证书、业绩证明等',
          risks: '交货期较紧，需注意设备进口周期',
          documentDirectory: {
            summary: '本次投标需要提交2个文件：商务文件、技术文件。',
            files: [
              {
                name: '商务文件',
                items: [
                  { title: '第一章 投标函', description: '按照规定格式填写投标函' },
                  { title: '第二章 报价清单', description: '详细列明设备清单及报价' },
                  { title: '第三章 商务文件', description: '营业执照、资质证书等商务文件' }
                ]
              },
              {
                name: '技术文件',
                items: [
                  { title: '第一章 技术方案', description: '设备技术参数及配置方案' },
                  { title: '第二章 实施计划', description: '设备安装及调试计划' },
                  { title: '第三章 售后服务', description: '售后服务承诺及保障措施' }
                ]
              }
            ]
          }
        }
      },
      {
        id: '5',
        projectName: '城市绿化景观工程',
        status: 'completed',
        uploadTime: '2025-10-08 10:15:00',
        fileName: '城市绿化景观招标文件.pdf',
        parseProgress: 100,
        parsedData: {
          basicInfo: {
            tenderer: '市园林局',
            agent: '市政工程招标中心',
            projectInfo: '公园景观提升改造工程',
            keyTimeline: '投标截止：2025-10-20 14:00',
            bidBond: '30万元'
          },
          qualificationRequirements: '园林绿化一级资质，近三年完成类似项目不少于2个',
          evaluationCriteria: {
            commercial: '价格分50分，商务分10分',
            technical: '设计方案30分，施工组织10分'
          },
          documentRequirements: '资质证书、项目经理证书、类似业绩',
          risks: '雨季施工影响，需做好应急预案',
          documentDirectory: {
            summary: '本次投标需要提交2个文件：商务文件、技术文件。',
            files: [
              {
                name: '商务文件',
                items: [
                  { title: '第一章 投标函', description: '投标函及投标函附录' },
                  { title: '第二章 工程量清单', description: '已标价工程量清单' },
                  { title: '第三章 商务资料', description: '营业执照、资质证书等' }
                ]
              },
              {
                name: '技术文件',
                items: [
                  { title: '第一章 施工方案', description: '施工组织设计及方案' },
                  { title: '第二章 进度计划', description: '施工进度计划安排' },
                  { title: '第三章 质量保证', description: '质量保证措施及承诺' }
                ]
              }
            ]
          }
        }
      }
    ];
  });

  const [currentView, setCurrentView] = useState<'list' | 'upload' | 'parsing' | 'review'>('list');
  const [selectedProject, setSelectedProject] = useState<BiddingProject | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleStartParsing = (projectName: string, files: any[]) => {
    const fileNames = files.map(f => f.name).join(', ');
    const newProject: BiddingProject = {
      id: String(Date.now()),
      projectName,
      status: 'parsing',
      uploadTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      fileName: fileNames,
      parseProgress: 0
    };

    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    setCurrentView('parsing');
  };

  const handleParsingComplete = (data: ParsedData) => {
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        status: 'parsed' as const,
        parseProgress: 100,
        parsedData: data
      };

      setProjects(projects.map(p =>
        p.id === selectedProject.id ? updatedProject : p
      ));
      setSelectedProject(updatedProject);
      setCurrentView('review');
    }
  };

  const handleSaveDraft = (data: ParsedData) => {
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        parsedData: data
      };

      setProjects(projects.map(p =>
        p.id === selectedProject.id ? updatedProject : p
      ));
      setSelectedProject(updatedProject);
    }
  };

  const handleConfirmReview = (data: ParsedData) => {
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        status: 'completed' as const,
        parsedData: data
      };

      setProjects(projects.map(p =>
        p.id === selectedProject.id ? updatedProject : p
      ));
      setCurrentView('list');
      setSelectedProject(null);
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProject(null);
  };

  const handleViewProject = (project: BiddingProject) => {
    setSelectedProject(project);
    if (project.status === 'pending' || project.status === 'failed') {
      setCurrentView('upload');
    } else if (project.status === 'parsing') {
      setCurrentView('parsing');
    } else if (project.status === 'parsed' || project.status === 'completed') {
      setCurrentView('review');
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleReparse = (project: BiddingProject) => {
    const updatedProject = {
      ...project,
      status: 'parsing' as const,
      parseProgress: 0,
      errorMessage: undefined
    };

    setProjects(projects.map(p =>
      p.id === project.id ? updatedProject : p
    ));
    setSelectedProject(updatedProject);
    setCurrentView('parsing');
  };

  const handleDownloadProject = (project: BiddingProject) => {
    const data = {
      projectName: project.projectName,
      uploadTime: project.uploadTime,
      parsedData: project.parsedData
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.projectName}_解析文件.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (currentView === 'upload') {
    return (
      <BiddingProjectUpload
        onBack={handleBackToList}
        onStartParsing={handleStartParsing}
        initialProjectName={selectedProject?.projectName}
        initialFileName={selectedProject?.fileName}
      />
    );
  }

  if (currentView === 'parsing' && selectedProject) {
    return (
      <BiddingProjectParsing
        projectId={selectedProject.id}
        projectName={selectedProject.projectName}
        onBack={handleBackToList}
        onParsingComplete={handleParsingComplete}
      />
    );
  }

  if (currentView === 'review' && selectedProject && selectedProject.parsedData) {
    return (
      <BiddingProjectReview
        projectId={selectedProject.id}
        projectName={selectedProject.projectName}
        initialData={selectedProject.parsedData}
        projectStatus={selectedProject.status}
        onBack={handleBackToList}
        onSave={handleSaveDraft}
        onConfirm={handleConfirmReview}
      />
    );
  }

  return (
    <BiddingProjectList
      projects={projects}
      onUploadClick={() => setCurrentView('upload')}
      onViewProject={handleViewProject}
      onDeleteProject={handleDeleteProject}
      onReparse={handleReparse}
      onDownloadProject={handleDownloadProject}
      onGenerateDocument={(project) => {
        if (project) {
          localStorage.setItem('preselected_bidding_project', JSON.stringify(project));
          window.dispatchEvent(new CustomEvent('navigate-to-generate'));
        }
      }}
    />
  );
};

export default BiddingProjectManager;
