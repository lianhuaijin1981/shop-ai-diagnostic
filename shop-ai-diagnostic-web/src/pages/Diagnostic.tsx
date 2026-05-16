import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ScoreCard, AlertItem } from '@/components/common'
import { RadarChart } from '@/components/charts'
import { diagnosticApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { Lightbulb, ArrowRight } from 'lucide-react'
import type { IFiveDimensionScores } from '@/types'

const dimensionNames: Record<string, string> = {
  customerFlow: '客流',
  conversion: '转化',
  avgAmount: '客单价',
  repurchase: '复购',
  profit: '利润',
}

const indicators = ['客流', '转化', '客单价', '复购', '利润']

export function Diagnostic() {
  const { currentShop } = useShopStore()
  const [selectedPeriod, setSelectedPeriod] = useState('week')

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

      {/* Suggestions - 来自真实API */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-semibold text-gray-900">优化建议</h2>
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
                <button className="flex items-center gap-1 text-primary-500 text-sm font-medium hover:text-primary-600 whitespace-nowrap">
                  {suggestion.action}
                  <ArrowRight className="w-4 h-4" />
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
    </div>
  )
}
