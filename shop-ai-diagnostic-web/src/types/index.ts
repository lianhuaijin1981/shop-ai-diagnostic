// ============ 基础类型 ============

export interface IShop {
  id: string
  name: string
  code: string
  address: string
  manager: string
  phone: string
  status: 'active' | 'inactive' | 'closed'
  config?: Record<string, any>
  businessHours?: BusinessHours[]
  createdAt: string
  updatedAt: string
}

export interface BusinessHours {
  day: number
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface IUser {
  id: string
  username: string
  phone?: string
  email?: string
  avatar?: string
  role: string
  createdAt: string
}

export interface IEmployee {
  id: string
  name: string
  phone: string
  role: 'manager' | 'cashier' | 'sales' | 'stock'
  shopId: string
  status: 'active' | 'inactive'
}

export interface ICustomer {
  id: string
  shopId: string
  name: string
  phone: string
  level: 'normal' | 'silver' | 'gold' | 'platinum'
  totalAmount: number
  visitCount: number
  lastVisitAt: string
  tags: string[]
}

export interface IProduct {
  id: string
  name: string
  code: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  status: 'active' | 'inactive' | 'offline'
}

export interface ITransaction {
  id: string
  shopId: string
  customerId?: string
  items: ITransactionItem[]
  totalAmount: number
  totalCost: number
  profit: number
  paymentMethod: 'cash' | 'wechat' | 'alipay' | 'card'
  createdAt: string
}

export interface ITransactionItem {
  productId: string
  productName: string
  quantity: number
  price: number
  cost: number
  discount: number
}

// ============ 诊断相关类型 ============

export interface IDiagnosticResult {
  id: string
  shopId: string
  period: {
    start: string
    end: string
  }
  scores: IFiveDimensionScores
  trends: IDiagnosticTrend[]
  alerts: IAlert[]
  suggestions: ISuggestion[]
  totalScore?: number
  createdAt: string
}

export interface IFiveDimensionScores {
  // 五维诊断模型权重: 客流20% | 转化25% | 客单价20% | 复购20% | 利润15%
  customerFlow: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
  conversion: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
  avgAmount: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
  repurchase: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
  profit: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
}

export interface IDiagnosticTrend {
  date: string
  customerFlow: number
  conversion: number
  avgAmount: number
  repurchase: number
  profit: number
}

export interface IAlert {
  id: string
  type: 'danger' | 'warning' | 'info'
  dimension: keyof IFiveDimensionScores
  title: string
  description: string
  value: number
  threshold: number
  createdAt: string
  status: 'pending' | 'processing' | 'resolved'
}

export interface ISuggestion {
  id: string
  dimension: keyof IFiveDimensionScores
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  expectedEffect: string
}

// ============ 货品诊断相关类型 ============

export interface IProductDiagnostic {
  id: string
  shopId: string
  period: {
    start: string
    end: string
  }
  fastMoving: IProductAnalysis[]
  slowMoving: IProductAnalysis[]
  stockAlerts: IProductStockAlert[]
  categoryAnalysis: ICategoryAnalysis[]
  createdAt: string
}

export interface IProductAnalysis {
  productId: string
  productName: string
  category: string
  salesAmount: number
  salesCount: number
  profit: number
  rank: number
}

export interface IProductStockAlert {
  productId: string
  productName: string
  currentStock: number
  minStock: number
  alertLevel: 'normal' | 'low' | 'critical'
  suggestedReorder: number
}

export interface ICategoryAnalysis {
  category: string
  salesAmount: number
  salesCount: number
  avgPrice: number
  profitRate: number
  salesRatio: number
}

// ============ 任务相关类型 ============

export interface ITask {
  id: string
  title: string
  description: string
  type: 'diagnostic' | 'follow_up' | 'inventory' | 'training'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  shopId: string
  assigneeId: string
  assignee?: string  // 负责人名称
  relatedDiagnosticId?: string
  dueDate: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ITaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
}

// ============ API响应类型 ============

export interface IApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
}

export interface IPaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface IDashboardStats {
  todaySales: number
  todayTransactions: number
  todayCustomers: number
  todayProfit: number
  salesChangeRate: number
  transactionChangeRate: number
  customerChangeRate: number
  profitChangeRate: number
  totalScore?: number
  fiveDimensionScores?: IFiveDimensionScores
  weekTrend?: IDailyStat[]
  realtimeAlertCount?: number
  pendingTaskCount?: number
}

export interface IDailyStat {
  date: string
  sales: number
  transactions: number
  customers: number
  profit: number
}

// ============ 报告相关类型 ============

export interface IReport {
  id: string
  shopId: string
  period: 'daily' | 'weekly' | 'monthly'
  dateRange: {
    start: string
    end: string
  }
  summary: {
    totalRevenue: number
    totalTransactions: number
    totalCustomers: number
    todayProfit: number
    avgCustomerFlow: number
    avgConversion: number
    avgAmount: number
    avgRepurchase: number
    avgProfit: number
  }
  fiveDimensionScores: IFiveDimensionScores
  topProducts: IReportProduct[]
  customerAnalysis: {
    newCustomers: number
    returningCustomers: number
    vipCustomers: number
  }
  recommendations: string[]
  generatedAt: string
}

export interface IReportProduct {
  rank: number
  name: string
  salesCount: number
  salesAmount: number
  profit: number
}

// ============ 深度客流分析相关类型 ============

/** 总客流走势对比分析结果 */
export interface ICustomerFlowTrendAnalysis {
  currentPeriod: IDailyStat[]      // 本期每日客流
  previousPeriod: IDailyStat[]     // 上期每日客流（环比）
  samePeriodLastYear: IDailyStat[] // 去年同期
  benchmark: IDailyStat[]          // 行业基准
  wowChangeRate: number            // 环比变化率 %
  yoyChangeRate: number            // 同比变化率 %
  benchmarkGap: number             // 与基准差距 %
  trendDirection: 'up' | 'down' | 'stable'
  keyInsight: string               // AI生成的洞察结论
}

/** 自然到店客流拆解 */
export interface INaturalTrafficBreakdown {
  totalNatural: number
  breakdown: {
    passerbyConversion: { count: number; rate: number; desc: string }  // 过路客转化
    organicSearch: { count: number; rate: number; desc: string }       // 自然搜索/发现
    wordOfMouth: { count: number; rate: number; desc: string }        // 口碑传播
    nearbyResidents: { count: number; rate: number; desc: string }    // 周边居民
  }
  changeVsLastPeriod: number  // 环比变化
  keyDriver: string            // 主要驱动因素
}

/** 引流活动客流拆解 */
export interface ICampaignTrafficBreakdown {
  totalCampaignTraffic: number
  campaigns: Array<{
    id: string
    name: string
    type: 'discount' | 'new_product' | 'festival' | 'live_stream' | 'koc' | 'other'
    traffic: number
    cost: number
    costPerVisitor: number
    roi: number
    incrementalRate: number   // 增量占比
    startDate: string
    endDate: string
    effectiveness: 'excellent' | 'good' | 'average' | 'poor'
  }>
  bestPerformingCampaign: string
  worstPerformingCampaign: string
  totalCampaignSpend: number
  avgCostPerVisitor: number
}

/** 老客带新客流拆解 */
export interface IReferralTrafficBreakdown {
  totalReferral: number
  referralRate: number          // 转介绍率 %
  kFactor: number               // 病毒系数 K
  breakdown: {
    wechatShare: { count: number; rate: number }
    douyinShare: { count: number; rate: number }
    inPersonReferral: { count: number; rate: number }
    memberReferralProgram: { count: number; rate: number; rewardCost: number }
  }
  topReferrers: Array<{ customerName: string; referrals: number; rewardEarned: number }>
  referralTrend: 'up' | 'down' | 'stable'
}

/** 客流变化精准原因判定 */
export interface ITrafficChangeRootCause {
  direction: 'up' | 'down' | 'stable'
  changeRate: number
  magnitude: 'significant' | 'moderate' | 'slight' | 'negligible'
  causes: Array<{
    factor: string              // 因素名称：天气、竞品、营销支出、季节等
    impact: number              // 影响程度 %（正向或负向）
    contribution: number       // 对变化的贡献度 %
    evidence: string           // 支撑证据
    isControllable: boolean    // 是否可控
  }>
  uncontrollableFactors: string[]  // 不可控因素列表
  actionableFactors: string[]      // 可行动因素列表
  aiConclusion: string            // AI判定的结论描述
}

/** 高低客流时段精准定位 */
export interface ITrafficPeakOffPeakAnalysis {
  hourlyHeatmap: Array<{ hour: number; traffic: number; level: 'peak' | 'normal' | 'low' }>
  dailyPattern: Array<{ dayOfWeek: number; dayName: string; avgTraffic: number; level: 'peak' | 'normal' | 'low' }>
  peakHours: Array<{ start: number; end: number; avgTraffic: number; suggestion: string }>
  lowHours: Array<{ start: number; end: number; avgTraffic: number; suggestion: string }>
  weekendVsWeekday: { weekend: number; weekday: number; difference: number }
  recommendations: Array<{
    timeSlot: string
    problem: string
    solution: string
    expectedImpact: string
  }>
}

/** 客流提升落地玩法 */
export interface ITrafficBoostTactic {
  id: string
  category: 'online_ad' | 'offline_event' | 'member_referral' | 'platform_promotion' | 'collaboration'
  name: string
  description: string
  expectedTrafficIncrease: number  // 预计带来客流/天
  costPerDay: number               // 成本/天
  costPerVisitor: number           // 获客成本
  roi: number                      // 投资回报率
  difficulty: 'easy' | 'medium' | 'hard'
  timeToImplement: string          // 实施周期
  priority: 'high' | 'medium' | 'low'
  steps: string[]                 // 落地步骤
  expectedEffect: string           // 预期效果描述
}

/** 深度客流分析完整结果 */
export interface IDepCustomerFlowAnalysis {
  shopId: string
  period: { start: string; end: string }
  generatedAt: string

  // 7大维度
  trendAnalysis: ICustomerFlowTrendAnalysis
  naturalTraffic: INaturalTrafficBreakdown
  campaignTraffic: ICampaignTrafficBreakdown
  referralTraffic: IReferralTrafficBreakdown
  changeRootCause: ITrafficChangeRootCause
  peakOffPeak: ITrafficPeakOffPeakAnalysis
  boostTactics: ITrafficBoostTactic[]

  // 综合诊断结论
  overallDiagnosis: string
  top3Priorities: string[]
}

// ============ 深度转化分析相关类型 ============

export interface IDepConversionAnalysis {
  shopId: string
  period: { start: string; end: string }
  overallRate: number
  benchmark: number
  funnelAnalysis: Array<{ stage: string; count: number; rate: number; dropOffReason: string }>
  customerTypeConversion: Array<{ type: string; rate: number; benchmark: number; gap: number }>
  timeSlotConversion: Array<{ hour: number; rate: number; level: 'high' | 'medium' | 'low' }>
  productCategoryConversion: Array<{ category: string; rate: number; avgAmount: number }>
  rootCauseAnalysis: Array<{ factor: string; impact: number; isControllable: boolean; suggestion: string }>
  boostTactics: Array<{ tactic: string; expectedLift: number; difficulty: string; steps: string[] }>
  overallDiagnosis: string
  top3Priorities: string[]
}

// ============ 深度客单价分析相关类型 ============

export interface IDepAvgAmountAnalysis {
  shopId: string
  period: { start: string; end: string }
  overallAvgAmount: number
  benchmark: number
  gap: number
  distributionAnalysis: Array<{ range: string; count: number; percentage: number }>
  customerTypeAvg: Array<{ type: string; avgAmount: number; benchmark: number; gap: number; reason: string }>
  productCombinationAnalysis: Array<{ combo: string; frequency: number; avgAmount: number; profit: number; note: string }>
  timeSlotAvgAmount: Array<{ hour: number; avgAmount: number; level: 'high' | 'medium' | 'low' }>
  rootCauseAnalysis: Array<{ factor: string; impact: number; isControllable: boolean; suggestion: string; evidence: string }>
  boostTactics: Array<{ tactic: string; expectedLift: number; difficulty: string; steps: string[] }>
  overallDiagnosis: string
  top3Priorities: string[]
}

// ============ 深度复购分析相关类型 ============

export interface IDepRepurchaseAnalysis {
  shopId: string
  period: { start: string; end: string }
  overallRepurchaseRate: number
  benchmark: number
  gap: number
  cohortAnalysis: Array<{ month: string; newCustomers: number; repurchaseRate: number; note: string }>
  intervalAnalysis: Array<{ days: string; percentage: number; avgAmount: number; note: string }>
  reasonAnalysis: Array<{ reason: string; percentage: number; isControllable: boolean; note: string }>
  lostCustomerAnalysis: {
    count: number
    avgDaysSinceLastVisit: number
    mainReasons: Array<{ reason: string; percentage: number; isControllable: boolean }>
  }
  retentionTactics: Array<{ tactic: string; expectedLift: number; difficulty: string; steps: string[] }>
  overallDiagnosis: string
  top3Priorities: string[]
}

// ============ 深度利润分析相关类型 ============

export interface IDepProfitAnalysis {
  shopId: string
  period: { start: string; end: string }
  overallProfitRate: number
  benchmark: number
  gap: number
  profitComposition: Array<{ category: string; revenue: number; cost: number; profit: number; profitRate: number; note: string }>
  costStructureAnalysis: Array<{ item: string; amount: number; percentage: number; isControllable: boolean; note: string }>
  productProfitAnalysis: Array<{ productName: string; salesCount: number; profitPerUnit: number; totalProfit: number; profitRate: number }>
  rootCauseAnalysis: Array<{ factor: string; impact: number; isControllable: boolean; suggestion: string; evidence: string }>
  profitBoostTactics: Array<{ tactic: string; expectedLift: number; difficulty: string; steps: string[] }>
  overallDiagnosis: string
  top3Priorities: string[]
}

// ============ 请求参数类型 ============

export interface IDiagnosticQuery {
  shopId: string
  period: 'today' | 'week' | 'month' | 'quarter' | 'custom'
  startDate?: string
  endDate?: string
}

export interface IProductDiagnosticQuery {
  shopId: string
  period: 'today' | 'week' | 'month' | 'quarter'
  category?: string
}

export interface ITaskQuery {
  shopId: string
  status?: ITask['status']
  type?: ITask['type']
  priority?: ITask['priority']
  assigneeId?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface IAlertQuery {
  shopId: string
  type?: IAlert['type']
  status?: IAlert['status']
  dimension?: IAlert['dimension']
  page?: number
  pageSize?: number
}

// ============ 经营大盘7大类类型 ============

export type DashboardPeriod = 'today' | 'yesterday' | 'week' | 'month'

export interface ITimeSlotRevenue {
  slot: string
  revenue: number
  transactions: number
  profit: number
}

export interface IPaymentDistribution {
  method: string
  amount: number
  count: number
  percentage: number
}

export interface IDailyTrend {
  date: string
  revenue: number
  profit: number
  transactions: number
  customers: number
}

export interface IDashboardStockAlert {
  skuId: string
  skuName: string
  category: string
  stock: number
  minStock: number
  cost: number
  price: number
  turnoverDays: number
  alertLevel: 'normal' | 'low' | 'critical' | 'overstock'
}

export interface IInventorySummary {
  category: string
  skuCount: number
  totalStock: number
  totalValue: number
  avgCost: number
  avgPrice: number
  sold7d: number
  turnoverRate: number
}

export interface ITopSellingSKU {
  skuId: string
  skuName: string
  category: string
  soldCount: number
  revenue: number
  profit: number
  profitRate: number
  stock: number
}

export interface IMemberLevel {
  level: string
  count: number
  percentage: number
  avgConsume: number
}

export interface IVisitFrequency {
  range: string
  count: number
  avgAmount: number
  description: string
}

export interface IEmployeePerformance {
  employeeId: string
  name: string
  role: string
  salesAmount: number
  transactions: number
  avgAmount: number
  attachmentRate: number
  attendance: number
  workHours: number
  rank: number
}

export interface IAttendanceSummary {
  date: string
  present: number
  absent: number
  late: number
  earlyLeave: number
  leave: number
  attendanceRate: number
}

export interface ISchedulePlan {
  employeeId: string
  name: string
  role: string
  shift: 'morning' | 'afternoon' | 'evening' | 'full'
  date: string
  startTime: string
  endTime: string
}

export interface IHourlyCustomerFlow {
  hour: number
  traffic: number
  entryCount: number
  entryRate: number
  avgDwellMinutes: number
  level: 'peak' | 'normal' | 'low'
}

export interface ITrafficSource {
  source: string
  count: number
  percentage: number
  description: string
}

export interface IPlatformDistribution {
  platform: string
  orders: number
  revenue: number
  percentage: number
  avgRating: number
}

export interface IComplaintAnalysis {
  reason: string
  count: number
  percentage: number
  isControllable: boolean
  suggestion: string
}

export interface ITrafficConversion {
  platform: string
  impressions: number
  clicks: number
  orders: number
  ctr: number
  cvr: number
}

export interface ICompetitorActivity {
  competitorName: string
  distance: number
  activity: string
  startDate: string
  endDate: string
  estimatedImpact: number
  isActive: boolean
}

export interface IPriceDistribution {
  brand: string
  avgPrice: number
  distance: number
  marketShare: number
  trend: 'up' | 'down' | 'stable'
}

export interface IIndustryBenchmark {
  avgRevenue: number
  avgCustomerFlow: number
  avgConversion: number
  avgAmount: number
  top25Revenue: number
  yourRank: number
  yourRankPercent: number
}

export interface IDashboardComprehensive {
  shopId: string
  period: DashboardPeriod
  generatedAt: string
  cashflow: {
    totalRevenue: number
    totalProfit: number
    totalNetProfit: number
    totalDiscount: number
    totalTransactions: number
    avgAmount: number
    profitRate: number
    netProfitRate: number
    discountRate: number
    todayRevenue: number
    yesterdayRevenue: number
    weekRevenue: number
    monthRevenue: number
    todayProfit: number
    yesterdayProfit: number
    weekProfit: number
    monthProfit: number
    timeSlotRevenue: ITimeSlotRevenue[]
    paymentDistribution: IPaymentDistribution[]
    dailyTrend: IDailyTrend[]
  }
  products: {
    totalSKU: number
    activeSKU: number
    lowStockSKU: number
    outOfStockSKU: number
    todaySold: number
    inventoryTurnover: number
    inventoryValue: number
    stockAlerts: IDashboardStockAlert[]
    inventorySummary: IInventorySummary[]
    topSellingSKU: ITopSellingSKU[]
  }
  members: {
    totalMembers: number
    activeMembers: number
    newMembers: number
    vipMembers: number
    dormantMembers: number
    totalStoredValue: number
    totalConsumeValue: number
    avgConsumeValue: number
    avgVisitCycle: number
    memberConversion: number
    levelDistribution: IMemberLevel[]
    visitFrequency: IVisitFrequency[]
    newMembersList: Array<{ memberId: string; name: string; phone: string; level: string; firstConsume: string; storedValue: number }>
    highValueDormant: Array<{ memberId: string; name: string; level: string; totalConsume: number; lastVisit: string; daysSinceVisit: number }>
  }
  employees: {
    totalStaff: number
    onDutyToday: number
    absentToday: number
    avgWorkHours: number
    totalPerformance: number
    avgPersonalSales: number
    avgPersonalAmount: number
    avgAttachmentRate: number
    performanceRanking: IEmployeePerformance[]
    attendanceSummary: IAttendanceSummary[]
    schedulePlan: ISchedulePlan[]
  }
  storeScene: {
    todayCustomerFlow: number
    yesterdayCustomerFlow: number
    weekAvgCustomerFlow: number
    avgDwellTime: number
    entryRate: number
    peakHour: number
    lowHour: number
    hourlyCustomerFlow: IHourlyCustomerFlow[]
    dailyCustomerTrend: Array<{ date: string; customerFlow: number; entryCount: number; avgDwellTime: number }>
    trafficSources: ITrafficSource[]
    dwellTimeDistribution: Array<{ range: string; count: number; percentage: number }>
  }
  deliveryPlatform: {
    totalOrders: number
    totalRevenue: number
    avgDeliveryTime: number
    cancelRate: number
    complaintRate: number
    deliveryRating: number
    productRating: number
    platformDistribution: IPlatformDistribution[]
    hourlyOrders: Array<{ hour: number; meituan: number; ele: number; didi: number; total: number }>
    complaintAnalysis: IComplaintAnalysis[]
    trafficConversion: ITrafficConversion[]
  }
  businessDistrict: {
    competitorActivities: ICompetitorActivity[]
    priceDistribution: IPriceDistribution[]
    trafficMarket: {
      totalPassersby: number
      totalEntryRate: number
      peakHour: number
      avgDwellTime: number
      weekendTraffic: number
      weekdayTraffic: number
      weatherImpact: number
    }
    industryBenchmark: IIndustryBenchmark
  }
}

export interface IMultiStoreSummary {
  shopId: string
  shopName: string
  revenue: number
  profit: number
  customers: number
  transactions: number
  avgAmount: number
  customerFlow: number
  rank: number
}

export interface IMultiStoreTotal {
  stores: IMultiStoreSummary[]
  totalRevenue: number
  totalProfit: number
  totalCustomers: number
  totalTransactions: number
  avgAmount: number
  avgCustomerFlow: number
  storeCount: number
}

// ============ 货品全链路智能诊断类型 ============

// ---------- 3.3.1 货品结构诊断 ----------
export interface IProductStructureDiag {
  shopId: string
  period: { start: string; end: string }
  generatedAt: string

  /** 新款/老款占比分析 */
  newVsOld: INewVsOldRatio

  /** 引流款、利润款、形象款结构占比筛查 */
  roleStructure: IProductRoleStructure

  /** 品类结构失衡问题诊断 */
  categoryStructure: ICategoryStructureDiag

  /** 尺码颜色库存结构不合理诊断 */
  sizeColorStock: ISizeColorStockDiag

  /** 综合诊断结论 */
  overallDiagnosis: string
  suggestions: string[]
}

export interface INewVsOldRatio {
  newArrivalRatio: number    // 新款占比 %
  oldArrivalRatio: number    // 老款占比 %
  newArrivalSalesRatio: number  // 新款销售额占比 %
  oldArrivalSalesRatio: number  // 老款销售额占比 %
  diagnosis: 'balanced' | 'new_heavy' | 'old_heavy' | 'imbalanced'
  issue: string
  suggestion: string
  newArrivalDetail: Array<{ sku: string; name: string; sales: number; stock: number }>
  oldArrivalDetail: Array<{ sku: string; name: string; sales: number; stock: number; daysSinceLaunch: number }>
}

export interface IProductRoleStructure {
  roles: Array<{
    role: 'traffic' | 'profit' | 'image'
    roleLabel: string        // 中文标签：引流款/利润款/形象款
    skuCount: number
    salesAmount: number
    salesRatio: number      // 销售额占比
    profitAmount: number
    profitRatio: number     // 利润占比
  }>
  idealStructure: {         // 理想结构参考
    traffic: number         // 引流款占比 20-30%
    profit: number          // 利润款占比 50-60%
    image: number           // 形象款占比 10-20%
  }
  diagnosis: string
  issues: string[]
  suggestions: string[]
}

export interface ICategoryStructureDiag {
  categories: Array<{
    category: string
    skuCount: number
    salesAmount: number
    salesRatio: number
    profitRate: number
    turnoverDays: number
    status: 'healthy' | 'over_weight' | 'under_weight' | 'declining'
  }>
  benchmark: Record<string, number>   // 行业基准占比
  imbalancedCategories: string[]       // 失衡品类列表
  diagnosis: string
  suggestions: string[]
}

export interface ISizeColorStockDiag {
  totalSKU: number
  unreasonableSKU: number
  unreasonableRate: number
  issues: Array<{
    sku: string
    name: string
    category: string
    sizeStock: Array<{ size: string; stock: number }>
    colorStock: Array<{ color: string; stock: number }>
    issueType: 'size_imbalanced' | 'color_imbalanced' | 'over_stock' | 'dead_stock'
    issueDesc: string
    suggestion: string
  }>
  diagnosis: string
  suggestions: string[]
}

// ---------- 3.3.2 动销滞销智能判定 ----------
export interface ISalesVelocityDiag {
  shopId: string
  period: { start: string; end: string }
  generatedAt: string

  /** 自动划分：爆款、平销款、慢销款、死款 */
  velocityClassification: IVelocityClassification

  /** 滞销货品积压金额自动统计 */
  slowMovingBacklog: ISlowMovingBacklog

  /** 季节性滞销、款式滞销、定价滞销区分判定 */
  slowMovingRootCause: ISlowMovingRootCause

  /** 滞销产生根源精准定位 */
  rootCauseLocation: IRootCauseLocation

  /** 综合诊断结论 */
  overallDiagnosis: string
  topPriorityActions: string[]
}

export interface IVelocityClassification {
  categories: Array<{
    level: 'hot' | 'normal' | 'slow' | 'dead'
    levelLabel: string       // 爆款/平销款/慢销款/死款
    skuCount: number
    skus: Array<{
      sku: string
      name: string
      salesCount: number
      salesAmount: number
      stock: number
      daysSinceLastSale: number
      velocityScore: number  // 动销评分
    }>
    avgSalesPerDay: number
    totalBacklogValue: number
  }>
  classificationRules: {
    hot: string      // 评分规则描述
    normal: string
    slow: string
    dead: string
  }
  diagnosis: string
}

export interface ISlowMovingBacklog {
  totalBacklogValue: number       // 滞销积压总金额
  totalBacklogSKU: number        // 滞销SKU数
  backlogByCategory: Array<{
    category: string
    backlogValue: number
    skuCount: number
    avgDaysInStock: number
  }>
  backlogDetails: Array<{
    sku: string
    name: string
    category: string
    costValue: number        // 积压成本金额
    retailValue: number      // 吊牌总额
    daysInStock: number      // 库存天数
    lastSaleDays: number     // 距上次销售天数
    urgency: 'high' | 'medium' | 'low'
  }>
  diagnosis: string
}

export interface ISlowMovingRootCause {
  totalSlowMoving: number
  causes: Array<{
    causeType: 'seasonal' | 'style' | 'pricing' | 'quality' | 'competition' | 'placement'
    causeLabel: string       // 季节性/款式/定价/质量/竞品/陈列
    skuCount: number
    backlogValue: number
    percentage: number      // 占滞销总数比例
    examples: string[]      // 典型SKU
    suggestion: string
  }>
  seasonalDetail: Array<{ season: string; skuCount: number; suggestion: string }>
  diagnosis: string
}

export interface IRootCauseLocation {
  skuRootCauses: Array<{
    sku: string
    name: string
    category: string
    rootCause: string       // 根本原因分析文本
    contributingFactors: Array<{
      factor: string
      weight: number        // 贡献度 %
      isControllable: boolean
    }>
    recommendedActions: string[]
  }>
  uncontrollableFactors: string[]   // 不可控因素
  actionableFactors: string[]       // 可行动因素
  diagnosis: string
}

// ---------- 3.3.3 库存风险诊断 ----------
export interface IInventoryRiskDiag {
  shopId: string
  period: { start: string; end: string }
  generatedAt: string

  /** 库存积压预警 */
  backlogAlert: IBacklogAlert

  /** 爆款断货缺货预警 */
  stockoutAlert: IStockoutAlert

  /** 跨季节库存积压风险预警 */
  crossSeasonRisk: ICrossSeasonRisk

  /** 库存周转效率评级 */
  turnoverRating: ITurnoverRating

  /** 综合诊断结论 */
  overallDiagnosis: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  topRisks: string[]
}

export interface IBacklogAlert {
  alertLevel: 'low' | 'medium' | 'high' | 'critical'
  totalBacklogValue: number
  backlogDays: number          // 平均积压天数
  alertItems: Array<{
    sku: string
    name: string
    category: string
    stock: number
    costValue: number
    daysInStock: number
    alertLevel: 'low' | 'medium' | 'high' | 'critical'
    suggestedAction: string   // 建议处理方式
  }>
  trend: 'worsening' | 'improving' | 'stable'
  diagnosis: string
  suggestion: string
}

export interface IStockoutAlert {
  alertLevel: 'low' | 'medium' | 'high' | 'critical'
  atRiskSKUCount: number
  riskItems: Array<{
    sku: string
    name: string
    category: string
    currentStock: number
    dailyAvgSales: number
    daysUntilStockout: number  // 预计断货天数
    suggestedReorderQty: number
    supplierLeadTime: number   // 供应商交货周期(天)
    urgency: 'high' | 'medium' | 'low'
  }>
  totalRevenueRisk: number    // 潜在营收损失
  diagnosis: string
  suggestion: string
}

export interface ICrossSeasonRisk {
  currentSeason: string
  nextSeason: string
  riskLevel: 'low' | 'medium' | 'high'
  crossSeasonItems: Array<{
    sku: string
    name: string
    category: string
    season: string
    stock: number
    costValue: number
    sellThroughRate: number   // 当季售罄率
    recommendedAction: string
  }>
  totalRiskValue: number
  diagnosis: string
  suggestion: string
}

export interface ITurnoverRating {
  overallRating: 'A' | 'B' | 'C' | 'D'   // A=优秀 B=良好 C=一般 D=较差
  overallTurnoverDays: number
  benchmarkTurnoverDays: number
  ratingDetail: Array<{
    category: string
    turnoverDays: number
    rating: 'A' | 'B' | 'C' | 'D'
    benchmark: number
    status: string
  }>
  lowTurnoverItems: Array<{
    sku: string
    name: string
    category: string
    turnoverDays: number
    stock: number
    suggestion: string
  }>
  diagnosis: string
  suggestions: string[]
}

// ---------- 3.3.4 货品运营解决方案自动输出 ----------
export interface IOperationSolution {
  shopId: string
  generatedAt: string

  /** 滞销清仓方案（活动形式、定价、话术） */
  clearancePlan: IClearancePlan

  /** 爆款补货周期建议 */
  replenishmentSuggestion: IReplenishmentSuggestion

  /** 上新选品方向建议 */
  newProductSelection: INewProductSelection

  /** 货品陈列优先排序建议 */
  displayPriority: IDisplayPriority
}

export interface IClearancePlan {
  totalClearanceValue: number
  strategies: Array<{
    sku: string
    name: string
    category: string
    costValue: number
    currentStock: number
    daysInStock: number
    recommendedAction: 'discount' | 'bundle' | 'gift' | 'transfer' | 'scrap'
    actionLabel: string       // 打折/捆绑/赠品/调拨/报损
    discountRate: number     // 建议折扣率
    suggestedPrice: number   // 建议清仓价
    estimatedClearDays: number
    script: string          // 销售话术
    priority: 'high' | 'medium' | 'low'
  }>
  activitySuggestions: Array<{
    activityType: string    // 活动类型
    description: string
    expectedClearRate: number
    cost: number
  }>
}

export interface IReplenishmentSuggestion {
  totalReplenishmentValue: number
  items: Array<{
    sku: string
    name: string
    category: string
    currentStock: number
    dailyAvgSales: number
    safetyStock: number      // 安全库存
    suggestedReorderQty: number
    reorderCycle: number     // 补货周期(天)
    leadTime: number         // 交货周期(天)
    supplier: string
    estimatedArrival: string
    urgency: 'high' | 'medium' | 'low'
  }>
  summary: string
}

export interface INewProductSelection {
  directionSuggestions: Array<{
    category: string
    direction: string       // 选品方向描述
    reason: string          // 推荐理由
    expectedProfitRate: number
    riskLevel: 'low' | 'medium' | 'high'
    referencePrice: number
  }>
  trendingCategories: string[]   // 趋势品类
  decliningCategories: string[]  // 衰退品类
  summary: string
}

export interface IDisplayPriority {
  totalSKU: number
  priorityList: Array<{
    sku: string
    name: string
    category: string
    priority: number        // 陈列优先级排序 1=最高
    reason: string          // 优先陈列理由
    recommendedPosition: 'entrance' | 'hot_zone' | 'wall' | 'cashier' | 'corner'
    positionLabel: string   // 入口区/热区/墙面/收银台/角落
    displayQty: number     // 建议陈列量
  }>
  zoneSuggestions: Array<{
    zone: string
    currentSKUs: string[]
    suggestedSKUs: string[]
    reason: string
  }>
}
