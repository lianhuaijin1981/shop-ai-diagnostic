import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { depDiagnosticApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { Loading } from '@/components/common'
import { BarChart, LineChart } from '@/components/charts'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users,
  AlertTriangle, Clock, Lightbulb, CheckCircle2, Percent,
  ChevronRight, ChevronDown, Zap, Package, ShoppingBag
} from 'lucide-react'

// ============ 工具函数 ============
function TrendBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const isPositive = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
      isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
    }`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}{value.toFixed(1)}{suffix}
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

function StrategyCard({ strategy, index }: { strategy: any; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const liftColor = strategy.expectedLift >= 8 ? 'text-success' : strategy.expectedLift >= 5 ? 'text-warning' : 'text-primary'
  return (
    <div className="bg-white rounded-xl p-5 shadow-card border border-gray-200 hover:border-primary-200 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{strategy.tactic}</h4>
            <span className={`font-bold text-lg ${liftColor}`}>+{strategy.expectedLift}%</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded ${
              strategy.difficulty === 'easy' ? 'bg-success/10 text-success' :
              strategy.difficulty === 'medium' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
            }`}>
              {strategy.difficulty === 'easy' ? '简单' : strategy.difficulty === 'medium' ? '中等' : '复杂'}
            </span>
            <span>预计提升客单 {strategy.expectedLift}%</span>
          </div>
          {expanded && (
            <div className="mt-3 pl-2 border-l-2 border-primary-200">
              <p className="text-xs text-gray-500 mb-2">落地步骤：</p>
              <ul className="space-y-1">
                {strategy.steps.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {expanded ? '收起' : '查看步骤'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ 主组件 ============
export function AvgAmountAnalysis() {
  const { currentShop } = useShopStore()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [activeTab, setActiveTab] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['avgAmountAnalysis', currentShop.id, selectedPeriod],
    queryFn: () => depDiagnosticApi.getAvgAmountAnalysis({
      shopId: currentShop.id,
      period: selectedPeriod as 'today' | 'week' | 'month' | 'quarter',
    }),
    enabled: !!currentShop.id,
  })

  if (isLoading) return <Loading text="深度分析客单价数据中..." />

  const aa = data?.data
  if (!aa) return null

  // 分布直方图
  const distChartData = {
    categories: aa.distributionAnalysis.map(d => d.range),
    series: [{
      name: '订单数',
      data: aa.distributionAnalysis.map(d => d.count),
    }],
  }

  // 时段客单图（LineChart 需用 dates 字段）
  const timeChartData = {
    dates: aa.timeSlotAvgAmount.map(d => `${d.hour}:00`),
    series: [{
      name: '客单价',
      data: aa.timeSlotAvgAmount.map(d => d.avgAmount),
    }],
  }

  // 根因柱状图
  const causeChartData = {
    categories: aa.rootCauseAnalysis.map(c => c.factor),
    series: [{
      name: '影响程度',
      data: aa.rootCauseAnalysis.map(c => c.impact),
    }],
  }

  // 产品组合饼图
  const comboData = aa.productCombinationAnalysis.map(c => ({
    name: c.combo,
    value: c.frequency,
  }))

  const tabs = [
    { icon: ShoppingBag, label: '客单分布', desc: '金额段分布直方图' },
    { icon: Users, label: '客群对比', desc: '各类型客群客单对比' },
    { icon: Package, label: '产品组合', desc: '连带产品与时段分析' },
    { icon: AlertTriangle, label: '根因分析', desc: 'AI归因深度诊断' },
    { icon: Lightbulb, label: '提升策略', desc: 'ROI落地执行方案' },
  ]

  const totalRevenue = aa.overallAvgAmount * 2500 // 模拟：客单 * 订单数

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客单价诊断</h1>
          <p className="text-sm text-gray-500 mt-1">
            {aa.period.start} ~ {aa.period.end} · {currentShop.name}
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

      {/* 综合诊断 */}
      <div className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/10">
            <DollarSign className="w-8 h-8 text-amber-200" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">AI综合诊断结论</h3>
              <span className="px-2 py-0.5 bg-amber-500/30 text-amber-200 text-xs rounded-full">GPT-4分析</span>
            </div>
            <p className="text-sm text-amber-100 leading-relaxed">{aa.overallDiagnosis}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {aa.top3Priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-danger text-white' : i === 1 ? 'bg-warning text-white' : 'bg-amber-600 text-white'
              }`}>{i + 1}</span>
              <span className="text-sm text-amber-100">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">当前客单价</p>
          <p className="text-2xl font-bold text-gray-900">¥{aa.overallAvgAmount.toFixed(1)}</p>
          <div className="mt-2"><TrendBadge value={aa.gap} suffix='元' /></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">行业基准</p>
          <p className="text-2xl font-bold text-gray-500">¥{aa.benchmark.toFixed(1)}</p>
          <p className="text-xs text-gray-400 mt-1">行业平均水平</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">差距</p>
          <p className={`text-2xl font-bold ${aa.gap < 0 ? 'text-danger' : 'text-success'}`}>
            {aa.gap >= 0 ? '+' : ''}¥{aa.gap.toFixed(1)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{aa.gap < 0 ? '低于基准' : '高于基准'}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">本周营收贡献</p>
          <p className="text-2xl font-bold text-gray-900">¥{(totalRevenue / 10000).toFixed(1)}万</p>
          <p className="text-xs text-gray-400 mt-1">模拟数据</p>
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
          {/* Tab 0: 客单分布 */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <SectionHeader icon={ShoppingBag} title="客单价金额分布" subtitle="各价格段订单数量与占比" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {aa.distributionAnalysis.map((d) => (
                  <div key={d.range} className="bg-white rounded-xl p-4 border border-gray-200 text-center hover:border-amber-300 transition-colors">
                    <p className="text-sm font-medium text-gray-500 mb-1">{d.range}</p>
                    <p className="text-2xl font-bold text-gray-900">{d.count}</p>
                    <p className="text-xs text-gray-400">单</p>
                    <div className="mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${d.percentage * 2}%` }} />
                    </div>
                    <p className="text-xs text-amber-600 mt-1">{d.percentage}%</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">客单分布直方图</h4>
                <div className="h-64">
                  <BarChart data={distChartData} />
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">关键发现</span>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• ¥40-60区间订单最多（32.8%），是主力客单价段</li>
                  <li>• ¥0-20低价单占12.8%，多为单人低客单场景，可引导加购</li>
                  <li>• ¥100+高客单仅占3.2%，说明高价值产品推荐严重不足，提升空间巨大</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 1: 客群对比 */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <SectionHeader icon={Users} title="客群类型客单价对比" subtitle="新客 vs 老客 vs VIP · 与行业基准差距" />
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">客群类型</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">平均客单</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">基准值</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">差距</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">趋势</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">原因分析</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {aa.customerTypeAvg.map((c) => (
                      <tr key={c.type} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium text-gray-900">{c.type}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-lg font-bold ${c.gap >= 0 ? 'text-success' : 'text-danger'}`}>
                            ¥{c.avgAmount.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-gray-500">¥{c.benchmark.toFixed(1)}</td>
                        <td className="px-5 py-4 text-center">
                          <TrendBadge value={c.gap} suffix='元' />
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`w-2 h-2 rounded-full inline-block ${c.gap >= 0 ? 'bg-success' : 'bg-danger'}`} />
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">{c.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 对比柱状图 */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">客群客单对比</h4>
                <div className="h-64">
                  <BarChart data={{
                    categories: aa.customerTypeAvg.map(c => c.type),
                    series: [
                      { name: '本店客单', data: aa.customerTypeAvg.map(c => c.avgAmount) },
                      { name: '行业基准', data: aa.customerTypeAvg.map(c => c.benchmark) },
                    ],
                  }} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">表现优于基准的客群</p>
                  <div className="flex gap-2">
                    {aa.customerTypeAvg.filter(c => c.gap > 0).map(c => (
                      <span key={c.type} className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                        {c.type} +¥{c.gap.toFixed(1)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">低于基准的客群（重点提升）</p>
                  <div className="flex gap-2">
                    {aa.customerTypeAvg.filter(c => c.gap < 0).map(c => (
                      <span key={c.type} className="px-3 py-1 bg-danger/10 text-danger rounded-full text-sm font-medium">
                        {c.type} ¥{c.gap.toFixed(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 产品组合 */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <SectionHeader icon={Package} title="产品组合与时段客单分析" subtitle="连带购买模式 · 最佳销售时段" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 产品组合 */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 className="font-medium text-gray-900 mb-4">产品组合分析</h4>
                  <div className="space-y-3">
                    {aa.productCombinationAnalysis.map((c) => (
                      <div key={c.combo} className={`p-3 rounded-xl border ${
                        c.profit < 0 ? 'border-danger/30 bg-danger/5' : 'border-gray-200 hover:border-amber-300'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{c.combo}</span>
                            {c.profit < 0 && <span className="ml-2 px-2 py-0.5 bg-danger/10 text-danger text-xs rounded">亏损</span>}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">¥{c.avgAmount.toFixed(1)}</span>
                            <span className="text-xs text-gray-400 ml-2">占比{c.frequency}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{c.note}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          <span className="text-gray-500">毛利贡献：<span className="text-gray-700 font-medium">¥{c.profit.toFixed(1)}</span></span>
                          <span className="text-gray-500">占订单{c.frequency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 时段客单 */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 className="font-medium text-gray-900 mb-4">各时段客单价</h4>
                  <div className="h-64 mb-4">
                    <LineChart data={timeChartData} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-danger/5 border border-danger/20 rounded-lg">
                      <p className="text-xs text-gray-500">高客单时段</p>
                      <p className="text-lg font-bold text-danger">19:00</p>
                      <p className="text-xs text-gray-400">¥68（晚餐高峰）</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-500">低客单时段</p>
                      <p className="text-lg font-bold text-gray-400">8:00-9:00</p>
                      <p className="text-xs text-gray-400">¥22-25（早餐）</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">洞察：产品组合严重失衡</span>
                </div>
                <p className="text-sm text-gray-600">单杯饮品订单占比42%，但毛利极低；高价组合（饮品+小食+周边）仅占8%。应重点提升连带推荐率，将产品组合从"单杯为主"转向"套餐组合为主"。</p>
              </div>
            </div>
          )}

          {/* Tab 3: 根因分析 */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <SectionHeader icon={AlertTriangle} title="客单价偏低根因分析" subtitle="AI多因子归因 · 区分可控/不可控因素" />
              {/* AI结论 */}
              <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">AI根因结论</span>
                </div>
                <p className="text-sm text-amber-100 leading-relaxed">
                  客单价偏低的核心原因是：①「第二杯半价」严重拉低毛利和客单（活动订单仅¥42）；②员工推荐率18%远低于行业标杆35%；③高价产品占比不足（¥40+产品仅占12%）。以上三个因素均可控，通过调整促销策略和强化培训可在短期内改善。
                </p>
              </div>

              {/* 根因条形图 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4">各因素影响程度</h4>
                <div className="h-72">
                  <BarChart data={causeChartData} />
                </div>
              </div>

              {/* 详细根因 */}
              <div className="space-y-3">
                {aa.rootCauseAnalysis.map((cause, i) => (
                  <div key={i} className={`bg-white rounded-xl p-5 border ${
                    cause.isControllable ? 'border-amber-200' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        cause.isControllable ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {cause.isControllable ? <Zap className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{cause.factor}</span>
                            {!cause.isControllable && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded">不可控</span>
                            )}
                          </div>
                          <span className={`font-bold ${cause.impact >= 0 ? 'text-success' : 'text-danger'}`}>
                            {cause.impact >= 0 ? '+' : ''}{cause.impact.toFixed(1)}元
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cause.impact >= 0 ? 'bg-success' : 'bg-danger'}`}
                            style={{ width: `${Math.min(Math.abs(cause.impact) * 5, 100)}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-start gap-4">
                          <p className="text-xs text-gray-500 flex-1">{cause.evidence}</p>
                          <p className="text-xs text-primary-600 font-medium whitespace-nowrap">{cause.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: 提升策略 */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <SectionHeader icon={Lightbulb} title="客单价提升落地策略" subtitle="基于ROI排序 · 预计综合提升客单 +35%" />
              {/* 预期效果总览 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">预计综合提升幅度</p>
                  <p className="text-3xl font-bold text-success">+35%</p>
                  <p className="text-xs text-gray-400 mt-1">综合各项策略</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">目标客单价</p>
                  <p className="text-3xl font-bold text-primary-600">¥79</p>
                  <p className="text-xs text-gray-400 mt-1">从¥58.5提升</p>
                </div>
                <div className="bg-amber/5 border border-amber/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">最高ROI策略</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">套餐组合</p>
                  <p className="text-xs text-gray-400 mt-1">提升12%客单</p>
                </div>
              </div>

              {/* 策略卡片 */}
              <div className="space-y-4">
                {aa.boostTactics.map((strategy, i) => (
                  <StrategyCard key={i} strategy={strategy} index={i} />
                ))}
              </div>

              {/* 综合预估 */}
              <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="font-semibold text-gray-900">综合执行效果预估</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">客单价提升目标</p>
                    <p className="text-2xl font-bold text-success mt-1">¥58.5 → ¥79</p>
                    <p className="text-xs text-gray-400">提升幅度 +35%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">周增收预估</p>
                    <p className="text-2xl font-bold text-primary-600 mt-1">+¥1.8万</p>
                    <p className="text-xs text-gray-400">基于日均客流×客单增幅</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">预计ROI</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">1:5.2</p>
                    <p className="text-xs text-gray-400">投入成本 vs 增收</p>
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
