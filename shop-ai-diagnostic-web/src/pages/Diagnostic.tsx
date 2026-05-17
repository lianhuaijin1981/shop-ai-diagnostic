import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ScoreCard, AlertItem } from '@/components/common'
import { RadarChart } from '@/components/charts'
import { diagnosticApi, aiPlanApi } from '@/api/http'
import { useShopStore } from '@/stores'
import {
  Lightbulb, ArrowRight, X, Loader2, Sparkles, Target, CheckCircle2,
  AlertTriangle, TrendingUp, Calendar, User, FileText, LogOut,
} from 'lucide-react'
import type { IFiveDimensionScores } from '@/types'

const dimensionNames: Record<string, string> = {
  customerFlow: '客流',
  conversion: '转化',
  avgAmount: '客单价',
  repurchase: '复购',
  profit: '利润',
}

const indicators = ['客流', '转化', '客单价', '复购', '利润']

// ============ AI方案弹窗 ============
interface AIPlanModalProps {
  open: boolean
  onClose: () => void
  suggestion: {
    id: string
    dimension: string
    title: string
    description: string
    priority: string
    action: string
    expectedEffect?: string
  } | null
  shopId: string
}

function AIPlanModal({ open, onClose, suggestion, shopId }: AIPlanModalProps) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<{
    background: string
    targetGoal: string
    specificMeasures: string[]
    implementSteps: Array<{ step: number; action: string; timeline: string; owner: string }>
    expectedEffect: string
    riskWarning: string
    exitMechanism: string
    referenceCase: string
  } | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!suggestion) return
    setLoading(true)
    setError('')
    setPlan(null)
    try {
      const res = await aiPlanApi.generatePlan({
        shopId,
        dimension: suggestion.dimension,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
      })
      setPlan(res.data as any)
    } catch (e: any) {
      setError(e?.message || 'AI 方案生成失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (!open || !suggestion) return null

  const priorityLabel = suggestion.priority === 'high' ? '高优先级' : suggestion.priority === 'medium' ? '中优先级' : '低优先级'
  const priorityColor = suggestion.priority === 'high' ? 'text-danger bg-danger/10' : suggestion.priority === 'medium' ? 'text-warning bg-warning/10' : 'text-gray-500 bg-gray-100'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityColor}`}>{priorityLabel}</span>
              <span className="text-xs text-gray-500">{dimensionNames[suggestion.dimension] || suggestion.dimension}维度</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{suggestion.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 未生成时的引导 */}
          {!plan && !loading && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI 生成完整落地方案</h4>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                基于门店实时经营数据，结合大刘整套线下实体运营方法论，为您生成可直接落地的执行方案
              </p>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors mx-auto font-medium"
              >
                <Sparkles className="w-4 h-4" />
                立即生成方案
              </button>
            </div>
          )}

          {/* 加载中 */}
          {loading && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">AI 正在分析经营数据，生成专属方案...</p>
              <p className="text-sm text-gray-400 mt-1">预计需要 5-10 秒</p>
            </div>
          )}

          {/* 错误 */}
          {error && (
            <div className="p-4 bg-danger/5 border border-danger/20 rounded-xl">
              <div className="flex items-center gap-2 text-danger mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">生成失败</span>
              </div>
              <p className="text-sm text-gray-600">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                重新生成
              </button>
            </div>
          )}

          {/* 方案内容 */}
          {plan && (
            <div className="space-y-5 animate-fade-in">
              {/* 问题背景 */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">问题背景</span>
                </div>
                <p className="text-sm text-amber-700">{plan.background}</p>
              </div>

              {/* 目标指标 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">目标指标</span>
                </div>
                <p className="text-sm text-blue-700">{plan.targetGoal}</p>
              </div>

              {/* 具体措施 */}
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-semibold text-gray-800">具体措施</span>
                </div>
                <div className="space-y-2">
                  {plan.specificMeasures.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span>{m}</span>
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
                  {plan.implementSteps.map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-primary-50 border border-primary-200 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">{s.step}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{s.action}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{s.timeline}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" />负责人：{s.owner}
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
                  <span className="text-sm font-semibold text-success">预期效果</span>
                </div>
                <p className="text-sm text-gray-700">{plan.expectedEffect}</p>
              </div>

              {/* 风险提示 */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-700">风险提示</span>
                </div>
                <p className="text-sm text-orange-700">{plan.riskWarning}</p>
              </div>

              {/* 退出机制 */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <LogOut className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">退出机制</span>
                </div>
                <p className="text-sm text-gray-600">{plan.exitMechanism}</p>
              </div>

              {/* 参考案例 */}
              {plan.referenceCase && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold text-purple-700">参考案例</span>
                  </div>
                  <p className="text-sm text-purple-700">{plan.referenceCase}</p>
                </div>
              )}

              {/* 重新生成 */}
              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  重新生成
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-400">由 AI 基于门店实时数据生成，仅供参考</p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-white transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ 主页面 ============

export function Diagnostic() {
  const { currentShop } = useShopStore()
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<{
    id: string
    dimension: string
    title: string
    description: string
    priority: string
    action: string
    expectedEffect?: string
  } | null>(null)

  // 获取五维诊断数据
  const { data: diagData, isLoading } = useQuery({
    queryKey: ['fiveDimension', currentShop.id, selectedPeriod],
    queryFn: () => diagnosticApi.getFiveDimension({
      shopId: currentShop.id,
      period: selectedPeriod as 'today' | 'week' | 'month' | 'quarter',
    }),
    enabled: !!currentShop.id,
    refetchInterval: 120000,
  })

  const diag = diagData?.data
  const scores = diag?.scores as IFiveDimensionScores | undefined
  const totalScore = diag?.totalScore || 0
  const suggestions = diag?.suggestions || []

  // 计算雷达图数据
  const radarValue = scores
    ? [
        scores.customerFlow.score,
        scores.conversion.score,
        scores.avgAmount.score,
        scores.repurchase.score,
        scores.profit.score,
      ]
    : [0, 0, 0, 0, 0]

  const handleSuggestionClick = (suggestion: (typeof suggestions)[0]) => {
    setSelectedSuggestion({
      id: suggestion.id,
      dimension: suggestion.dimension,
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority,
      action: suggestion.action,
      expectedEffect: suggestion.expectedEffect,
    })
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">五维诊断</h1>
          <p className="text-sm text-gray-500 mt-1">
            客流 · 转化 · 客单价 · 复购 · 利润
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
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period === 'today' ? '今日' : period === 'week' ? '本周' : period === 'month' ? '本月' : '本季'}
            </button>
          ))}
        </div>
      </div>

      {/* Total Score */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">综合健康得分</p>
            <p className="text-5xl font-bold mt-2">{isLoading ? '...' : totalScore.toFixed(1)}</p>
            <p className="text-primary-100 text-sm mt-1">满分 100</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm">健康等级</p>
            <p className="text-3xl font-bold mt-2">
              {isLoading ? '...' : totalScore >= 80 ? '优秀' : totalScore >= 60 ? '良好' : '需改善'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">五维雷达图</h2>
          <div className="h-[350px]">
            <RadarChart
              data={{
                name: '诊断得分',
                value: radarValue,
                max: [100, 100, 100, 100, 100],
              }}
              indicators={indicators}
            />
          </div>
        </div>

        {/* Score Cards */}
        <div className="lg:col-span-2 space-y-4">
          {scores ? (
            (Object.keys(scores) as Array<keyof IFiveDimensionScores>).map((key) => (
              <ScoreCard
                key={key}
                title={dimensionNames[key]}
                score={scores[key].score}
                value={scores[key].value}
                benchmark={scores[key].benchmark}
                weight={scores[key].weight}
                trend={scores[key].trend}
                unit={key === 'avgAmount' ? '元' : key === 'conversion' || key === 'repurchase' ? '%' : ''}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              {isLoading ? '加载诊断数据...' : '暂无数据'}
            </div>
          )}
        </div>
      </div>

      {/* Suggestions - 支持AI生成方案 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-semibold text-gray-900">优化建议</h2>
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            点击按钮可调用 AI 生成完整落地方案
          </span>
        </div>
        <div className="space-y-4">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        suggestion.priority === 'high'
                          ? 'bg-danger/10 text-danger'
                          : suggestion.priority === 'medium'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {suggestion.priority === 'high' ? '高优' : suggestion.priority === 'medium' ? '中优' : '低优'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {dimensionNames[suggestion.dimension] || suggestion.dimension}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{suggestion.description}</p>
                  {suggestion.expectedEffect && (
                    <p className="text-xs text-success mt-1">预期效果：{suggestion.expectedEffect}</p>
                  )}
                </div>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {suggestion.action}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              {isLoading ? '加载建议中...' : '暂无优化建议'}
            </div>
          )}
        </div>
      </div>

      {/* AI 方案弹窗 */}
      <AIPlanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        suggestion={selectedSuggestion}
        shopId={currentShop.id}
      />
    </div>
  )
}
