/**
 * 演示数据生成器
 * 生成模拟的门店诊断数据用于演示
 */
import { faker } from '@faker-js/faker/locale/zh_CN';

// 生成模拟门店
export function generateMockShops(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    _id: `shop_${i + 1}`,
    name: ['万象城旗舰店', '国贸CBD店', '龙湖天街店', '银泰中心店', '万达广场店'][i] || `${faker.company.name()}店`,
    code: `SHOP${String(i + 1).padStart(4, '0')}`,
    address: faker.location.streetAddress(true),
    contact: faker.person.fullName(),
    phone: faker.phone.number({ style: 'national' }),
    status: 'active',
    config: {
      enableAI: true,
      enableAlerts: true,
      alertThreshold: 0.8,
    },
    businessHours: {
      open: '09:00',
      close: '22:00',
    },
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }));
}

// 五维诊断分数生成器
function generateMockFiveDimensionScores() {
  const dimensions = ['customerFlow', 'conversion', 'avgAmount', 'repurchase', 'profit'] as const
  const weights = { customerFlow: 0.2, conversion: 0.25, avgAmount: 0.2, repurchase: 0.2, profit: 0.15 }
  const benchmarks = { customerFlow: 100, conversion: 40, avgAmount: 180, repurchase: 50, profit: 30 }
  const result: Record<string, any> = {}
  let totalScore = 0
  dimensions.forEach((dim) => {
    const score = Math.floor(Math.random() * 40 + 60) // 60~99
    const value = dim === 'conversion' || dim === 'repurchase'
      ? Math.round((Math.random() * 40 + 20) * 10) / 10  // 20~60%
      : dim === 'avgAmount'
        ? Math.round((Math.random() * 100 + 120) * 100) / 100  // 120~220
        : Math.round((Math.random() * 40 + 60) * 10) / 10  // 60~100
    const trendValues = ['up', 'down', 'stable'] as const
    result[dim] = {
      score,
      weight: (weights as any)[dim],
      value,
      benchmark: (benchmarks as any)[dim],
      trend: trendValues[Math.floor(Math.random() * 3)],
    }
    totalScore += score * (weights as any)[dim]
  })
  return { scores: result, totalScore: Math.round(totalScore * 10) / 10 }
}

// 生成模拟仪表盘数据
export function generateMockDashboardStats(shopId: string) {
  const { scores, totalScore } = generateMockFiveDimensionScores()
  return {
    shopId,
    todaySales: Math.round((Math.random() * 50000 + 10000) * 100) / 100,
    todayTransactions: Math.floor(Math.random() * 500 + 100),
    todayCustomers: Math.floor(Math.random() * 2000 + 200),
    todayProfit: Math.round((Math.random() * 20000 + 5000) * 100) / 100,
    salesChangeRate: Math.round((Math.random() * 0.5 - 0.15) * 100) / 100,
    transactionChangeRate: Math.round((Math.random() * 0.5 - 0.15) * 100) / 100,
    customerChangeRate: Math.round((Math.random() * 0.5 - 0.15) * 100) / 100,
    profitChangeRate: Math.round((Math.random() * 0.5 - 0.15) * 100) / 100,
    fiveDimensionScores: scores,
    totalScore,
    realtimeAlertCount: Math.floor(Math.random() * 15 + 1),
    pendingTaskCount: Math.floor(Math.random() * 10 + 1),
    lastUpdated: new Date().toISOString(),
  };
}

// 生成模拟交易数据
export function generateMockTransactions(shopId: string, count = 100) {
  return Array.from({ length: count }, (_, i) => {
    const items = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
      productId: `prod_${faker.number.int({ min: 1, max: 50 })}`,
      productName: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      cost: faker.number.float({ min: 5, max: 200, fractionDigits: 2 }),
      discount: faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
    }))
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity - item.discount, 0)
    const totalCost = items.reduce((sum, item) => sum + item.cost * item.quantity, 0)
    return {
      id: `txn_${i + 1}`,
      shopId,
      customerId: `cust_${faker.number.int({ min: 1, max: 500 })}`,
      items,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      profit: Math.round((totalAmount - totalCost) * 100) / 100,
      paymentMethod: faker.helpers.arrayElement(['cash', 'wechat', 'alipay', 'card']),
      createdAt: faker.date.recent({ days: 30 }),
    }
  });
}

// 生成模拟客户数据
export function generateMockCustomers(shopId: string, count = 50) {
  return Array.from({ length: count }, (_, i) => ({
    id: `cust_${i + 1}`,
    shopId,
    name: faker.person.fullName(),
    phone: faker.phone.number({ style: 'national' }),
    level: faker.helpers.arrayElement(['normal', 'silver', 'gold', 'platinum']),
    totalAmount: faker.number.float({ min: 100, max: 50000, fractionDigits: 2 }),
    visitCount: faker.number.int({ min: 1, max: 100 }),
    lastVisitAt: faker.date.recent().toISOString(),
    tags: faker.helpers.arrayElements(['VIP', '新客', '活跃', '沉睡'], { min: 0, max: 2 }),
    createdAt: faker.date.past(),
  }));
}

// 本地定义诊断类型（demo-data 不引用前端类型）
type DimensionKey = 'customerFlow' | 'conversion' | 'avgAmount' | 'repurchase' | 'profit'
interface FiveDimensionScores { [key: string]: { score: number; weight: number; value: number; benchmark: number; trend: 'up' | 'down' | 'stable' } }

// 生成五维诊断结果（供 Diagnostic 页面使用）
export function generateMockFiveDimension(shopId: string, period: string): { id: string; shopId: string; period: { start: string; end: string }; scores: FiveDimensionScores; totalScore: number; trends: any[]; suggestions: any[]; alerts: any[]; createdAt: string } {
  const dimensions = ['customerFlow', 'conversion', 'avgAmount', 'repurchase', 'profit'] as const
  const weights = { customerFlow: 0.2, conversion: 0.25, avgAmount: 0.2, repurchase: 0.2, profit: 0.15 }
  const benchmarks = { customerFlow: 100, conversion: 40, avgAmount: 180, repurchase: 50, profit: 30 }
  const scores: Record<string, any> = {}
  let totalScore = 0

  dimensions.forEach((dim) => {
    const score = Math.floor(Math.random() * 40 + 60)
    let value: number
    if (dim === 'conversion' || dim === 'repurchase') {
      value = Math.round((Math.random() * 40 + 20) * 10) / 10
    } else if (dim === 'avgAmount') {
      value = Math.round((Math.random() * 100 + 120) * 100) / 100
    } else {
      value = Math.round((Math.random() * 40 + 60) * 10) / 10
    }
    const trendValues = ['up', 'down', 'stable'] as const
    scores[dim] = {
      score,
      weight: (weights as any)[dim],
      value,
      benchmark: (benchmarks as any)[dim],
      trend: trendValues[Math.floor(Math.random() * 3)],
    }
    totalScore += score * (weights as any)[dim]
  })

  // 生成趋势数据（按天数）
  const dayCount = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90
  const trends = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (dayCount - 1 - i))
    return {
      date: d.toISOString().slice(0, 10),
      customerFlow: Math.floor(Math.random() * 80 + 20),
      conversion: Math.round((Math.random() * 30 + 10) * 10) / 10,
      avgAmount: Math.round((Math.random() * 100 + 100) * 100) / 100,
      repurchase: Math.round((Math.random() * 40 + 10) * 10) / 10,
      profit: Math.round((Math.random() * 30 + 10) * 10) / 10,
    }
  })

  // 生成建议
  const suggestionTemplates = [
    { dimension: 'customerFlow', priority: 'medium', title: '提升门店引流策略', description: '本周客流有所下降，建议通过线上推广、会员活动等方式吸引顾客', action: '查看引流方案' },
    { dimension: 'conversion', priority: 'high', title: '提升转化率的5个技巧', description: '当前转化率偏低，建议从商品陈列、客户引导、促销活动等方面优化', action: '查看优化方案' },
    { dimension: 'avgAmount', priority: 'medium', title: '提升客单价的营销策略', description: '可通过组合套餐、满减活动等方式提升客单价', action: '查看营销方案' },
    { dimension: 'repurchase', priority: 'medium', title: '会员复购激励计划', description: '老客户复购率有提升空间，建议推出会员专属优惠', action: '创建激励计划' },
    { dimension: 'profit', priority: 'high', title: '优化成本结构提升利润', description: '当前利润率偏低，建议优化供应链和库存管理', action: '查看优化方案' },
  ]
  const suggestions = suggestionTemplates.map((t, i) => ({
    id: `sug_${i + 1}`,
    dimension: t.dimension as DimensionKey,
    priority: t.priority as 'high' | 'medium' | 'low',
    title: t.title,
    description: t.description,
    action: t.action,
    expectedEffect: '预计可提升5-15%',
  }))

  return {
    id: `diag_${Date.now()}`,
    shopId,
    period: { start: trends[0]?.date || '', end: trends[trends.length - 1]?.date || '' },
    scores,
    totalScore: Math.round(totalScore * 10) / 10,
    trends,
    suggestions,
    alerts: generateMockAlerts(shopId, 5),
    createdAt: new Date().toISOString(),
  }
}

// 生成模拟告警数据
export function generateMockAlerts(shopId: string, count = 10) {
  const alertTemplates = [
    { type: 'danger' as const, title: '转化率严重偏低', description: '当前转化率低于目标值40%', dimension: 'conversion' as const, value: 28, threshold: 35 },
    { type: 'warning' as const, title: '客流异常下降', description: '本周客流较上周同期下降15%', dimension: 'customerFlow' as const, value: 85, threshold: 95 },
    { type: 'warning' as const, title: '客单价待提升', description: '当前客单价低于 benchmark', dimension: 'avgAmount' as const, value: 145, threshold: 160 },
    { type: 'info' as const, title: '复购率有提升空间', description: '老客户复购率低于行业平均', dimension: 'repurchase' as const, value: 38, threshold: 45 },
    { type: 'danger' as const, title: '利润率预警', description: '当前利润率低于目标值', dimension: 'profit' as const, value: 22, threshold: 25 },
  ]

  return Array.from({ length: count }, (_, i) => {
    const tpl = alertTemplates[i % alertTemplates.length]
    return {
      id: `alert_${i + 1}`,
      shopId,
      type: tpl.type,
      dimension: tpl.dimension,
      title: tpl.title,
      description: tpl.description,
      value: tpl.value + Math.round((Math.random() - 0.5) * 10),
      threshold: tpl.threshold,
      status: ['pending', 'processing', 'resolved'][Math.floor(Math.random() * 3)] as 'pending' | 'processing' | 'resolved',
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      processedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
      resolvedAt: Math.random() > 0.7 ? new Date().toISOString() : undefined,
    }
  })
}

// 生成模拟任务数据
export function generateMockTasks(shopId: string, count = 8) {
  const taskTemplates = [
    { title: '优化高峰期排队流程', description: '通过预约系统缓解高峰期压力', priority: 'high' },
    { title: '客户回访计划', description: '联系30天内未到店的高价值客户', priority: 'high' },
    { title: '库存盘点', description: '完成月度库存盘点，补充不足商品', priority: 'medium' },
    { title: '员工培训', description: '开展新产品销售技巧培训', priority: 'medium' },
    { title: '客户满意度调研', description: '收集客户反馈改进服务质量', priority: 'low' },
    { title: '促销活动策划', description: '制定下周促销活动方案', priority: 'medium' },
    { title: '数据报告分析', description: '分析本月销售数据，提交报告', priority: 'low' },
    { title: '设备维护检查', description: '检查店内设备运行状态', priority: 'low' },
  ];

  return taskTemplates.slice(0, count).map((t, i) => ({
    id: `task_${i + 1}`,
    shopId,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: faker.helpers.arrayElement(['pending', 'in_progress', 'completed']),
    dueDate: faker.date.soon({ days: 14 }).toISOString(),
    assignee: faker.person.fullName(),
    createdAt: faker.date.recent().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }));
}

// ============ 深度客流分析 Mock 数据生成器 ============

/** 生成深度客流分析结果（含7大维度） */
export function generateMockCustomerFlowAnalysis(shopId: string, period: string) {
  const now = new Date()
  const dayCount = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90
  const startDate = new Date(now.getTime() - (dayCount - 1) * 86400000).toISOString().slice(0, 10)
  const endDate = now.toISOString().slice(0, 10)

  // 1. 总客流走势对比分析
  const genDaily = (base: number, variance: number, days: number, startOffset = 0) =>
    Array.from({ length: days }, (_, i) => {
      const d = new Date(now.getTime() - (days - 1 - i - startOffset) * 86400000)
      const dow = d.getDay() // 0=周日, 6=周六
      const isWeekend = dow === 0 || dow === 6
      const seasonalBoost = isWeekend ? 1.3 : 1.0
      const weatherFactor = (i % 7 < 2) ? 0.85 : 1.0 // 模拟雨天影响
      const val = Math.round((base + (Math.sin(i * 0.5) * variance + (Math.random() - 0.5) * variance * 0.5)) * seasonalBoost * weatherFactor)
      return { date: d.toISOString().slice(0, 10), customers: Math.max(val, 20), sales: val * (80 + Math.random() * 40), profit: val * (25 + Math.random() * 15) }
    })

  const currentPeriod = genDaily(180, 50, dayCount)
  const previousPeriod = genDaily(195, 45, dayCount, dayCount) // 上期略高
  const samePeriodLastYear = genDaily(150, 40, dayCount, dayCount * 2) // 去年同期较低
  const benchmark = genDaily(200, 20, dayCount, 0) // 行业基准更高

  const currentTotal = currentPeriod.reduce((s, d) => s + d.customers, 0)
  const previousTotal = previousPeriod.reduce((s, d) => s + d.customers, 0)
  const lastYearTotal = samePeriodLastYear.reduce((s, d) => s + d.customers, 0)
  const benchmarkTotal = benchmark.reduce((s, d) => s + d.customers, 0)

  const wowChangeRate = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal * 100) * 10) / 10 : 0
  const yoyChangeRate = lastYearTotal > 0 ? Math.round(((currentTotal - lastYearTotal) / lastYearTotal * 100) * 10) / 10 : 0
  const benchmarkGap = benchmarkTotal > 0 ? Math.round(((benchmarkTotal - currentTotal) / benchmarkTotal * 100) * 10) / 10 : 0

  const trendAnalysis = {
    currentPeriod,
    previousPeriod,
    samePeriodLastYear,
    benchmark,
    wowChangeRate,
    yoyChangeRate,
    benchmarkGap,
    trendDirection: (wowChangeRate > 3 ? 'up' : wowChangeRate < -3 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
    keyInsight: wowChangeRate < -5
      ? `本期客流较上期下降${Math.abs(wowChangeRate)}%，主要原因是：① 本期有3天雨天（客流减少15%）；② 竞品「茶百道」新店开业分流约12%；③ 自然客流周期性回落约5%。建议重点关注天气预报，在雨天前加大线上推广力度。`
      : wowChangeRate > 5
        ? `本期客流较上期上升${wowChangeRate}%，增长主要来自：① 「第二杯半价」活动带来增量客流约${Math.round(currentTotal * 0.18)}人次（占比18%）；② 周末天气晴好，自然客流提升；③ 老客带新K因子达1.3，口碑传播效果显著。`
        : `本期客流环比${wowChangeRate >= 0 ? '上升' : '下降'}${Math.abs(wowChangeRate)}%，整体走势平稳。与行业基准差距为${benchmarkGap}%，仍有提升空间。`,
  }

  // 2. 自然到店客流拆解
  const totalNatural = Math.round(currentTotal * 0.62)
  const naturalTraffic = {
    totalNatural,
    breakdown: {
      passerbyConversion: {
        count: Math.round(totalNatural * 0.35),
        rate: 0.12,
        desc: '门店前自然路过行人，转化率12%（行业平均15%），有提升空间',
      },
      organicSearch: {
        count: Math.round(totalNatural * 0.28),
        rate: 0.28,
        desc: '通过地图搜索、点评平台自然搜索到店，占比28%，说明门店线上曝光较充足',
      },
      wordOfMouth: {
        count: Math.round(totalNatural * 0.22),
        rate: 0.22,
        desc: '朋友推荐、社交分享到店，占比22%，口碑传播效果良好',
      },
      nearbyResidents: {
        count: Math.round(totalNatural * 0.15),
        rate: 0.15,
        desc: '周边1km内居民重复到店，占比15%，社区渗透仍有空间',
      },
    },
    changeVsLastPeriod: -8.5,
    keyDriver: '过路客转化率下降是本期自然客流减少的主要原因（从15%降至12%），建议优化门头招牌和门口展示。',
  }

  // 3. 引流活动客流拆解
  const campaignTraffic = {
    totalCampaignTraffic: Math.round(currentTotal * 0.38),
    campaigns: [
      {
        id: 'cmp_1', name: '第二杯半价', type: 'discount' as const,
        traffic: 680, cost: 3200, costPerVisitor: 4.7, roi: 3.8, incrementalRate: 0.38,
        startDate: startDate, endDate: endDate, effectiveness: 'excellent' as const,
      },
      {
        id: 'cmp_2', name: '抖音本地推', type: 'live_stream' as const,
        traffic: 420, cost: 5000, costPerVisitor: 11.9, roi: 2.1, incrementalRate: 0.23,
        startDate: startDate, endDate: endDate, effectiveness: 'good' as const,
      },
      {
        id: 'cmp_3', name: '新品试饮活动', type: 'new_product' as const,
        traffic: 310, cost: 1800, costPerVisitor: 5.8, roi: 4.2, incrementalRate: 0.17,
        startDate: startDate, endDate: endDate, effectiveness: 'excellent' as const,
      },
      {
        id: 'cmp_4', name: '周末节日促销', type: 'festival' as const,
        traffic: 250, cost: 4000, costPerVisitor: 16.0, roi: 1.4, incrementalRate: 0.14,
        startDate: startDate, endDate: endDate, effectiveness: 'average' as const,
      },
      {
        id: 'cmp_5', name: 'KOC探店合作', type: 'koc' as const,
        traffic: 180, cost: 6000, costPerVisitor: 33.3, roi: 0.8, incrementalRate: 0.08,
        startDate: startDate, endDate: endDate, effectiveness: 'poor' as const,
      },
    ],
    bestPerformingCampaign: '新品试饮活动（ROI 4.2，获客成本5.8元/人）',
    worstPerformingCampaign: 'KOC探店合作（ROI 0.8，获客成本33.3元/人）',
    totalCampaignSpend: 20000,
    avgCostPerVisitor: 10.2,
  }

  // 4. 老客带新客流拆解
  const totalReferral = Math.round(currentTotal * 0.22)
  const referralTraffic = {
    totalReferral,
    referralRate: 22.0,
    kFactor: 1.3,
    breakdown: {
      wechatShare: { count: Math.round(totalReferral * 0.45), rate: 0.45 },
      douyinShare: { count: Math.round(totalReferral * 0.25), rate: 0.25 },
      inPersonReferral: { count: Math.round(totalReferral * 0.20), rate: 0.20 },
      memberReferralProgram: { count: Math.round(totalReferral * 0.10), rate: 0.10, rewardCost: 850 },
    },
    topReferrers: [
      { customerName: '张*', referrals: 12, rewardEarned: 240 },
      { customerName: '李*', referrals: 9, rewardEarned: 180 },
      { customerName: '王*', referrals: 7, rewardEarned: 140 },
      { customerName: '赵*', referrals: 6, rewardEarned: 120 },
      { customerName: '刘*', referrals: 5, rewardEarned: 100 },
    ],
    referralTrend: 'up' as const,
  }

  // 5. 客流变化精准原因判定
  const changeRootCause = {
    direction: (wowChangeRate < -3 ? 'down' : wowChangeRate > 3 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
    changeRate: wowChangeRate,
    magnitude: (Math.abs(wowChangeRate) > 10 ? 'significant' : Math.abs(wowChangeRate) > 5 ? 'moderate' : 'slight') as 'significant' | 'moderate' | 'slight' | 'negligible',
    causes: wowChangeRate < -3
      ? [
          { factor: '天气（雨天）', impact: -15, contribution: 45, evidence: '本期3天雨天，雨天日均客流仅126人，较晴天天均客流（198人）下降36%', isControllable: false },
          { factor: '竞品新店开业', impact: -12, contribution: 30, evidence: '「茶百道」于5月10日在本店500m内开业，本周观察分流约12%客流', isControllable: false },
          { factor: '自然客流周期性下滑', impact: -5, contribution: 15, evidence: '历史同期数据显示5月中旬通常为客流淡季，环比下降5-8%属正常', isControllable: false },
          { factor: '线上推广力度不足', impact: -8, contribution: 10, evidence: '本期抖音本地推预算较上期减少40%，曝光量下降明显', isControllable: true },
        ]
      : [
          { factor: '"第二杯半价"活动', impact: 18, contribution: 50, evidence: '活动期间日均增量客流约97人，活动ROI达3.8，效果显著', isControllable: true },
          { factor: '周末天气晴好', impact: 12, contribution: 30, evidence: '本周末天气晴好，自然客流较上期周末提升12%', isControllable: false },
          { factor: '老客带新K因子提升', impact: 8, contribution: 20, evidence: '本期老客转介绍率达22%，K因子1.3，口碑传播效果提升', isControllable: true },
        ],
    uncontrollableFactors: ['天气（雨天）', '竞品新店开业', '自然客流周期性变化'],
    actionableFactors: ['线上推广策略', '活动策划', '老客转介绍激励', '门头展示优化'],
    aiConclusion: wowChangeRate < -5
      ? `AI诊断结论：本期客流下降${Math.abs(wowChangeRate)}%为「可控+不可控因素叠加」导致。不可控因素（天气+竞品）贡献75%的影响，建议短期通过加大线上推广（可控）弥补约40%的流失；长期建议通过差异化产品和服务建立竞争壁垒，降低对自然客流的依赖。`
      : `AI诊断结论：本期客流${wowChangeRate > 0 ? '上升' : '变化不大'}${Math.abs(wowChangeRate)}%，整体表现${wowChangeRate > 0 ? '良好' : '平稳'}。建议抓住当前增长势头，重点放大「第二杯半价」类高ROI活动的投入，同时优化过路客转化率（当前12% vs 基准15%）。`,
  }

  // 6. 高低客流时段精准定位
  const hourlyPattern = [
    8, 12, 25, 45, 70, 95, 130, 180, 220, 250, 230, 200,
    260, 300, 280, 240, 220, 260, 320, 290, 210, 160, 100, 60
  ]
  const hourlyHeatmap = hourlyPattern.map((traffic, hour) => ({
    hour,
    traffic,
    level: traffic > 250 ? 'peak' as const : traffic < 100 ? 'low' as const : 'normal' as const,
  }))

  const dailyPattern = [
    { dayOfWeek: 1, dayName: '周一', avgTraffic: 980, level: 'normal' as const },
    { dayOfWeek: 2, dayName: '周二', avgTraffic: 920, level: 'low' as const },
    { dayOfWeek: 3, dayName: '周三', avgTraffic: 950, level: 'normal' as const },
    { dayOfWeek: 4, dayName: '周四', avgTraffic: 1020, level: 'normal' as const },
    { dayOfWeek: 5, dayName: '周五', avgTraffic: 1380, level: 'peak' as const },
    { dayOfWeek: 6, dayName: '周六', avgTraffic: 1520, level: 'peak' as const },
    { dayOfWeek: 0, dayName: '周日', avgTraffic: 1280, level: 'normal' as const },
  ]

  const peakOffPeak = {
    hourlyHeatmap,
    dailyPattern,
    peakHours: [
      { start: 11, end: 13, avgTraffic: 285, suggestion: '午餐高峰期，建议安排3人以上值守，提前备货，启用快速点单二维码' },
      { start: 17, end: 19, avgTraffic: 310, suggestion: '晚餐高峰期，建议推出「晚市套餐」引导预点单，减少排队' },
      { start: 14, end: 16, avgTraffic: 270, suggestion: '下午茶时段，建议主推冰淇淋/冷饮品，配合「买二送一」' },
    ],
    lowHours: [
      { start: 14, end: 16, avgTraffic: 52, suggestion: '周二14:00-16:00为全周最低谷，建议安排员工培训/盘点/清洁，或推出「下午茶特惠」引流' },
      { start: 9, end: 11, avgTraffic: 68, suggestion: '早低峰时段，建议在抖音/小红书投放「早餐套餐」广告，抢占早间客流' },
      { start: 20, end: 22, avgTraffic: 80, suggestion: '晚间收尾时段，建议推出「闭店前特惠」清理当日库存' },
    ],
    weekendVsWeekday: { weekend: 1400, weekday: 970, difference: 44.3 },
    recommendations: [
      { timeSlot: '周五18:00-20:00', problem: '排队超过15分钟，导致约12%顾客流失', solution: '启用预点单小程序 + 高峰期增配1名员工', expectedImpact: '预计减少流失60%，日均增收约800元' },
      { timeSlot: '周二14:00-16:00', problem: '客流仅为高峰时段的18%，人员闲置', solution: '推出「下午茶套餐」+ 安排员工培训/盘点', expectedImpact: '预计提升低峰时段客流30%，人员利用率提升50%' },
      { timeSlot: '周末11:00-13:00', problem: '等位区不足，影响路过客进店意愿', solution: '设置「扫码点单免排队」引导牌 + 扩大等位区', expectedImpact: '预计提升过路客转化率从12%至15%' },
    ],
  }

  // 7. 客流提升落地玩法
  const boostTactics = [
    {
      id: 'tactic_1', category: 'online_ad' as const, name: '抖音本地推「到店套餐」',
      description: '在抖音投放本地推广，定向门店周边3km人群，主推「9.9元尝鲜套餐」引流到店',
      expectedTrafficIncrease: 200, costPerDay: 500, costPerVisitor: 2.5, roi: 5.2,
      difficulty: 'easy' as const, timeToImplement: '3天', priority: 'high' as const,
      steps: ['开通抖音企业号并认证蓝V', '制作「9.9元尝鲜」短视频素材（含门店定位）', '设置本地推投放：周边3km + 18-35岁 + 下午茶时段', '配置核销码，到店核销后自动发放复购券'],
      expectedEffect: '预计7天内带来约1400人次新增客流，获客成本2.5元/人（低于行业平均8元），ROI 5.2',
    },
    {
      id: 'tactic_2', category: 'member_referral' as const, name: '老客带新「拼单返现」',
      description: '会员每成功邀请1位新客到店消费，双方各得10元无门槛券；新客首单满30元再返5元现金',
      expectedTrafficIncrease: 150, costPerDay: 300, costPerVisitor: 2.0, roi: 6.0,
      difficulty: 'easy' as const, timeToImplement: '5天', priority: 'high' as const,
      steps: ['在小程序后台配置「拼单返现」活动规则', '向近30天消费前200名会员推送活动通知', '设计分享海报（含专属二维码）', '新客扫码到店消费后自动发放奖励'],
      expectedEffect: '预计提升转介绍率从22%至35%，K因子从1.3提升至1.8，月均新增客流约4500人次',
    },
    {
      id: 'tactic_3', category: 'offline_event' as const, name: '周末「亲子DIY奶茶」体验活动',
      description: '每周六下午开设「亲子DIY奶茶」体验课，家长带孩子参与，现场制作+拍照打卡发抖音可获赠饮',
      expectedTrafficIncrease: 80, costPerDay: 400, costPerVisitor: 5.0, roi: 3.5,
      difficulty: 'medium' as const, timeToImplement: '7天', priority: 'medium' as const,
      steps: ['采购DIY材料包（珍珠、布丁、椰果等）', '设计活动海报并在社群/朋友圈预热', '每场限20组家庭，提前3天开放预约', '现场引导拍照打卡，赠送「下次来店8折券」'],
      expectedEffect: '预计每周带来约160人次新增家庭客流，同时产生大量UGC内容（拍照打卡），间接引流效果显著',
    },
    {
      id: 'tactic_4', category: 'platform_promotion' as const, name: '大众点评「霸王餐」引流',
      description: '在大众点评投放「霸王餐」活动（每周5份免费套餐），引导用户写好评+打卡，提升门店曝光和评分',
      expectedTrafficIncrease: 120, costPerDay: 350, costPerVisitor: 2.9, roi: 4.0,
      difficulty: 'easy' as const, timeToImplement: '3天', priority: 'medium' as const,
      steps: ['在大众点评商家后台开通「霸王餐」活动', '设置每周5份免费套餐（价值约70元/份）', '要求中奖用户写评价+上传实拍图', '对每位到店兑换用户追加赠送「买二送一券」'],
      expectedEffect: '预计提升门店点评曝光量300%，评分从4.2提升至4.5，间接带来日均约120人次自然客流',
    },
    {
      id: 'tactic_5', category: 'collaboration' as const, name: '异业联盟「周边商户互推」',
      description: '与周边美容院、健身房、培训机构合作，互相放置优惠券/宣传物料，实现客流共享',
      expectedTrafficIncrease: 60, costPerDay: 150, costPerVisitor: 2.5, roi: 4.8,
      difficulty: 'hard' as const, timeToImplement: '14天', priority: 'low' as const,
      steps: ['调研周边500m内非竞争关系的优质商户（美容、健身、培训）', '洽谈合作方案：互相放置优惠券展架', '设计联名优惠券（在A店消费满额，可得B店8折券）', '每月评估互推效果，优化合作商户名单'],
      expectedEffect: '预计每月带来约1800人次精准客流（周边已有消费能力的客群），且获客成本极低',
    },
  ]

  return {
    shopId,
    period: { start: startDate, end: endDate },
    generatedAt: new Date().toISOString(),
    trendAnalysis,
    naturalTraffic,
    campaignTraffic,
    referralTraffic,
    changeRootCause,
    peakOffPeak,
    boostTactics,
    overallDiagnosis: wowChangeRate < -5
      ? `【综合诊断】本期门店客流健康度：⚠️ 需关注。总客流${currentTotal}人次，环比下降${Math.abs(wowChangeRate)}%。主要问题：① 雨天等不可控因素导致客流短期下滑；② 过路客转化率低于行业基准（12% vs 15%）；③ 高获客成本的KOC活动ROI仅0.8，建议暂停。优先行动：1) 加大抖音本地推预算（获客成本仅2.5元）；2) 优化门头展示提升过路客转化率；3) 扩大「第二杯半价」类高ROI活动投入。`
      : `【综合诊断】本期门店客流健康度：✅ 良好。总客流${currentTotal}人次，环比${wowChangeRate > 0 ? '上升' : '变化'}${Math.abs(wowChangeRate)}%。亮点：① 「第二杯半价」和「新品试饮」ROI均超3.5，活动策略正确；② 老客转介绍率达22%，口碑传播基础良好；③ 周末客流较工作日高44%，节假日营销有抓手。待优化：过路客转化率仍有3个百分点提升空间；低峰时段（周二下午）客流利用率不足。`,
    top3Priorities: wowChangeRate < -5
      ? ['立即暂停KOC合作（ROI 0.8），将预算转投抖音本地推（ROI 5.2）', '优化门头展示+门口试饮台，目标提升过路客转化率至15%', '针对雨天场景制定「雨天特惠」预案，减少天气因素影响']
      : ['扩大「第二杯半价」投入范围（当前仅工作日，建议覆盖周末）', '推出低峰时段「下午茶套餐」激活周二14:00-16:00时段', '优化抖音短视频素材，目标将获客成本从2.5元降至2.0元'],
  }
}

/** 生成深度转化分析结果 */
export function generateMockConversionAnalysis(shopId: string, _period: string) {
  return {
    shopId,
    period: { start: new Date(Date.now() - 7 * 86400000).toISOString(), end: new Date().toISOString() },
    overallRate: 28.5,
    benchmark: 35.0,
    gap: -6.5,
    funnelAnalysis: [
      { stage: '路过/曝光', count: 5200, rate: 100, dropOffReason: '—' },
      { stage: '进店', count: 1872, rate: 36.0, dropOffReason: '门头吸引力不足，12%路人未进店' },
      { stage: '咨询/浏览', count: 1498, rate: 80.0, dropOffReason: 'menu不清晰，部分顾客浏览后未下单' },
      { stage: '下单/支付', count: 1124, rate: 75.0, dropOffReason: '高峰期排队导致约8%顾客放弃下单' },
      { stage: '完成消费', count: 1056, rate: 94.0, dropOffReason: '部分顾客下单后等待超时取消' },
    ],
    customerTypeConversion: [
      { type: '新客', rate: 22.0, benchmark: 30.0, gap: -8.0 },
      { type: '老客', rate: 42.0, benchmark: 45.0, gap: -3.0 },
      { type: 'VIP', rate: 58.0, benchmark: 55.0, gap: 3.0 },
    ],
    timeSlotConversion: [
      { hour: 8, rate: 18, level: 'low' as const }, { hour: 9, rate: 22, level: 'low' as const },
      { hour: 10, rate: 28, level: 'medium' as const }, { hour: 11, rate: 38, level: 'high' as const },
      { hour: 12, rate: 42, level: 'high' as const }, { hour: 13, rate: 35, level: 'medium' as const },
      { hour: 14, rate: 25, level: 'low' as const }, { hour: 15, rate: 28, level: 'medium' as const },
      { hour: 16, rate: 32, level: 'medium' as const }, { hour: 17, rate: 40, level: 'high' as const },
      { hour: 18, rate: 45, level: 'high' as const }, { hour: 19, rate: 48, level: 'high' as const },
      { hour: 20, rate: 35, level: 'medium' as const }, { hour: 21, rate: 25, level: 'low' as const },
    ],
    productCategoryConversion: [
      { category: '招牌奶茶', rate: 52, avgAmount: 25 },
      { category: '冰淇淋', rate: 48, avgAmount: 18 },
      { category: '小吃/甜品', rate: 35, avgAmount: 22 },
      { category: '限定周边', rate: 18, avgAmount: 45 },
    ],
    rootCauseAnalysis: [
      { factor: '门头展示不清晰', impact: -5.0, isControllable: true, suggestion: '重新设计门头灯箱，突出「第二杯半价」等核心优惠' },
      { factor: '高峰期排队超时', impact: -3.5, isControllable: true, suggestion: '启用预点单小程序，高峰期增配1名员工' },
      { factor: 'menu信息密度过高', impact: -2.5, isControllable: true, suggestion: '简化menu，突出TOP3推荐，减少选择困难' },
      { factor: '新客首次到店无引导', impact: -2.0, isControllable: true, suggestion: '设计「新客立减5元」引导牌，降低首单门槛' },
    ],
    boostTactics: [
      { tactic: '启用预点单小程序+到店核销', expectedLift: 8.0, difficulty: 'easy', steps: ['接入小程序预点单功能', '高峰期前张贴「扫码点单免排队」引导牌', '后台配置核销提醒'] },
      { tactic: '重新设计门头+门口试饮台', expectedLift: 5.0, difficulty: 'medium', steps: ['聘请设计师重新设计门头灯箱', '门口设置小型试饮台（2款主打产品）', '培训店员主动邀请路人试饮'] },
      { tactic: '新客首单立减5元+赠送积分', expectedLift: 6.0, difficulty: 'easy', steps: ['后台配置新客专享优惠券', '门口放置「新客立减5元」引导牌', '收银时主动询问是否为新客'] },
    ],
    overallDiagnosis: '【转化率诊断】当前转化率28.5%，低于行业基准35%达6.5个百分点。漏斗分析显示最大流失在「路过→进店」阶段（流失64%），主要原因是门头吸引力不足。建议优先：1) 改造门头展示；2) 启用预点单减少排队流失；3) 针对新客设计首单优惠。预计综合提升转化率至35%以上。',
    top3Priorities: ['改造门头+设置试饮台（预计提升进店率至45%）', '启用预点单小程序（预计减少排队流失80%）', '新客首单立减5元（预计提升新客转化率至30%）'],
  }
}

// ============ 深度客单价分析 Mock 数据生成器 ============

export function generateMockAvgAmountAnalysis(shopId: string, period: string) {
  const now = new Date()
  const dayCount = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90
  const startDate = new Date(now.getTime() - (dayCount - 1) * 86400000).toISOString().slice(0, 10)
  const endDate = now.toISOString().slice(0, 10)

  // 故事主线：本期客单价 58.5 元，低于基准 65 元。主要原因：低价单品占比过高、连带推荐不足、周末客单低于工作日（通常反直觉）
  const overallAvgAmount = 58.5
  const benchmark = 65.0
  const gap = -6.5

  // 1. 客单价分布分析
  const distributionAnalysis = [
    { range: '¥0-20', count: 320, percentage: 12.8 },
    { range: '¥20-40', count: 680, percentage: 27.2 },
    { range: '¥40-60', count: 820, percentage: 32.8 },
    { range: '¥60-80', count: 450, percentage: 18.0 },
    { range: '¥80-100', count: 150, percentage: 6.0 },
    { range: '¥100+', count: 80, percentage: 3.2 },
  ]

  // 2. 客群类型客单价对比
  const customerTypeAvg = [
    { type: '新客', avgAmount: 38.2, benchmark: 42.0, gap: -3.8, reason: '新客首单多选低价引流款，缺乏引导升级' },
    { type: '老客（普通）', avgAmount: 55.6, benchmark: 58.0, gap: -2.4, reason: '复购客群稳定但缺乏加购动机' },
    { type: '老客（活跃）', avgAmount: 72.3, benchmark: 70.0, gap: 2.3, reason: '活跃老客有固定消费习惯，客单较高' },
    { type: 'VIP会员', avgAmount: 88.5, benchmark: 85.0, gap: 3.5, reason: 'VIP会员消费能力强，套餐偏好明显' },
  ]

  // 3. 产品组合分析
  const productCombinationAnalysis = [
    { combo: '单杯饮品', frequency: 42, avgAmount: 28.5, profit: 9.9, note: '最低客单组合，贡献32%客流但仅18%营收' },
    { combo: '饮品+小食', frequency: 28, avgAmount: 45.0, profit: 16.5, note: '主力加购组合，客单提升58%' },
    { combo: '双杯套餐', frequency: 15, avgAmount: 58.0, profit: 20.3, note: '"第二杯半价"带量，但拉低毛利' },
    { combo: '饮品+小食+周边', frequency: 8, avgAmount: 85.0, profit: 35.5, note: '最高价值组合，但占比仅8%' },
    { combo: '限定套餐', frequency: 7, avgAmount: 72.0, profit: 28.8, note: '节日/季节限定套餐，贡献高且毛利好' },
  ]

  // 4. 时段客单价
  const timeSlotAvgAmount = [
    { hour: 8, avgAmount: 22.5, level: 'low' as const }, { hour: 9, avgAmount: 25.0, level: 'low' as const },
    { hour: 10, avgAmount: 35.0, level: 'medium' as const }, { hour: 11, avgAmount: 48.0, level: 'medium' as const },
    { hour: 12, avgAmount: 52.0, level: 'high' as const }, { hour: 13, avgAmount: 45.0, level: 'medium' as const },
    { hour: 14, avgAmount: 38.0, level: 'medium' as const }, { hour: 15, avgAmount: 42.0, level: 'medium' as const },
    { hour: 16, avgAmount: 48.0, level: 'medium' as const }, { hour: 17, avgAmount: 55.0, level: 'high' as const },
    { hour: 18, avgAmount: 62.0, level: 'high' as const }, { hour: 19, avgAmount: 68.0, level: 'high' as const },
    { hour: 20, avgAmount: 55.0, level: 'high' as const }, { hour: 21, avgAmount: 42.0, level: 'medium' as const },
  ]

  // 5. 根因分析
  const rootCauseAnalysis = [
    {
      factor: '"第二杯半价"活动拉低客单',
      impact: -8.2,
      isControllable: true,
      evidence: '活动订单平均客单仅42元，较非活动订单低28%；活动期间客流提升18%但营收仅增8%',
      suggestion: '将"第二杯半价"改为"加3元换购小食"，既保留促销吸引力，又提升客单和毛利',
    },
    {
      factor: '缺乏有效的连带推荐话术',
      impact: -5.5,
      isControllable: true,
      evidence: '员工推荐率为18%，行业标杆为35%；顾客点单后无人主动推荐加购小食或周边',
      suggestion: '培训"三步推荐法"：① 确认饮品后问"需要加份小食吗" ② 推荐TOP3小食 ③ 收银台设置加购区',
    },
    {
      factor: '产品结构以低价饮品为主',
      impact: -4.0,
      isControllable: true,
      evidence: '定价¥15-25产品占菜单65%，¥40+产品仅占12%；高价新品上架频率低（每月1款）',
      suggestion: '每月推出1-2款¥45+限定新品，配合限量发售策略提升溢价感知',
    },
    {
      factor: '新客首单引导策略缺失',
      impact: -3.0,
      isControllable: true,
      evidence: '新客首单平均客单38.2元，仅为VIP客群的43%；新客无任何升级引导机制',
      suggestion: '设计新客专属"升级礼"：首单满50元送下次消费8折券，引导首单即建立高客单习惯',
    },
    {
      factor: '周末客单反而低于工作日（异常）',
      impact: -2.5,
      isControllable: true,
      evidence: '周末客单52元 vs 工作日62元；原因是周末家庭客群点单分散，人均消费低',
      suggestion: '推出"家庭套餐"（3-4人份），配合"周末亲子加购享双倍积分"，激活周末高客单场景',
    },
  ]

  // 6. 客单价提升策略
  const boostTactics = [
    {
      tactic: '推出"下午茶套餐A/B"组合',
      expectedLift: 12.0,
      difficulty: 'easy',
      steps: [
        '设计A套餐（饮品+小食+饮品=¥68，原价¥80）：适合2人分享',
        '设计B套餐（饮品+小食+饮品+甜点=¥88，原价¥108）：适合3-4人聚会',
        '在menu和收银台显著位置展示套餐，引导点单前推荐',
        '配套会员积分翻倍权益，提升套餐吸引力',
      ],
      expectedEffect: '预计套餐订单占比从15%提升至30%，带动整体客单提升12%至¥65.5元',
    },
    {
      tactic: '实施"三步推荐法"员工话术培训',
      expectedLift: 8.0,
      difficulty: 'medium',
      steps: [
        '编制标准推荐话术手册：确认饮品→推荐小食→收银台加购',
        '设置"连带推荐奖"：每单连带2件以上奖励0.5元/单',
        '每日晨会演练推荐话术，主管实时监督',
        '每周统计员工连带率，张榜公示激励',
      ],
      expectedEffect: '预计员工推荐率从18%提升至35%，连带客单提升¥8-10元/单',
    },
    {
      tactic: '改造收银台"加购区"陈列',
      expectedLift: 6.0,
      difficulty: 'easy',
      steps: [
        '在收银台前设置小型加购展架（高度与视线平齐）',
        '展架陈列TOP5高利润小食/周边，配合价格标签',
        '设计"加购享立减"标签：如"+3元换购价值¥8小食"',
        '收银时收银员口播推荐加购（配合培训）',
      ],
      expectedEffect: '预计加购转化率从8%提升至22%，额外增收¥3.5元/单',
    },
    {
      tactic: '推出月度"限定新品"提升溢价',
      expectedLift: 5.0,
      difficulty: 'hard',
      steps: [
        '每2周推出1款¥45+季节限定新品（含特色原料/联名包装）',
        '新品上市前3天在抖音/小红书预热，制造稀缺感',
        '限量发售（每日50份），营造排队抢购氛围',
        '设计"集齐新品可换VIP卡"机制，提升复购动机',
      ],
      expectedEffect: '预计高客单新品贡献整体营收15%+，带动整体客单提升¥5元',
    },
    {
      tactic: '周末"家庭套餐"专项营销',
      expectedLift: 4.0,
      difficulty: 'medium',
      steps: [
        '设计3人家庭套餐（2饮品+2小食+1甜点=¥108，原价¥128）',
        '在亲子社群、学校周边定向投放家庭套餐广告',
        '设置"周末亲子打卡"：拍照发小红书@门店享赠饮',
        '配套"家庭积分双倍"：周末家庭消费积分2倍累计',
      ],
      expectedEffect: '预计周末客单从¥52提升至¥65+，家庭客群复购率提升25%',
    },
  ]

  return {
    shopId,
    period: { start: startDate, end: endDate },
    overallAvgAmount,
    benchmark,
    gap,
    distributionAnalysis,
    customerTypeAvg,
    productCombinationAnalysis,
    timeSlotAvgAmount,
    rootCauseAnalysis,
    boostTactics,
    overallDiagnosis: `【客单价综合诊断】当前客单价¥58.5，低于行业基准¥65约10%（Gap -¥6.5）。核心问题：①「第二杯半价」活动虽引客流但严重拉低客单（活动订单仅¥42）；②员工推荐率18%远低于行业35%标杆；③高价产品占比仅12%，产品结构偏低端。亮点：活跃老客和VIP客群客单高于基准，说明产品力足够，只是推荐转化不足。优先行动：调整「第二杯半价」为「加3元换购」+ 强制员工推荐话术培训，预计可带来20%+的客单提升。`,
    top3Priorities: [
      '立即调整「第二杯半价」为「加3元换购指定小食」，活动期客单预计提升¥8+',
      '实施员工「三步推荐法」培训+连带奖励，推荐率从18%提升至35%',
      '在收银台设置加购展架，配套"+3元换购"话术，预计额外增收¥3.5/单',
    ],
  }
}

// ============ 深度复购分析 Mock 数据生成器 ============

export function generateMockRepurchaseAnalysis(shopId: string, period: string) {
  const now = new Date()
  const dayCount = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90
  const startDate = new Date(now.getTime() - (dayCount - 1) * 86400000).toISOString().slice(0, 10)
  const endDate = now.toISOString().slice(0, 10)

  // 故事主线：复购率32.5%低于基准38%，主要问题是积分体系弱、沉睡客户多、新品不足
  const overallRepurchaseRate = 32.5
  const benchmark = 38.0
  const gap = -5.5

  // 1. 同期群分析
  const cohortAnalysis = [
    { month: '2025-12', newCustomers: 580, repurchaseRate: 52, note: '圣诞活动月，新客质量高' },
    { month: '2026-01', newCustomers: 420, repurchaseRate: 48, note: '新年活动，新客首单转化好' },
    { month: '2026-02', newCustomers: 350, repurchaseRate: 38, note: '春节后淡季，新客获取减少' },
    { month: '2026-03', newCustomers: 480, repurchaseRate: 45, note: '春季新品拉动，新客留存提升' },
    { month: '2026-04', newCustomers: 520, repurchaseRate: 38, note: '常规月份，复购趋于稳定' },
    { month: '2026-05', newCustomers: 380, repurchaseRate: 22, note: '5月新客（当期），复购数据未完全' },
  ]

  // 2. 复购间隔分析
  const intervalAnalysis = [
    { days: '1-7天', percentage: 28, avgAmount: 68, note: '高频忠实客，超优质群体' },
    { days: '8-14天', percentage: 32, avgAmount: 58, note: '理想复购周期，健康' },
    { days: '15-30天', percentage: 25, avgAmount: 52, note: '偏低频，需唤醒' },
    { days: '31-60天', percentage: 10, avgAmount: 45, note: '低频濒危，即将流失' },
    { days: '60天+', percentage: 5, avgAmount: 38, note: '沉睡/流失客户' },
  ]

  // 3. 复购/流失原因分析
  const reasonAnalysis = [
    { reason: '产品口味/品质满意，愿意回来', percentage: 45, isControllable: false, note: '核心留客因素，口碑基础好' },
    { reason: '门店位置便利，习惯性复购', percentage: 28, isControllable: false, note: '地理优势，不易改变' },
    { reason: '会员积分/优惠券驱动复购', percentage: 18, isControllable: true, note: '积分体系有作用但激励不足' },
    { reason: '新品/限定款吸引回访', percentage: 9, isControllable: true, note: '新品频率低，贡献有限' },
  ]

  // 流失原因
  const lostCustomerAnalysis = {
    count: 185,
    avgDaysSinceLastVisit: 48,
    mainReasons: [
      { reason: '竞品开业（茶百道500m内）分流', percentage: 32, isControllable: false },
      { reason: '产品同质化，缺乏新鲜感', percentage: 28, isControllable: true },
      { reason: '会员积分价值感知低（100积分=¥1）', percentage: 22, isControllable: true },
      { reason: '无周期性唤醒机制，沉睡后遗忘', percentage: 18, isControllable: true },
    ],
  }

  // 4. 留存策略
  const retentionTactics = [
    {
      tactic: '重构会员积分体系（100积分=¥1 → 50积分=¥1）',
      expectedLift: 10.0,
      difficulty: 'easy',
      steps: [
        '调整积分规则：消费1元=2积分（原1积分），50积分=1元（原100积分=1元）',
        '新增积分兑换专区：50积分=小食兑换券、500积分=免费饮品、2000积分=VIP体验卡',
        '向全部会员推送积分升级公告，配合首周兑换双倍活动',
        '设置"积分到期提醒"：每年12月31日清零前30天推送唤醒',
      ],
      expectedEffect: '预计复购率从32.5%提升至35.8%，沉睡客户激活率提升30%',
    },
    {
      tactic: '实施「沉睡客户精准唤醒」计划',
      expectedLift: 8.0,
      difficulty: 'medium',
      steps: [
        '从CRM系统筛选近15-45天未到店客户（按消费金额分层）',
        'VIP沉睡客户：发送"专属回归礼"（免费任选饮品1杯+限时3天）',
        '普通沉睡客户：发送"30天未见面"短信+¥10无门槛回归券',
        '高价值沉睡客户（累计消费¥500+）：店长电话回访+到店接待礼',
      ],
      expectedEffect: '预计唤醒率35%（平均），高价值客户唤醒率可达55%，ROI 1:8',
    },
    {
      tactic: '建立每月「会员日」周期性活动',
      expectedLift: 6.0,
      difficulty: 'medium',
      steps: [
        '固定每月15日为"会员日"（遇周末提前），提前3天全渠道通知',
        '会员日专属权益：全单88折+双倍积分+新品优先体验',
        '配合社群推送：会员日前3天在微信群/小红书预热活动',
        '会员日当天：到店即赠"下次消费立减5元"券（有效期7天）',
      ],
      expectedEffect: '预计会员日当天客流提升40%+，复购率整体提升6个百分点',
    },
    {
      tactic: '推出「每2周1款」新品计划激活回访动机',
      expectedLift: 5.0,
      difficulty: 'hard',
      steps: [
        '建立新品研发节奏：每2周推出1款季节限定或联名新品',
        '新品上市前：会员群/小红书预热，制造期待感',
        '新品首发周：会员优先体验权（前50名会员免费试饮）',
        '设计"新品打卡地图"：集齐12款新品可兑换年度VIP卡',
      ],
      expectedEffect: '预计新品驱动回访占比从9%提升至18%，带动整体复购率+5%',
    },
    {
      tactic: '构建「门店社群」私域运营体系',
      expectedLift: 4.0,
      difficulty: 'hard',
      steps: [
        '建立门店专属微信群（每店1-2个），目标每个群300+人',
        '社群内容运营：新品预告、限时福利、晒单有奖、话题互动',
        '每周三"社群专属秒杀"：群里抢¥9.9饮品券（限时2小时）',
        '社群专属客服：解答咨询、处理投诉，提升情感连接',
      ],
      expectedEffect: '预计社群客户复购率比非社群客户高22%，月均互动3次+客户留存率+35%',
    },
  ]

  return {
    shopId,
    period: { start: startDate, end: endDate },
    overallRepurchaseRate,
    benchmark,
    gap,
    cohortAnalysis,
    intervalAnalysis,
    reasonAnalysis,
    lostCustomerAnalysis,
    retentionTactics,
    overallDiagnosis: `【复购率综合诊断】当前复购率32.5%，低于行业基准38%约5.5个百分点。核心问题：① 积分体系价值感知低（100积分=¥1，行业标杆50积分=¥1）；② 沉睡客户激活机制缺失（近30天流失客户185人，平均48天未回访）；③ 新品推出频率偏低（每月1款）导致缺乏回访动机。亮点：产品口味满意度高（45%客户因口味复购），口碑基础扎实，提升复购重点在会员体系优化而非产品改造。优先行动：重构积分体系（50积分=¥1）+沉睡客户精准唤醒，预计整体复购率提升至38%+。`,
    top3Priorities: [
      '重构会员积分体系：消费2元=1积分，50积分=¥1，同时新增多级兑换权益',
      '对近30天流失的185名客户实施精准唤醒（分层：VIP电话、普通短信+券）',
      '建立每月15日固定「会员日」+每2周1款新品节奏，创造周期性回访理由',
    ],
  }
}

// ============ 深度利润分析 Mock 数据生成器 ============

export function generateMockProfitAnalysis(shopId: string, period: string) {
  const now = new Date()
  const dayCount = period === 'today' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90
  const startDate = new Date(now.getTime() - (dayCount - 1) * 86400000).toISOString().slice(0, 10)
  const endDate = now.toISOString().slice(0, 10)

  // 故事主线：利润率28.5%低于基准32%，主要问题是促销拉低毛利、原料损耗高、能耗超标
  const overallProfitRate = 28.5
  const benchmark = 32.0
  const gap = -3.5
  const totalRevenue = 85000 // 模拟周期总收入
  const totalCost = 60775   // 28.5% 利润率对应成本

  // 1. 利润构成分析（按品类）
  const profitComposition = [
    { category: '招牌奶茶', revenue: 32000, cost: 19200, profit: 12800, profitRate: 40.0, note: '毛利最高的主力品类，招牌地位稳固' },
    { category: '冰淇淋/冷饮', revenue: 22000, cost: 15400, profit: 6600, profitRate: 30.0, note: '销量大但原料成本偏高' },
    { category: '小吃/甜品', revenue: 18000, cost: 10800, profit: 7200, profitRate: 40.0, note: '高毛利产品，但占比仅21%' },
    { category: '限定周边', revenue: 8000, cost: 9600, profit: -1600, profitRate: -20.0, note: '⚠️ 亏损！库存积压+定价偏低' },
    { category: '套餐组合', revenue: 5000, cost: 5775, profit: -775, profitRate: -15.5, note: '⚠️ 亏损！"第二杯半价"套餐毛利被严重摊薄' },
  ]

  // 2. 成本结构分析
  const costStructureAnalysis = [
    { item: '原料成本', amount: 32000, percentage: 52.7, isControllable: true, note: '含食材、包材、损耗（损耗约占8%）' },
    { item: '人工成本', amount: 15000, percentage: 24.7, isControllable: false, note: '含员工工资、社保，寒暑假旺季有弹性' },
    { item: '房租/水电', amount: 8000, percentage: 13.2, isControllable: false, note: '租金固定，水电有节能空间' },
    { item: '营销推广', amount: 4200, percentage: 6.9, isControllable: true, note: '含平台抽佣（美团/抖音/点评）' },
    { item: '其他杂费', amount: 1575, percentage: 2.5, isControllable: true, note: '设备维护、耗材、损耗等' },
  ]

  // 3. 产品利润贡献排行
  const productProfitAnalysis = [
    { productName: '招牌芋泥波波奶茶', salesCount: 480, profitPerUnit: 9.5, totalProfit: 4560, profitRate: 38.0 },
    { productName: '经典珍珠奶茶(大杯)', salesCount: 420, profitPerUnit: 8.0, totalProfit: 3360, profitRate: 40.0 },
    { productName: '杨枝甘露', salesCount: 380, profitPerUnit: 7.6, totalProfit: 2888, profitRate: 32.0 },
    { productName: '芒果班戟小食', salesCount: 320, profitPerUnit: 8.8, totalProfit: 2816, profitRate: 44.0 },
    { productName: '芝士蛋糕', salesCount: 280, profitPerUnit: 7.2, totalProfit: 2016, profitRate: 36.0 },
    { productName: '季节限定（当前：杨梅）', salesCount: 220, profitPerUnit: 6.0, totalProfit: 1320, profitRate: 30.0 },
    { productName: '联名周边（亏损品）', salesCount: 80, profitPerUnit: -20.0, totalProfit: -1600, profitRate: -20.0 },
    { productName: '第二杯半价套餐', salesCount: 350, profitPerUnit: -2.2, totalProfit: -770, profitRate: -15.5 },
  ]

  // 4. 根因分析
  const rootCauseAnalysis = [
    {
      factor: '"第二杯半价"严重拉低毛利率',
      impact: -4.5,
      isControllable: true,
      evidence: '活动期间毛利率仅18%（非活动35%），活动订单占总订单38%，拉低整体毛利率约4.5个百分点',
      suggestion: '将"第二杯半价"改为"加3元换购指定小食"：顾客原价购买第1杯，第2杯+3元换购小食（成本¥2），既保留促销感知又提升毛利',
    },
    {
      factor: '原料损耗率偏高（8% vs 行业5%）',
      impact: -2.0,
      isControllable: true,
      evidence: '本期原料成本¥32,000，损耗约¥2,560（8%），行业平均损耗5%约¥1,600，多损耗约¥960/周',
      suggestion: '建立原料使用SOP：① 每日盘点按需备料 ② 设置保鲜期预警 ③ 研发损耗友好型配方 ④ 建立损耗率KPI考核，目标将损耗率从8%降至5%',
    },
    {
      factor: '限定周边库存积压，亏损清仓',
      impact: -1.5,
      isControllable: true,
      evidence: '联名周边滞销，当前库存积压¥6,000+；已销售部分毛利率-20%（定价低于成本），整体亏损¥1,600+',
      suggestion: '立即停止滞销周边进货；现有库存通过"买奶茶送周边"或"集齐换大礼"方式消耗；优化新品选品机制，首批小批量试销再决定是否加单',
    },
    {
      factor: '能耗成本超预算15%（¥800/周 vs 预算¥700）',
      impact: -0.8,
      isControllable: true,
      evidence: '本期水电费¥8,000，超出预算¥1,000；主要原因：空调/冷藏设备24小时运行（深夜客流低但设备不停）',
      suggestion: '安装智能电表+定时开关（22:00后自动调低空调/关闭部分照明）；高峰期前1小时预冷/预热，减少满负荷运行时长；目标节能15%',
    },
    {
      factor: '平台抽佣偏高（美团/抖音约6%营收）',
      impact: -0.5,
      isControllable: false,
      evidence: '外卖平台抽佣约5%，加上推广费用，平台渠道综合成本约占营收6%，但平台订单占比仅15%',
      suggestion: '短期难以改变平台规则，可通过提升自营小程序复购（无抽佣）来平衡：引导到店客户注册小程序会员，下次线上下单享专属优惠',
    },
  ]

  // 5. 利润提升策略
  const profitBoostTactics = [
    {
      tactic: '调整「第二杯半价」→ 「加3元换购小食」',
      expectedLift: 4.5,
      difficulty: 'easy',
      steps: [
        '后台修改促销规则：将"第2杯半价"替换为"加¥3换购指定小食（原价¥8）"',
        '收银员话术培训："现在加¥3就可以换购我们店里最好卖的小食哦"',
        '加购区设置：在收银台前陈列换购小食，配合价格标签',
        '老客通知：通过小程序/短信向活跃老客推送新活动预告',
      ],
      expectedEffect: '预计活动订单毛利从18%提升至33%，整体利润率提升4.5个百分点至33%+',
    },
    {
      tactic: '建立原料损耗管控SOP',
      expectedLift: 2.0,
      difficulty: 'medium',
      steps: [
        '每日开店前：按昨日销售数据备料，不盲目多备',
        '设置保鲜期分级预警：临期食材（剩余1/3保质期）强制降级使用或做成员工餐',
        '建立损耗率周报：每周统计各品类损耗率，纳入店长KPI考核',
        '研发低损耗配方：与供应商合作开发损耗友好型原料规格',
      ],
      expectedEffect: '预计损耗率从8%降至5%，每周节省原料成本约¥960，月省¥3,840',
    },
    {
      tactic: '清理滞销周边库存，停止盲目进货',
      expectedLift: 1.5,
      difficulty: 'easy',
      steps: [
        '立即盘点所有滞销周边，明确库存数量和成本价',
        '推出"买任意饮品+¥15换购滞销周边"（原价¥30+，换购价覆盖成本）',
        '设计"集齐3款周边换免费饮品"活动，激活收集动机',
        '建立新品引进机制：首批小批量试销（20-50件），根据动销率决定是否加单',
      ],
      expectedEffect: '预计清理全部滞销库存，止损¥1,600+；同时改善库存资金占用¥6,000',
    },
    {
      tactic: '安装智能能耗管控设备',
      expectedLift: 0.8,
      difficulty: 'medium',
      steps: [
        '安装智能电表（带远程控制功能，¥500/台）',
        '设置设备运行时段策略：22:00-次日9:00自动调低空调/关闭非必要照明',
        '高峰前1小时（10:00）预冷/预热设备，减少满负荷启动能耗',
        '每月对比能耗数据，动态调整节能策略',
      ],
      expectedEffect: '预计月均节省电费¥1,000-1,500，年节省¥12,000-18,000，投资回收期约4-6个月',
    },
    {
      tactic: '优化产品结构：下架亏损品、扶持高毛利品',
      expectedLift: 1.5,
      difficulty: 'hard',
      steps: [
        '下架利润率<20%的产品（尤其是亏损的套餐和周边）',
        '将高毛利产品（班戟/芒果类）在menu上置顶展示，配合"店员推荐"标签',
        '研发2-3款高毛利新品（如：椰椰芋泥捞、桂花酒酿等），定价¥38-45，毛利率42%+',
        '收银员话术引导：优先推荐高毛利产品而非低价引流款',
      ],
      expectedEffect: '预计高毛利品类营收占比从35%提升至50%，整体利润率额外提升1.5个百分点',
    },
  ]

  return {
    shopId,
    period: { start: startDate, end: endDate },
    overallProfitRate,
    benchmark,
    gap,
    profitComposition,
    costStructureAnalysis,
    productProfitAnalysis,
    rootCauseAnalysis,
    profitBoostTactics,
    overallDiagnosis: `【利润率综合诊断】当前利润率28.5%，低于行业基准32%约3.5个百分点。主要亏损来源：①「第二杯半价」活动将毛利率从35%拉低至18%（贡献38%订单），是最大问题；②限定周边和套餐组合已出现亏损（利润率-15%~-20%）；③原料损耗率8%高于行业5%。亮点：招牌奶茶品类毛利率40%，产品力足够。优先行动：立即将「第二杯半价」改为「加3元换购小食」（预计提升毛利4.5个百分点）+ 下架亏损品（周边+套餐），预计利润率可恢复至33%+。`,
    top3Priorities: [
      '立即调整「第二杯半价」→「加3元换购指定小食」，预计提升整体利润率4.5个百分点',
      '下架亏损品类（限定周边/低毛利套餐），止损¥2,370+/周，同时优化menu结构',
      '建立原料损耗SOP（目标从8%降至5%），月节省原料成本约¥3,840',
    ],
  }
}

// ============ 经营大盘数据生成器（7大类）============

/** 7大类经营大盘完整数据 */
export interface IDashboard7Categories {
  shopId: string
  period: 'today' | 'yesterday' | 'week' | 'month'
  generatedAt: string
  // === 1. 收银交易数据 ===
  cashflow: {
    totalRevenue: number          // 总营业额
    totalProfit: number           // 总毛利
    totalNetProfit: number        // 净利润
    totalDiscount: number        // 总折扣
    totalTransactions: number    // 总流水笔数
    avgAmount: number             // 平均客单价
    profitRate: number           // 毛利率%
    netProfitRate: number        // 净利率%
    discountRate: number         // 折扣率%
    todayRevenue: number         // 今日营收
    yesterdayRevenue: number      // 昨日营收
    weekRevenue: number          // 7日营收
    monthRevenue: number         // 30日营收
    todayProfit: number
    yesterdayProfit: number
    weekProfit: number
    monthProfit: number
    // 时段营收（14个时段）
    timeSlotRevenue: Array<{ slot: string; revenue: number; transactions: number; profit: number }>
    // 支付方式分布
    paymentDistribution: Array<{ method: string; amount: number; count: number; percentage: number }>
    // 每日趋势
    dailyTrend: Array<{ date: string; revenue: number; profit: number; transactions: number; customers: number }>
  }

  // === 2. 商品货品数据 ===
  products: {
    totalSKU: number             // SKU总数
    activeSKU: number            // 在售SKU
    lowStockSKU: number          // 库存不足SKU
    outOfStockSKU: number        // 缺货SKU
    todaySold: number            // 今日售出SKU数
    inventoryTurnover: number   // 库存周转天数
    inventoryValue: number      // 库存价值
    // 库存预警
    stockAlerts: Array<{
      skuId: string
      skuName: string
      category: string
      stock: number
      minStock: number
      cost: number
      price: number
      turnoverDays: number
      alertLevel: 'normal' | 'low' | 'critical' | 'overstock'
    }>
    // 进销存概览
    inventorySummary: Array<{
      category: string
      skuCount: number
      totalStock: number
      totalValue: number
      avgCost: number
      avgPrice: number
      sold7d: number
      turnoverRate: number
    }>
    // 热销SKU排行
    topSellingSKU: Array<{
      skuId: string
      skuName: string
      category: string
      soldCount: number
      revenue: number
      profit: number
      profitRate: number
      stock: number
    }>
  }

  // === 3. 会员客户数据 ===
  members: {
    totalMembers: number         // 会员总数
    activeMembers: number       // 活跃会员（30天内消费）
    newMembers: number          // 本期新注册
    vipMembers: number          // VIP会员
    dormantMembers: number      // 沉睡会员（90天+未消费）
    totalStoredValue: number    // 储值总额
    totalConsumeValue: number   // 累计消费总额
    avgConsumeValue: number     // 人均累计消费
    avgVisitCycle: number       // 平均到店周期（天）
    memberConversion: number     // 会员转化率%
    // 会员等级分布
    levelDistribution: Array<{ level: string; count: number; percentage: number; avgConsume: number }>
    // 消费频次分析
    visitFrequency: Array<{ range: string; count: number; avgAmount: number; description: string }>
    // 本期新增会员
    newMembersList: Array<{ memberId: string; name: string; phone: string; level: string; firstConsume: string; storedValue: number }>
    // 高价值流失预警
    highValueDormant: Array<{ memberId: string; name: string; level: string; totalConsume: number; lastVisit: string; daysSinceVisit: number }>
  }

  // === 4. 员工考勤业绩数据 ===
  employees: {
    totalStaff: number          // 在职员工数
    onDutyToday: number          // 今日出勤
    absentToday: number          // 今日缺勤
    avgWorkHours: number         // 平均工时
    totalPerformance: number     // 总业绩
    avgPersonalSales: number     // 人均个人业绩
    avgPersonalAmount: number    // 人均客单
    avgAttachmentRate: number    // 平均连带率
    // 员工业绩排行
    performanceRanking: Array<{
      employeeId: string
      name: string
      role: string
      salesAmount: number
      transactions: number
      avgAmount: number
      attachmentRate: number
      attendance: number         // 出勤天数
      workHours: number
      rank: number
    }>
    // 出勤统计
    attendanceSummary: Array<{
      date: string
      present: number
      absent: number
      late: number
      earlyLeave: number
      leave: number
      attendanceRate: number
    }>
    // 排班计划
    schedulePlan: Array<{
      employeeId: string
      name: string
      role: string
      shift: 'morning' | 'afternoon' | 'evening' | 'full'
      date: string
      startTime: string
      endTime: string
    }>
  }

  // === 5. 门店场景数据 ===
  storeScene: {
    todayCustomerFlow: number    // 今日客流
    yesterdayCustomerFlow: number
    weekAvgCustomerFlow: number
    avgDwellTime: number         // 平均停留时长（分钟）
    entryRate: number            // 进店率%
    peakHour: number             // 高峰时段
    lowHour: number              // 低峰时段
    // 客流时段热力
    hourlyCustomerFlow: Array<{ hour: number; traffic: number; entryCount: number; entryRate: number; avgDwellMinutes: number; level: 'peak' | 'normal' | 'low' }>
    // 每日客流趋势
    dailyCustomerTrend: Array<{ date: string; customerFlow: number; entryCount: number; avgDwellTime: number }>
    // 客流来源
    trafficSources: Array<{ source: string; count: number; percentage: number; description: string }>
    // 停留时长分布
    dwellTimeDistribution: Array<{ range: string; count: number; percentage: number }>
  }

  // === 6. 外卖平台数据 ===
  deliveryPlatform: {
    totalOrders: number          // 线上总订单
    totalRevenue: number         // 线上总收入
    avgDeliveryTime: number      // 平均配送时长（分钟）
    cancelRate: number           // 取消率%
    complaintRate: number        // 差评率%
    deliveryRating: number      // 配送评分
    productRating: number        // 商品评分
    // 平台分布
    platformDistribution: Array<{ platform: string; orders: number; revenue: number; percentage: number; avgRating: number }>
    // 时段订单量
    hourlyOrders: Array<{ hour: number; meituan: number; ele: number; didi: number; total: number }>
    // 差评分析
    complaintAnalysis: Array<{ reason: string; count: number; percentage: number; isControllable: boolean; suggestion: string }>
    // 流量转化
    trafficConversion: Array<{ platform: string; impressions: number; clicks: number; orders: number; ctr: number; cvr: number }>
  }

  // === 7. 商圈行业数据 ===
  businessDistrict: {
    // 周边同行动态
    competitorActivities: Array<{
      competitorName: string
      distance: number           // 距离（米）
      activity: string
      startDate: string
      endDate: string
      estimatedImpact: number    // 预估影响%
      isActive: boolean
    }>
    // 周边同行价格分布
    priceDistribution: Array<{
      brand: string
      avgPrice: number
      distance: number
      marketShare: number
      trend: 'up' | 'down' | 'stable'
    }>
    // 客流行情
    trafficMarket: {
      totalPassersby: number     // 日均路过人数
      totalEntryRate: number     // 综合进店率
      peakHour: number
      avgDwellTime: number
      weekendTraffic: number
      weekdayTraffic: number
      weatherImpact: number      // 天气影响%
    }
    // 行业基准
    industryBenchmark: {
      avgRevenue: number         // 行业平均营收
      avgCustomerFlow: number    // 行业平均客流
      avgConversion: number      // 行业平均转化率
      avgAmount: number          // 行业平均客单价
      top25Revenue: number       // 行业前25%营收
      yourRank: number           // 门店排名（百分位）
      yourRankPercent: number    // 排名百分比
    }
  }
}

/** 生成7大类经营大盘数据 */
export function generateMockDashboard7Categories(shopId: string, period: 'today' | 'yesterday' | 'week' | 'month'): IDashboard7Categories {
  const now = new Date()

  // === 1. 收银交易数据 ===
  const totalRevenue = Math.round((Math.random() * 50000 + 30000) * 100) / 100
  const totalProfit = Math.round(totalRevenue * (0.28 + Math.random() * 0.08) * 100) / 100
  const totalNetProfit = Math.round(totalProfit * (0.75 + Math.random() * 0.1) * 100) / 100
  const totalDiscount = Math.round(totalRevenue * (0.08 + Math.random() * 0.06) * 100) / 100
  const totalTransactions = Math.floor(totalRevenue / (45 + Math.random() * 30))
  const avgAmount = Math.round(totalRevenue / totalTransactions * 100) / 100
  const profitRate = Math.round((totalProfit / totalRevenue) * 100 * 10) / 10
  const netProfitRate = Math.round((totalNetProfit / totalRevenue) * 100 * 10) / 10
  const discountRate = Math.round((totalDiscount / (totalRevenue + totalDiscount)) * 100 * 10) / 10

  const todayRevenue = totalRevenue
  const yesterdayRevenue = Math.round(todayRevenue * (0.85 + Math.random() * 0.2) * 100) / 100
  const weekRevenue = Math.round(todayRevenue * 7 * (0.9 + Math.random() * 0.15) * 100) / 100
  const monthRevenue = Math.round(todayRevenue * 30 * (0.88 + Math.random() * 0.2) * 100) / 100

  const todayProfit = totalProfit
  const yesterdayProfit = Math.round(todayProfit * (0.85 + Math.random() * 0.15) * 100) / 100
  const weekProfit = Math.round(todayProfit * 7 * (0.9 + Math.random() * 0.15) * 100) / 100
  const monthProfit = Math.round(todayProfit * 30 * (0.88 + Math.random() * 0.2) * 100) / 100

  // 时段营收（14个时段：7:00-21:00，每小时一个时段）
  const timeSlotRevenue = [
    { slot: '07-09', revenue: 2800, transactions: 62, profit: 980 },
    { slot: '09-11', revenue: 4200, transactions: 93, profit: 1470 },
    { slot: '11-13', revenue: 8500, transactions: 188, profit: 2975 },
    { slot: '13-15', revenue: 5800, transactions: 128, profit: 2030 },
    { slot: '15-17', revenue: 6200, transactions: 137, profit: 2170 },
    { slot: '17-19', revenue: 9800, transactions: 217, profit: 3430 },
    { slot: '19-21', revenue: 7200, transactions: 159, profit: 2520 },
  ]

  // 支付方式
  const paymentDistribution = [
    { method: '微信支付', amount: Math.round(totalRevenue * 0.45 * 100) / 100, count: Math.floor(totalTransactions * 0.45), percentage: 45 },
    { method: '支付宝', amount: Math.round(totalRevenue * 0.32 * 100) / 100, count: Math.floor(totalTransactions * 0.32), percentage: 32 },
    { method: '会员储值', amount: Math.round(totalRevenue * 0.15 * 100) / 100, count: Math.floor(totalTransactions * 0.15), percentage: 15 },
    { method: '现金', amount: Math.round(totalRevenue * 0.05 * 100) / 100, count: Math.floor(totalTransactions * 0.05), percentage: 5 },
    { method: '其他', amount: Math.round(totalRevenue * 0.03 * 100) / 100, count: Math.floor(totalTransactions * 0.03), percentage: 3 },
  ]

  // 每日趋势（按周期不同天数）
  const dayCount = period === 'today' ? 1 : period === 'yesterday' ? 2 : period === 'week' ? 7 : 30
  const dailyTrend = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(now.getTime() - (dayCount - 1 - i) * 86400000)
    const dow = d.getDay()
    const isWeekend = dow === 0 || dow === 6
    const dayRevenue = Math.round((totalRevenue / dayCount) * (isWeekend ? 1.3 : 1.0) * (0.9 + Math.random() * 0.2) * 100) / 100
    return {
      date: d.toISOString().slice(0, 10),
      revenue: dayRevenue,
      profit: Math.round(dayRevenue * (0.28 + Math.random() * 0.08) * 100) / 100,
      transactions: Math.floor(dayRevenue / (45 + Math.random() * 30)),
      customers: Math.floor(dayRevenue / (38 + Math.random() * 20)),
    }
  })

  // === 2. 商品货品数据 ===
  const stockAlerts = [
    { skuId: 'SKU_001', skuName: '招牌芋泥波波奶茶', category: '奶茶', stock: 8, minStock: 30, cost: 16, price: 28, turnoverDays: 12, alertLevel: 'critical' as const },
    { skuId: 'SKU_002', skuName: '珍珠原料（大袋装）', category: '原料', stock: 15, minStock: 25, cost: 35, price: 0, turnoverDays: 8, alertLevel: 'low' as const },
    { skuId: 'SKU_003', skuName: '经典珍珠奶茶(大杯)', category: '奶茶', stock: 5, minStock: 20, cost: 12, price: 22, turnoverDays: 6, alertLevel: 'critical' as const },
    { skuId: 'SKU_004', skuName: '芒果班戟小食', category: '小食', stock: 18, minStock: 15, cost: 12, price: 22, turnoverDays: 10, alertLevel: 'overstock' as const },
    { skuId: 'SKU_005', skuName: '椰椰芋泥捞', category: '新品', stock: 22, minStock: 20, cost: 18, price: 35, turnoverDays: 15, alertLevel: 'normal' as const },
  ]

  const inventorySummary = [
    { category: '奶茶饮品', skuCount: 28, totalStock: 850, totalValue: 22100, avgCost: 15.2, avgPrice: 26, sold7d: 320, turnoverRate: 0.38 },
    { category: '小食甜品', skuCount: 18, totalStock: 420, totalValue: 8400, avgCost: 12.5, avgPrice: 20, sold7d: 185, turnoverRate: 0.44 },
    { category: '咖啡特饮', skuCount: 12, totalStock: 280, totalValue: 7280, avgCost: 18.0, avgPrice: 32, sold7d: 95, turnoverRate: 0.34 },
    { category: '限定周边', skuCount: 8, totalStock: 180, totalValue: 5400, avgCost: 30.0, avgPrice: 42, sold7d: 12, turnoverRate: 0.07 },
    { category: '套餐组合', skuCount: 6, totalStock: 60, totalValue: 1800, avgCost: 25.0, avgPrice: 42, sold7d: 48, turnoverRate: 0.80 },
  ]

  const topSellingSKU = [
    { skuId: 'SKU_A1', skuName: '招牌芋泥波波奶茶', category: '奶茶', soldCount: 186, revenue: 5208, profit: 2232, profitRate: 42.9, stock: 48 },
    { skuId: 'SKU_A2', skuName: '经典珍珠奶茶(大杯)', category: '奶茶', soldCount: 158, revenue: 3476, profit: 1580, profitRate: 45.5, stock: 32 },
    { skuId: 'SKU_A3', skuName: '杨枝甘露', category: '特饮', soldCount: 142, revenue: 4260, profit: 1704, profitRate: 40.0, stock: 55 },
    { skuId: 'SKU_A4', skuName: '芒果班戟小食', category: '小食', soldCount: 128, revenue: 2816, profit: 1280, profitRate: 45.5, stock: 18 },
    { skuId: 'SKU_A5', skuName: '芝士蛋糕', category: '甜品', soldCount: 105, revenue: 2625, profit: 945, profitRate: 36.0, stock: 40 },
  ]

  // === 3. 会员客户数据 ===
  const totalMembers = 2860
  const activeMembers = Math.floor(totalMembers * 0.42)
  const newMembers = Math.floor(totalMembers * 0.08)
  const vipMembers = Math.floor(totalMembers * 0.12)
  const dormantMembers = Math.floor(totalMembers * 0.25)
  const totalStoredValue = 286000
  const totalConsumeValue = 2150000

  const levelDistribution = [
    { level: '普通会员', count: Math.floor(totalMembers * 0.55), percentage: 55, avgConsume: 480 },
    { level: '银卡会员', count: Math.floor(totalMembers * 0.22), percentage: 22, avgConsume: 1280 },
    { level: '金卡会员', count: Math.floor(totalMembers * 0.15), percentage: 15, avgConsume: 3200 },
    { level: 'VIP会员', count: vipMembers, percentage: 12, avgConsume: 8500 },
  ]

  const visitFrequency = [
    { range: '1次/周+', count: 420, avgAmount: 156, description: '超级活跃，核心用户群' },
    { range: '1次/2周', count: 680, avgAmount: 128, description: '活跃会员，复购稳定' },
    { range: '1次/月', count: 850, avgAmount: 98, description: '普通会员，需激活' },
    { range: '1次/季', count: 560, avgAmount: 82, description: '低频会员，沉睡风险' },
    { range: '90天+未消费', count: dormantMembers, avgAmount: 65, description: '已流失，需唤醒' },
  ]

  const newMembersList = [
    { memberId: 'MB_001', name: '张*晴', phone: '138****7821', level: '普通会员', firstConsume: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), storedValue: 200 },
    { memberId: 'MB_002', name: '李*博', phone: '139****3056', level: '普通会员', firstConsume: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), storedValue: 0 },
    { memberId: 'MB_003', name: '王*琳', phone: '137****8829', level: '银卡会员', firstConsume: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), storedValue: 1000 },
    { memberId: 'MB_004', name: '赵*晨', phone: '136****5512', level: '普通会员', firstConsume: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), storedValue: 100 },
    { memberId: 'MB_005', name: '刘*明', phone: '135****6734', level: '普通会员', firstConsume: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), storedValue: 0 },
  ]

  const highValueDormant = [
    { memberId: 'MB_V1', name: '陈*华', level: 'VIP会员', totalConsume: 12800, lastVisit: new Date(Date.now() - 95 * 86400000).toISOString().slice(0, 10), daysSinceVisit: 95 },
    { memberId: 'MB_V2', name: '周*敏', level: '金卡会员', totalConsume: 5600, lastVisit: new Date(Date.now() - 88 * 86400000).toISOString().slice(0, 10), daysSinceVisit: 88 },
    { memberId: 'MB_V3', name: '吴*强', level: '金卡会员', totalConsume: 4200, lastVisit: new Date(Date.now() - 102 * 86400000).toISOString().slice(0, 10), daysSinceVisit: 102 },
    { memberId: 'MB_V4', name: '郑*文', level: '银卡会员', totalConsume: 2100, lastVisit: new Date(Date.now() - 91 * 86400000).toISOString().slice(0, 10), daysSinceVisit: 91 },
  ]

  // === 4. 员工考勤业绩数据 ===
  const totalStaff = 12
  const onDutyToday = 10
  const absentToday = 2

  const performanceRanking = [
    { employeeId: 'EMP_001', name: '李店长', role: '店长', salesAmount: 18600, transactions: 412, avgAmount: 45.1, attachmentRate: 1.82, attendance: 7, workHours: 56, rank: 1 },
    { employeeId: 'EMP_002', name: '王晓芳', role: '收银员', salesAmount: 15200, transactions: 336, avgAmount: 45.2, attachmentRate: 1.65, attendance: 7, workHours: 49, rank: 2 },
    { employeeId: 'EMP_003', name: '张伟', role: '店员', salesAmount: 13800, transactions: 305, avgAmount: 45.2, attachmentRate: 1.58, attendance: 6, workHours: 42, rank: 3 },
    { employeeId: 'EMP_004', name: '陈思思', role: '店员', salesAmount: 12400, transactions: 274, avgAmount: 45.3, attachmentRate: 1.48, attendance: 7, workHours: 49, rank: 4 },
    { employeeId: 'EMP_005', name: '刘洋', role: '店员', salesAmount: 11800, transactions: 261, avgAmount: 45.2, attachmentRate: 1.42, attendance: 6, workHours: 42, rank: 5 },
  ]

  const attendanceSummary = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000)
    return {
      date: d.toISOString().slice(0, 10),
      present: 10 + Math.floor(Math.random() * 2),
      absent: Math.floor(Math.random() * 2),
      late: Math.floor(Math.random() * 3),
      earlyLeave: Math.floor(Math.random() * 2),
      leave: Math.floor(Math.random() * 1),
      attendanceRate: 85 + Math.random() * 12,
    }
  })

  const schedulePlan = [
    { employeeId: 'EMP_001', name: '李店长', role: '店长', shift: 'full', date: now.toISOString().slice(0, 10), startTime: '08:00', endTime: '22:00' },
    { employeeId: 'EMP_002', name: '王晓芳', role: '收银员', shift: 'morning', date: now.toISOString().slice(0, 10), startTime: '08:00', endTime: '15:00' },
    { employeeId: 'EMP_003', name: '张伟', role: '店员', shift: 'evening', date: now.toISOString().slice(0, 10), startTime: '15:00', endTime: '22:00' },
    { employeeId: 'EMP_004', name: '陈思思', role: '店员', shift: 'morning', date: now.toISOString().slice(0, 10), startTime: '08:00', endTime: '15:00' },
  ]

  // === 5. 门店场景数据 ===
  const todayCustomerFlow = 1280
  const yesterdayCustomerFlow = 1350
  const weekAvgCustomerFlow = 1240

  const hourlyCustomerFlow = [
    { hour: 7, traffic: 38, entryCount: 12, entryRate: 31.6, avgDwellMinutes: 18, level: 'low' as const },
    { hour: 8, traffic: 85, entryCount: 28, entryRate: 32.9, avgDwellMinutes: 22, level: 'low' as const },
    { hour: 9, traffic: 120, entryCount: 42, entryRate: 35.0, avgDwellMinutes: 25, level: 'normal' as const },
    { hour: 10, traffic: 165, entryCount: 60, entryRate: 36.4, avgDwellMinutes: 28, level: 'normal' as const },
    { hour: 11, traffic: 220, entryCount: 82, entryRate: 37.3, avgDwellMinutes: 32, level: 'peak' as const },
    { hour: 12, traffic: 310, entryCount: 120, entryRate: 38.7, avgDwellMinutes: 38, level: 'peak' as const },
    { hour: 13, traffic: 280, entryCount: 105, entryRate: 37.5, avgDwellMinutes: 35, level: 'peak' as const },
    { hour: 14, traffic: 195, entryCount: 72, entryRate: 36.9, avgDwellMinutes: 30, level: 'normal' as const },
    { hour: 15, traffic: 175, entryCount: 65, entryRate: 37.1, avgDwellMinutes: 28, level: 'normal' as const },
    { hour: 16, traffic: 205, entryCount: 78, entryRate: 38.0, avgDwellMinutes: 32, level: 'normal' as const },
    { hour: 17, traffic: 285, entryCount: 112, entryRate: 39.3, avgDwellMinutes: 36, level: 'peak' as const },
    { hour: 18, traffic: 350, entryCount: 140, entryRate: 40.0, avgDwellMinutes: 40, level: 'peak' as const },
    { hour: 19, traffic: 320, entryCount: 128, entryRate: 40.0, avgDwellMinutes: 38, level: 'peak' as const },
    { hour: 20, traffic: 260, entryCount: 100, entryRate: 38.5, avgDwellMinutes: 35, level: 'normal' as const },
    { hour: 21, traffic: 180, entryCount: 65, entryRate: 36.1, avgDwellMinutes: 28, level: 'normal' as const },
  ]

  const dailyCustomerTrend = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date(now.getTime() - (dayCount - 1 - i) * 86400000)
    const dow = d.getDay()
    const isWeekend = dow === 0 || dow === 6
    const flow = Math.round((todayCustomerFlow / dayCount) * (isWeekend ? 1.2 : 1.0) * (0.9 + Math.random() * 0.2))
    return {
      date: d.toISOString().slice(0, 10),
      customerFlow: flow,
      entryCount: Math.round(flow * 0.38),
      avgDwellTime: 28 + Math.round(Math.random() * 10),
    }
  })

  const trafficSources = [
    { source: '自然路过客', count: 820, percentage: 42.8, description: '门店前路过，主动入店' },
    { source: '线上引流到店', count: 580, percentage: 30.2, description: '抖音/点评/微信到店' },
    { source: '老客回头', count: 420, percentage: 21.9, description: '会员/回头客主动复购' },
    { source: '推荐转介绍', count: 60, percentage: 3.1, description: '朋友/社群推荐到店' },
    { source: '其他渠道', count: 36, percentage: 1.9, description: '地图导航/外卖转化等' },
  ]

  const dwellTimeDistribution = [
    { range: '<15分钟', count: 320, percentage: 25.0 },
    { range: '15-30分钟', count: 640, percentage: 50.0 },
    { range: '30-60分钟', count: 256, percentage: 20.0 },
    { range: '>60分钟', count: 64, percentage: 5.0 },
  ]

  // === 6. 外卖平台数据 ===
  const totalOrders = Math.floor(todayCustomerFlow * 0.18)
  const totalDeliveryRevenue = Math.round(todayRevenue * 0.18 * 100) / 100

  const platformDistribution = [
    { platform: '美团', orders: Math.floor(totalOrders * 0.55), revenue: Math.round(totalDeliveryRevenue * 0.55 * 100) / 100, percentage: 55, avgRating: 4.6 },
    { platform: '饿了么', orders: Math.floor(totalOrders * 0.32), revenue: Math.round(totalDeliveryRevenue * 0.32 * 100) / 100, percentage: 32, avgRating: 4.4 },
    { platform: '滴滴出行', orders: Math.floor(totalOrders * 0.08), revenue: Math.round(totalDeliveryRevenue * 0.08 * 100) / 100, percentage: 8, avgRating: 4.5 },
    { platform: '抖音团购', orders: Math.floor(totalOrders * 0.05), revenue: Math.round(totalDeliveryRevenue * 0.05 * 100) / 100, percentage: 5, avgRating: 4.7 },
  ]

  const hourlyOrders = [
    { hour: 11, meituan: 32, ele: 18, didi: 4, total: 54 },
    { hour: 12, meituan: 65, ele: 38, didi: 8, total: 111 },
    { hour: 13, meituan: 48, ele: 28, didi: 6, total: 82 },
    { hour: 17, meituan: 55, ele: 32, didi: 7, total: 94 },
    { hour: 18, meituan: 78, ele: 45, didi: 10, total: 133 },
    { hour: 19, meituan: 62, ele: 36, didi: 8, total: 106 },
    { hour: 20, meituan: 38, ele: 22, didi: 5, total: 65 },
  ]

  const complaintAnalysis = [
    { reason: '配送超时', count: 8, percentage: 32, isControllable: false, suggestion: '与平台沟通优化配送路线，选择优质骑手' },
    { reason: '包装破损', count: 6, percentage: 24, isControllable: true, suggestion: '改进包装材质，增加防漏措施' },
    { reason: '分量不足', count: 4, percentage: 16, isControllable: true, suggestion: '标准化出品份量，加强培训' },
    { reason: '温度变化', count: 3, percentage: 12, isControllable: true, suggestion: '使用保温包装，减少温度流失' },
    { reason: '骑手服务', count: 4, percentage: 16, isControllable: false, suggestion: '选择高评分骑手，反馈平台处理' },
  ]

  const trafficConversion = [
    { platform: '美团', impressions: 8500, clicks: 1420, orders: 380, ctr: 16.7, cvr: 26.8 },
    { platform: '饿了么', impressions: 6200, clicks: 980, orders: 248, ctr: 15.8, cvr: 25.3 },
    { platform: '抖音', impressions: 12000, clicks: 1680, orders: 160, ctr: 14.0, cvr: 9.5 },
  ]

  // === 7. 商圈行业数据 ===
  const competitorActivities = [
    { competitorName: '茶百道（国贸店）', distance: 450, activity: '新店开业，全场8折+买一送一', startDate: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), endDate: new Date(Date.now() + 11 * 86400000).toISOString().slice(0, 10), estimatedImpact: -15, isActive: true },
    { competitorName: '喜茶（龙湖店）', distance: 1200, activity: '新品上市，第二杯半价', startDate: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10), endDate: new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10), estimatedImpact: -8, isActive: true },
    { competitorName: '霸王茶姬（银泰店）', distance: 800, activity: '会员日，全单7.5折', startDate: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), endDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10), estimatedImpact: -5, isActive: true },
    { competitorName: '一点点（万达店）', distance: 1500, activity: '限时特惠，满30减5', startDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), endDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), estimatedImpact: -3, isActive: true },
  ]

  const priceDistribution = [
    { brand: '茶百道', avgPrice: 18.5, distance: 450, marketShare: 22, trend: 'stable' as const },
    { brand: '喜茶', avgPrice: 28.0, distance: 1200, marketShare: 18, trend: 'up' as const },
    { brand: '霸王茶姬', avgPrice: 22.0, distance: 800, marketShare: 15, trend: 'up' as const },
    { brand: '一点点', avgPrice: 15.0, distance: 1500, marketShare: 12, trend: 'down' as const },
    { brand: '我们门店', avgPrice: 26.0, distance: 0, marketShare: 25, trend: 'stable' as const },
  ]

  const industryBenchmark = {
    avgRevenue: 35000,
    avgCustomerFlow: 1100,
    avgConversion: 36.5,
    avgAmount: 42.0,
    top25Revenue: 52000,
    yourRank: 18,
    yourRankPercent: 72,
  }

  return {
    shopId,
    period,
    generatedAt: new Date().toISOString(),
    cashflow: {
      totalRevenue, totalProfit, totalNetProfit, totalDiscount, totalTransactions,
      avgAmount, profitRate, netProfitRate, discountRate,
      todayRevenue, yesterdayRevenue, weekRevenue, monthRevenue,
      todayProfit, yesterdayProfit, weekProfit, monthProfit,
      timeSlotRevenue, paymentDistribution, dailyTrend,
    },
    products: {
      totalSKU: 72,
      activeSKU: 68,
      lowStockSKU: 3,
      outOfStockSKU: 1,
      todaySold: 612,
      inventoryTurnover: 18.5,
      inventoryValue: 46980,
      stockAlerts, inventorySummary, topSellingSKU,
    },
    members: {
      totalMembers, activeMembers, newMembers, vipMembers, dormantMembers,
      totalStoredValue, totalConsumeValue,
      avgConsumeValue: Math.round(totalConsumeValue / totalMembers * 100) / 100,
      avgVisitCycle: 22.5,
      memberConversion: Math.round((activeMembers / totalMembers) * 100 * 10) / 10,
      levelDistribution, visitFrequency, newMembersList, highValueDormant,
    },
    employees: {
      totalStaff, onDutyToday, absentToday,
      avgWorkHours: 7.8,
      totalPerformance: totalRevenue,
      avgPersonalSales: Math.round(totalRevenue / totalStaff * 100) / 100,
      avgPersonalAmount: avgAmount,
      avgAttachmentRate: 1.58,
      performanceRanking, attendanceSummary, schedulePlan,
    },
    storeScene: {
      todayCustomerFlow, yesterdayCustomerFlow, weekAvgCustomerFlow,
      avgDwellTime: 32,
      entryRate: 37.8,
      peakHour: 18,
      lowHour: 8,
      hourlyCustomerFlow, dailyCustomerTrend, trafficSources, dwellTimeDistribution,
    },
    deliveryPlatform: {
      totalOrders, totalRevenue: totalDeliveryRevenue,
      avgDeliveryTime: 35.2,
      cancelRate: 2.8,
      complaintRate: 1.2,
      deliveryRating: 4.55,
      productRating: 4.62,
      platformDistribution, hourlyOrders, complaintAnalysis, trafficConversion,
    },
    businessDistrict: {
      competitorActivities, priceDistribution,
      trafficMarket: {
        totalPassersby: 3800,
        totalEntryRate: 36.8,
        peakHour: 18,
        avgDwellTime: 35,
        weekendTraffic: 4200,
        weekdayTraffic: 3200,
        weatherImpact: -8,
      },
      industryBenchmark,
    },
  }
}

/** 生成多门店汇总数据 */
export function generateMockMultiStoreSummary(shopIds: string[], period: 'today' | 'yesterday' | 'week' | 'month') {
  return shopIds.map((shopId) => ({
    shopId,
    shopName: ['万象城旗舰店', '国贸CBD店', '龙湖天街店', '银泰中心店', '万达广场店'][shopIds.indexOf(shopId)] || shopId,
    revenue: Math.round((35000 + Math.random() * 20000) * 100) / 100,
    profit: Math.round((9500 + Math.random() * 6000) * 100) / 100,
    customers: Math.floor(800 + Math.random() * 600),
    transactions: Math.floor(600 + Math.random() * 400),
    avgAmount: Math.round((45 + Math.random() * 20) * 100) / 100,
    customerFlow: Math.floor(1000 + Math.random() * 500),
    rank: 0,
  }))
}

// ============ 货品全链路智能诊断 Mock 数据 ============

/** 3.3.1 货品结构诊断 */
export function generateMockProductStructureDiag(shopId: string, _period: string): IProductStructureDiag {
  // 新款/老款占比
  const newRatio = Math.round((Math.random() * 20 + 25) * 10) / 10
  const newVsOld: INewVsOldRatio = {
    newArrivalRatio: newRatio,
    oldArrivalRatio: Math.round((100 - newRatio) * 10) / 10,
    newArrivalSalesRatio: Math.round((Math.random() * 25 + 35) * 10) / 10,
    oldArrivalSalesRatio: 0,
    diagnosis: 'balanced',
    issue: '',
    suggestion: '',
    newArrivalDetail: Array.from({ length: 6 }, (_, i) => ({
      sku: `sku_new_${i + 1}`,
      name: ['春季卫衣', '新款T恤', '轻薄外套', '休闲长裤', '碎花裙', '牛仔外套'][i],
      sales: Math.floor(Math.random() * 200 + 50),
      stock: Math.floor(Math.random() * 300 + 100),
    })),
    oldArrivalDetail: Array.from({ length: 5 }, (_, i) => ({
      sku: `sku_old_${i + 1}`,
      name: ['经典牛仔裤', '基础白T', '黑色长裤', '针织开衫', '简约毛衣'][i],
      sales: Math.floor(Math.random() * 100 + 10),
      stock: Math.floor(Math.random() * 500 + 200),
      daysSinceLaunch: Math.floor(Math.random() * 300 + 180),
    })),
  }
  newVsOld.oldArrivalSalesRatio = Math.round((100 - newVsOld.newArrivalSalesRatio) * 10) / 10
  if (newVsOld.newArrivalRatio > 50) {
    newVsOld.diagnosis = 'new_heavy'
    newVsOld.issue = '新款占比过高，库存资金占用大'
    newVsOld.suggestion = '适当减少新款进货频率，加快老款出清'
  } else if (newVsOld.oldArrivalRatio > 70) {
    newVsOld.diagnosis = 'old_heavy'
    newVsOld.issue = '老款占比过高，商品新鲜度不足，对年轻客群吸引力下降'
    newVsOld.suggestion = '制定老款清仓计划，同时增加新款引入比例至40%以上'
  } else {
    newVsOld.diagnosis = 'balanced'
    newVsOld.issue = ''
    newVsOld.suggestion = '新款/老款比例健康，保持当前商品迭代节奏'
  }

  // 引流款/利润款/形象款结构
  const roleStructure: IProductRoleStructure = {
    roles: [
      { role: 'traffic', roleLabel: '引流款', skuCount: Math.floor(Math.random() * 8 + 5), salesAmount: 28000, salesRatio: 22, profitAmount: 4200, profitRatio: 8 },
      { role: 'profit', roleLabel: '利润款', skuCount: Math.floor(Math.random() * 15 + 20), salesAmount: 78000, salesRatio: 58, profitAmount: 43000, profitRatio: 82 },
      { role: 'image', roleLabel: '形象款', skuCount: Math.floor(Math.random() * 5 + 3), salesAmount: 26000, salesRatio: 20, profitAmount: 5200, profitRatio: 10 },
    ],
    idealStructure: { traffic: 25, profit: 55, image: 20 },
    diagnosis: '',
    issues: [],
    suggestions: [],
  }
  if (roleStructure.roles[0].salesRatio < 15) {
    roleStructure.issues.push('引流款占比偏低（当前22%，建议25-30%），可能影响自然进店客流')
    roleStructure.suggestions.push('增加2-3款高性价比引流款，定价贴近成本价，吸引价格敏感客群')
  }
  if (roleStructure.roles[1].salesRatio < 40) {
    roleStructure.issues.push('利润款占比偏低（当前58%，建议50-60%），整体盈利能力不足')
    roleStructure.suggestions.push('优化利润款选品，提升高毛利商品（毛利率>50%）的SKU占比'))
  }
  roleStructure.diagnosis = roleStructure.issues.length === 0 ? '引流/利润/形象款结构合理，符合行业基准' : `结构需优化：存在${roleStructure.issues.length}个问题`

  // 品类结构失衡诊断
  const catNames = ['服饰类', '鞋靴类', '配饰类', '箱包类', '美妆类']
  const catBench = [40, 25, 15, 12, 8]
  const categoryStructure: ICategoryStructureDiag = {
    categories: catNames.map((cat, i) => ({
      category: cat,
      skuCount: Math.floor(Math.random() * 20 + 5),
      salesAmount: Math.round((catBench[i] / 100) * 150000 * (0.8 + Math.random() * 0.4) * 100) / 100,
      salesRatio: Math.round((catBench[i] * (0.8 + Math.random() * 0.4)) * 10) / 10,
      profitRate: Math.round((Math.random() * 25 + 10) * 10) / 10,
      turnoverDays: Math.round((Math.random() * 30 + 10) * 10) / 10,
      status: 'healthy' as const,
    })),
    benchmark: Object.fromEntries(catNames.map((c, i) => [c, catBench[i]])),
    imbalancedCategories: [],
    diagnosis: '',
    suggestions: [],
  }
  categoryStructure.categories.forEach(c => {
    const bench = categoryStructure.benchmark[c.category] || 10
    if (c.salesRatio > bench * 1.3) {
      c.status = 'over_weight'
      categoryStructure.imbalancedCategories.push(`${c.category}（实际${c.salesRatio}%，基准${bench}%）`)
    } else if (c.salesRatio < bench * 0.7) {
      c.status = 'under_weight'
      categoryStructure.imbalancedCategories.push(`${c.category}（实际${c.salesRatio}%，基准${bench}%）`)
    }
  })
  categoryStructure.diagnosis = categoryStructure.imbalancedCategories.length > 0
    ? `品类结构失衡：${categoryStructure.imbalancedCategories.join('；')}`
    : '各品类销售占比与行业基准基本吻合，结构健康'
  if (categoryStructure.imbalancedCategories.length > 0) {
    categoryStructure.suggestions.push('按基准比例调整各品类进货预算，过度品类减少进货，不足品类增加选品')
  }

  // 尺码颜色库存结构
  const sizeColorStock: ISizeColorStockDiag = {
    totalSKU: 68,
    unreasonableSKU: Math.floor(Math.random() * 8 + 2),
    unreasonableRate: 0,
    issues: [],
    diagnosis: '',
    suggestions: [],
  }
  const issueSKUs = ['男士圆领T恤', '女士直筒牛仔裤', '连帽卫衣', 'A字半身裙', '薄款风衣']
  const issueTypes: Array<'size_imbalanced' | 'color_imbalanced' | 'over_stock' | 'dead_stock'> = ['size_imbalanced', 'color_imbalanced', 'over_stock', 'over_stock', 'dead_stock']
  sizeColorStock.issues = issueSKUs.map((name, i) => {
    const sizes = 'S,M,L,XL,XXL'.split(',').map(s => ({ size: s, stock: Math.floor(Math.random() * 60) }))
    // 制造尺码不均：S和XXL库存高，M/L库存低
    if (issueTypes[i] === 'size_imbalanced') { sizes[0].stock = 80; sizes[4].stock = 75; sizes[2].stock = 8; sizes[3].stock = 12 }
    const colors = '黑色,白色,灰色,蓝色,红色'.split(',').map(c => ({ color: c, stock: Math.floor(Math.random() * 60) }))
    if (issueTypes[i] === 'color_imbalanced') { colors[0].stock = 5; colors[1].stock = 8; colors[2].stock = 90; colors[3].stock = 70 }
    return {
      sku: `sku_sc_${i + 1}`,
      name,
      category: '服饰类',
      sizeStock: sizes,
      colorStock: colors,
      issueType: issueTypes[i],
      issueDesc: '',
      suggestion: '',
    }
  })
  sizeColorStock.issues.forEach(issue => {
    if (issue.issueType === 'size_imbalanced') {
      issue.issueDesc = '尺码库存严重不均：中间码(M/L)库存不足，两端码(S/XXL)库存积压'
      issue.suggestion = '按身材分布调整尺码配比（S:15%, M:30%, L:30%, XL:20%, XXL:5%），紧急补货M/L码'
    } else if (issue.issueType === 'color_imbalanced') {
      issue.issueDesc = '颜色库存不均：主流色（黑/白）库存不足，冷门色（灰/蓝）库存积压'
      issue.suggestion = '增加主流色进货比例至70%以上，冷门色停止补货并做捆绑促销'
    } else if (issue.issueType === 'over_stock') {
      issue.issueDesc = '部分颜色/尺码库存过高，远超安全库存，存在滞销风险'
      issue.suggestion = '对高库存SKU做买一送一或第二件半价活动，快速回笼资金'
    } else {
      issue.issueDesc = '该SKU部分颜色完全无销量，属于死库存'
      issue.suggestion = '立即做清仓处理，回收资金，不再补货该颜色'
    }
  })
  sizeColorStock.unreasonableRate = Math.round((sizeColorStock.unreasonableSKU / sizeColorStock.totalSKU) * 1000) / 10
  sizeColorStock.diagnosis = sizeColorStock.unreasonableSKU > 5
    ? `尺码/颜色库存存在结构性问题（${sizeColorStock.unreasonableSKU}个SKU），需紧急优化`
    : '尺码颜色库存结构基本合理，少数SKU需微调'

  return {
    shopId,
    period: { start: new Date(Date.now() - 30 * 86400000).toISOString(), end: new Date().toISOString() },
    generatedAt: new Date().toISOString(),
    newVsOld,
    roleStructure,
    categoryStructure,
    sizeColorStock,
    overallDiagnosis: '货品结构整体健康，新款比例适中；需重点优化品类失衡问题和尺码库存结构，预计优化后可提升整体毛利8-12%。',
    suggestions: [
      '将新款占比调整至40%，加快90天以上老款清仓',
      '增加利润款SKU占比至55%以上，重点引入毛利率>50%商品',
      '服饰类占比过高，适当减少进货，增加鞋靴类选品',
      '对4个尺码/颜色结构不合理SKU立即调整库存配比',
    ],
  }
}

/** 3.3.2 动销滞销智能判定 */
export function generateMockSalesVelocityDiag(shopId: string, _period: string): ISalesVelocityDiag {
  // 动销分类
  const velocityClassification: IVelocityClassification = {
    categories: [
      { level: 'hot', levelLabel: '爆款', skuCount: Math.floor(Math.random() * 5 + 3), skus: [], avgSalesPerDay: 0, totalBacklogValue: 0 },
      { level: 'normal', levelLabel: '平销款', skuCount: Math.floor(Math.random() * 20 + 30), skus: [], avgSalesPerDay: 0, totalBacklogValue: 0 },
      { level: 'slow', levelLabel: '慢销款', skuCount: Math.floor(Math.random() * 10 + 8), skus: [], avgSalesPerDay: 0, totalBacklogValue: 0 },
      { level: 'dead', levelLabel: '死款', skuCount: Math.floor(Math.random() * 5 + 2), skus: [], avgSalesPerDay: 0, totalBacklogValue: 0 },
    ],
    classificationRules: {
      hot: '连续14天每天销量≥5件，且库存周转天数<20天',
      normal: '连续30天有销量，库存周转天数20-60天',
      slow: '连续30天销量<10件，或库存周转天数60-120天',
      dead: '连续60天无销量，或库存周转天数>120天',
    },
    diagnosis: '',
  }
  const hotNames = ['爆款圆领T恤', '明星同款卫衣', '高弹牛仔裤', '轻薄防晒衣', '冰丝内裤']
  const normalNames = ['休闲长裤', ' Polo衫', '运动外套', '直筒裙', '帆布鞋', '双肩包', '针织开衫']
  const slowNames = ['格子衬衫', '灯芯绒裤', '羊毛背心', '西装外套', '皮裙']
  const deadNames = ['厚款毛衣', '冬季棉服', '加绒皮靴', '毛呢大衣', '保暖内衣']
  velocityClassification.categories[0].skus = hotNames.map((name, i) => ({
    sku: `sku_hot_${i + 1}`, name, category: '服饰类',
    salesCount: Math.floor(Math.random() * 300 + 200), salesAmount: Math.round((Math.random() * 50000 + 30000) * 100) / 100,
    stock: Math.floor(Math.random() * 50 + 10), daysSinceLastSale: Math.floor(Math.random() * 3),
    velocityScore: Math.round((Math.random() * 15 + 85) * 10) / 10,
  }))
  velocityClassification.categories[1].skus = normalNames.map((name, i) => ({
    sku: `sku_norm_${i + 1}`, name, category: '服饰类',
    salesCount: Math.floor(Math.random() * 50 + 20), salesAmount: Math.round((Math.random() * 10000 + 5000) * 100) / 100,
    stock: Math.floor(Math.random() * 80 + 20), daysSinceLastSale: Math.floor(Math.random() * 10 + 1),
    velocityScore: Math.round((Math.random() * 30 + 45) * 10) / 10,
  }))
  velocityClassification.categories[2].skus = slowNames.map((name, i) => ({
    sku: `sku_slow_${i + 1}`, name, category: '服饰类',
    salesCount: Math.floor(Math.random() * 10 + 1), salesAmount: Math.round((Math.random() * 3000 + 500) * 100) / 100,
    stock: Math.floor(Math.random() * 100 + 50), daysSinceLastSale: Math.floor(Math.random() * 20 + 15),
    velocityScore: Math.round((Math.random() * 25 + 15) * 10) / 10,
  }))
  velocityClassification.categories[3].skus = deadNames.map((name, i) => ({
    sku: `sku_dead_${i + 1}`, name, category: '服饰类',
    salesCount: 0, salesAmount: 0,
    stock: Math.floor(Math.random() * 60 + 20), daysSinceLastSale: Math.floor(Math.random() * 60 + 60),
    velocityScore: Math.round((Math.random() * 12) * 10) / 10,
  }))
  velocityClassification.categories.forEach(cat => {
    cat.avgSalesPerDay = cat.skus.length > 0 ? Math.round(cat.skus.reduce((s, s2) => s + s2.salesCount, 0) / cat.skus.length / 30 * 100) / 100 : 0
    cat.totalBacklogValue = cat.skus.reduce((s, s2) => s + s2.stock * 50, 0) // 预估成本50元/件
  })
  velocityClassification.diagnosis = `当前${velocityClassification.categories[3].skuCount}个死款和${velocityClassification.categories[2].skuCount}个慢销款占用大量资金，建议立即制定清仓计划`

  // 滞销积压金额统计
  const slowMovingBacklog: ISlowMovingBacklog = {
    totalBacklogValue: Math.round((Math.random() * 50000 + 20000) * 100) / 100,
    totalBacklogSKU: velocityClassification.categories[2].skuCount + velocityClassification.categories[3].skuCount,
    backlogByCategory: [
      { category: '服饰类', backlogValue: Math.round((Math.random() * 30000 + 10000) * 100) / 100, skuCount: 8, avgDaysInStock: Math.floor(Math.random() * 40 + 60) },
      { category: '鞋靴类', backlogValue: Math.round((Math.random() * 20000 + 5000) * 100) / 100, skuCount: 4, avgDaysInStock: Math.floor(Math.random() * 30 + 50) },
      { category: '配饰类', backlogValue: Math.round((Math.random() * 10000 + 3000) * 100) / 100, skuCount: 3, avgDaysInStock: Math.floor(Math.random() * 50 + 40) },
    ],
    backlogDetails: [],
    diagnosis: '',
  }
  slowMovingBacklog.backlogDetails = [
    ...velocityClassification.categories[2].skus.slice(0, 3),
    ...velocityClassification.categories[3].skus,
  ].map(s => ({
    sku: s.sku, name: s.name, category: s.category,
    costValue: Math.round(s.stock * (Math.random() * 30 + 20) * 100) / 100,
    retailValue: Math.round(s.stock * (Math.random() * 80 + 50) * 100) / 100,
    daysInStock: s.daysSinceLastSale + Math.floor(Math.random() * 30),
    lastSaleDays: s.daysSinceLastSale,
    urgency: s.daysSinceLastSale > 60 ? 'high' as const : s.daysSinceLastSale > 30 ? 'medium' as const : 'low' as const,
  }))
  slowMovingBacklog.diagnosis = `滞销积压总金额¥${slowMovingBacklog.totalBacklogValue.toLocaleString()}，涉及${slowMovingBacklog.totalBacklogSKU}个SKU，其中${velocityClassification.categories[3].skuCount}个死款需立即清仓处理`

  // 滞销根因区分
  const slowMovingRootCause: ISlowMovingRootCause = {
    totalSlowMoving: slowMovingBacklog.totalBacklogSKU,
    causes: [
      { causeType: 'seasonal', causeLabel: '季节性滞销', skuCount: Math.floor(slowMovingBacklog.totalBacklogSKU * 0.4), backlogValue: 0, percentage: 40, examples: ['厚款毛衣', '冬季棉服'], suggestion: '跨季节清仓：提前3个月做反季促销，冬季商品夏季清仓' },
      { causeType: 'style', causeLabel: '款式滞销', skuCount: Math.floor(slowMovingBacklog.totalBacklogSKU * 0.35), backlogValue: 0, percentage: 35, examples: ['格子衬衫', '灯芯绒裤'], suggestion: '款式迭代：该类款式已过时，停止补货，清仓后引入新流行元素款式' },
      { causeType: 'pricing', causeLabel: '定价滞销', skuCount: Math.floor(slowMovingBacklog.totalBacklogSKU * 0.25), backlogValue: 0, percentage: 25, examples: ['皮裙', '羊毛背心'], suggestion: '重新定价：对比竞品价格，若高出行价20%以上，立即调价至市场中位价' },
    ],
    seasonalDetail: [
      { season: '冬季', skuCount: 3, suggestion: '立即做反季促销，折扣率不低于6折，应在6月底前清空' },
      { season: '夏季', skuCount: 1, suggestion: '当季商品动销差系款式问题，不属于季节性滞销，按款式滞销处理' },
    ],
    diagnosis: '滞销主要由季节性因素（40%）和款式过时（35%）导致，建议针对性制定清仓策略而非一刀切打折',
  }
  slowMovingRootCause.causes.forEach(c => { c.backlogValue = Math.round(slowMovingBacklog.totalBacklogValue * c.percentage / 100 * 100) / 100 })

  // 根因精准定位
  const rootCauseLocation: IRootCauseLocation = {
    skuRootCauses: slowMovingBacklog.backlogDetails.slice(0, 5).map(s => ({
      sku: s.sku, name: s.name, category: s.category,
      rootCause: s.daysInStock > 120 ? '季节性滞销：该商品为冬季厚款，当前季节完全无需求' : s.daysInStock > 60 ? '款式滞销：该款式已超过流行周期，消费者偏好已转移' : '定价策略失误：进价比同类竞品高30%，零售价缺乏竞争力',
      contributingFactors: [
        { factor: s.daysInStock > 90 ? '季节周期' : '款式流行度', weight: 60, isControllable: false },
        { factor: '进货定价策略', weight: 30, isControllable: true },
        { factor: '竞品价格变化', weight: 10, isControllable: false },
      ],
      recommendedActions: s.urgency === 'high' ? ['立即5折清仓', '捆绑热销款销售', '内部员工福利价'] : ['7折促销', '调整陈列至主推区', '搭配网红款组合销售'],
    })),
    uncontrollableFactors: ['季节周期变化', '消费者偏好转移', '竞品价格战'],
    actionableFactors: ['进货定价策略', '陈列位置调整', '促销话术优化', '捆绑销售策略'],
    diagnosis: '滞销根因中60%为不可控因素（季节/流行周期），40%为可控因素；建议重点优化可控因素，不可控因素通过提前清仓规避',
  }

  return {
    shopId,
    period: { start: new Date(Date.now() - 30 * 86400000).toISOString(), end: new Date().toISOString() },
    generatedAt: new Date().toISOString(),
    velocityClassification,
    slowMovingBacklog,
    slowMovingRootCause,
    rootCauseLocation,
    overallDiagnosis: `动销分析完成：爆款${velocityClassification.categories[0].skuCount}个、平销款${velocityClassification.categories[1].skuCount}个、慢销款${velocityClassification.categories[2].skuCount}个、死款${velocityClassification.categories[3].skuCount}个。滞销积压¥${slowMovingBacklog.totalBacklogValue.toLocaleString()}，建议优先级：死款立即清仓 > 慢销款打折促销 > 优化定价策略。`,
    topPriorityActions: [
      `立即对${velocityClassification.categories[3].skuCount}个死款做5折清仓处理`,
      `对${velocityClassification.categories[2].skuCount}个慢销款做7折促销，并调整陈列位置`,
      '重新评估定价策略，对比竞品价格，高出行价商品立即调价',
      '建立动销预警机制：连续14天销量为0的商品自动提醒',
    ],
  }
}

/** 3.3.3 库存风险诊断 */
export function generateMockInventoryRiskDiag(shopId: string, _period: string): IInventoryRiskDiag {
  // 库存积压预警
  const backlogAlert: IBacklogAlert = {
    alertLevel: 'high',
    totalBacklogValue: Math.round((Math.random() * 60000 + 30000) * 100) / 100,
    backlogDays: Math.floor(Math.random() * 30 + 45),
    alertItems: Array.from({ length: 5 }, (_, i) => ({
      sku: `sku_backlog_${i + 1}`,
      name: ['厚款毛衣', '冬季棉服', '灯芯绒裤', '格子衬衫', '加绒皮靴'][i],
      category: '服饰类',
      stock: Math.floor(Math.random() * 80 + 30),
      costValue: Math.round((Math.random() * 3000 + 1000) * 100) / 100,
      daysInStock: Math.floor(Math.random() * 60 + 60),
      alertLevel: i < 2 ? 'critical' as const : 'high' as const,
      suggestedAction: i < 2 ? '立即5折清仓，回收资金' : '7折促销，搭配热销款销售',
    })),
    trend: 'stable',
    diagnosis: '库存积压问题严重，5个SKU积压金额超过¥30,000，建议立即启动清仓计划，预计可回收资金60-70%',
    suggestion: '对积压超过90天的商品做阶梯折扣：90天7折、120天5折、150天员工福利价3折',
  }

  // 爆款断货预警
  const stockoutAlert: IStockoutAlert = {
    alertLevel: 'critical',
    atRiskSKUCount: 3,
    riskItems: Array.from({ length: 3 }, (_, i) => ({
      sku: `sku_hot_${i + 1}`,
      name: ['爆款圆领T恤', '明星同款卫衣', '高弹牛仔裤'][i],
      category: '服饰类',
      currentStock: [8, 3, 12][i],
      dailyAvgSales: [15, 8, 10][i],
      daysUntilStockout: [0, 0, 1][i], // 0 = 已断货
      suggestedReorderQty: [100, 80, 120][i],
      supplierLeadTime: [14, 14, 14][i],
      urgency: i < 2 ? 'critical' as const : 'high' as const,
    })),
    totalRevenueRisk: Math.round((3 * 15 * 50 * 14) * 100) / 100, // 断货期间潜在损失
    diagnosis: '爆款断货风险极高：2个SKU已断货，1个SKU将在1天内断货；预计断货14天将损失营收¥31,500，需立即补货',
    suggestion: '立即向供应商下达紧急补货订单，同时寻找同类替代品临时上架，避免销售中断',
  }

  // 跨季节库存风险
  const crossSeasonRisk: ICrossSeasonRisk = {
    currentSeason: '春季',
    nextSeason: '夏季',
    riskLevel: 'high',
    crossSeasonItems: Array.from({ length: 4 }, (_, i) => ({
      sku: `sku_cross_${i + 1}`,
      name: ['厚款卫衣', '春季风衣', '灯芯绒裤', '薄款毛衣'][i],
      category: '服饰类',
      season: '冬季/春季过渡',
      stock: Math.floor(Math.random() * 60 + 20),
      costValue: Math.round((Math.random() * 4000 + 1000) * 100) / 100,
      sellThroughRate: Math.round((Math.random() * 20) * 10) / 10,
      recommendedAction: i < 2 ? '立即打折清仓，折扣率不低于6折' : '可作为基础款继续销售，但停止补货',
    })),
    totalRiskValue: Math.round((Math.random() * 20000 + 8000) * 100) / 100,
    diagnosis: '跨季节风险较高：当前季节交替期，冬季过渡商品如未及时清仓，进入夏季后将完全滞销，预计损失¥12,000+',
    suggestion: '制定季节切换清仓时间表：每季度最后30天开始反季促销，季度结束后15天内完成全部反季商品清仓',
  }

  // 库存周转效率评级
  const turnoverRating: ITurnoverRating = {
    overallRating: 'C',
    overallTurnoverDays: Math.round((Math.random() * 30 + 45) * 10) / 10,
    benchmarkTurnoverDays: 30,
    ratingDetail: [
      { category: '服饰类', turnoverDays: Math.round((Math.random() * 30 + 50) * 10) / 10, rating: 'C' as const, benchmark: 30, status: '周转偏慢，需优化' },
      { category: '鞋靴类', turnoverDays: Math.round((Math.random() * 20 + 35) * 10) / 10, rating: 'B' as const, benchmark: 35, status: '接近基准，保持' },
      { category: '配饰类', turnoverDays: Math.round((Math.random() * 40 + 55) * 10) / 10, rating: 'D' as const, benchmark: 25, status: '周转过慢，需紧急优化' },
      { category: '箱包类', turnoverDays: Math.round((Math.random() * 25 + 30) * 10) / 10, rating: 'B' as const, benchmark: 35, status: '健康' },
    ],
    lowTurnoverItems: Array.from({ length: 3 }, (_, i) => ({
      sku: `sku_lowturn_${i + 1}`,
      name: ['灯芯绒裤', '格子衬衫', '羊毛背心'][i],
      category: '服饰类',
      turnoverDays: Math.floor(Math.random() * 60 + 90),
      stock: Math.floor(Math.random() * 50 + 20),
      suggestion: '立即打折清仓，或调拨至该款式更受欢迎的门店',
    })),
    diagnosis: '整体库存周转效率评级C（行业平均B），周转天数45天，较基准慢50%；主要问题在服饰类和配饰类，需重点优化',
    suggestions: [
      '将整体周转天数从45天压缩至30天以内，重点优化服饰类和配饰类',
      '对周转天数>60天的商品立即启动清仓，不再补货',
      '建立周转预警：周转天数超过45天的商品自动提醒采购部门',
      '优化进货策略：减少首批进货量，采用小步快跑模式，根据动销情况快速补货',
    ],
  }

  const riskScore = (backlogAlert.alertLevel === 'critical' ? 4 : backlogAlert.alertLevel === 'high' ? 3 : 2) +
    (stockoutAlert.alertLevel === 'critical' ? 4 : stockoutAlert.alertLevel === 'high' ? 3 : 2)

  return {
    shopId,
    period: { start: new Date(Date.now() - 30 * 86400000).toISOString(), end: new Date().toISOString() },
    generatedAt: new Date().toISOString(),
    backlogAlert,
    stockoutAlert,
    crossSeasonRisk,
    turnoverRating,
    overallDiagnosis: `库存风险等级：${riskScore >= 6 ? 'CRITICAL（极度危险）' : riskScore >= 4 ? 'HIGH（高风险）' : 'MEDIUM（中等风险）'}。积压预警¥${backlogAlert.totalBacklogValue.toLocaleString()}，爆款断货风险极高，跨季节风险¥${crossSeasonRisk.totalRiskValue.toLocaleString()}，周转效率评级C。建议立即执行清仓+紧急补货双轨方案。`,
    riskLevel: riskScore >= 6 ? 'critical' : riskScore >= 4 ? 'high' : 'medium',
    topRisks: [
      `${stockoutAlert.riskItems.filter(r => r.daysUntilStockout <= 1).length}个爆款已断货或即将断货，立即补货`,
      `¥${backlogAlert.totalBacklogValue.toLocaleString()}积压库存需清仓，预计可回收¥${Math.round(backlogAlert.totalBacklogValue * 0.6).toLocaleString()}`,
      `跨季节风险商品${crossSeasonRisk.crossSeasonItems.length}个，预计夏季损失¥${crossSeasonRisk.totalRiskValue.toLocaleString()}`,
      `库存周转${turnoverRating.overallTurnoverDays}天（基准30天），评级${turnoverRating.overallRating}，需优化进货策略`,
    ],
  }
}

/** 3.3.4 货品运营解决方案自动输出 */
export function generateMockOperationSolution(shopId: string): IOperationSolution {
  // 滞销清仓方案
  const clearancePlan: IClearancePlan = {
    totalClearanceValue: Math.round((Math.random() * 40000 + 20000) * 100) / 100,
    strategies: Array.from({ length: 6 }, (_, i) => {
      const urgency: Array<'high' | 'medium' | 'low'> = ['high', 'high', 'medium', 'medium', 'low', 'low']
      const actions: Array<'discount' | 'bundle' | 'gift' | 'transfer' | 'scrap'> = ['discount', 'bundle', 'discount', 'transfer', 'gift', 'scrap']
      const actionLabels = ['打折', '捆绑', '打折', '调拨', '赠品', '报损']
      const discounts = [50, 30, 40, 0, 0, 0]
      return {
        sku: `sku_clear_${i + 1}`,
        name: ['厚款毛衣', '冬季棉服', '灯芯绒裤', '春季风衣（大码）', '格子衬衫', '破损库存'][i],
        category: i < 5 ? '服饰类' : '配饰类',
        costValue: Math.round((Math.random() * 3000 + 500) * 100) / 100,
        currentStock: Math.floor(Math.random() * 40 + 5),
        daysInStock: Math.floor(Math.random() * 60 + 60),
        recommendedAction: actions[i],
        actionLabel: actionLabels[i],
        discountRate: discounts[i],
        suggestedPrice: Math.round((Math.random() * 80 + 30) * 100) / 100,
        estimatedClearDays: [15, 20, 25, 30, 20, 7][i],
        script: [
          '您好，这款是我们本季特惠商品，原价XXX元，现在只要XXX元，超级划算，要不要带一件？',
          '您好，这款商品买一送一，相当于半价，非常适合囤货/送人，机会不多哦！',
          '您看的这款，今天有满减活动，满200减60，搭配这条裤子一起买最划算！',
          '这款在我们其他门店卖得特别好，这边尺码不全了，我帮您调货，您看可以吗？',
          '这款今天做赠品活动，买满188就送，您再看看还有什么需要的，一起结账更划算~',
          '（内部）这批库存已无销售价值，建议做报损处理，释放仓储空间。',
        ][i],
        priority: urgency[i],
      }
    }),
    activitySuggestions: [
      { activityType: '周末特惠场', description: '每周五-周日，滞销款5-7折促销，搭配热销款组成套餐', expectedClearRate: 35, cost: 2000 },
      { activityType: '买一送一', description: '对死款做买一送一，快速回笼资金，减少仓储占用', expectedClearRate: 60, cost: 0 },
      { activityType: '员工内购日', description: '每月最后一天员工内购，3折专享价，清理死库存', expectedClearRate: 80, cost: 0 },
    ],
  }

  // 爆款补货周期建议
  const replenishmentSuggestion: IReplenishmentSuggestion = {
    totalReplenishmentValue: Math.round((Math.random() * 30000 + 15000) * 100) / 100,
    items: Array.from({ length: 4 }, (_, i) => ({
      sku: `sku_replenish_${i + 1}`,
      name: ['爆款圆领T恤', '明星同款卫衣', '高弹牛仔裤', '轻薄防晒衣'][i],
      category: '服饰类',
      currentStock: [8, 3, 12, 20][i],
      dailyAvgSales: [15, 8, 10, 12][i],
      safetyStock: [45, 24, 30, 36][i],
      suggestedReorderQty: [150, 100, 120, 140][i],
      reorderCycle: [14, 14, 14, 14][i],
      leadTime: [14, 14, 14, 14][i],
      supplier: ['广州面料厂A', '杭州服饰B', '东莞制衣C', '福建面料D'][i],
      estimatedArrival: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      urgency: (i < 2 ? 'critical' : 'high') as 'critical' | 'high' | 'low',
    })),
    summary: '4个爆款中2个已断货或即将断货，需立即向供应商下达紧急补货订单；建议与供应商协商缩短交货周期从14天至7天，或建立安全库存预警机制',
  }

  // 上新选品方向建议
  const newProductSelection: INewProductSelection = {
    directionSuggestions: [
      { category: '服饰类/防晒系列', direction: '夏季临近，防晒衣、冰丝袖套、遮阳帽需求激增', reason: '去年同期防晒系列销售额增长120%，今年气温预计偏高，需求持续旺盛', expectedProfitRate: 45, riskLevel: 'low', referencePrice: 89 },
      { category: '配饰类/简约首饰', direction: '极简风首饰（耳环、项链、手链）契合当前审美趋势', reason: '社交媒体上极简风首饰话题热度持续上升，年轻客群购买意愿强', expectedProfitRate: 60, riskLevel: 'low', referencePrice: 49 },
      { category: '服饰类/阔腿裤', direction: '高腰阔腿裤适配多种身材，是当前最热款式', reason: '竞品阔腿裤销量同比增长80%，我店尚未引入该品类，存在市场空白', expectedProfitRate: 40, riskLevel: 'medium', referencePrice: 129 },
    ],
    trendingCategories: ['防晒系列', '阔腿裤', '极简首饰', '帆布包', '运动休闲鞋'],
    decliningCategories: ['厚款毛衣', '灯芯绒裤', '西装外套', '冬季棉服'],
    summary: '建议本季度重点引入防晒系列和极简首饰，预计毛利率45-60%；阔腿裤需小批量试销，根据动销情况决定是否扩大进货；冬季品类全部停止进货，专注清仓。',
  }

  // 货品陈列优先排序
  const displayPriority: IDisplayPriority = {
    totalSKU: 68,
    priorityList: Array.from({ length: 10 }, (_, i) => ({
      sku: `sku_disp_${i + 1}`,
      name: ['爆款圆领T恤', '明星同款卫衣', '高弹牛仔裤', '轻薄防晒衣', '冰丝内裤', '简约项链', '帆布包', '运动袜', '春季长裤', '格纹裙'][i],
      category: '服饰类',
      priority: i + 1,
      reason: i < 3 ? '爆款，销量TOP3，黄金位置（入口正对面/收银台旁）' : i < 6 ? '热销款，销量稳定，热区陈列（主通道两侧）' : '平销款，搭配爆款组合陈列，提升连带率',
      recommendedPosition: (i < 3 ? 'hot_zone' : i < 6 ? 'wall' : 'corner') as 'entrance' | 'hot_zone' | 'wall' | 'cashier' | 'corner',
      positionLabel: i < 3 ? '热区（入口正对面）' : i < 6 ? '墙面区' : '角落区',
      displayQty: i < 3 ? 4 : i < 6 ? 3 : 2,
    })),
    zoneSuggestions: [
      { zone: '入口区', currentSKUs: ['普通T恤', '基础款'], suggestedSKUs: ['爆款圆领T恤', '明星同款卫衣'], reason: '入口区是顾客第一眼看到的位置，应陈列最具吸引力的爆款，提升进店转化率' },
      { zone: '热区（主通道）', currentSKUs: ['春季长裤', '简约上衣'], suggestedSKUs: ['高弹牛仔裤', '轻薄防晒衣', '阔腿裤'], reason: '主通道热区流量最大，陈列当季热销款，配合POP海报强调卖点' },
      { zone: '收银台旁', currentSKUs: ['袜子', '内衣'], suggestedSKUs: ['简约首饰', '冰丝内裤', '运动袜'], reason: '收银台旁是冲动消费区，陈列低价高毛利小商品，提升客单价' },
    ],
  }

  return {
    shopId,
    generatedAt: new Date().toISOString(),
    clearancePlan,
    replenishmentSuggestion,
    newProductSelection,
    displayPriority,
  }
}
export function generateMockReport(shopId: string) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  const endDate = new Date()

  const topProducts = Array.from({ length: 5 }, (_, i) => ({
    rank: i + 1,
    name: ['明星套餐A', '明星套餐B', '明星套餐C', '明星套餐D', '明星套餐E'][i],
    salesCount: faker.number.int({ min: 50, max: 500 }),
    salesAmount: faker.number.float({ min: 2500, max: 25000, fractionDigits: 2 }),
    profit: faker.number.float({ min: 1000, max: 10000, fractionDigits: 2 }),
  }))

  return {
    id: `report_${Date.now()}`,
    shopId,
    period: 'weekly',
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalRevenue: faker.number.float({ min: 50000, max: 200000, fractionDigits: 2 }),
      totalTransactions: faker.number.int({ min: 500, max: 2000 }),
      totalCustomers: faker.number.int({ min: 300, max: 1500 }),
      todayProfit: faker.number.float({ min: 5000, max: 50000, fractionDigits: 2 }),
      avgCustomerFlow: Math.round((Math.random() * 40 + 60) * 10) / 10,
      avgConversion: Math.round((Math.random() * 20 + 20) * 10) / 10,
      avgAmount: Math.round((Math.random() * 100 + 100) * 100) / 100,
      avgRepurchase: Math.round((Math.random() * 30 + 20) * 10) / 10,
      avgProfit: Math.round((Math.random() * 25 + 15) * 10) / 10,
    },
    fiveDimensionScores: generateMockFiveDimensionScores(),
    topProducts,
    customerAnalysis: {
      newCustomers: faker.number.int({ min: 20, max: 100 }),
      returningCustomers: faker.number.int({ min: 100, max: 500 }),
      vipCustomers: faker.number.int({ min: 50, max: 200 }),
    },
    recommendations: [
      '建议增加高峰期预约服务，减少客户等待时间',
      '高价值客户流失率上升，建议加强会员营销',
      '部分商品周转率偏低，考虑调整进货策略',
      '客流高峰期人员配置不足，建议优化排班',
    ],
    generatedAt: new Date().toISOString(),
  };
}
