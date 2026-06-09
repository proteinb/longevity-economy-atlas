const nodes = [
  { id: "omics-targets", name: "靶点组学", type: "上游", stage: "upstream", x: 105, y: 85, color: "#176b53" },
  { id: "innovative-drugs", name: "创新药", type: "上游", stage: "upstream", x: 105, y: 205, color: "#1f7a5d" },
  { id: "advanced-therapy", name: "CGT核酸", type: "上游", stage: "upstream", x: 105, y: 325, color: "#2f628f" },
  { id: "cxo-research", name: "CXO研发", type: "上游", stage: "upstream", x: 105, y: 445, color: "#3f6f91" },
  { id: "ivd-diagnostics", name: "IVD诊断", type: "中游", stage: "midstream", x: 315, y: 85, color: "#2f8177" },
  { id: "medical-devices", name: "高端器械", type: "中游", stage: "midstream", x: 315, y: 205, color: "#3a8d84" },
  { id: "digital-health", name: "数字健康", type: "中游", stage: "midstream", x: 315, y: 325, color: "#3d719d" },
  { id: "rehab-assistive", name: "康复辅具", type: "中游", stage: "midstream", x: 315, y: 445, color: "#a66d32" },
  { id: "health-management", name: "健康管理", type: "下游", stage: "downstream", x: 555, y: 85, color: "#a64238" },
  { id: "clinical-services", name: "医疗服务", type: "下游", stage: "downstream", x: 555, y: 205, color: "#b24e43" },
  { id: "elderly-care", name: "康养机构", type: "下游", stage: "downstream", x: 555, y: 325, color: "#b9832f" },
  { id: "payment-insurance", name: "支付保险", type: "下游", stage: "downstream", x: 555, y: 445, color: "#8d5d9f" },
  { id: "ai-data", name: "AI数据", type: "支撑", stage: "support", x: 765, y: 85, color: "#6d5a9e" },
  { id: "biomanufacturing", name: "生物制造", type: "支撑", stage: "support", x: 765, y: 205, color: "#8a5a37" },
  { id: "policy-capital", name: "政策资本", type: "支撑", stage: "support", x: 765, y: 325, color: "#47713d" },
  { id: "talent-global", name: "人才国际", type: "支撑", stage: "support", x: 765, y: 445, color: "#636b3e" },
];

const links = [
  ["omics-targets", "innovative-drugs"],
  ["innovative-drugs", "advanced-therapy"],
  ["innovative-drugs", "cxo-research"],
  ["omics-targets", "ivd-diagnostics"],
  ["innovative-drugs", "medical-devices"],
  ["advanced-therapy", "digital-health"],
  ["cxo-research", "rehab-assistive"],
  ["ivd-diagnostics", "health-management"],
  ["medical-devices", "clinical-services"],
  ["digital-health", "health-management"],
  ["rehab-assistive", "elderly-care"],
  ["health-management", "payment-insurance"],
  ["clinical-services", "elderly-care"],
  ["elderly-care", "payment-insurance"],
  ["ai-data", "omics-targets"],
  ["ai-data", "digital-health"],
  ["ai-data", "health-management"],
  ["policy-capital", "biomanufacturing"],
  ["policy-capital", "payment-insurance"],
  ["talent-global", "cxo-research"],
  ["talent-global", "clinical-services"],
  ["biomanufacturing", "innovative-drugs"],
  ["biomanufacturing", "medical-devices"],
];

const companies = [
  {
    name: "靶点发现、组学检测与转化医学平台",
    node: "omics-targets",
    stage: "upstream",
    location: "靶点发现 / 多组学 / 生物标志物",
    need: "为老龄高发疾病提供早期风险识别、伴随诊断和真实世界随访指标",
    tags: ["组学", "靶点", "早筛"],
  },
  {
    name: "信达生物等创新药企业",
    node: "innovative-drugs",
    stage: "upstream",
    location: "创新药 / 肿瘤 / 代谢 / 免疫",
    need: "面向肿瘤、慢病、代谢疾病等老龄高发疾病，连接临床研究、医保支付和真实世界数据",
    tags: ["创新药", "慢病", "健康寿命"],
  },
  {
    name: "细胞与基因治疗、核酸药物平台",
    node: "advanced-therapy",
    stage: "upstream",
    location: "前沿生物技术 / 转化医学",
    need: "寻找长期随访队列、临床转化平台、老年疾病适应症合作伙伴",
    tags: ["CGT", "核酸药物", "再生医学"],
  },
  {
    name: "临床前、临床研究与 CXO 服务能力",
    node: "cxo-research",
    stage: "upstream",
    location: "CRO / CDMO前端 / 临床研究",
    need: "帮助长寿医学相关药械完成药效评价、临床试验设计和老年人群研究",
    tags: ["CXO", "临床研究", "转化"],
  },
  {
    name: "体外诊断、伴随诊断与慢病筛查企业",
    node: "ivd-diagnostics",
    stage: "midstream",
    location: "IVD / 分子诊断 / 伴随诊断",
    need: "进入肿瘤早筛、心脑血管风险筛查、代谢病管理和养老机构体检场景",
    tags: ["IVD", "伴随诊断", "慢病筛查"],
  },
  {
    name: "高端医疗器械、植介入与医疗机器人企业",
    node: "medical-devices",
    stage: "midstream",
    location: "高端器械 / 医疗机器人 / 植介入",
    need: "服务老年高发疾病治疗、微创干预、功能恢复和院内外连续照护",
    tags: ["高端器械", "医疗机器人", "微创"],
  },
  {
    name: "数字疗法、可穿戴与远程健康监测平台",
    node: "digital-health",
    stage: "midstream",
    location: "数字健康 / 可穿戴 / 远程监测",
    need: "把园区药械产品接入居家监测、慢病管理和真实世界数据闭环",
    tags: ["数字疗法", "可穿戴", "远程监测"],
  },
  {
    name: "康复设备、辅具与智能照护产品企业",
    node: "rehab-assistive",
    stage: "midstream",
    location: "康复设备 / 辅具 / 具身智能",
    need: "面向术后康复、失能预防、跌倒防护和养老照护减负形成适老产品包",
    tags: ["康复", "辅具", "适老科技"],
  },
  {
    name: "体检、慢病管理与主动健康服务机构",
    node: "health-management",
    stage: "downstream",
    location: "体检咨询 / 慢病管理 / 主动健康",
    need: "承接 IVD、数字健康和创新药械成果，形成预防、筛查、干预、随访闭环",
    tags: ["主动健康", "慢病管理", "随访"],
  },
  {
    name: "医院、专科中心与医养结合服务网络",
    node: "clinical-services",
    stage: "downstream",
    location: "临床服务 / 专科中心 / 医养结合",
    need: "为创新药械提供临床验证、真实世界研究和老年疾病综合管理场景",
    tags: ["医疗服务", "真实世界", "医养结合"],
  },
  {
    name: "养老院、福利院、康养机构应用场景",
    node: "elderly-care",
    stage: "downstream",
    location: "康养机构 / 居家照护 / 社区养老",
    need: "承接可穿戴设备、康复辅具、养老照护系统和智能化适老产品试点采购",
    tags: ["康养机构", "养老照护", "应用示范"],
  },
  {
    name: "商业健康保险、长护险与创新支付渠道",
    node: "payment-insurance",
    stage: "downstream",
    location: "商保 / 长护险 / 苏惠保 / 机构采购",
    need: "将疗效、康复效果和照护减负转化为可支付、可持续的商业模式",
    tags: ["支付", "保险", "价值医疗"],
  },
  {
    name: "AI 制药、生物大模型与健康数据底座",
    node: "ai-data",
    stage: "support",
    location: "AI制药 / 生物大模型 / 数据平台",
    need: "连接药物研发、蛋白设计、实验自动化、风险预测和真实世界研究",
    tags: ["AI制药", "生物大模型", "数据闭环"],
  },
  {
    name: "生物制造与公共技术服务平台",
    node: "biomanufacturing",
    stage: "support",
    location: "临床前 / 检验检测 / 生产制造 / 销售流通",
    need: "支撑创新药械从研发到规模化生产，缩短长寿经济产品产业化周期",
    tags: ["生物制造", "公共平台", "产业化"],
  },
  {
    name: "政策、资本、审评审批与国际合作体系",
    node: "policy-capital",
    stage: "support",
    location: "行动计划 / 资本 / 自贸区 / 新加坡合作",
    need: "提供融资、注册审批、创新名优目录、海外 BD 和跨境流通支持",
    tags: ["政策", "资本", "国际化"],
  },
  {
    name: "高层次人才、院校平台与国际合作网络",
    node: "talent-global",
    stage: "support",
    location: "人才 / 院校 / 新加坡合作 / 海外 BD",
    need: "补齐长寿医学交叉人才、国际注册、海外商务拓展和全球临床合作能力",
    tags: ["人才", "国际合作", "出海"],
  },
];

const resources = [
  {
    kind: "园区官网",
    title: "BioBAY 官方介绍",
    summary: "园区已形成创新药物、高端医疗器械与体外诊断、生物技术三大重点产业集群。",
    node: "innovative-drugs",
    stage: "upstream",
    url: "https://www.biobay.com.cn/en/about/introduction",
  },
  {
    kind: "工作方案",
    title: "苏州市生物医药产业创新集群建设实施方案",
    summary: "将创新医药、高端医疗器械、CXO、BT+IT 融合、医疗健康服务等纳入集群建设重点。",
    node: "cxo-research",
    stage: "upstream",
    url: "https://www.suzhou.gov.cn/szsrmzf/gbqtwj/202207/fc52f625230a4c12b8d63f5dfc748c46.shtml",
  },
  {
    kind: "节点口径",
    title: "靶点组学与老龄疾病早筛",
    summary: "将靶点发现、多组学、生物标志物和伴随诊断作为长寿医学的上游入口。",
    node: "omics-targets",
    stage: "upstream",
    url: "./苏州BioBAY长寿经济产业图谱.md",
  },
  {
    kind: "节点口径",
    title: "CGT、核酸药物与再生医学",
    summary: "聚焦功能修复、难治性疾病和健康寿命干预，连接长期随访和真实世界研究。",
    node: "advanced-therapy",
    stage: "upstream",
    url: "./苏州BioBAY长寿经济产业图谱.md",
  },
  {
    kind: "节点口径",
    title: "IVD 诊断与慢病筛查",
    summary: "将体外诊断、分子诊断和伴随诊断导入肿瘤早筛、慢病筛查和机构体检。",
    node: "ivd-diagnostics",
    stage: "midstream",
    url: "./苏州BioBAY长寿经济产业图谱.md",
  },
  {
    kind: "行动计划",
    title: "苏州工业园区生物医药及大健康产业腾飞行动计划",
    summary: "明确支持 AI 生物大模型，并引导养老院、福利院、康养机构采购智能化适老化产品。",
    node: "elderly-care",
    stage: "downstream",
    url: "https://www.suzhou.gov.cn/szsrmzf/szyw/202505/20b233af1c82485f973929693b2c964e.shtml",
  },
  {
    kind: "强链补链",
    title: "苏州市生物医药及健康产业强链补链三年行动计划",
    summary: "覆盖链主引培、技术攻坚、创新平台、临床提升、审批提效、金融助力和数字融合。",
    node: "policy-capital",
    stage: "support",
    url: "https://www.suzhou.gov.cn/szsrmzf/bmwjjd/202106/23dfa7e887874749aa77baa64704f84b.shtml",
  },
  {
    kind: "行动计划",
    title: "苏州工业园区生物制造产业发展行动计划",
    summary: "聚焦生物医药、食品、生物基材料、生物制造设备等方向，支撑规模化产业化。",
    node: "biomanufacturing",
    stage: "support",
    url: "https://www.sipac.gov.cn/szgyyq/dthg202503/202503/0a64f75fc81146b6833e98334cea3d59.shtml",
  },
  {
    kind: "园区资讯",
    title: "苏州工业园区推动大健康产业发展",
    summary: "将创新医疗器械纳入名优目录和苏惠保，帮助产品从研发走向市场推广。",
    node: "medical-devices",
    stage: "midstream",
    url: "https://www.suzhou.gov.cn/szsrmzf/ylfw/202509/4cf080e8e56149268d12e6f0a63f6359.shtml",
  },
  {
    kind: "节点口径",
    title: "数字健康与真实世界数据闭环",
    summary: "把数字疗法、可穿戴和远程监测接入慢病管理、康复随访和真实世界评价。",
    node: "digital-health",
    stage: "midstream",
    url: "./苏州BioBAY长寿经济产业图谱.md",
  },
  {
    kind: "节点口径",
    title: "康复辅具与适老科技产品包",
    summary: "围绕术后康复、失能预防、跌倒防护和照护减负形成可推广的适老产品体系。",
    node: "rehab-assistive",
    stage: "midstream",
    url: "./苏州BioBAY长寿经济产业图谱.md",
  },
  {
    kind: "AI4Science",
    title: "AI 解码生命科学奥秘的园区实践",
    summary: "园区人工智能产业基础与生物医药研发结合，为 AI+长寿医学提供技术底座。",
    node: "ai-data",
    stage: "support",
    url: "https://kjj.suzhou.gov.cn/szkj/sxdt/202506/cb3df9914d80471bbe794004ee3c5a12.shtml",
  },
  {
    kind: "国家政策",
    title: "关于发展银发经济增进老年人福祉的意见",
    summary: "国家层面对老年健康、智慧健康养老、康复辅具、抗衰老和银发经济集群提出政策方向。",
    node: "payment-insurance",
    stage: "downstream",
    url: "https://www.gov.cn/zhengce/content/202401/content_6926087.htm",
  },
  {
    kind: "人口数据",
    title: "国家统计局 2025 年人口数据解读",
    summary: "老龄人口规模持续扩大，构成长寿经济需求侧的长期确定性。",
    node: "health-management",
    stage: "downstream",
    url: "https://www.stats.gov.cn/sj/sjjd/202601/t20260119_1962338.html",
  },
  {
    kind: "节点口径",
    title: "医疗服务与老年疾病综合管理",
    summary: "通过医院、专科中心和医养结合服务承接创新药械验证和老年疾病连续管理。",
    node: "clinical-services",
    stage: "downstream",
    url: "./苏州BioBAY长寿经济产业图谱.md",
  },
  {
    kind: "节点口径",
    title: "人才国际化与长寿经济出海",
    summary: "以高层次人才、院校平台、新加坡合作和海外 BD 支撑国际注册和全球合作。",
    node: "talent-global",
    stage: "support",
    url: "./苏州BioBAY长寿经济产业图谱.md",
  },
  {
    kind: "图谱说明",
    title: "苏州 BioBAY 长寿经济产业图谱说明",
    summary: "说明图谱分层、节点定义、关键补链方向和后续数据字段。",
    node: "policy-capital",
    stage: "support",
    url: "./苏州BioBAY长寿经济产业图谱.md",
  },
  {
    kind: "初始研报",
    title: "全球长寿经济市场分析与三家高成长企业",
    summary: "集中说明全球长寿经济市场、评分模型、三家高成长企业和每日研报机制。",
    node: "ai-data",
    stage: "support",
    url: "./全球长寿经济市场分析与三家高成长企业.md",
  },
];

const watchlists = [
  {
    group: "全球长寿科技企业",
    companies: [
      {
        name: "Insilico Medicine",
        ticker: "3696.HK",
        focus: "AI 药物发现 / 健康寿命平台",
        score: 91,
        thesis:
          "2025 年底港股上市，2026 年与 Eli Lilly 签署最高 27.5 亿美元 AI 药物发现合作，平台商业化验证显著增强。",
        signals: ["药企 BD", "管线临床进展", "平台收入", "港股公告"],
        sources: [
          ["公司 2025 年业绩", "https://insilico.com/news/ohz9ozx0t1-insilico-medicine-announces-2025-annual"],
          ["Lilly 合作公告", "https://www.hkexnews.hk/listedco/listconews/sehk/2026/0329/2026032900717.pdf"],
        ],
      },
      {
        name: "Retro Biosciences",
        ticker: "未上市",
        focus: "Autophagy / iPSC 血液干细胞 / 细胞重编程",
        score: 89,
        thesis:
          "以延长 10 年健康寿命为目标，RTR242 已进入 Phase I，2026 年融资后估值约 18 亿美元，临床与平台化路线并进。",
        signals: ["RTR242 临床", "融资", "iPSC 合作", "重编程里程碑"],
        sources: [
          ["公司 2026 更新", "https://www.retro.bio/blog/fundraise-2026"],
          ["STAT 融资报道", "https://www.statnews.com/2026/05/22/retro-biosciences-longevity-valuation/"],
        ],
      },
      {
        name: "Life Biosciences",
        ticker: "未上市",
        focus: "部分表观遗传重编程 / 细胞年轻化",
        score: 88,
        thesis:
          "ER-100 获 FDA IND 放行并启动 Phase I，是首个进入人体临床的表观遗传重编程细胞年轻化疗法之一，2026 年完成 8000 万美元 D 轮融资。",
        signals: ["ER-100 Phase I", "FDA/ClinicalTrials", "融资", "眼科适应症数据"],
        sources: [
          ["IND 放行公告", "https://www.lifebiosciences.com/life-biosciences-announces-fda-clearance-of-ind-application-for-er-100-in-optic-neuropathies/"],
          ["公司新闻中心", "https://www.lifebiosciences.com/news/"],
        ],
      },
    ],
  },
  {
    group: "中国市场上市企业",
    companies: [
      {
        name: "京东健康",
        ticker: "06618.HK",
        focus: "慢病用药 / 在线医疗 / AI 医疗 / 新药首发",
        score: 90,
        thesis:
          "2025 年收入同比增长 26.3%，2026 年 Q1 收入同比增长 17%，平台规模、医药供应链和 AI 医疗工具形成持续跟踪价值。",
        signals: ["业绩公告", "新药首发", "AI 医疗", "药企合作"],
        sources: [
          ["2025 年报摘要", "https://www.itiger.com/news/1151344399"],
          ["2026 Q1 报道", "https://finance.sina.cn/tech/2026-05-13/detail-inhxtkrp7695472.d.html"],
        ],
      },
      {
        name: "阿里健康",
        ticker: "00241.HK",
        focus: "医药电商 / 创新药服务 / AI 医疗 / 本地化健康服务",
        score: 86,
        thesis:
          "2026 财年收入同比增长 12%，净利润同比增长 35.16%，在医药电商监管趋严后转向创新药、AI 和服务融合。",
        signals: ["年度业绩", "创新药合作", "AI 医疗", "平台合规"],
        sources: [
          ["2026 财年业绩报道", "https://www.nbd.com.cn/articles/2026-05-15/4393429.html"],
          ["FY2025 摘要", "https://quartr.com/events/alibaba-health-information-technology-limited-241-h2-2025_Fg6a364N"],
        ],
      },
      {
        name: "可孚医疗",
        ticker: "301087.SZ",
        focus: "康复辅具 / 健康监测 / 医疗护理 / 家用医疗器械",
        score: 84,
        thesis:
          "2025 年收入同比增长 13.56%，归母净利润同比增长 19.20%，康复辅具和健康监测直接对应银发经济、居家照护和主动健康管理。",
        signals: ["年报", "康复辅具", "健康监测", "线下渠道"],
        sources: [
          ["2025 年报解读", "https://finance.sina.com.cn/stock/aigc/stockfs/2026-03-11/doc-inhqrfcn2586211.shtml"],
          ["公司年报全文", "https://cofoe.com.cn/uploads/image/20260323/69c091c9614d6.pdf"],
        ],
      },
    ],
  },
];

const dailyReportTemplate = [
  {
    title: "今日总览",
    body: "扫描全球长寿科技、中国银发经济政策、医疗健康资本市场和 6 家企业重大事件。",
  },
  {
    title: "全球 3 家",
    body: "更新 Insilico Medicine、Retro Biosciences、Life Biosciences 的新闻、融资、临床、合作、论文、监管动态和判断变化。",
  },
  {
    title: "中国 3 家",
    body: "更新京东健康、阿里健康、可孚医疗的公告、财务、业务进展、政策催化、股价与风险变化。",
  },
  {
    title: "结论",
    body: "对每家公司给出维持、上调或下调关注度，并说明主要原因；研报仅作研究监测，不构成投资建议。",
  },
];

const matchmakingNeeds = [
  {
    actor: "创新药 / CGT 企业",
    node: "innovative-drugs",
    stage: "upstream",
    question: "管线如何进入老龄高发疾病的临床验证和支付路径？",
    seek: ["专科医院", "真实世界研究", "医保商保", "出海 BD"],
    resource: "优先看 BioBAY、创新药研究院、苏惠保、临床研究和海外商务交易线索。",
    nextStep: "补具体适应症、临床阶段、老年亚组数据和已合作医院。",
  },
  {
    actor: "IVD / 伴随诊断 / 早筛企业",
    node: "ivd-diagnostics",
    stage: "midstream",
    question: "检测产品如何从实验室走向体检、慢病管理和康养机构？",
    seek: ["样本队列", "体检机构", "慢病管理", "伴随诊断"],
    resource: "优先连接靶点组学、创新药管线、体检服务和长期随访数据。",
    nextStep: "补筛查病种、验证样本量、临床指南位置和支付方式。",
  },
  {
    actor: "高端器械 / 康复辅具企业",
    node: "medical-devices",
    stage: "midstream",
    question: "获批产品如何进入医院、康养机构、名优目录和苏惠保？",
    seek: ["医院试用", "康养采购", "创新名优目录", "苏惠保"],
    resource: "优先看园区大健康行动计划、创新产品推广、机构采购和功能维持场景。",
    nextStep: "补注册证、真实使用效果、机构采购清单和保单责任。",
  },
  {
    actor: "AI+BT / AI制药 / 生物大模型团队",
    node: "ai-data",
    stage: "support",
    question: "算法、模型和数据平台如何变成可验证的药械研发效率？",
    seek: ["药企课题", "实验平台", "数据治理", "公共技术服务"],
    resource: "优先连接 AI4Science、BioBAY 企业、苏州创新药研究院和生物制造平台。",
    nextStep: "补模型应用边界、验证指标、数据合规和企业共研项目。",
  },
  {
    actor: "康养机构 / 医养结合服务方",
    node: "elderly-care",
    stage: "downstream",
    question: "机构如何找到真正减负、可采购、可评估的适老科技产品？",
    seek: ["可穿戴", "康复辅具", "护理预警", "照护系统"],
    resource: "优先看养老院、福利院、康养机构采购智能化适老化产品的政策线索。",
    nextStep: "补机构试点、使用指标、护理人员反馈和采购预算。",
  },
  {
    actor: "城市 / 园区 / 产业资本",
    node: "policy-capital",
    stage: "support",
    question: "如何把单点企业组织成一个可招商、可验证、可出海的区域样板？",
    seek: ["标杆案例", "政策工具", "产业基金", "国际合作"],
    resource: "优先复用 BioBAY 的指标、代表企业、政策工具、四条转化链和证据模型。",
    nextStep: "补企业规模、重点集群、场景清单、政策工具和真实产品案例。",
  },
];

const regionalClusters = [
  {
    name: "苏州 BioBAY",
    region: "江苏苏州",
    status: "标杆案例",
    role: "创新药械策源地 + 长寿医学转化平台 + 康养科技应用示范区",
    why:
      "BioBAY 已具备创新药、高端医疗器械、IVD、生物技术、AI+BT、生物制造、资本和国际合作基础，适合把传统生物医药园区升级为健康寿命延长产业平台。",
    metrics: [
      ["企业规模", "680+ 创新企业"],
      ["重点集群", "创新药 / 高端器械 / IVD / 生物技术"],
      ["政策工具", "5511 培育 / 名优目录 / 苏惠保 / AI 赋能"],
      ["转化方向", "早筛、治疗、康复、照护、支付闭环"],
    ],
    representatives: ["信达生物", "基石药业", "亚盛医药", "宜联生物", "纽伦捷生物", "金翼医疗"],
    scenarioChains: [
      "早筛链：靶点组学 → IVD/伴随诊断 → 体检/慢病管理",
      "治疗链：创新药/CGT → 临床研究 → 医疗服务/医保商保",
      "康复链：高端器械/康复辅具 → 医院/康养机构 → 功能维持",
      "产业化链：AI数据/生物制造 → 审评审批/资本 → 出海与规模化",
    ],
    policyTools: ["5511 企业培育体系", "创新名优目录", "苏惠保", "AI 生物大模型", "康养机构采购", "中新合作与自贸区"],
    assets: ["创新药", "高端器械", "IVD", "AI+BT", "生物制造", "康养机构试点"],
    gaps: ["康养场景数据", "支付保险闭环", "老龄疾病组合方案", "国际注册与出海"],
    links: [
      ["案例图谱", "./苏州BioBAY长寿经济产业图谱.md"],
      ["调研报告", "./苏州生物医药产业园调研分析报告_长寿经济导向.md"],
    ],
  },
  {
    name: "上海张江",
    region: "上海浦东",
    status: "观察中",
    role: "创新药、临床资源、跨国药企与资本市场连接点",
    why:
      "适合作为长寿经济的药物研发、国际合作、真实世界研究和高端医疗服务节点，与苏州 BioBAY 形成长三角联动。",
    assets: ["创新药", "临床资源", "跨国药企", "资本市场"],
    gaps: ["康养应用场景", "长期随访数据", "适老科技产品包"],
    links: [["贡献入口", "#contribute"]],
  },
  {
    name: "北京中关村 / 昌平生命谷",
    region: "北京",
    status: "观察中",
    role: "科研院所、AI 医疗、脑科学和监管转化资源高地",
    why:
      "适合承接长寿医学基础研究、AI 医疗算法、老年疾病临床研究和国家级标准制定。",
    assets: ["科研院所", "AI 医疗", "脑科学", "标准制定"],
    gaps: ["产业化落地", "康养服务网络", "支付侧验证"],
    links: [["贡献入口", "#contribute"]],
  },
  {
    name: "深圳 / 粤港澳大湾区",
    region: "广东",
    status: "征集中",
    role: "医疗器械、可穿戴、机器人、数字健康和跨境医疗协同",
    why:
      "适合作为长寿经济硬件产品、数字健康、居家监测、康复机器人和香港医疗资源联动的试验场。",
    assets: ["医疗器械", "可穿戴", "机器人", "跨境医疗"],
    gaps: ["临床验证", "长期照护场景", "保险支付模型"],
    links: [["贡献入口", "#contribute"]],
  },
  {
    name: "海南博鳌乐城",
    region: "海南",
    status: "观察中",
    role: "国际创新药械准入、真实世界研究和高端医疗消费场景",
    why:
      "适合观察国际创新药械、特许准入、真实世界数据和高净值健康管理如何与长寿经济结合。",
    assets: ["国际药械", "真实世界研究", "高端医疗", "特许准入"],
    gaps: ["普惠支付", "规模化康养", "数据开放机制"],
    links: [["贡献入口", "#contribute"]],
  },
  {
    name: "成都 / 成渝生命健康带",
    region: "四川重庆",
    status: "征集中",
    role: "医疗资源、康养目的地、中医药和西部老龄服务市场",
    why:
      "适合补充长寿经济中的康养目的地、慢病服务、中医药现代化和区域医疗中心价值。",
    assets: ["医疗资源", "康养目的地", "中医药", "区域市场"],
    gaps: ["创新药械链接", "数字化运营", "产业资本"],
    links: [["贡献入口", "#contribute"]],
  },
];

const stageLabels = {
  upstream: "上游",
  midstream: "中游",
  downstream: "下游",
  support: "支撑",
};

const state = {
  filter: "all",
  query: "",
  selectedNode: null,
  lockedNode: null,
  mapTransform: { x: 0, y: 0, scale: 1 },
  isPanning: false,
  didPan: false,
  panStart: { x: 0, y: 0, originX: 0, originY: 0 },
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const svgNs = "http://www.w3.org/2000/svg";

function includesQuery(item) {
  if (!state.query) return true;
  const haystack = JSON.stringify(item).toLowerCase();
  return haystack.includes(state.query.toLowerCase());
}

function matchesFilters(item) {
  const stageMatch = state.filter === "all" || item.stage === state.filter;
  const nodeMatch = !state.selectedNode || item.node === state.selectedNode;
  return stageMatch && nodeMatch && includesQuery(item);
}

function getRelatedNodeIds(nodeId) {
  if (!nodeId) return new Set();
  const related = new Set([nodeId]);
  links.forEach(([fromId, toId]) => {
    if (fromId === nodeId) related.add(toId);
    if (toId === nodeId) related.add(fromId);
  });
  return related;
}

function isRelatedLink(link, nodeId) {
  return nodeId && (link[0] === nodeId || link[1] === nodeId);
}

function setMapTransform() {
  const viewport = $("#mapViewport");
  if (!viewport) return;
  const { x, y, scale } = state.mapTransform;
  viewport.setAttribute("transform", `translate(${x} ${y}) scale(${scale})`);
}

function clampScale(scale) {
  return Math.min(1.8, Math.max(0.68, scale));
}

function drawMap() {
  const laneLayer = $("#laneLayer");
  const linkLayer = $("#linkLayer");
  const nodeLayer = $("#nodeLayer");
  laneLayer.innerHTML = "";
  linkLayer.innerHTML = "";
  nodeLayer.innerHTML = "";
  setMapTransform();

  const activeNode = state.lockedNode;
  const relatedNodes = getRelatedNodeIds(activeNode);

  [
    { label: "上游：研发与技术源头", x: 105, minX: 20, width: 170 },
    { label: "中游：产品与解决方案", x: 315, minX: 230, width: 170 },
    { label: "下游：服务与支付场景", x: 555, minX: 470, width: 170 },
    { label: "支撑：平台与生态要素", x: 765, minX: 690, width: 170 },
  ].forEach((lane) => {
    const band = document.createElementNS(svgNs, "rect");
    band.setAttribute("class", "lane-band");
    band.setAttribute("x", lane.minX);
    band.setAttribute("y", "52");
    band.setAttribute("width", lane.width);
    band.setAttribute("height", "440");
    band.setAttribute("rx", "30");
    laneLayer.appendChild(band);

    const label = document.createElementNS(svgNs, "text");
    label.setAttribute("class", "lane-label");
    label.setAttribute("x", lane.x);
    label.setAttribute("y", "28");
    label.textContent = lane.label;
    laneLayer.appendChild(label);
  });

  links.forEach(([fromId, toId]) => {
    const from = nodes.find((node) => node.id === fromId);
    const to = nodes.find((node) => node.id === toId);
    const path = document.createElementNS(svgNs, "path");
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - 35;
    const related = isRelatedLink([fromId, toId], activeNode);
    path.setAttribute("class", `link${related ? " is-related" : ""}${activeNode && !related ? " is-muted" : ""}`);
    path.setAttribute("d", `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`);
    path.setAttribute("marker-end", "url(#arrowPulse)");
    linkLayer.appendChild(path);
  });

  nodes.forEach((node) => {
    const group = document.createElementNS(svgNs, "g");
    const halo = document.createElementNS(svgNs, "circle");
    const pulse = document.createElementNS(svgNs, "circle");
    const circle = document.createElementNS(svgNs, "circle");
    const core = document.createElementNS(svgNs, "circle");
    const label = document.createElementNS(svgNs, "text");
    const type = document.createElementNS(svgNs, "text");

    const visibleByStage = state.filter === "all" || node.stage === state.filter;
    const selected = state.selectedNode === node.id;
    const unrelated = activeNode && !relatedNodes.has(node.id);
    group.setAttribute(
      "class",
      `node-button${visibleByStage ? "" : " is-dimmed"}${selected ? " is-selected" : ""}${unrelated ? " is-unrelated" : ""}`,
    );
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `筛选 ${node.name}`);
    group.setAttribute("transform", `translate(${node.x} ${node.y})`);

    halo.setAttribute("class", "node-halo");
    halo.setAttribute("r", "56");
    halo.setAttribute("fill", node.color);
    pulse.setAttribute("class", "node-pulse");
    pulse.setAttribute("r", "54");
    circle.setAttribute("r", "44");
    circle.setAttribute("fill", node.color);
    core.setAttribute("class", "node-core");
    core.setAttribute("r", "13");
    core.setAttribute("cy", "-12");
    label.setAttribute("y", "2");
    label.textContent = node.name;
    type.setAttribute("class", "node-type");
    type.setAttribute("y", "24");
    type.textContent = node.type;

    group.append(halo, pulse, circle, core, label, type);
    group.addEventListener("click", (event) => {
      event.stopPropagation();
      selectNode(node.id);
    });
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectNode(node.id);
      }
    });
    nodeLayer.appendChild(group);
  });
}

function selectNode(nodeId) {
  state.lockedNode = state.lockedNode === nodeId ? null : nodeId;
  state.selectedNode = state.lockedNode;
  render();
}

function resetMapView() {
  state.mapTransform = { x: 0, y: 0, scale: 1 };
  state.lockedNode = null;
  state.selectedNode = null;
  render();
}

function zoomMap(multiplier) {
  const nextScale = clampScale(state.mapTransform.scale * multiplier);
  state.mapTransform = { ...state.mapTransform, scale: nextScale };
  setMapTransform();
}

function renderCompanies() {
  const grid = $("#companyGrid");
  const filtered = companies.filter(matchesFilters);
  grid.innerHTML = filtered.length
    ? filtered
        .map(
          (company) => `
            <article class="company-card">
              <div>
                <h3>${company.name}</h3>
                <p>${company.need}</p>
              </div>
              <div class="tags">
                <span class="tag stage-badge">${stageLabels[company.stage]}</span>
                ${company.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
              </div>
              <div class="company-meta">
                <span>${company.location}</span>
                <span>${nodes.find((node) => node.id === company.node).name}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : '<div class="empty">没有匹配结果。可以换一个关键词，或点击图谱节点取消筛选。</div>';
}

function renderResources() {
  const list = $("#resourceList");
  const filtered = resources.filter(matchesFilters);
  list.innerHTML = filtered.length
    ? filtered
        .map(
          (resource) => `
            <article class="resource-row">
              <div class="resource-kind">${resource.kind}</div>
              <div>
                <h3>${resource.title}</h3>
                <p>${resource.summary}</p>
              </div>
              <a href="${resource.url}" target="${resource.url.startsWith("http") ? "_blank" : "_self"}" rel="noreferrer">打开</a>
            </article>
          `,
        )
        .join("")
    : '<div class="empty">当前筛选下暂无资源。欢迎在开源仓库中补充。</div>';
}

function renderWatchlists() {
  const grid = $("#watchlistGrid");
  grid.innerHTML = watchlists
    .map(
      (list) => `
        <section class="watchlist-group" aria-label="${list.group}">
          <h3>${list.group}</h3>
          <div class="watchlist-cards">
            ${list.companies
              .map(
                (company) => `
                  <article class="watch-card">
                    <div class="watch-card-top">
                      <div>
                        <span class="ticker">${company.ticker}</span>
                        <h4>${company.name}</h4>
                      </div>
                      <div class="score" aria-label="成长性评分 ${company.score} 分">${company.score}</div>
                    </div>
                    <p class="focus">${company.focus}</p>
                    <p>${company.thesis}</p>
                    <div class="tags">
                      ${company.signals.map((signal) => `<span class="tag">${signal}</span>`).join("")}
                    </div>
                    <div class="source-links">
                      ${company.sources
                        .map(
                          ([label, url]) =>
                            `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`,
                        )
                        .join("")}
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function renderDailyReportTemplate() {
  const list = $("#dailyReportList");
  list.innerHTML = dailyReportTemplate
    .map(
      (item, index) => `
        <article class="daily-step">
          <span>${index + 1}</span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.body}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderMatchmakingNeeds() {
  const grid = $("#needGrid");
  const filtered = matchmakingNeeds.filter(matchesFilters);
  grid.innerHTML = filtered.length
    ? filtered
        .map(
          (need) => `
            <article class="need-card">
              <div class="need-card-top">
                <span>${stageLabels[need.stage]}</span>
                <strong>${nodes.find((node) => node.id === need.node).name}</strong>
              </div>
              <h3>${need.actor}</h3>
              <p class="need-question">${need.question}</p>
              <div class="tags">
                ${need.seek.map((item) => `<span class="tag">${item}</span>`).join("")}
              </div>
              <div class="need-block">
                <span>可找资源</span>
                <p>${need.resource}</p>
              </div>
              <div class="need-block is-next">
                <span>下一步补证据</span>
                <p>${need.nextStep}</p>
              </div>
            </article>
          `,
        )
        .join("")
    : '<div class="empty">当前筛选下暂无合作需求卡。可以换一个关键词，或点击图谱节点取消筛选。</div>';
}

function renderRegionalClusters() {
  const grid = $("#clusterGrid");
  const filtered = regionalClusters.filter(includesQuery);
  grid.innerHTML = filtered.length
    ? filtered
    .map(
      (cluster) => `
        <article class="cluster-card${cluster.status === "标杆案例" ? " is-featured" : ""}">
          <div class="cluster-card-top">
            <div>
              <span class="cluster-region">${cluster.region}</span>
              <h3>${cluster.name}</h3>
            </div>
            <span class="cluster-status">${cluster.status}</span>
          </div>
          <p class="cluster-role">${cluster.role}</p>
          <p>${cluster.why}</p>
          ${
            cluster.metrics
              ? `<div class="cluster-metrics">
                  ${cluster.metrics
                    .map(
                      ([label, value]) => `
                        <div>
                          <span>${label}</span>
                          <strong>${value}</strong>
                        </div>
                      `,
                    )
                    .join("")}
                </div>`
              : ""
          }
          ${
            cluster.representatives
              ? `<div class="cluster-mini-section">
                  <strong>代表企业/主体</strong>
                  <div class="tags">
                    ${cluster.representatives.map((item) => `<span class="tag representative-tag">${item}</span>`).join("")}
                  </div>
                </div>`
              : ""
          }
          ${
            cluster.scenarioChains
              ? `<div class="cluster-chain-list">
                  ${cluster.scenarioChains.map((chain) => `<span>${chain}</span>`).join("")}
                </div>`
              : ""
          }
          <div class="cluster-columns">
            <div>
              <strong>已有资产</strong>
              <div class="tags">
                ${cluster.assets.map((asset) => `<span class="tag">${asset}</span>`).join("")}
              </div>
            </div>
            <div>
              <strong>下一步验证</strong>
              <div class="tags">
                ${cluster.gaps.map((gap) => `<span class="tag gap-tag">${gap}</span>`).join("")}
              </div>
            </div>
          </div>
          ${
            cluster.policyTools
              ? `<div class="cluster-mini-section">
                  <strong>政策工具</strong>
                  <div class="tags">
                    ${cluster.policyTools.map((tool) => `<span class="tag policy-tag">${tool}</span>`).join("")}
                  </div>
                </div>`
              : ""
          }
          <div class="source-links">
            ${cluster.links
              .map(([label, url]) => `<a href="${url}"${url.startsWith("http") ? ' target="_blank" rel="noreferrer"' : ""}>${label}</a>`)
              .join("")}
          </div>
        </article>
      `,
    )
    .join("")
    : '<div class="empty">当前关键词下暂无产业聚集地案例。欢迎补充新的区域样本。</div>';
}

function renderStats() {
  $("#nodeCount").textContent = nodes.length;
  $("#companyCount").textContent = companies.filter(matchesFilters).length;
  $("#resourceCount").textContent = resources.filter(matchesFilters).length;
}

function render() {
  drawMap();
  renderRegionalClusters();
  renderMatchmakingNeeds();
  renderWatchlists();
  renderDailyReportTemplate();
  renderCompanies();
  renderResources();
  renderStats();
}

function bindEvents() {
  $("#searchInput").addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    render();
  });

  $$(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      state.lockedNode = null;
      state.selectedNode = null;
      $$(".segment").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  const map = $("#industryMap");
  map.addEventListener("pointerdown", (event) => {
    state.isPanning = true;
    state.didPan = false;
    state.panStart = {
      x: event.clientX,
      y: event.clientY,
      originX: state.mapTransform.x,
      originY: state.mapTransform.y,
    };
    map.setPointerCapture(event.pointerId);
    map.classList.add("is-panning");
  });

  map.addEventListener("pointermove", (event) => {
    if (!state.isPanning) return;
    const dx = event.clientX - state.panStart.x;
    const dy = event.clientY - state.panStart.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) state.didPan = true;
    state.mapTransform.x = state.panStart.originX + dx;
    state.mapTransform.y = state.panStart.originY + dy;
    setMapTransform();
  });

  map.addEventListener("pointerup", (event) => {
    if (state.isPanning) {
      map.releasePointerCapture(event.pointerId);
      map.classList.remove("is-panning");
    }
    state.isPanning = false;
  });

  map.addEventListener("pointercancel", () => {
    state.isPanning = false;
    map.classList.remove("is-panning");
  });

  map.addEventListener("click", (event) => {
    if (state.didPan) {
      state.didPan = false;
      return;
    }
    if (event.target.classList.contains("map-hitbox")) {
      state.lockedNode = null;
      state.selectedNode = null;
      render();
    }
  });

  map.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomMap(event.deltaY > 0 ? 0.92 : 1.08);
    },
    { passive: false },
  );

  $("#zoomOut").addEventListener("click", () => zoomMap(0.88));
  $("#zoomIn").addEventListener("click", () => zoomMap(1.12));
  $("#zoomReset").addEventListener("click", resetMapView);
}

bindEvents();
render();
