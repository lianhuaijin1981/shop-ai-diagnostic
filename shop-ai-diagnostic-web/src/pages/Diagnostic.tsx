import { useState } from 'react'
import { ScoreCard, AlertItem } from '@/components/common'
import { RadarChart } from '@/components/charts'
import { Lightbulb, ArrowRight } from 'lucide-react'

// Mock数据
const mockScores = {
  customerFlow: { score: 72, weight: 0.2, value: 89, benchmark: 100, trend: 'down' as const },
  conversion: { score: 65, weight: 0.25, value: 32, benchmark: 40, trend: 'down' as const },
  avgAmount: { score: 85, weight: 0.2, value: 183.1, benchmark: 180, trend: 'up' as const },
  repurchase: { score: 78, weight: 0.2, value: 45, benchmark: 50, trend: 'stable' as const },
  profit: { score: 82, weight: 0.15, value: 28.5, benchmark: 30, trend: 'up' as const },
}

const mockSuggestions = [
  {
    id: '1',
    dimension: 'conversion' as const,
    priority: 'high' as const,
    title: '提升转化率的5个技巧',
    description: '当前转化率偏低，建议从商品陈列、客户引导、促销活动等方面优化',
    action: '查看优化方案',
  },
  {
    id: '2',
    dimension: 'customerFlow' as const,
    priority: 'medium' as const,
    title: '增加门店引流的3个策略',
    description: '本周客流有所下降，建议通过线上推广、会员活动等方式吸引顾客',
    action: '查看引流方案',
  },
  {
    id: '3',
    dimension: 'repurchase' as const,
    priority: 'medium' as const,
    title: '会员复购激励计划',
    description: '老客户复购率有提升空间，建议推出会员专属优惠',
    action: '创建激励计划',
  },
]

const mockAlerts = [
  {
    id: '1',
    type: 'danger' as const,
    title: '转化率偏低',
    description: '当前转化率32%，低于目标值40%',
    time: '刚刚',
  },
  {
    id: '2',
    type: 'warning' as const,
    title: '客流下降',
    description: '本周客流较上周下降5%',
    time: '2小时前',
  },
]

const dimensionNames = {
  customerFlow: '客流',
  conversion: '转化',
  avgAmount: '客单价',
  repurchase: '复购',
  profit: '利润',
}

const indicators = ['客流', '转化', '客单价', '复购', '利润']

export function Diagnostic() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const totalScore =
    Object.values(mockScores).reduce((sum, s) => sum + s.score * s.weight, 0) * 10

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
          {['today', 'week', 'month', 'quarter'].map((period) => (
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
            <p className="text-5xl font-bold mt-2">{totalScore.toFixed(1)}</p>
            <p className="text-primary-100 text-sm mt-1">满分 100</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm">健康等级</p>
            <p className="text-3xl font-bold mt-2">
              {totalScore >= 80 ? '优秀' : totalScore >= 60 ? '良好' : '需改善'}
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
                value: Object.values(mockScores).map((s) => s.score * 10),
                max: [100, 100, 100, 100, 100],
              }}
              indicators={indicators}
            />
          </div>
        </div>

        {/* Score Cards */}
        <div className="lg:col-span-2 space-y-4">
          {(Object.keys(mockScores) as Array<keyof typeof mockScores>).map((key) => (
            <ScoreCard
              key={key}
              title={dimensionNames[key]}
              score={mockScores[key].score * 10}
              value={mockScores[key].value}
              benchmark={mockScores[key].benchmark}
              weight={mockScores[key].weight}
              trend={mockScores[key].trend}
              unit={key === 'avgAmount' ? '元' : key === 'conversion' || key === 'repurchase' ? '%' : ''}
            />
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-semibold text-gray-900">优化建议</h2>
        </div>
        <div className="space-y-4">
          {mockSuggestions.map((suggestion) => (
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
                    {dimensionNames[suggestion.dimension]}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{suggestion.description}</p>
              </div>
              <button className="flex items-center gap-1 text-primary-500 text-sm font-medium hover:text-primary-600">
                {suggestion.action}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
