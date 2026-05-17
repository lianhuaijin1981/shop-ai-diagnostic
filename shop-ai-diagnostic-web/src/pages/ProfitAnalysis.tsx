import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { depDiagnosticApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { Loading } from '@/components/common'
import { BarChart, LineChart } from '@/components/charts'
import {
  TrendingUp, TrendingDown, DollarSign, PieChart,
  AlertTriangle, Lightbulb, CheckCircle2, Zap,
  ChevronRight, ChevronDown, Percent, Package
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

function ProfitCard({ tactic, index }: { tactic: any; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const liftColor = tactic.expectedLift >= 3 ? 'text-success' : tactic.expectedLift >= 1.5 ? 'text-warning' : 'text-primary'
  return (
    <div className="bg-white rounded-xl p-5 shadow-card border border-gray-200 hover:border-primary-200 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{tactic.tactic}</h4>
            <span className={`font-bold text-lg ${liftColor}`}>+{tactic.expectedLift}%</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className={`px-2 py-0.5 rounded ${
              tactic.difficulty === 'easy' ? 'bg-success/10 text-success' :
              tactic.difficulty === 'medium' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
            }`}>
              {tactic.difficulty === 'easy' ? '简单' : tactic.difficulty === 'medium' ? '中等' : '复杂'}
            </span>
            <span>预计提升利润率 {tactic.expectedLift} 个百分点</span>
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
export function ProfitAnalysis() {
  const { currentShop } = useShopStore()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [activeTab, setActiveTab] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['profitAnalysis', currentShop.id, selectedPeriod],
    queryFn: () => depDiagnosticApi.getProfitAnalysis({
      shopId: currentShop.id,
      period: selectedPeriod as 'today' | 'week' | 'month' | 'quarter',
    }),
    enabled: !!currentShop.id,
  })

  if (isLoading) return <Loading text="深度分析利润数据中..." />

  const pf = data?.data
  if (!pf) return null

  // 成本结构饼图
  const costChartData = {
    categories: pf.costStructureAnalysis.map(c => c.item),
    series: [{
      name: '成本占比',
      data: pf.costStructureAnalysis.map(c => c.percentage),
    }],
  }

  // 产品利润贡献
  const productProfitChartData = {
    categories: pf.productProfitAnalysis.map(p => p.productName.length > 8 ? p.productName.slice(0, 8) + '...' : p.productName),
    series: [{
      name: '单品利润贡献',
      data: pf.productProfitAnalysis.map(p => p.totalProfit),
    }],
  }

  // 品类利润率对比
  const categoryRateData = {
    categories: pf.profitComposition.map(c => c.category),
    series: [
      { name: '毛利率', data: pf.profitComposition.map(c => c.profitRate) },
    ],
  }

  const tabs = [
    { icon: DollarSign, label: '利润概览', desc: '整体利润率与差距' },
    { icon: PieChart, label: '成本结构', desc: '成本构成分析' },
    { icon: Package, label: '产品利润', desc: '单品利润贡献排行' },
    { icon: AlertTriangle, label: '根因分析', desc: 'AI归因深度诊断' },
    { icon: Lightbulb, label: '提升策略', desc: '利润提升方案' },
  ]

  const totalRevenue = pf.profitComposition.reduce((s, c) => s + c.revenue, 0)
  const totalProfit = pf.profitComposition.reduce((s, c) => s + c.profit, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">利润诊断</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pf.period.start} ~ {pf.period.end} · {currentShop.name}
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
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/10">
            <DollarSign className="w-8 h-8 text-emerald-200" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">AI综合诊断结论</h3>
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-xs rounded-full">GPT-4分析</span>
            </div>
            <p className="text-sm text-emerald-100 leading-relaxed">{pf.overallDiagnosis}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {pf.top3Priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-danger text-white' : i === 1 ? 'bg-warning text-white' : 'bg-emerald-600 text-white'
              }`}>{i + 1}</span>
              <span className="text-sm text-emerald-100">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">当前利润率</p>
          <p className="text-2xl font-bold text-gray-900">{pf.overallProfitRate}%</p>
          <div className="mt-2"><TrendBadge value={pf.gap} /></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">行业基准</p>
          <p className="text-2xl font-bold text-gray-500">{pf.benchmark}%</p>
          <p className="text-xs text-gray-400 mt-1">行业平均水平</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">本期总利润</p>
          <p className="text-2xl font-bold text-emerald-600">¥{(totalProfit / 10000).toFixed(1)}万</p>
          <p className="text-xs text-gray-400 mt-1">毛利额</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">本期总营收</p>
          <p className="text-2xl font-bold text-gray-900">¥{(totalRevenue / 10000).toFixed(1)}万</p>
          <p className="text-xs text-gray-400 mt-1">含所有品类</p>
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
          {/* Tab 0: 利润概览 */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <SectionHeader icon={DollarSign} title="利润率整体情况" subtitle="毛利率 vs 净利 vs 基准" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">利润率 vs 基准</h4>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-900">{pf.overallProfitRate}%</p>
                      <p className="text-sm text-gray-500 mt-1">当前利润率</p>
                    </div>
                    <div className="text-3xl text-gray-300">→</div>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-400">{pf.benchmark}%</p>
                      <p className="text-sm text-gray-500 mt-1">行业基准</p>
                    </div>
                    <div className="text-3xl text-danger">-</div>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-danger">{Math.abs(pf.gap)}%</p>
                      <p className="text-sm text-gray-500 mt-1">差距</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-end pr-3 text-xs font-medium text-white" style={{ width: `${(pf.overallProfitRate / pf.benchmark) * 100}%` }}>
                      {pf.overallProfitRate}%
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">深色区域为当前利润率，基准线为{pf.benchmark}%</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">招牌奶茶毛利率</p>
                    <p className="text-3xl font-bold text-emerald-600">40%</p>
                    <p className="text-xs text-gray-400">毛利最高品类</p>
                  </div>
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">亏损品类数</p>
                    <p className="text-3xl font-bold text-danger">2个</p>
                    <p className="text-xs text-gray-400">限定周边/套餐组合</p>
                  </div>
                  <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">成本超支项</p>
                    <p className="text-3xl font-bold text-warning">2项</p>
                    <p className="text-xs text-gray-400">能耗+损耗超标</p>
                  </div>
                </div>
              </div>
              {/* 品类利润一览 */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">品类</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">营收</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">成本</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">毛利</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">毛利率</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pf.profitComposition.map((c) => (
                      <tr key={c.category} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium text-gray-900">{c.category}</td>
                        <td className="px-5 py-4 text-right text-gray-700">¥{c.revenue.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right text-gray-500">¥{c.cost.toLocaleString()}</td>
                        <td className={`px-5 py-4 text-right font-bold ${c.profit >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
                          {c.profit >= 0 ? '+' : ''}¥{c.profit.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-sm font-bold ${c.profitRate >= 35 ? 'text-success' : c.profitRate >= 20 ? 'text-warning' : 'text-danger'}`}>
                            {c.profitRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">{c.note}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="px-5 py-4 text-gray-900">合计</td>
                      <td className="px-5 py-4 text-right text-gray-900">¥{totalRevenue.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-gray-700">¥{(totalRevenue - totalProfit).toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-emerald-600">+¥{totalProfit.toLocaleString()}</td>
                      <td className="px-5 py-4 text-center text-emerald-600">{((totalProfit / totalRevenue) * 100).toFixed(1)}%</td>
                      <td className="px-5 py-4 text-gray-500">综合毛利率</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 1: 成本结构 */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <SectionHeader icon={PieChart} title="成本结构分析" subtitle="各项成本占比与可控性评估" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 成本占比图 */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 className="font-medium text-gray-900 mb-4">成本占比分布</h4>
                  <div className="h-72">
                    <BarChart data={costChartData} />
                  </div>
                </div>
                {/* 成本明细 */}
                <div className="space-y-3">
                  {pf.costStructureAnalysis.map((cost) => (
                    <div key={cost.item} className={`bg-white rounded-xl p-4 border ${
                      cost.isControllable ? 'border-gray-200' : 'border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{cost.item}</span>
                          {!cost.isControllable && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded">固定</span>
                          )}
                          {cost.isControllable && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">可控</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">¥{cost.amount.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 ml-1">({cost.percentage}%)</span>
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cost.isControllable ? 'bg-primary-400' : 'bg-gray-400'}`}
                          style={{ width: `${cost.percentage * 3}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{cost.note}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">成本优化机会识别</span>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 原料成本占比52.7%，其中损耗8%（约¥2,560/周）是优化重点</li>
                  <li>• 营销成本占比6.9%，含平台抽佣，可通过提升自营渠道平衡</li>
                  <li>• 人工和房租合计37.9%属固定成本，短期优化空间有限</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: 产品利润 */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <SectionHeader icon={Package} title="单品利润贡献排行" subtitle="每个产品的利润贡献与毛利率" />
              {/* 利润贡献柱状图 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4">单品利润贡献（降序）</h4>
                <div className="h-80">
                  <BarChart data={productProfitChartData} />
                </div>
              </div>
              {/* 详细列表 */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">产品名称</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">销量</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">单利</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">总毛利</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">毛利率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pf.productProfitAnalysis.map((p) => (
                      <tr key={p.productName} className={`hover:bg-gray-50 ${p.totalProfit < 0 ? 'bg-danger/5' : ''}`}>
                        <td className="px-5 py-4 font-medium text-gray-900">
                          {p.productName}
                          {p.totalProfit < 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-danger/10 text-danger text-xs rounded">亏损</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-700">{p.salesCount}</td>
                        <td className={`px-5 py-4 text-right font-medium ${p.profitPerUnit >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
                          {p.profitPerUnit >= 0 ? '+' : ''}¥{p.profitPerUnit.toFixed(1)}
                        </td>
                        <td className={`px-5 py-4 text-right font-bold ${p.totalProfit >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
                          {p.totalProfit >= 0 ? '+' : ''}¥{p.totalProfit.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-sm font-bold ${p.profitRate >= 35 ? 'text-success' : p.profitRate >= 0 ? 'text-warning' : 'text-danger'}`}>
                            {p.profitRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">盈利冠军</p>
                  <p className="text-sm font-bold text-success">{pf.productProfitAnalysis.find(p => p.totalProfit === Math.max(...pf.productProfitAnalysis.map(x => x.totalProfit)))?.productName}</p>
                  <p className="text-2xl font-bold text-success">+¥{Math.max(...pf.productProfitAnalysis.map(p => p.totalProfit)).toLocaleString()}</p>
                </div>
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">亏损最严重</p>
                  <p className="text-sm font-bold text-danger">{pf.productProfitAnalysis.find(p => p.totalProfit === Math.min(...pf.productProfitAnalysis.map(x => x.totalProfit)))?.productName}</p>
                  <p className="text-2xl font-bold text-danger">¥{Math.min(...pf.productProfitAnalysis.map(p => p.totalProfit)).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">净利合计</p>
                  <p className="text-2xl font-bold text-gray-900">¥{pf.productProfitAnalysis.reduce((s, p) => s + p.totalProfit, 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">单品毛利贡献</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 根因分析 */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <SectionHeader icon={AlertTriangle} title="利润率偏低根因分析" subtitle="AI多因子归因 · 区分可控/不可控因素" />
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">AI根因结论</span>
                </div>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  利润率偏低的核心原因：①「第二杯半价」将活动毛利从35%拉低至18%（贡献38%订单），是最大问题；②限定周边和套餐已出现亏损（-20%和-15.5%）；③原料损耗率8%高于行业5%。以上问题均可控，通过调整促销策略和优化成本结构，利润率可恢复至33%+。
                </p>
              </div>
              <div className="space-y-3">
                {pf.rootCauseAnalysis.map((cause, i) => (
                  <div key={i} className={`bg-white rounded-xl p-5 border ${
                    cause.isControllable ? 'border-emerald-200' : 'border-gray-300'
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
                            {cause.impact >= 0 ? '+' : ''}{cause.impact.toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cause.impact >= 0 ? 'bg-success' : 'bg-danger'}`}
                            style={{ width: `${Math.min(Math.abs(cause.impact) * 10, 100)}%` }}
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
              <SectionHeader icon={Lightbulb} title="利润提升落地策略" subtitle="基于ROI排序 · 预计综合提升利润率 +10.3%" />
              {/* 预期总览 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">预计综合提升</p>
                  <p className="text-3xl font-bold text-success">+10.3%</p>
                  <p className="text-xs text-gray-400 mt-1">利润率百分点</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">目标利润率</p>
                  <p className="text-3xl font-bold text-primary-600">38.8%</p>
                  <p className="text-xs text-gray-400 mt-1">从28.5%提升</p>
                </div>
                <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">月增收预估</p>
                  <p className="text-3xl font-bold text-emerald-600">+¥1.5万</p>
                  <p className="text-xs text-gray-400 mt-1">月均利润增幅</p>
                </div>
              </div>
              {/* 策略卡片 */}
              <div className="space-y-4">
                {pf.profitBoostTactics.map((tactic, i) => (
                  <ProfitCard key={i} tactic={tactic} index={i} />
                ))}
              </div>
              {/* 综合预估 */}
              <div className="bg-gradient-to-r from-success/10 to-emerald/10 border border-success/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="font-semibold text-gray-900">综合执行效果预估</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">利润率提升目标</p>
                    <p className="text-2xl font-bold text-success mt-1">28.5% → 38.8%</p>
                    <p className="text-xs text-gray-400">提升 +10.3 个百分点</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">月均新增利润</p>
                    <p className="text-2xl font-bold text-primary-600 mt-1">+¥1.5万</p>
                    <p className="text-xs text-gray-400">基于周期利润×增幅</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">年化增收</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">+¥18万</p>
                    <p className="text-xs text-gray-400">月均×12个月</p>
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
