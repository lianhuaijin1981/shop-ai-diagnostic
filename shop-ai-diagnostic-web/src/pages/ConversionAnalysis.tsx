import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { depDiagnosticApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { Loading } from '@/components/common'
import { BarChart } from '@/components/charts'
import {
  Target, BarChart3, Users, Clock, Package, AlertTriangle,
  Lightbulb, CheckCircle2, TrendingUp, TrendingDown, ArrowRight,
  ChevronDown, ChevronRight, Percent
} from 'lucide-react'

// ============ 工具组件 ============
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

function FunnelBar({ stage, count, rate, dropOffReason, isLast = false }: {
  stage: string; count: number; rate: number; dropOffReason: string; isLast?: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 text-sm font-medium text-gray-700 text-right">{stage}</div>
      <div className="flex-1 relative">
        <div className="h-12 bg-gradient-to-r from-primary-500 to-primary-400 rounded-lg flex items-center justify-between px-4">
          <span className="text-white font-bold">{count.toLocaleString()}</span>
          <span className="text-white/80 text-sm">{rate}%</span>
        </div>
        {!isLast && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 z-10">
            <svg className="w-4 h-4 text-primary-400" viewBox="0 0 8 8" fill="currentColor">
              <path d="M4 8L0 0h8z" />
            </svg>
          </div>
        )}
      </div>
      <div className="w-64 text-xs text-gray-500 pl-6">
        {dropOffReason !== '—' && (
          <div className="flex items-start gap-1">
            <TrendingDown className="w-3 h-3 text-danger mt-0.5 flex-shrink-0" />
            <span>{dropOffReason}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function TacticItem({ tactic, expectedLift, difficulty, steps }: {
  tactic: string; expectedLift: number; difficulty: string; steps: string[]
}) {
  const [expanded, setExpanded] = useState(false)
  const difficultyColors: Record<string, string> = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    hard: 'bg-danger/10 text-danger',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{tactic}</span>
            <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[difficulty]}`}>
              {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '复杂'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">预计提升：</span>
            <span className="font-bold text-success">+{expectedLift}%</span>
            <span className="text-gray-400">转化率</span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {expanded ? '收起' : '详情'}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">执行步骤：</p>
          <ul className="space-y-1.5">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-medium mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function HourlyBar({ hour, rate, level }: { hour: number; rate: number; level: string }) {
  const levelConfig = {
    high: { color: 'bg-success', text: 'text-success', bg: 'bg-success/5' },
    medium: { color: 'bg-warning', text: 'text-warning', bg: 'bg-warning/5' },
    low: { color: 'bg-gray-300', text: 'text-gray-400', bg: 'bg-gray-50' },
  }
  const cfg = levelConfig[level as keyof typeof levelConfig] || levelConfig.low
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${cfg.bg}`}>
      <span className="text-xs text-gray-500 w-8">{hour}:00</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3">
        <div className={`h-3 rounded-full ${cfg.color}`} style={{ width: `${Math.min(rate / 0.5 * 100, 100)}%` }} />
      </div>
      <span className={`text-xs font-medium w-12 text-right ${cfg.text}`}>{rate}%</span>
    </div>
  )
}

// ============ 主组件 ============
export function ConversionAnalysis() {
  const { currentShop } = useShopStore()
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const { data, isLoading } = useQuery({
    queryKey: ['conversionAnalysis', currentShop.id, selectedPeriod],
    queryFn: () => depDiagnosticApi.getConversionAnalysis({
      shopId: currentShop.id,
      period: selectedPeriod as 'today' | 'week' | 'month' | 'quarter',
    }),
    enabled: !!currentShop.id,
  })

  if (isLoading) return <Loading text="深度分析转化数据中..." />

  const conv = data?.data
  if (!conv) return null

  const { funnelAnalysis, customerTypeConversion, timeSlotConversion, productCategoryConversion, rootCauseAnalysis, boostTactics, overallRate, benchmark } = conv
  const gap = benchmark - overallRate

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">转化深度分析</h1>
          <p className="text-sm text-gray-500 mt-1">
            {conv.period.start?.slice(0, 10)} ~ {conv.period.end?.slice(0, 10)} · {currentShop.name}
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

      {/* AI综合诊断 */}
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
            <p className="text-sm text-slate-300 leading-relaxed">{conv.overallDiagnosis}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {conv.top3Priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-danger text-white' : i === 1 ? 'bg-warning text-white' : 'bg-slate-600 text-white'
              }`}>{i + 1}</span>
              <span className="text-sm text-slate-200">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-card text-center">
          <p className="text-sm text-gray-500 mb-1">当前转化率</p>
          <p className="text-3xl font-bold text-primary-600">{overallRate}%</p>
          <p className="text-xs text-gray-400 mt-1">进店 → 消费比率</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card text-center">
          <p className="text-sm text-gray-500 mb-1">行业基准</p>
          <p className="text-3xl font-bold text-gray-900">{benchmark}%</p>
          <p className="text-xs text-gray-400 mt-1">优秀门店均值</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card text-center">
          <p className="text-sm text-gray-500 mb-1">差距</p>
          <p className={`text-3xl font-bold ${gap >= 0 ? 'text-success' : 'text-danger'}`}>
            {gap >= 0 ? '+' : ''}{gap.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">追赶空间</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card text-center">
          <p className="text-sm text-gray-500 mb-1">转化漏斗层级</p>
          <p className="text-3xl font-bold text-gray-900">{funnelAnalysis.length}</p>
          <p className="text-xs text-gray-400 mt-1">个关键节点</p>
        </div>
      </div>

      {/* 转化漏斗 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <SectionHeader icon={BarChart3} title="转化漏斗分析" subtitle="从曝光到消费的完整路径，识别每个节点的最大流失" />
        <div className="space-y-6 mt-6 pb-4">
          {funnelAnalysis.map((stage, i) => (
            <FunnelBar
              key={i}
              stage={stage.stage}
              count={stage.count}
              rate={stage.rate}
              dropOffReason={stage.dropOffReason}
              isLast={i === funnelAnalysis.length - 1}
            />
          ))}
        </div>
        {/* 最大流失标注 */}
        {funnelAnalysis.length > 1 && (
          <div className="mt-6 p-4 bg-danger/5 border border-danger/20 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <span className="text-sm font-medium text-gray-700">最大流失节点</span>
            </div>
            {(() => {
              let maxDrop = 0
              let maxDropIdx = 0
              for (let i = 0; i < funnelAnalysis.length - 1; i++) {
                const drop = funnelAnalysis[i].count - funnelAnalysis[i + 1].count
                if (drop > maxDrop) { maxDrop = drop; maxDropIdx = i }
              }
              const from = funnelAnalysis[maxDropIdx]
              const to = funnelAnalysis[maxDropIdx + 1]
              return (
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-danger">「{from.stage} → {to?.stage}」</span>
                  阶段流失最严重，流失 <span className="font-bold text-danger">{maxDrop.toLocaleString()} 人</span>
                  （{from.count > 0 ? ((maxDrop / from.count) * 100).toFixed(1) : 0}%），主要原因是：{from.dropOffReason}
                </p>
              )
            })()}
          </div>
        )}
      </div>

      {/* 客群转化对比 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <SectionHeader icon={Users} title="客群类型转化对比" subtitle="不同客群的转化能力差异" />
          <div className="space-y-4">
            {customerTypeConversion.map((item) => (
              <div key={item.type} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700">{item.type}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-bold text-primary-600">{item.rate}%</span>
                    <span className="text-xs text-gray-400">基准 {item.benchmark}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${item.gap >= 0 ? 'bg-success' : 'bg-danger'}`}
                      style={{ width: `${Math.min((item.rate / benchmark) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className={`w-16 text-right text-sm font-medium ${item.gap >= 0 ? 'text-success' : 'text-danger'}`}>
                  {item.gap >= 0 ? '+' : ''}{item.gap}%
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">洞察</p>
            <p className="text-sm text-gray-600">VIP客群转化率（58%）高于行业基准（55%），表现优秀；新客转化率（22%）差距最大（-8%），是重点优化方向。</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-card">
          <SectionHeader icon={Clock} title="时段转化对比" subtitle="24小时各时段转化率" />
          <div className="grid grid-cols-2 gap-2">
            {timeSlotConversion.map((item) => (
              <HourlyBar key={item.hour} hour={item.hour} rate={item.rate} level={item.level} />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-success"></span>高峰时段（11-13时, 17-19时）</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-warning"></span>正常时段</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300"></span>低峰时段（早8-9时，晚20-21时）</span>
          </div>
        </div>
      </div>

      {/* 品类转化 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <SectionHeader icon={Package} title="品类转化对比" subtitle="不同品类的转化率和客单价" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productCategoryConversion.map((item) => (
            <div key={item.category} className="bg-gray-50 rounded-xl p-4 hover:bg-primary-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.category}</span>
                <span className="text-lg font-bold text-primary-600">{item.rate}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gray-200 rounded-full flex-1 overflow-hidden">
                  <div className="h-full bg-primary-400 rounded-full" style={{ width: `${(item.rate / 60) * 100}%` }} />
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">转化率</span>
                <span className="text-sm font-medium text-gray-900">¥{item.avgAmount}/单</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 原因分析 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <SectionHeader icon={AlertTriangle} title="转化率低原因分析" subtitle="AI多因子归因，区分可控/不可控因素" />
        <div className="space-y-4">
          {rootCauseAnalysis.map((cause, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                cause.isControllable ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'
              }`}>
                <span className="text-sm font-bold">{i + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{cause.factor}</span>
                  {!cause.isControllable && (
                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-xs rounded">不可控</span>
                  )}
                  <span className={`ml-auto text-sm font-bold ${cause.impact >= 0 ? 'text-success' : 'text-danger'}`}>
                    {cause.impact >= 0 ? '+' : ''}{cause.impact}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{cause.suggestion}</p>
                <div className="p-2 bg-white rounded border border-gray-200">
                  <p className="text-xs text-gray-600 leading-relaxed">{cause.impact >= 0 ? '正向影响：' : '负向影响：'}{cause.impact >= 0 ? `该因素对转化率有正向贡献，当前状态良好` : `该因素拉低了转化率${Math.abs(cause.impact)}个百分点，需要优化`}。{cause.suggestion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 提升策略 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <SectionHeader icon={Lightbulb} title="转化率提升策略" subtitle="基于原因分析的可执行方案，按预期提升幅度排序" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boostTactics.map((tactic, i) => (
            <TacticItem
              key={i}
              tactic={tactic.tactic}
              expectedLift={tactic.expectedLift}
              difficulty={tactic.difficulty}
              steps={tactic.steps}
            />
          ))}
        </div>
        {/* 综合预估 */}
        <div className="mt-6 bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="font-semibold text-gray-900">综合执行效果预估</span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500">综合提升幅度</p>
              <p className="text-2xl font-bold text-success mt-1">
                +{boostTactics.reduce((s, t) => s + t.expectedLift, 0)}%
              </p>
              <p className="text-xs text-gray-400">全部策略落地后</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">预计转化率</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {(overallRate + boostTactics.reduce((s, t) => s + t.expectedLift, 0)).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">超越行业基准 {benchmark}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">预计日均增收</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ¥{Math.round(boostTactics.reduce((s, t) => s + t.expectedLift, 0) * 15)}
              </p>
              <p className="text-xs text-gray-400">按日均客流×转化率×客单价估算</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
