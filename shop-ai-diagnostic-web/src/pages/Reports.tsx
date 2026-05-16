import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { FileText, Download, RefreshCw, Calendar, TrendingUp, ShoppingBag, Users, AlertCircle, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import type { IReport, IReportProduct } from '@/types'

export function Reports() {
  const { currentShop } = useShopStore()
  const queryClient = useQueryClient()
  const [generating, setGenerating] = useState(false)

  // 获取报告列表（演示模式下只有一份最新报告）
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', currentShop.id],
    queryFn: () => reportApi.getList(currentShop.id),
    enabled: !!currentShop.id,
  })

  // 生成新报告
  const generateMutation = useMutation({
    mutationFn: (period: string) => reportApi.generate(currentShop.id, period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setGenerating(false)
    },
  })

  const handleGenerate = (period: string) => {
    setGenerating(true)
    generateMutation.mutate(period)
  }

  const report = reportsData?.data?.[0] || null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getLevelLabel = (level: string) => {
    const map: Record<string, string> = { normal: '普通', silver: '白银', gold: '黄金', platinum: '白金' }
    return map[level] || level
  }

  const getLevelColor = (level: string) => {
    const map: Record<string, string> = {
      normal: 'bg-gray-100 text-gray-600',
      silver: 'bg-gray-200 text-gray-700',
      gold: 'bg-yellow-100 text-yellow-700',
      platinum: 'bg-purple-100 text-purple-700',
    }
    return map[level] || 'bg-gray-100 text-gray-80'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报告中心</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentShop.name} · 智能经营分析报告
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate('week')}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                生成周报
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : !report ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-card">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">暂无报告</p>
          <button
            onClick={() => handleGenerate('week')}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            生成第一份报告
          </button>
        </div>
      ) : (
        <>
          {/* 报告周期 */}
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDate(report.dateRange.start)} - {formatDate(report.dateRange.end)}
                </h2>
                <span className="ml-2 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded">
                  {report.period === 'weekly' ? '周报' : report.period === 'monthly' ? '月报' : '日报'}
                </span>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Download className="w-4 h-4" />
                导出PDF
              </button>
            </div>

            {/* 核心指标概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">总营收</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(report.summary.totalRevenue)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">交易笔数</p>
                <p className="text-2xl font-bold text-gray-900">{report.summary.totalTransactions}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">服务客户</p>
                <p className="text-2xl font-bold text-gray-900">{report.summary.totalCustomers}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">净利润</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(report.summary.todayProfit)}</p>
              </div>
            </div>

            {/* 五维得分 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                五维诊断得分
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {report.fiveDimensionScores && Object.entries(report.fiveDimensionScores).map(([key, val]: [string, any]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      {{ customerFlow: '客流', conversion: '转化', avgAmount: '客单', repurchase: '复购', profit: '利润' }[key]}
                    </p>
                    <p className={`text-xl font-bold ${val.score >= val.benchmark ? 'text-success' : 'text-warning'}`}>
                      {val.score}
                    </p>
                    <p className="text-xs text-gray-400">目标: {val.benchmark}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 热销商品 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary-500" />
                热销商品 TOP5
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">排名</th>
                      <th className="text-left py-2 text-gray-500 font-medium">商品名称</th>
                      <th className="text-right py-2 text-gray-500 font-medium">销量</th>
                      <th className="text-right py-2 text-gray-500 font-medium">销售额</th>
                      <th className="text-right py-2 text-gray-500 font-medium">利润</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topProducts?.map((p: IReportProduct) => (
                      <tr key={p.rank} className="border-b border-gray-50">
                        <td className="py-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            p.rank <= 3 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {p.rank}
                          </span>
                        </td>
                        <td className="py-3 text-gray-900">{p.name}</td>
                        <td className="py-3 text-right text-gray-600">{p.salesCount}</td>
                        <td className="py-3 text-right text-gray-900">{formatCurrency(p.salesAmount)}</td>
                        <td className="py-3 text-right text-success">{formatCurrency(p.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 客户分析 */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" />
                客户分析
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">新增客户</p>
                  <p className="text-2xl font-bold text-blue-700">{report.customerAnalysis?.newCustomers || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">回头客</p>
                  <p className="text-2xl font-bold text-green-700">{report.customerAnalysis?.returningCustomers || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 mb-1">VIP客户</p>
                  <p className="text-2xl font-bold text-purple-700">{report.customerAnalysis?.vipCustomers || 0}</p>
                </div>
              </div>
            </div>

            {/* AI建议 */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                AI 经营建议
              </h3>
              <div className="space-y-2">
                {report.recommendations?.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
