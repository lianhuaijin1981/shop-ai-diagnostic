import { useState } from 'react'
import {
  Target, TrendingUp, TrendingDown, Users, Package, DollarSign,
  RefreshCcw, ShoppingBag, Zap, CheckCircle2, Clock, Play,
  ChevronRight, X, AlertTriangle, Star, Calendar, User,
  Send, Bell, CheckSquare, Store, ArrowRight, Filter, Search,
  Layers, BarChart3, Award, Shield, Lightbulb
} from 'lucide-react'

// ============ 策略库类型定义 ============

type StrategyStatus = 'idle' | 'dispatched' | 'confirmed' | 'executing' | 'completed'
type StrategyScene = 'traffic_drop' | 'traffic_grow' | 'conversion_low' | 'low_avg_amount' | 'churn_risk' | 'profit_drop' | 'inventory_risk' | 'new_season'
type StrategyPriority = 'urgent' | 'high' | 'medium' | 'low'

interface StrategyStep {
  step: number
  action: string
  timeline: string
  owner: string
  detail?: string
}

interface Strategy {
  id: string
  scene: StrategyScene
  sceneLabel: string
  priority: StrategyPriority
  title: string
  summary: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  tags: string[]
  // 详情
  applicableCondition: string    // 适用范围与触发条件
  specificMeasures: string[]    // 具体措施
  implementSteps: StrategyStep[]   // 实施步骤
  expectedEffect: string           // 预期效果
  exitMechanism: string            // 退出机制
  estimatedDuration: string        // 预计周期
  difficulty: 'easy' | 'medium' | 'hard'
  expectedLiftRange: string        // 预期提升区间
  status: StrategyStatus
  dispatchedAt?: string
  confirmedAt?: string
}

// ============ 内置策略库（不同经营情况→对应备选策略）============

const STRATEGY_LIBRARY: Strategy[] = [
  // ─── 客流下滑场景 ───
  {
    id: 'S001',
    scene: 'traffic_drop',
    sceneLabel: '客流下滑',
    priority: 'urgent',
    title: '老客带新裂变引流计划',
    summary: '通过老客推荐激励机制，快速扩大门店新客来源，适合自然客流下滑≥10%时紧急启动',
    icon: Users,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    tags: ['裂变引流', '低成本', '快速见效'],
    applicableCondition: '适用条件：当周/当月客流同比下滑10%及以上，或持续2周以上客流低于预警线。门店具备基本会员体系（100人以上活跃会员）。适合各类型服装零售门店。',
    specificMeasures: [
      '老客推荐新客到店，双方各享9折优惠，老客累计积分加倍（满3人推荐额外送100元代金券）',
      '在门店入口处和收银台摆放"邀请好友"专属引导牌，强化视觉提醒',
      '利用微信私域群/朋友圈发布"好友专属邀请码"，进店扫码核销',
      '设置阶梯奖励：推荐1人得50积分、3人得200积分+专属礼品、5人以上升级VIP待遇',
      '每周三"老带新专属日"：老客带新客到店享门店最高折扣组合',
    ],
    implementSteps: [
      { step: 1, action: '配置系统推荐码，生成专属邀请链接/小程序码，测试核销流程正常', timeline: '第1天', owner: '技术/店长', detail: '确认POS系统支持老带新折扣核销逻辑' },
      { step: 2, action: '制作活动物料（推荐卡、门口海报、收银台引导牌），印刷并上架', timeline: '第1-2天', owner: '美工/店长' },
      { step: 3, action: '向全部活跃会员发送活动短信/微信推送，附带专属邀请码', timeline: '第2天', owner: '运营' },
      { step: 4, action: '全员培训活动话术，收银时主动介绍：「您朋友来店可享9折，您也可得积分」', timeline: '第2-3天', owner: '店长' },
      { step: 5, action: '活动上线，每日统计新客来源、转化率，每周复盘优化激励机制', timeline: '持续4周', owner: '全员' },
    ],
    expectedEffect: '预计4周内通过裂变新增新客50-100人，客流提升10-15%，该策略边际成本极低（主要是折扣让利），ROI通常可达1:6以上',
    exitMechanism: '执行2周后，若新客转化率低于3%（即每100次推荐码发放不足3次核销），说明老客活跃度不足，应先优先激活沉睡会员；或改为异业联盟引流方向',
    estimatedDuration: '4周',
    difficulty: 'easy',
    expectedLiftRange: '+10%~+15% 客流',
    status: 'idle',
  },
  {
    id: 'S002',
    scene: 'traffic_drop',
    sceneLabel: '客流下滑',
    priority: 'high',
    title: '短视频+到店核销引流组合',
    summary: '通过抖音/小红书内容种草，结合到店核销转化，实现线上流量→线下客流的高效转化',
    icon: TrendingUp,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
    tags: ['内容营销', '线上引流', '种草转化'],
    applicableCondition: '适用条件：门店附近目标客群（18-35岁女性为主）活跃于抖音/小红书平台，门店有1-2名能出镜或协助拍摄的员工。自然客流下滑或新开业需快速打知名度时使用。',
    specificMeasures: [
      '每周发布2-3条短视频：穿搭种草/买家秀/门店探店/新品首发，真实自然风格',
      '视频结尾引导：「到店出示视频截图享9折/领取专属礼品」，设置明确行动指令',
      '与同城穿搭博主（粉丝1-10万腰部）合作探店，置换优惠券而非现金，降低成本',
      '在抖音开通本地生活团购（到店核销），设置「引流款套餐」提升线上可见度',
      '建立内容素材库：每次新品上新时同步输出3-5张高质量买家秀/穿搭图',
    ],
    implementSteps: [
      { step: 1, action: '开通/优化抖音/小红书店铺账号，完善门店信息、定位、联系方式', timeline: '第1天', owner: '运营/店长' },
      { step: 2, action: '拍摄第一条探店/穿搭视频（30-60秒），发布并测试核销码配置', timeline: '第1-3天', owner: '拍摄/运营' },
      { step: 3, action: '联系3-5位本地腰部博主，发出置换合作邀请（优惠券换探店内容）', timeline: '第3-5天', owner: '店长' },
      { step: 4, action: '开通到店团购核销，上架1-2款「引流套餐」（低利润款），配置核销流程', timeline: '第3-5天', owner: '店长/IT' },
      { step: 5, action: '保持周3次以上内容更新频率，每周统计线上→线下核销数据', timeline: '持续执行', owner: '运营' },
    ],
    expectedEffect: '预计6-8周后，通过线上内容带来月增新客20-40人，若有博主合作，单条视频可带来门店访客50-200人次；团购引流预计月增到店15-30人',
    exitMechanism: '若持续发布8条视频后单条平均播放量低于500，且到店核销为0，说明内容方向或发布时间段有问题，应申请专业拍摄优化或更换内容策略；继续投入成本效益低',
    estimatedDuration: '6-8周',
    difficulty: 'medium',
    expectedLiftRange: '+8%~+20% 客流（内容复利效应）',
    status: 'idle',
  },
  // ─── 转化率低场景 ───
  {
    id: 'S003',
    scene: 'conversion_low',
    sceneLabel: '转化率低',
    priority: 'urgent',
    title: '接待SOP标准化+话术提升计划',
    summary: '针对进店未成交率偏高问题，通过接待标准化和话术培训，系统性提升转化率',
    icon: Target,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    tags: ['话术培训', '标准化', '快速提升'],
    applicableCondition: '适用条件：门店转化率低于35%（服装类行业均值42%以下），或发现进店客户「随便看看就走」比例超过40%。尤其适合新开业门店或员工配置变动后转化率下滑的情况。',
    specificMeasures: [
      '制定"三步接待法"SOP：①进店10秒内问候 → ②30秒内需求探询（「您今天是找上班穿还是约会穿？」）→ ③1分钟内引导到对应主推区',
      '编制「价格异议应对话术」手册：对「太贵了/再想想」等常见拒绝给出3种回应话术',
      '实施「镜头复盘」：每日抽取2-3次真实接待录像，店长带领复盘优化',
      '设置转化率每日可见看板，员工各自转化率数据公开，形成良性竞争',
      '对转化率连续3天低于25%的员工启动「1对1辅导计划」',
    ],
    implementSteps: [
      { step: 1, action: '编写接待SOP手册（含流程图+话术示例），打印人手一份', timeline: '第1-2天', owner: '店长' },
      { step: 2, action: '组织全员SOP培训（2小时），进行现场情景模拟演练，考核合格方能上岗', timeline: '第2-3天', owner: '店长' },
      { step: 3, action: '建立转化率每日统计表，各员工数据每日下班前录入，店长次日复盘', timeline: '第3天起', owner: '店长' },
      { step: 4, action: '每周周会抽取5段真实接待片段集体复盘，识别「话术断点」并优化', timeline: '每周执行', owner: '全员' },
      { step: 5, action: '4周后评估转化率变化，若提升超5pp则复制优秀话术，扩大推广', timeline: '第4周', owner: '店长' },
    ],
    expectedEffect: '预计4-6周内转化率从当前水平提升5-10个百分点（如从35%→42%），按日均进店100人计算，每日多成交5-10单，月增营收15,000-30,000元',
    exitMechanism: '若6周后转化率提升不足3pp，说明主要问题在货品本身（款式/价格不符合客群需求）而非话术，需优先推进货品结构调整，话术培训辅助进行',
    estimatedDuration: '4-6周',
    difficulty: 'easy',
    expectedLiftRange: '+5~+10pp 转化率',
    status: 'idle',
  },
  // ─── 客单价低场景 ───
  {
    id: 'S004',
    scene: 'low_avg_amount',
    sceneLabel: '客单价低',
    priority: 'high',
    title: '连带销售激活计划（搭配陈列+连带话术）',
    summary: '通过搭配式陈列改造+连带销售话术培训+激励机制，系统性提升每单件数和客单价',
    icon: ShoppingBag,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    tags: ['连带销售', '陈列优化', '客单提升'],
    applicableCondition: '适用条件：门店客单件数低于1.6件（服装类行业均值1.8件），或近期客单价同比下滑超过10%。适合货品结构较为完整（上下装+配件）的服装类门店。',
    specificMeasures: [
      '陈列改为「搭配展示模式」：每个主推款旁边陈列1-2件搭配建议，配上完整穿搭照片和价格组合',
      '培训「三步连带话术」：① 确认主购款 → ② 「这条裤子/外套配您选的上衣特别好看，要不要试试？」→ ③ 引导试穿增加成交概率',
      '设计组合套餐：上衣+裤装9折、上下外套8.5折、全套搭（上下外套+配件）8折',
      '连带销售员工激励：当日连带率超1.8件奖励50元，超2件奖励100元',
      '在试衣间内张贴「搭配建议卡」，客户试穿时员工主动推荐搭配款',
    ],
    implementSteps: [
      { step: 1, action: '梳理当前库存，设计10套完整穿搭（含价格），制作搭配推荐图卡', timeline: '第1-2天', owner: '陈列/店长' },
      { step: 2, action: '调整门店陈列：爆款区改为「整套搭配展示」，试衣间贴搭配建议卡', timeline: '第2-3天', owner: '陈列' },
      { step: 3, action: '全员连带话术培训（1小时），重点演练「推荐搭配」环节，现场通关', timeline: '第3天', owner: '店长' },
      { step: 4, action: '配置套餐折扣规则，收银系统测试组合套餐核销正常', timeline: '第3-4天', owner: 'IT/收银' },
      { step: 5, action: '每日公布连带率排名，每周兑现连带奖励，月度分享连带销售最佳案例', timeline: '持续执行', owner: '店长' },
    ],
    expectedEffect: '预计6-8周内连带销售率从1.3提升至1.7-1.8件，客单价提升20-30%；以日均50单为例，每单多增60-80元，日增营收3,000-4,000元，月增约90,000-120,000元',
    exitMechanism: '若4周后连带率提升不足0.2件，说明货品搭配结构有问题（上下装/配件比例不匹配），需调整进货方向增加搭配配件，而非继续强化话术培训',
    estimatedDuration: '6-8周',
    difficulty: 'medium',
    expectedLiftRange: '+20%~+30% 客单价',
    status: 'idle',
  },
  // ─── 客户流失风险场景 ───
  {
    id: 'S005',
    scene: 'churn_risk',
    sceneLabel: '客户流失风险',
    priority: 'high',
    title: '沉睡会员批量激活行动',
    summary: '针对90天未消费的沉睡会员，通过分级唤醒策略和专属回归礼，批量激活高价值流失客户',
    icon: RefreshCcw,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    tags: ['会员激活', '流失挽回', '精准运营'],
    applicableCondition: '适用条件：沉睡会员（90天以上未消费）占会员总数超过20%，或月度新客比例持续下降（门店增长越来越依赖老客）。适合有基础会员体系的门店。',
    specificMeasures: [
      '将沉睡会员按历史消费金额分为A（2000+）/B（500-2000）/C（500以下）三级，差异化唤醒方案',
      'A级高价值沉睡客户：店长本人致电，附带「专属回归礼包」（满300减80+免费穿搭咨询）',
      'B级客户：发送「专属回归短信+微信卡券」，优惠力度：满200减40，有效期7天',
      'C级客户：批量推送换季新品图文推荐，附带5元无门槛优惠券，引导到店',
      '建立「回归客户专属档案」：记录唤醒方式、回访时间、到店反馈，迭代优化',
    ],
    implementSteps: [
      { step: 1, action: '导出沉睡会员名单，按消费金额分A/B/C三级，制作差异化短信和话术', timeline: '第1天', owner: '运营/店长' },
      { step: 2, action: '启动A级客户致电（每天10-20人），记录接通率/到店意向，及时跟进', timeline: '第1-7天', owner: '店长' },
      { step: 3, action: '批量发送B/C级短信，同步发放优惠券，设置7天有效期', timeline: '第2天', owner: '运营' },
      { step: 4, action: '私域群/朋友圈发布「换季新品到店礼」预告，吸引感兴趣客户回流', timeline: '第3-5天', owner: '运营' },
      { step: 5, action: '统计各级激活率，7天后复盘数据，对未响应A级客户二次跟进', timeline: '第7-14天', owner: '店长' },
    ],
    expectedEffect: '预计A级激活率15-25%，B级激活率8-12%，C级激活率3-5%；以200名沉睡会员估算，可激活回流20-40人，带来月增营收约20,000-50,000元（A级客户单次消费高）',
    exitMechanism: '若A级致电响应率低于10%，说明该批客户已永久流失（可能是竞品拦截/搬家等），接受损失并将重心转移到当前活跃客户的复购提升；对于C级客户可每季度轻量唤醒一次',
    estimatedDuration: '2-3周（首次），后续季度性执行',
    difficulty: 'easy',
    expectedLiftRange: '+20~+50人 回流/月',
    status: 'idle',
  },
  // ─── 利润下滑场景 ───
  {
    id: 'S006',
    scene: 'profit_drop',
    sceneLabel: '利润下滑',
    priority: 'urgent',
    title: '折扣活动结构性优化计划',
    summary: '将低效的全场折扣活动替换为精准定向促销，在不影响客流的前提下系统性提升毛利率',
    icon: DollarSign,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    tags: ['利润优化', '折扣重构', '毛利提升'],
    applicableCondition: '适用条件：门店毛利率低于40%（服装类行业均值48%以下），或发现全场折扣活动（7折/8折）期间营收增量不足5%，即折扣让利大于销量增量。适合有一定库存深度的门店。',
    specificMeasures: [
      '立即停止「全场8折/7折」等无差别折扣，改为「指定款9折」或「指定品类折扣」',
      '设计「高价值组合套餐」替代折扣：全套搭享8折（客单更高，总毛利反而更多）',
      '对真正需要清仓的滞销款：单独设置「清仓区」，不与主推区混合，避免拉低主推款形象',
      '精准活动日历：折扣活动只在周末/节假日特定时段（2小时限时）执行，减少常态化折扣损耗',
      '建立各品类毛利率月报，对毛利率持续低于25%的SKU启动淘汰机制',
    ],
    implementSteps: [
      { step: 1, action: '梳理当前所有折扣活动规则，逐一评估毛利率，标注「亏损活动」', timeline: '第1天', owner: '店长/财务' },
      { step: 2, action: '停止亏损活动，同步设计替代方案（组合套餐/指定款折扣），配置系统', timeline: '第2-3天', owner: '店长/IT' },
      { step: 3, action: '划设清仓专区，将滞销/过季款集中陈列，贴标清晰「清仓价」不拉低主区', timeline: '第2-3天', owner: '陈列' },
      { step: 4, action: '向会员发送「活动调整」说明（突出「精选折扣更划算」的正面包装）', timeline: '第3-4天', owner: '运营' },
      { step: 5, action: '活动调整后持续跟踪：毛利率变化、客流变化，2周后出具对比报告', timeline: '持续2周', owner: '店长' },
    ],
    expectedEffect: '预计4周内毛利率从40%提升至46-48%，若月营收80万，毛利率提升6pp则月增毛利约48,000元；客流可能短期微降2-5%，但总利润反而提升',
    exitMechanism: '若停止全场折扣后2周内客流下滑超过15%（且无法通过其他引流策略补充），说明该门店已严重依赖折扣维持客流，需先解决客流问题，再渐进式调整折扣结构',
    estimatedDuration: '4周调整期，后续持续优化',
    difficulty: 'medium',
    expectedLiftRange: '+4~+8pp 毛利率',
    status: 'idle',
  },
  // ─── 库存风险场景 ───
  {
    id: 'S007',
    scene: 'inventory_risk',
    sceneLabel: '库存积压',
    priority: 'high',
    title: '滞销库存快速清仓行动计划',
    summary: '针对积压超过60天的滞销款，通过多种清仓手段组合，在2-4周内快速回笼资金',
    icon: Package,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    tags: ['库存清仓', '资金回笼', '换季处理'],
    applicableCondition: '适用条件：门店有超过30天无销售记录的SKU数超过总SKU数15%，或库存积压金额超过月营业额的30%。换季节点（3-4月/9-10月）前使用效果最佳。',
    specificMeasures: [
      '将滞销款按积压时长分级：60-90天（快速促销）/90-180天（大力度活动清仓）/180天+（成本价清仓/捐赠/回收）',
      '设计清仓活动：「买任意正价款+9.9元换购清仓款」，让清仓款搭载正价款出清，减少品牌损耗',
      '与周边二手/寄卖平台合作：部分滞销款以批发价出货，回笼70%成本',
      '举办「换季特卖会」：设置独立清仓区，限时2天，全场清仓款买2件享7折',
      '员工亲友优惠购：内部员工+亲友价购买清仓款，既激励员工又处理库存',
    ],
    implementSteps: [
      { step: 1, action: '盘点全部库存，列出滞销SKU名单（60天+无销售记录），标注积压成本', timeline: '第1天', owner: '店长/仓库' },
      { step: 2, action: '设置清仓专区：物理隔离（避免影响主区客流感受），定价清晰标注「原价/清仓价」', timeline: '第2天', owner: '陈列' },
      { step: 3, action: '配置「搭购清仓」活动规则，培训收银员话术（收银时主动推荐清仓区搭购）', timeline: '第2-3天', owner: '店长/收银' },
      { step: 4, action: '联系2-3家二手/寄卖平台，商谈积压量最大的SKU批发出货价格', timeline: '第3-5天', owner: '店长' },
      { step: 5, action: '举办2天特卖会，发动私域群+朋友圈宣传，统计清仓成效，及时处理剩余库存', timeline: '第7-10天', owner: '全员' },
    ],
    expectedEffect: '预计2-4周内清仓完成率达60-80%，回笼库存资金约为积压金额的50-70%；清仓出的资金可直接用于补充当季爆款，形成良性循环',
    exitMechanism: '清仓活动执行2周后，若清仓率不足30%，需评估是否为定价问题（清仓价仍高于客户心理价位），可进一步降价至成本价清仓；剩余不能出清的货品考虑捐赠处理换税收优惠',
    estimatedDuration: '2-4周',
    difficulty: 'medium',
    expectedLiftRange: '回笼资金50%~70%',
    status: 'idle',
  },
  // ─── 新品上市场景 ───
  {
    id: 'S008',
    scene: 'new_season',
    sceneLabel: '新品上市',
    priority: 'medium',
    title: '换季新品首发引爆策略',
    summary: '在换季上新节点通过首发预告、到店专属礼等手段，快速建立新品认知并带动全品类销售',
    icon: Star,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    tags: ['新品推广', '上新首发', '会员唤醒'],
    applicableCondition: '适用条件：门店处于换季上新节点（春夏/秋冬切换前1-2周），适合有私域会员群的门店；新款货品到仓后立即启动，效果最佳。',
    specificMeasures: [
      '提前3天在私域群+朋友圈发布「新品预告」内容（穿搭大片/幕后揭秘），引发期待感',
      '设置「首发专属礼」：上新首周到店选购新款享赠品礼（品牌配件/小礼盒），仅限前50名',
      '邀请高价值VIP会员「提前尝鲜」：新品到仓当天私下通知VIP可提前选购，增强VIP特权感',
      '上新首周主推「新品+清仓搭购」：购买新品任意一件，可享清仓款5折购，借新品带动库存清消',
      '收集首发客户反馈：到店选购新品的客户赠送「试穿评价卡」，获取产品反馈用于后续补货决策',
    ],
    implementSteps: [
      { step: 1, action: '货品到仓后立即拍摄新品穿搭大片（5-8张），制作新品预告推文/视频', timeline: '到货当天', owner: '拍摄/运营' },
      { step: 2, action: '私下通知TOP10 VIP会员，邀请提前尝鲜，给予最优先选款权利', timeline: '到货第1天', owner: '店长' },
      { step: 3, action: '私域群+朋友圈发布「换季新品首发」预告，附首发礼品信息，制造稀缺感', timeline: '到货第2天', owner: '运营' },
      { step: 4, action: '门店陈列调整：新品占据最优陈列位（入口右侧第一区），配首发标识', timeline: '正式上市前1天', owner: '陈列' },
      { step: 5, action: '首发日全员精神状态最佳，主动推荐+连带搭配，记录客户反馈', timeline: '首发日', owner: '全员' },
    ],
    expectedEffect: '预计上新首周到店人数提升20-30%（新品吸引力），新品周转率达到70%以上（避免首批压货），VIP满意度提升，老客复购周期缩短约1-2周',
    exitMechanism: '上新首周后评估新品动销率：若动销率低于30%（上架7天销量不足总库存的30%），需立即评估是款式问题还是定价问题，提前调整或追加促销力度；避免变成新的积压库存',
    estimatedDuration: '1-2周首发期，后续转常规运营',
    difficulty: 'easy',
    expectedLiftRange: '+20%~+30% 首发周到店',
    status: 'idle',
  },
  // ─── 客流增长稳固场景 ───
  {
    id: 'S009',
    scene: 'traffic_grow',
    sceneLabel: '客流增长期',
    priority: 'medium',
    title: '高峰期承接能力强化计划',
    summary: '在客流增长期，通过排班优化+高峰期人员部署+高效接待流程，最大化承接客流转化为销售',
    icon: Zap,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100',
    tags: ['高峰承接', '人效优化', '服务提升'],
    applicableCondition: '适用条件：门店处于客流增长期（节假日/旺季/活动期间），或日均客流超过150人但转化率反而下降（说明接待能力跟不上）。适合3人以上员工配置的门店。',
    specificMeasures: [
      '根据过去4周时段客流数据优化排班：高峰时段（午12-14点/晚18-21点）增加1名机动人员',
      '高峰期实行「分工制」：1人专门在门口引导/介绍；1-2人负责全场巡场推荐；1人专职结账',
      '设置「快速结账通道」：预先折叠好常规号码的包装袋，收银台常备零钱，减少排队等待',
      '高峰期缩短每位客户平均接待时间至5-8分钟，提高接待效率（而非减少质量）',
      '试衣间实行「限时30分钟」，高峰期主动提醒等待客户，避免堵塞试衣间降低成交机会',
    ],
    implementSteps: [
      { step: 1, action: '调取近4周各时段客流数据，识别3-4个高峰时段，制定优化排班方案', timeline: '第1-2天', owner: '店长' },
      { step: 2, action: '与员工沟通新排班安排，确定高峰期分工职责，模拟演练分工协作', timeline: '第2-3天', owner: '店长' },
      { step: 3, action: '准备快速结账所需物资（包装材料、零钱备用金），整理收银台效率设施', timeline: '第3天', owner: '收银' },
      { step: 4, action: '高峰期实际执行新分工方案，店长在场巡视并实时调度优化', timeline: '第4天起', owner: '全员' },
      { step: 5, action: '1周后对比高峰期成交率和客户满意度，持续迭代排班和分工方案', timeline: '每周复盘', owner: '店长' },
    ],
    expectedEffect: '预计高峰期转化率提升5-8个百分点（从35%→40-43%），高峰期单时段成交额提升15-25%，客户等待时间缩短50%，整体月营收提升10-15%',
    exitMechanism: '若实施2周后高峰期转化率未提升，说明问题不在接待效率而在货品匹配或价格，此时应切换为货品结构分析方向；持续增加排班成本不经济',
    estimatedDuration: '2周调整期，后续持续优化',
    difficulty: 'easy',
    expectedLiftRange: '+10%~+15% 高峰销售额',
    status: 'idle',
  },
]

// ============ 场景分组配置 ============
const SCENE_CONFIG: Record<StrategyScene, { label: string; icon: React.ElementType; color: string }> = {
  traffic_drop:  { label: '客流下滑', icon: TrendingDown, color: 'text-red-500' },
  traffic_grow:  { label: '客流增长', icon: TrendingUp, color: 'text-green-500' },
  conversion_low: { label: '转化率低', icon: Target, color: 'text-blue-500' },
  low_avg_amount: { label: '客单价低', icon: ShoppingBag, color: 'text-amber-500' },
  churn_risk:    { label: '客户流失', icon: Users, color: 'text-purple-500' },
  profit_drop:   { label: '利润下滑', icon: DollarSign, color: 'text-emerald-500' },
  inventory_risk: { label: '库存积压', icon: Package, color: 'text-orange-500' },
  new_season:    { label: '新品上市', icon: Star, color: 'text-yellow-500' },
}

const PRIORITY_CONFIG: Record<StrategyPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: '紧急', color: 'text-red-600', bg: 'bg-red-100' },
  high:   { label: '高优', color: 'text-orange-600', bg: 'bg-orange-100' },
  medium: { label: '中优', color: 'text-amber-600', bg: 'bg-amber-100' },
  low:    { label: '低优', color: 'text-gray-500', bg: 'bg-gray-100' },
}

const DIFFICULTY_CONFIG = {
  easy:   { label: '易执行', color: 'text-green-600', bg: 'bg-green-100' },
  medium: { label: '中难度', color: 'text-amber-600', bg: 'bg-amber-100' },
  hard:   { label: '高难度', color: 'text-red-600', bg: 'bg-red-100' },
}

const STATUS_CONFIG: Record<StrategyStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  idle:       { label: '未启动', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
  dispatched: { label: '已下发', icon: Send, color: 'text-blue-500', bg: 'bg-blue-100' },
  confirmed:  { label: '门店已确认', icon: CheckSquare, color: 'text-purple-500', bg: 'bg-purple-100' },
  executing:  { label: '执行中', icon: Play, color: 'text-amber-500', bg: 'bg-amber-100' },
  completed:  { label: '已完成', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
}

// ============ 策略详情弹窗 ============
interface StrategyDetailModalProps {
  strategy: Strategy | null
  onClose: () => void
  onDispatch: (strategyId: string) => void
}

function StrategyDetailModal({ strategy, onClose, onDispatch }: StrategyDetailModalProps) {
  const [dispatching, setDispatching] = useState(false)
  const [dispatched, setDispatched] = useState(false)

  if (!strategy) return null

  const priorityCfg = PRIORITY_CONFIG[strategy.priority]
  const difficultyCfg = DIFFICULTY_CONFIG[strategy.difficulty]
  const Icon = strategy.icon

  const handleDispatch = async () => {
    setDispatching(true)
    // 模拟通知发送延迟
    await new Promise(r => setTimeout(r, 1200))
    setDispatching(false)
    setDispatched(true)
    onDispatch(strategy.id)
  }

  const canDispatch = strategy.status === 'idle'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${strategy.iconBg}`}>
                <Icon className={`w-5 h-5 ${strategy.iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${priorityCfg.bg} ${priorityCfg.color}`}>{priorityCfg.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${difficultyCfg.bg} ${difficultyCfg.color}`}>{difficultyCfg.label}</span>
                  <span className="text-xs text-gray-400">适用：{strategy.sceneLabel}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{strategy.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{strategy.summary}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-4">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 核心指标 */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-400 mb-1">预期提升</p>
              <p className="text-sm font-bold text-primary-600">{strategy.expectedLiftRange}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-400 mb-1">执行周期</p>
              <p className="text-sm font-bold text-gray-800">{strategy.estimatedDuration}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-400 mb-1">当前状态</p>
              <p className={`text-sm font-bold ${STATUS_CONFIG[strategy.status].color}`}>{STATUS_CONFIG[strategy.status].label}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 适用范围 */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">适用范围 & 触发条件</span>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">{strategy.applicableCondition}</p>
          </div>

          {/* 具体措施 */}
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-gray-800">具体措施</span>
            </div>
            <div className="space-y-2.5">
              {strategy.specificMeasures.map((m, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 实施步骤 */}
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-gray-800">实施步骤</span>
            </div>
            <div className="space-y-3">
              {strategy.implementSteps.map((s) => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary-50 border border-primary-200 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">{s.step}</div>
                  <div className="flex-1 pb-3 border-b border-gray-50 last:border-0">
                    <p className="text-sm font-medium text-gray-900">{s.action}</p>
                    {s.detail && <p className="text-xs text-gray-400 mt-0.5">{s.detail}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{s.timeline}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" />负责：{s.owner}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 预期效果 */}
          <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm font-semibold text-green-700">预期效果</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{strategy.expectedEffect}</p>
          </div>

          {/* 退出机制 */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">退出机制</span>
            </div>
            <p className="text-sm text-orange-700 leading-relaxed">{strategy.exitMechanism}</p>
          </div>
        </div>

        {/* Footer - 执行操作 */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          {dispatched || strategy.status !== 'idle' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">策略已下发至门店，等待店长确认执行</span>
              </div>
              <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-white transition-colors">
                关闭
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                点击"选择执行"后，系统将自动通知门店店长，由店长确认执行
              </p>
              <div className="flex items-center gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-white transition-colors">
                  稍后考虑
                </button>
                <button
                  onClick={handleDispatch}
                  disabled={dispatching}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 font-medium"
                >
                  {dispatching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      通知门店中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      选择执行 · 通知门店
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============ 主页面 ============

export function StrategyCenter() {
  const [strategies, setStrategies] = useState<Strategy[]>(STRATEGY_LIBRARY)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [filterScene, setFilterScene] = useState<StrategyScene | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<StrategyStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDispatchNotice, setShowDispatchNotice] = useState(false)
  const [lastDispatchedStrategy, setLastDispatchedStrategy] = useState<string>('')

  const handleDispatch = (strategyId: string) => {
    setStrategies(prev =>
      prev.map(s => s.id === strategyId ? {
        ...s,
        status: 'dispatched',
        dispatchedAt: new Date().toLocaleString('zh-CN'),
      } : s)
    )
    const s = strategies.find(s => s.id === strategyId)
    if (s) setLastDispatchedStrategy(s.title)
    setShowDispatchNotice(true)
    setTimeout(() => setShowDispatchNotice(false), 4000)
  }

  const handleConfirm = (strategyId: string) => {
    setStrategies(prev =>
      prev.map(s => s.id === strategyId ? {
        ...s,
        status: 'executing',
        confirmedAt: new Date().toLocaleString('zh-CN'),
      } : s)
    )
  }

  // 过滤
  const filtered = strategies.filter(s => {
    if (filterScene !== 'all' && s.scene !== filterScene) return false
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    if (searchQuery && !s.title.includes(searchQuery) && !s.summary.includes(searchQuery)) return false
    return true
  })

  const executingCount = strategies.filter(s => s.status === 'dispatched' || s.status === 'executing').length
  const completedCount = strategies.filter(s => s.status === 'completed').length
  const idleCount = strategies.filter(s => s.status === 'idle').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 下发成功提示 */}
      {showDispatchNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-success text-white px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">「{lastDispatchedStrategy}」已通知门店，等待确认执行</span>
        </div>
      )}

      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">策略中心</h1>
        <p className="text-sm text-gray-500 mt-1">
          预设各类经营情况下的备选策略库 · 一键下发门店执行
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-gray-500">策略总数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{strategies.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">覆盖{Object.keys(SCENE_CONFIG).length}类经营场景</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-500">执行中</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{executingCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">已下发门店执行</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-sm text-gray-500">已完成</span>
          </div>
          <p className="text-2xl font-bold text-success">{completedCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">历史执行成功数</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500">待启动</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{idleCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">可选择的备选策略</p>
        </div>
      </div>

      {/* 筛选 & 搜索 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 搜索 */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索策略..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 状态筛选 */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">全部状态</option>
          {(Object.keys(STATUS_CONFIG) as StrategyStatus[]).map(k => (
            <option key={k} value={k}>{STATUS_CONFIG[k].label}</option>
          ))}
        </select>
      </div>

      {/* 场景分组标签 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterScene('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filterScene === 'all' ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          全部场景
        </button>
        {(Object.keys(SCENE_CONFIG) as StrategyScene[]).map(scene => {
          const cfg = SCENE_CONFIG[scene]
          const SceneIcon = cfg.icon
          const count = strategies.filter(s => s.scene === scene).length
          return (
            <button
              key={scene}
              onClick={() => setFilterScene(scene === filterScene ? 'all' : scene)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterScene === scene ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SceneIcon className={`w-3.5 h-3.5 ${filterScene === scene ? 'text-white' : cfg.color}`} />
              {cfg.label}
              <span className={`text-xs ${filterScene === scene ? 'text-white/80' : 'text-gray-400'}`}>({count})</span>
            </button>
          )
        })}
      </div>

      {/* 策略列表 */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无符合条件的策略</p>
          </div>
        ) : (
          filtered.map(strategy => {
            const priorityCfg = PRIORITY_CONFIG[strategy.priority]
            const statusCfg = STATUS_CONFIG[strategy.status]
            const difficultyCfg = DIFFICULTY_CONFIG[strategy.difficulty]
            const Icon = strategy.icon
            const StatusIcon = statusCfg.icon
            const sceneCfg = SCENE_CONFIG[strategy.scene]

            return (
              <div
                key={strategy.id}
                className="bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* 图标 */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${strategy.iconBg}`}>
                    <Icon className={`w-5 h-5 ${strategy.iconColor}`} />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${priorityCfg.bg} ${priorityCfg.color}`}>{priorityCfg.label}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${difficultyCfg.bg} ${difficultyCfg.color}`}>{difficultyCfg.label}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <sceneCfg.icon className={`w-3 h-3 ${sceneCfg.color}`} />
                            {sceneCfg.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{strategy.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{strategy.summary}</p>
                      </div>

                      {/* 状态+操作 */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                        {strategy.status === 'dispatched' && (
                          <button
                            onClick={() => handleConfirm(strategy.id)}
                            className="text-xs px-3 py-1 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                          >
                            门店确认执行
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 关键指标行 */}
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {strategy.expectedLiftRange}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {strategy.estimatedDuration}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {strategy.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{tag}</span>
                        ))}
                      </div>
                      {strategy.dispatchedAt && (
                        <span className="text-xs text-gray-400 ml-auto">
                          下发时间：{strategy.dispatchedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 底部操作 */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => setSelectedStrategy(strategy)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    查看详情
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {strategy.status === 'idle' && (
                    <button
                      onClick={() => setSelectedStrategy(strategy)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                    >
                      <Send className="w-4 h-4" />
                      选择执行
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 策略详情弹窗 */}
      <StrategyDetailModal
        strategy={selectedStrategy}
        onClose={() => setSelectedStrategy(null)}
        onDispatch={(id) => {
          handleDispatch(id)
          // 更新选中策略的状态以便弹窗内也能看到
          setSelectedStrategy(prev => prev && prev.id === id ? { ...prev, status: 'dispatched' } : prev)
        }}
      />
    </div>
  )
}
