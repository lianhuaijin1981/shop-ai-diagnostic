import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { depDiagnosticApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { Loading } from '@/components/common'
import { LineChart, BarChart, PieChart } from '@/components/charts'
import {
  TrendingUp, TrendingDown, Users, Target, Megaphone, Heart,
  AlertTriangle, Clock, Lightbulb, CheckCircle2, ArrowRight,
  ChevronRight, ChevronDown, Star, Zap, Gift, Smartphone,
  Users2, Building2, Calendar, Percent, DollarSign
} from 'lucide-react'

// ============ 工具函数 ============
function TrendBadge({ value }: { value: number }) {
  const isPositive = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
    }`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-primary-50 text-primary-500">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function TacticCard({ tactic }: { tactic: any }) {
  const [expanded, setExpanded] = useState(false)
  const categoryIcons: Record<string, any> = {
    online_ad: Smartphone,
    offline_event: Calendar,
    member_referral: Users2,
    platform_promotion: Building2,
    collaboration: Gift,
  }
  const priorityColors: Record<string, string> = {
    high: 'border-l-danger',
    medium: 'border-l-warning',
    low: 'border-l-gray-400',
  }
  const difficultyColors: Record<string, string> = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    hard: 'bg-danger/10 text-danger',
  }
  const Icon = categoryIcons[tactic.category] || Target
  const roiColor = tactic.roi >= 4 ? 'text-success' : tactic.roi >= 2 ? 'text-warning' : 'text-danger'

  return (
    <div className={`bg-white rounded-xl p-5 shadow-card border-l-4 ${priorityColors[tactic.priority]} hover:shadow-card-hover transition-shadow`}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-primary-50 text-primary-500 flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-gray-900">{tactic.name}</h4>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[tactic.difficulty]}`}>
              {tactic.difficulty === 'easy' ? '简单' : tactic.difficulty === 'medium' ? '中等' : '复杂'}
            </span>
            <span className="text-xs text-gray-400">实施周期：{tactic.timeToImplement}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{tactic.description}</p>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">预计增量：</span>
              <span className="font-medium text-primary-600">+{tactic.expectedTrafficIncrease}人次/天</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">获客成本：</span>
              <span className="font-medium">¥{tactic.costPerVisitor.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Percent className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">ROI：</span>
              <span className={`font-medium ${roiColor}`}>{tactic.roi.toFixed(1)}</span>
            </div>
          </div>
          {expanded && (
            <div className="mt-3 pl-2 border-l-2 border-primary-200">
              <p className="text-xs text-gray-500 mb-2">落地步骤：</p>
              <ul className="space-y-1">
                {tactic.steps.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
              <div className="mt-3 p-3 bg-success/5 rounded-lg border border-success/20">
                <p className="text-xs text-gray-500 mb-1">预期效果</p>
                <p className="text-sm text-success font-medium">{tactic.expectedEffect}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {expanded ? '收起详情' : '查看详情'}
          </button>
        </div>
      </div>
    </div>
  )
}

function HourlyHeatmap({ data }: { data: Array<{ hour: number; traffic: number; level: string }> }) {
  const max = Math.max(...data.map(d => d.traffic))
  const levelColors: Record<string, string> = {
    peak: 'bg-danger',
    normal: 'bg-warning',
    low: 'bg-gray-200',
  }
  const levelBg: Record<string, string> = {
    peak: 'bg-danger/10',
    normal: 'bg-warning/10',
    low: 'bg-gray-50',
  }
  const levelText: Record<string, string> = {
    peak: 'text-danger',
    normal: 'text-warning',
    low: 'text-gray-400',
  }
  return (
    <div className="grid grid-cols-6 gap-1">
      {data.map((d) => (
        <div key={d.hour} className={`flex flex-col items-center p-2 rounded-lg ${levelBg[d.level]}`}>
          <span className="text-xs text-gray-400">{d.hour}:00</span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className={`h-2 rounded-full ${levelColors[d.level]}`}
              style={{ width: `${(d.traffic / max) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-medium mt-1 ${levelText[d.level]}`}>{d.traffic}</span>
        </div>
      ))}
    </div>
  )
}

// ============ 主组件 ============
export function CustomerFlowAnalysis() {
  const { currentShop } = useShopStore()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [activeTab, setActiveTab] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['customerFlowAnalysis', currentShop.id, selectedPeriod],
    queryFn: () => depDiagnosticApi.getCustomerFlowAnalysis({
      shopId: currentShop.id,
      period: selectedPeriod as 'today' | 'week' | 'month' | 'quarter',
    }),
    enabled: !!currentShop.id,
  })

  if (isLoading) return <Loading text="深度分析客流数据中..." />

  const cf = data?.data
  if (!cf) return null

  const { trendAnalysis, naturalTraffic, campaignTraffic, referralTraffic, changeRootCause, peakOffPeak, boostTactics } = cf

  // 趋势图数据：4条线（本期、上期、去年同期、基准）
  const trendChartData = {
    dates: trendAnalysis.currentPeriod.map(d => d.date?.slice(5) || ''),
    series: [
      { name: '本期', data: trendAnalysis.currentPeriod.map(d => d.customers) },
      { name: '上期', data: trendAnalysis.previousPeriod.map(d => d.customers) },
      { name: '去年同期', data: trendAnalysis.samePeriodLastYear.map(d => d.customers) },
      { name: '行业基准', data: trendAnalysis.benchmark.map(d => d.customers) },
    ],
  }

  // 自然客流饼图
  const naturalPieData = [
    { name: '过路客转化', value: naturalTraffic.breakdown.passerbyConversion.count },
    { name: '自然搜索', value: naturalTraffic.breakdown.organicSearch.count },
    { name: '口碑传播', value: naturalTraffic.breakdown.wordOfMouth.count },
    { name: '周边居民', value: naturalTraffic.breakdown.nearbyResidents.count },
  ]

  // 原因判定柱状图
  const causeChartData = {
    categories: changeRootCause.causes.map(c => c.factor),
    series: [{
      name: '影响程度',
      data: changeRootCause.causes.map(c => c.impact),
    }],
  }

  // 周规律柱状图
  const dailyChartData = {
    categories: peakOffPeak.dailyPattern.map(d => d.dayName),
    series: [{
      name: '日均客流',
      data: peakOffPeak.dailyPattern.map(d => d.avgTraffic),
    }],
  }

  // Campaign柱状图
  const campaignChartData = {
    categories: campaignTraffic.campaigns.map(c => c.name),
    series: [
      { name: '引流人次', data: campaignTraffic.campaigns.map(c => c.traffic) },
      { name: 'ROI', data: campaignTraffic.campaigns.map(c => c.roi) },
    ],
  }

  const tabs = [
    { icon: TrendingUp, label: '总客流走势', desc: '同比/环比/基准对比' },
    { icon: Users, label: '客流来源拆解', desc: '自然/活动/老带新' },
    { icon: AlertTriangle, label: '变化原因判定', desc: 'AI归因分析' },
    { icon: Clock, label: '时段分析', desc: '峰谷时段定位' },
    { icon: Lightbulb, label: '提升玩法', desc: '落地执行方案' },
  ]

  const totalCustomers = trendAnalysis.currentPeriod.reduce((s, d) => s + d.customers, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客流深度分析</h1>
          <p className="text-sm text-gray-500 mt-1">
            {cf.period.start} ~ {cf.period.end} · {currentShop.name}
          </p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'quarter'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {period === 'today' ? '今日' : period === 'week' ? '本周' : period === 'month' ? '本月' : '本季'}
            </button>
          ))}
        </div>
      </div>

      {/* 综合诊断卡片 */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/10">
            <Target className="w-8 h-8 text-primary-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">AI综合诊断结论</h3>
              <span className="px-2 py-0.5 bg-primary-500/30 text-primary-200 text-xs rounded-full">GPT-4分析</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{cf.overallDiagnosis}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {cf.top3Priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-danger text-white' : i === 1 ? 'bg-warning text-white' : 'bg-slate-600 text-white'
              }`}>{i + 1}</span>
              <span className="text-sm text-slate-200">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心指标概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">本期总客流</p>
          <p className="text-2xl font-bold text-gray-900">{totalCustomers.toLocaleString()}</p>
          <div className="mt-2"><TrendBadge value={trendAnalysis.wowChangeRate} /></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">环比变化</p>
          <p className={`text-2xl font-bold ${trendAnalysis.wowChangeRate >= 0 ? 'text-success' : 'text-danger'}`}>
            {trendAnalysis.wowChangeRate >= 0 ? '+' : ''}{trendAnalysis.wowChangeRate}%
          </p>
          <p className="text-xs text-gray-400 mt-1">较上期</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">同比变化</p>
          <p className={`text-2xl font-bold ${trendAnalysis.yoyChangeRate >= 0 ? 'text-success' : 'text-danger'}`}>
            {trendAnalysis.yoyChangeRate >= 0 ? '+' : ''}{trendAnalysis.yoyChangeRate}%
          </p>
          <p className="text-xs text-gray-400 mt-1">较去年同期</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">与基准差距</p>
          <p className={`text-2xl font-bold ${trendAnalysis.benchmarkGap <= 0 ? 'text-success' : 'text-warning'}`}>
            {trendAnalysis.benchmarkGap >= 0 ? '+' : ''}{trendAnalysis.benchmarkGap}%
          </p>
          <p className="text-xs text-gray-400 mt-1">行业基准对比</p>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab, i) => {
            const Icon = tab.icon
            return (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === i
                    ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className="text-xs text-gray-400 hidden sm:inline">({tab.desc})</span>
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {/* Tab 0: 总客流走势对比 */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <SectionHeader icon={TrendingUp} title="总客流走势对比分析" subtitle="本期 vs 上期 vs 去年同期 vs 行业基准" />
              <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-primary-400">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-gray-700">AI洞察</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{trendAnalysis.keyInsight}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span>本期</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>上期</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>去年同期</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400"></span>行业基准</span>
                </div>
                <div className="h-80">
                  <LineChart data={trendChartData} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">环比（vs上期）</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-bold ${trendAnalysis.wowChangeRate >= 0 ? 'text-success' : 'text-danger'}`}>
                      {trendAnalysis.wowChangeRate >= 0 ? '+' : ''}{trendAnalysis.wowChangeRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {trendAnalysis.wowChangeRate >= 0 ? '客流上升' : '客流下降'}，{(trendAnalysis.currentPeriod.reduce((s, d) => s + d.customers, 0) - trendAnalysis.previousPeriod.reduce((s, d) => s + d.customers, 0)).toLocaleString()}人次
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">同比（vs去年同期）</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-bold ${trendAnalysis.yoyChangeRate >= 0 ? 'text-success' : 'text-danger'}`}>
                      {trendAnalysis.yoyChangeRate >= 0 ? '+' : ''}{trendAnalysis.yoyChangeRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {trendAnalysis.yoyChangeRate >= 0 ? '客流上升' : '客流下降'}，{(trendAnalysis.currentPeriod.reduce((s, d) => s + d.customers, 0) - trendAnalysis.samePeriodLastYear.reduce((s, d) => s + d.customers, 0)).toLocaleString()}人次
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">与行业基准差距</p>
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-bold ${trendAnalysis.benchmarkGap <= 0 ? 'text-success' : 'text-warning'}`}>
                      {trendAnalysis.benchmarkGap >= 0 ? '+' : ''}{trendAnalysis.benchmarkGap}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    需追赶 {Math.abs(trendAnalysis.benchmark.reduce((s, d) => s + d.customers, 0) - trendAnalysis.currentPeriod.reduce((s, d) => s + d.customers, 0)).toLocaleString()} 人次
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: 客流来源拆解 */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 自然客流 */}
                <div className="space-y-4">
                  <SectionHeader icon={Users} title="自然到店客流拆解" subtitle={`自然客流共 ${naturalTraffic.totalNatural.toLocaleString()} 人次，占比 62%`} />
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(naturalTraffic.breakdown).map(([key, item]) => (
                      <div key={key} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {key === 'passerbyConversion' ? '过路客转化' :
                             key === 'organicSearch' ? '自然搜索' :
                             key === 'wordOfMouth' ? '口碑传播' : '周边居民'}
                          </span>
                          <span className="text-lg font-bold text-gray-900">{(item.rate * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-2xl font-bold text-primary-600">{item.count.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">人</p>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium text-gray-700">关键驱动因素</span>
                    </div>
                    <p className="text-sm text-gray-600">{naturalTraffic.keyDriver}</p>
                  </div>
                </div>

                {/* 活动引流 */}
                <div className="space-y-4">
                  <SectionHeader icon={Megaphone} title="引流活动客流拆解" subtitle={`活动引流共 ${campaignTraffic.totalCampaignTraffic.toLocaleString()} 人次，占比 38%`} />
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">活动名称</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">引流人次</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">ROI</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">获客成本</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">效果</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {campaignTraffic.campaigns.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                            <td className="px-4 py-3 text-center text-primary-600 font-medium">{c.traffic}</td>
                            <td className={`px-4 py-3 text-center font-bold ${c.roi >= 3.5 ? 'text-success' : c.roi >= 2 ? 'text-warning' : 'text-danger'}`}>
                              {c.roi.toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">¥{c.costPerVisitor.toFixed(1)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                c.effectiveness === 'excellent' ? 'bg-success/10 text-success' :
                                c.effectiveness === 'good' ? 'bg-primary/10 text-primary' :
                                c.effectiveness === 'average' ? 'bg-warning/10 text-warning' :
                                'bg-danger/10 text-danger'
                              }`}>
                                {c.effectiveness === 'excellent' ? '优秀' :
                                 c.effectiveness === 'good' ? '良好' :
                                 c.effectiveness === 'average' ? '一般' : '较差'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-success/5 border border-success/20 rounded-xl p-3">
                      <p className="text-xs text-gray-500">最优活动</p>
                      <p className="text-sm font-medium text-success mt-1">{campaignTraffic.bestPerformingCampaign}</p>
                    </div>
                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-3">
                      <p className="text-xs text-gray-500">待优化活动</p>
                      <p className="text-sm font-medium text-danger mt-1">{campaignTraffic.worstPerformingCampaign}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <p className="text-xs text-gray-500">总活动花费</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">¥{campaignTraffic.totalCampaignSpend.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 老客带新 */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <SectionHeader icon={Heart} title="老客带新客流拆解" subtitle="基于推荐链路和K因子分析" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <p className="text-sm text-gray-500">转介绍客流</p>
                    <p className="text-3xl font-bold text-primary-600 mt-1">{referralTraffic.totalReferral.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">人次</p>
                  </div>
                  <div className="text-center p-4 bg-warning/5 rounded-xl">
                    <p className="text-sm text-gray-500">转介绍率</p>
                    <p className="text-3xl font-bold text-warning mt-1">{referralTraffic.referralRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">老客中有多少推荐新客</p>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-xl">
                    <p className="text-sm text-gray-500">K因子</p>
                    <p className="text-3xl font-bold text-success mt-1">{referralTraffic.kFactor.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">K{'>'}1为病毒式增长</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">推荐来源</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">微信45%</span>
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded">抖音25%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Top推荐人榜</p>
                  <div className="space-y-2">
                    {referralTraffic.topReferrers.map((r, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>{i + 1}</span>
                          <span className="text-sm font-medium text-gray-700">{r.customerName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">推荐 {r.referrals} 人</span>
                          <span className="text-success font-medium">获得 ¥{r.rewardEarned}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 变化原因判定 */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <SectionHeader icon={AlertTriangle} title="客流变化精准原因判定" subtitle="AI多因子归因分析 · 区分可控/不可控因素" />
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">AI归因结论</span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                    changeRootCause.direction === 'down' ? 'bg-danger/30 text-danger' :
                    changeRootCause.direction === 'up' ? 'bg-success/30 text-success' : 'bg-gray-500/30 text-gray-300'
                  }`}>
                    {changeRootCause.direction === 'down' ? '客流下降' : changeRootCause.direction === 'up' ? '客流上升' : '客流稳定'}
                    {' '}{Math.abs(changeRootCause.changeRate).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{changeRootCause.aiConclusion}</p>
              </div>

              {/* 因素贡献条 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4">各因素贡献度分析</h4>
                <div className="space-y-4">
                  {changeRootCause.causes.map((cause, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cause.isControllable ? 'bg-primary-500' : 'bg-gray-400'}`}></span>
                          <span className="text-sm font-medium text-gray-700">{cause.factor}</span>
                          {!cause.isControllable && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 text-xs rounded">不可控</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className={cause.impact >= 0 ? 'text-success font-medium' : 'text-danger font-medium'}>
                            {cause.impact >= 0 ? '+' : ''}{cause.impact}%
                          </span>
                          <span className="text-gray-400 w-16 text-right">{cause.contribution}%贡献</span>
                        </div>
                      </div>
                      <div className="ml-4 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className={`h-full rounded-full flex items-center justify-end pr-2 text-xs font-medium text-white transition-all ${
                            cause.impact >= 0 ? 'bg-success' : 'bg-danger'
                          }`}
                          style={{ width: `${Math.min(Math.abs(cause.contribution), 100)}%` }}
                        />
                      </div>
                      <p className="ml-4 text-xs text-gray-400 mt-1">{cause.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">不可控因素（需接受或规避）</p>
                  <div className="flex flex-wrap gap-2">
                    {changeRootCause.uncontrollableFactors.map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-danger/10 text-danger text-sm rounded-lg">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">可行动因素（重点优化方向）</p>
                  <div className="flex flex-wrap gap-2">
                    {changeRootCause.actionableFactors.map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-lg">{f}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 归因柱状图 */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">影响程度可视化</h4>
                <div className="h-64">
                  <BarChart data={causeChartData} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 时段分析 */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <SectionHeader icon={Clock} title="高低客流时段精准定位" subtitle="小时级热力图 + 周规律分析" />

              {/* 小时热力图 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">24小时客流热力图</h4>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-danger"></span>高峰</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-warning"></span>正常</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200"></span>低谷</span>
                  </div>
                </div>
                <HourlyHeatmap data={peakOffPeak.hourlyHeatmap} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 周规律 */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 className="font-medium text-gray-900 mb-3">周规律分析</h4>
                  <div className="h-56">
                    <BarChart data={dailyChartData} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-danger/5 border border-danger/20 rounded-lg">
                      <p className="text-xs text-gray-500">周末 vs 工作日</p>
                      <p className="text-lg font-bold text-danger">+{peakOffPeak.weekendVsWeekday.difference.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-3 bg-warning/5 border border-warning/20 rounded-lg">
                      <p className="text-xs text-gray-500">周末均客流</p>
                      <p className="text-lg font-bold text-warning">{peakOffPeak.weekendVsWeekday.weekend}</p>
                    </div>
                  </div>
                </div>

                {/* 峰谷时段建议 */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-danger" />
                      高峰时段优化
                    </h4>
                    <div className="space-y-3">
                      {peakOffPeak.peakHours.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-danger/5 border border-danger/20 rounded-lg">
                          <div className="text-center min-w-[50px]">
                            <span className="text-lg font-bold text-danger">{h.start}:00-{h.end}</span>
                            <p className="text-xs text-gray-500">均客流{h.avgTraffic}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{h.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-gray-400" />
                      低谷时段激活
                    </h4>
                    <div className="space-y-3">
                      {peakOffPeak.lowHours.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="text-center min-w-[50px]">
                            <span className="text-lg font-bold text-gray-500">{h.start}:00-{h.end}</span>
                            <p className="text-xs text-gray-400">均客流{h.avgTraffic}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{h.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 时段优化建议 */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">时段优化专项建议</h4>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">时段</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">问题</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">解决方案</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">预期效果</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {peakOffPeak.recommendations.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-primary-600">{r.timeSlot}</td>
                        <td className="px-5 py-3 text-gray-600">{r.problem}</td>
                        <td className="px-5 py-3 text-gray-600">{r.solution}</td>
                        <td className="px-5 py-3 text-success font-medium">{r.expectedImpact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: 提升玩法 */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <SectionHeader icon={Lightbulb} title="客流提升落地玩法" subtitle="基于ROI排序 · 可执行可落地" />

              {/* 优先级总览 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">优先执行</p>
                  <p className="text-2xl font-bold text-danger">{boostTactics.filter(t => t.priority === 'high').length}个</p>
                  <p className="text-xs text-gray-400 mt-1">预计ROI &gt; 4.0</p>
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">次优先</p>
                  <p className="text-2xl font-bold text-warning">{boostTactics.filter(t => t.priority === 'medium').length}个</p>
                  <p className="text-xs text-gray-400 mt-1">ROI 2.0 ~ 4.0</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">参考方案</p>
                  <p className="text-2xl font-bold text-gray-400">{boostTactics.filter(t => t.priority === 'low').length}个</p>
                  <p className="text-xs text-gray-400 mt-1">ROI &lt; 2.0</p>
                </div>
              </div>

              {/* 玩法卡片列表 */}
              <div className="space-y-4">
                {boostTactics.map((tactic) => (
                  <TacticCard key={tactic.id} tactic={tactic} />
                ))}
              </div>

              {/* 预计综合效果 */}
              <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="font-semibold text-gray-900">综合执行效果预估</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">预计总增量客流</p>
                    <p className="text-2xl font-bold text-success mt-1">
                      +{boostTactics.reduce((s, t) => s + t.expectedTrafficIncrease, 0)}
                    </p>
                    <p className="text-xs text-gray-400">人次/天</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">加权平均ROI</p>
                    <p className="text-2xl font-bold text-primary-600 mt-1">
                      {(boostTactics.reduce((s, t) => s + t.roi * t.expectedTrafficIncrease, 0) / boostTactics.reduce((s, t) => s + t.expectedTrafficIncrease, 0)).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400">投入产出比</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">综合获客成本</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ¥{(boostTactics.reduce((s, t) => s + t.costPerDay * t.expectedTrafficIncrease, 0) / boostTactics.reduce((s, t) => s + t.expectedTrafficIncrease, 0)).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400">元/人次</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
