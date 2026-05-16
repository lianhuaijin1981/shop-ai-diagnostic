import { useState } from 'react'
import { BarChart, PieChart } from '@/components/charts'
import { formatCurrency, formatNumber } from '@/utils'
import { Package, TrendingUp, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react'

// Mock数据
const mockFastMoving = [
  { id: '1', name: '商品A', salesAmount: 12580, salesCount: 256, profit: 3890, rank: 1 },
  { id: '2', name: '商品B', salesAmount: 9860, salesCount: 198, profit: 2850, rank: 2 },
  { id: '3', name: '商品C', salesAmount: 8540, salesCount: 178, profit: 2450, rank: 3 },
  { id: '4', name: '商品D', salesAmount: 7620, salesCount: 156, profit: 2180, rank: 4 },
  { id: '5', name: '商品E', salesAmount: 6580, salesCount: 134, profit: 1890, rank: 5 },
]

const mockSlowMoving = [
  { id: '1', name: '商品X', salesAmount: 320, salesCount: 8, profit: 65, rank: 1 },
  { id: '2', name: '商品Y', salesAmount: 480, salesCount: 12, profit: 98, rank: 2 },
  { id: '3', name: '商品Z', salesAmount: 560, salesCount: 14, profit: 115, rank: 3 },
]

const mockStockAlerts = [
  { id: '1', name: '商品A', currentStock: 15, minStock: 50, level: 'critical' as const },
  { id: '2', name: '商品B', currentStock: 25, minStock: 40, level: 'low' as const },
  { id: '3', name: '商品C', currentStock: 60, minStock: 50, level: 'normal' as const },
]

const mockCategoryData = [
  { name: '食品类', value: 35000 },
  { name: '日用品', value: 28000 },
  { name: '服饰类', value: 18000 },
  { name: '数码类', value: 12000 },
  { name: '其他', value: 7000 },
]

export function ProductDiagnostic() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">货品诊断</h1>
          <p className="text-sm text-gray-500 mt-1">
            动销分析 · 滞销预警 · 库存管理
          </p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period === 'week' ? '本周' : period === 'month' ? '本月' : '本季'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10 text-success">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">动销商品数</p>
              <p className="text-xl font-bold text-gray-900">128 种</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">滞销商品数</p>
              <p className="text-xl font-bold text-gray-900">23 种</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-danger/10 text-danger">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">库存预警</p>
              <p className="text-xl font-bold text-gray-900">5 种</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">品类销售占比</h2>
          <div className="h-[300px]">
            <PieChart data={mockCategoryData} />
          </div>
        </div>

        {/* Sales Ranking */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">TOP 10 商品销售额</h2>
          <div className="h-[300px]">
            <BarChart
              data={{
                categories: mockFastMoving.slice(0, 5).map((p) => p.name),
                series: [
                  {
                    name: '销售额',
                    data: mockFastMoving.slice(0, 5).map((p) => p.salesAmount),
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Moving Products */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">动销排行</h2>
            <span className="text-sm text-primary-500 cursor-pointer hover:text-primary-600">
              查看全部
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500">排名</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500">商品</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500">销量</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500">销售额</th>
                </tr>
              </thead>
              <tbody>
                {mockFastMoving.slice(0, 5).map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          product.rank === 1
                            ? 'bg-warning text-white'
                            : product.rank === 2
                              ? 'bg-gray-300 text-white'
                              : product.rank === 3
                                ? 'bg-orange-300 text-white'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.rank}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium text-gray-900">{product.name}</td>
                    <td className="py-3 px-2 text-right text-gray-600">{formatNumber(product.salesCount)}</td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900">
                      {formatCurrency(product.salesAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow Moving Products */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">滞销预警</h2>
            <span className="text-sm text-warning cursor-pointer hover:text-warning/80">
              处理建议
            </span>
          </div>
          <div className="space-y-3">
            {mockSlowMoving.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ArrowDown className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    销量 {formatNumber(product.salesCount)}
                  </p>
                  <p className="text-xs text-danger">{formatCurrency(product.salesAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">库存预警</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockStockAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.level === 'critical'
                  ? 'border-danger bg-danger/5'
                  : alert.level === 'low'
                    ? 'border-warning bg-warning/5'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{alert.name}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    alert.level === 'critical'
                      ? 'bg-danger text-white'
                      : alert.level === 'low'
                        ? 'bg-warning text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {alert.level === 'critical' ? '紧急' : alert.level === 'low' ? '预警' : '正常'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                当前库存：{alert.currentStock} / 最低库存：{alert.minStock}
              </p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    alert.level === 'critical'
                      ? 'bg-danger'
                      : alert.level === 'low'
                        ? 'bg-warning'
                        : 'bg-success'
                  }`}
                  style={{ width: `${(alert.currentStock / alert.minStock) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
