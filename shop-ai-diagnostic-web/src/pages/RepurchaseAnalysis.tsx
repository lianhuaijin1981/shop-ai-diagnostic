import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { depDiagnosticApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { Loading } from '@/components/common'
import { BarChart, LineChart } from '@/components/charts'
import {
  TrendingUp, TrendingDown, RefreshCcw, Users, Clock,
  AlertTriangle, Heart, Lightbulb, CheckCircle2, UserMinus,
  ChevronRight, ChevronDown, Zap, Calendar, Percent
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

function RetentionCard({ tactic, index }: { tactic: any; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const liftColor = tactic.expectedLift >= 8 ? 'text-success' : tactic.expectedLift >= 5 ? 'text-warning' : 'text-primary'
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
            <span>预计提升复购率 {tactic.expectedLift}%</span>
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
export function RepurchaseAnalysis() {
  const { currentShop } = useShopStore()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [activeTab, setActiveTab] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['repurchaseAnalysis', currentShop.id, selectedPeriod],
    queryFn: () => depDiagnosticApi.getRepurchaseAnalysis({
      shopId: currentShop.id,
      period: selectedPeriod as 'today' | 'week' | 'month' | 'quarter',
    }),
    enabled: !!currentShop.id,
  })

  if (isLoading) return <Loading text="深度分析复购数据中..." />

  const rp = data?.data
  if (!rp) return null

  // 同期群柱状图
  const cohortChartData = {
    categories: rp.cohortAnalysis.map(c => c.month),
    series: [{
      name: '复购率',
      data: rp.cohortAnalysis.map(c => c.repurchaseRate),
    }],
  }

  // 复购间隔环形数据
  const intervalData = rp.intervalAnalysis.map(i => ({
    name: i.days,
    value: i.percentage,
  }))

  // 流失原因图
  const lostReasonData = {
    categories: rp.lostCustomerAnalysis.mainReasons.map(r => r.reason),
    series: [{
      name: '占比',
      data: rp.lostCustomerAnalysis.mainReasons.map(r => r.percentage),
    }],
  }

  const tabs = [
    { icon: RefreshCcw, label: '复购概览', desc: '整体复购率与差距' },
    { icon: Calendar, label: '同期群分析', desc: '各月新客留存' },
    { icon: Clock, label: '复购间隔', desc: '间隔周期分布' },
    { icon: UserMinus, label: '流失分析', desc: '流失原因诊断' },
    { icon: Heart, label: '留存策略', desc: '复购提升方案' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">复购深度分析</h1>
          <p className="text-sm text-gray-500 mt-1">
            {rp.period.start} ~ {rp.period.end} · {currentShop.name}
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
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/10">
            <RefreshCcw className="w-8 h-8 text-teal-200" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">AI综合诊断结论</h3>
              <span className="px-2 py-0.5 bg-teal-500/30 text-teal-200 text-xs rounded-full">GPT-4分析</span>
            </div>
            <p className="text-sm text-teal-100 leading-relaxed">{rp.overallDiagnosis}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {rp.top3Priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-danger text-white' : i === 1 ? 'bg-warning text-white' : 'bg-teal-600 text-white'
              }`}>{i + 1}</span>
              <span className="text-sm text-teal-100">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">当前复购率</p>
          <p className="text-2xl font-bold text-gray-900">{rp.overallRepurchaseRate}%</p>
          <div className="mt-2"><TrendBadge value={rp.gap} /></div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">行业基准</p>
          <p className="text-2xl font-bold text-gray-500">{rp.benchmark}%</p>
          <p className="text-xs text-gray-400 mt-1">行业平均水平</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">差距</p>
          <p className={`text-2xl font-bold ${rp.gap < 0 ? 'text-danger' : 'text-success'}`}>
            {rp.gap >= 0 ? '+' : ''}{rp.gap}%
          </p>
          <p className="text-xs text-gray-400 mt-1">低于基准</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <p className="text-sm text-gray-500 mb-1">流失客户数</p>
          <p className="text-2xl font-bold text-danger">{rp.lostCustomerAnalysis.count}</p>
          <p className="text-xs text-gray-400 mt-1">近30天流失</p>
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
          {/* Tab 0: 复购概览 */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <SectionHeader icon={RefreshCcw} title="复购率整体情况" subtitle="核心指标与基准对比" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">复购率 vs 基准</h4>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-900">{rp.overallRepurchaseRate}%</p>
                      <p className="text-sm text-gray-500 mt-1">当前复购率</p>
                    </div>
                    <div className="text-3xl text-gray-300">→</div>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-400">{rp.benchmark}%</p>
                      <p className="text-sm text-gray-500 mt-1">行业基准</p>
                    </div>
                    <div className="text-3xl text-danger">-</div>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-danger">{Math.abs(rp.gap)}%</p>
                      <p className="text-sm text-gray-500 mt-1">差距</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-end pr-3 text-xs font-medium text-white" style={{ width: `${(rp.overallRepurchaseRate / rp.benchmark) * 100}%` }}>
                      {rp.overallRepurchaseRate}%
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">深色区域为当前复购率，基准线为{rp.benchmark}%</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">理想复购周期（8-14天）</p>
                    <p className="text-3xl font-bold text-teal-600">32%</p>
                    <p className="text-xs text-gray-400">占比最高的复购间隔</p>
                  </div>
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">高频忠实客（1-7天）</p>
                    <p className="text-3xl font-bold text-danger">28%</p>
                    <p className="text-xs text-gray-400">最高价值的复购群体</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">濒危流失（31-60天）</p>
                    <p className="text-3xl font-bold text-gray-400">10%</p>
                    <p className="text-xs text-gray-400">需立即唤醒</p>
                  </div>
                </div>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">关键发现</span>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 积分体系是复购核心驱动（18%客户因积分/优惠券复购），但当前价值偏低</li>
                  <li>• 高频忠实客（28%）是最有价值的群体，应重点维护并给予专属权益</li>
                  <li>• 濒危流失客户（10%）和流失客户（185人）可通过精准唤醒大幅挽回</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 1: 同期群分析 */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <SectionHeader icon={Calendar} title="新客同期群留存分析" subtitle="按新客注册月份追踪复购率变化" />
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4">各月新客复购率趋势</h4>
                <div className="h-72">
                  <BarChart data={cohortChartData} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">注册月份</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">新客数量</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">复购率</th>
                      <th className="px-5 py-3 text-center text-xs font-medium text-gray-500">趋势</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rp.cohortAnalysis.map((c) => (
                      <tr key={c.month} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium text-gray-900">{c.month}</td>
                        <td className="px-5 py-4 text-center text-gray-700">{c.newCustomers}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-lg font-bold ${c.repurchaseRate >= 40 ? 'text-success' : c.repurchaseRate >= 35 ? 'text-warning' : 'text-danger'}`}>
                            {c.repurchaseRate}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`w-2 h-2 rounded-full inline-block ${c.repurchaseRate >= 40 ? 'bg-success' : 'bg-warning'}`} />
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">{c.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">表现最优</p>
                  <p className="text-lg font-bold text-success">{rp.cohortAnalysis.reduce((a, b) => a.repurchaseRate > b.repurchaseRate ? a : b).month}</p>
                  <p className="text-2xl font-bold text-success">{rp.cohortAnalysis.reduce((a, b) => a.repurchaseRate > b.repurchaseRate ? a : b).repurchaseRate}%</p>
                </div>
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">整体平均</p>
                  <p className="text-2xl font-bold text-warning">
                    {(rp.cohortAnalysis.reduce((s, c) => s + c.repurchaseRate, 0) / rp.cohortAnalysis.length).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">6个月平均复购率</p>
                </div>
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">关注对象</p>
                  <p className="text-lg font-bold text-danger">{rp.cohortAnalysis[rp.cohortAnalysis.length - 1].month}</p>
                  <p className="text-xs text-danger">当期新客数据尚不完整</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 复购间隔 */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <SectionHeader icon={Clock} title="复购间隔分布分析" subtitle="识别高频客群与濒危流失客群" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 className="font-medium text-gray-900 mb-4">复购间隔分布</h4>
                  <div className="space-y-3">
                    {rp.intervalAnalysis.map((interval) => (
                      <div key={interval.days} className={`p-3 rounded-xl border ${
                        interval.percentage >= 28 ? 'border-success/30 bg-success/5' : interval.percentage >= 20 ? 'border-gray-200' : 'border-warning/30 bg-warning/5'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{interval.days}</span>
                          <span className="text-lg font-bold text-gray-900">{interval.percentage}%</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${interval.percentage >= 28 ? 'bg-success' : interval.percentage >= 20 ? 'bg-warning' : 'bg-gray-400'}`}
                            style={{ width: `${interval.percentage * 2}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">平均客单 ¥{interval.avgAmount}</span>
                          <span className="text-xs text-gray-400">{interval.note}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-success/5 border border-success/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-success" />
                      <span className="font-semibold text-gray-900">高频忠实客（1-7天）</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">占复购客户28%，是最优质的高价值客群，客单价最高（¥68）。</p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">VIP专属权益</span>
                      <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">生日礼包</span>
                      <span className="px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">优先体验新品</span>
                    </div>
                  </div>
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-danger" />
                      <span className="font-semibold text-gray-900">濒危流失（31-60天）</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">占10%，平均48天未到店。需立即实施唤醒策略，否则将彻底流失。</p>
                    <div className="bg-danger/10 rounded-lg p-3">
                      <p className="text-xs text-danger font-medium">建议行动：</p>
                      <p className="text-xs text-gray-600 mt-1">发送"专属回归礼"（免费任选饮品1杯）+ 限时48小时有效</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <RefreshCcw className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-gray-900">理想间隔（8-14天）</span>
                    </div>
                    <p className="text-sm text-gray-600">32%的复购发生在这个周期，是最健康的复购节奏。</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 流失分析 */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <SectionHeader icon={UserMinus} title="客户流失诊断" subtitle={`近30天流失 ${rp.lostCustomerAnalysis.count} 人 · 平均 ${rp.lostCustomerAnalysis.avgDaysSinceLastVisit} 天未到店`} />
              {/* 流失原因柱状图 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4">流失原因分布</h4>
                <div className="h-64">
                  <BarChart data={lostReasonData} />
                </div>
              </div>
              <div className="space-y-3">
                {rp.lostCustomerAnalysis.mainReasons.map((reason, i) => (
                  <div key={i} className={`bg-white rounded-xl p-4 border ${
                    reason.isControllable ? 'border-gray-200' : 'border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          reason.isControllable ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400'
                        }`}>{i + 1}</span>
                        <span className="font-medium text-gray-900">{reason.reason}</span>
                        {!reason.isControllable && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded">不可控</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 rounded-full h-4 w-40 overflow-hidden">
                          <div className="h-full bg-danger rounded-full" style={{ width: `${reason.percentage * 2}%` }} />
                        </div>
                        <span className="font-bold text-danger w-12 text-right">{reason.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* 流失挽回价值 */}
              <div className="bg-gradient-to-r from-danger/10 to-warning/10 border border-danger/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-danger" />
                  <span className="font-semibold text-gray-900">流失挽回价值评估</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">流失客户数</p>
                    <p className="text-2xl font-bold text-danger mt-1">{rp.lostCustomerAnalysis.count}人</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">平均客户终身价值</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">¥580</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">挽回后潜在营收</p>
                    <p className="text-2xl font-bold text-primary-600 mt-1">¥{((rp.lostCustomerAnalysis.count * 580 * 0.3) / 10000).toFixed(1)}万</p>
                    <p className="text-xs text-gray-400">假设30%可唤醒</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: 留存策略 */}
          {activeTab === 4 && (
            <div className="space-y-6">
              <SectionHeader icon={Heart} title="复购留存落地策略" subtitle="基于ROI排序 · 预计综合提升复购率 +33%" />
              {/* 预期总览 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">预计综合提升幅度</p>
                  <p className="text-3xl font-bold text-success">+33%</p>
                  <p className="text-xs text-gray-400 mt-1">复购率 +33%</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">目标复购率</p>
                  <p className="text-3xl font-bold text-primary-600">43%</p>
                  <p className="text-xs text-gray-400 mt-1">从32.5%提升</p>
                </div>
                <div className="bg-teal/5 border border-teal/20 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">客户唤醒价值</p>
                  <p className="text-3xl font-bold text-teal-600">¥3.2万</p>
                  <p className="text-xs text-gray-400 mt-1">预计挽回营收</p>
                </div>
              </div>
              {/* 策略卡片 */}
              <div className="space-y-4">
                {rp.retentionTactics.map((tactic, i) => (
                  <RetentionCard key={i} tactic={tactic} index={i} />
                ))}
              </div>
              {/* 综合预估 */}
              <div className="bg-gradient-to-r from-success/10 to-teal/10 border border-success/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="font-semibold text-gray-900">综合执行效果预估</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-gray-500">复购率提升目标</p>
                    <p className="text-2xl font-bold text-success mt-1">32.5% → 43%</p>
                    <p className="text-xs text-gray-400">提升幅度 +32.3%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">月新增复购订单</p>
                    <p className="text-2xl font-bold text-primary-600 mt-1">+380单</p>
                    <p className="text-xs text-gray-400">基于客流×复购率增幅</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">月增收预估</p>
                    <p className="text-2xl font-bold text-teal-600 mt-1">+¥2.2万</p>
                    <p className="text-xs text-gray-400">复购客单¥58×新增订单</p>
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
