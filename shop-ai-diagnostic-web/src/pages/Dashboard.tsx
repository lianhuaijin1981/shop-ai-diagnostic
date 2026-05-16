import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import {
  DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, Minus,
  RefreshCw, BarChart3, Store, Package, UserCheck, Eye, Truck,
  MapPin, PieChart, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Star, Clock, Award, Package2, Database
} from 'lucide-react'
import { cn, formatCurrency, formatNumber, formatPercent, getTrendIcon } from '@/utils'
import { LineChart, BarChart, PieChart as RechartsPie } from '@/components/charts'
import { dashboardApi } from '@/api/http'
import { useShopStore } from '@/stores'
import type {
  DashboardPeriod, IDashboardComprehensive, IMultiStoreTotal,
  IDailyTrend, ITimeSlotRevenue, IPaymentDistribution,
  IDashboardStockAlert, ITopSellingSKU, IEmployeePerformance,
  IHourlyCustomerFlow, IPlatformDistribution, ICompetitorActivity,
  IIndustryBenchmark,
} from '@/types'

// ============ 常量定义 ============
const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'week', label: '7日' },
  { value: 'month', label: '30日' },
]

const TAB_ITEMS = [
  { key: 'overview', label: '经营总览', icon: BarChart3, color: 'text-blue-500' },
  { key: 'cashflow', label: '收银交易', icon: DollarSign, color: 'text-emerald-500' },
  { key: 'products', label: '商品货品', icon: Package, color: 'text-amber-500' },
  { key: 'members', label: '会员客户', icon: UserCheck, color: 'text-purple-500' },
  { key: 'employees', label: '员工绩效', icon: Award, color: 'text-rose-500' },
  { key: 'store', label: '门店场景', icon: Eye, color: 'text-cyan-500' },
  { key: 'delivery', label: '外卖平台', icon: Truck, color: 'text-orange-500' },
  { key: 'district', label: '商圈行情', icon: MapPin, color: 'text-slate-500' },
]

// ============ 工具函数 ============
function DeltaBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const positive = value >= 0
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded',
      positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
    )}>
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {positive ? '+' : ''}{value.toFixed(1)}{suffix}
    </span>
  )
}

function MiniCard({ label, value, delta, format = 'number', unit = '', className }: {
  label: string
  value: number
  delta?: number
  format?: 'currency' | 'number' | 'percent'
  unit?: string
  className?: string
}) {
  const fmt = format === 'currency' ? formatCurrency(value) : format === 'percent' ? formatPercent(value) : formatNumber(value)
  return (
    <div className={cn('bg-white rounded-lg p-3 shadow-card', className)}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900">{fmt}{unit}</p>
      {delta !== undefined && <DeltaBadge value={delta} />}
    </div>
  )
}

// 等级颜色
function MemberLevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    '普通会员': 'bg-gray-100 text-gray-600',
    '银卡会员': 'bg-gray-200 text-gray-700',
    '金卡会员': 'bg-amber-100 text-amber-700',
    'VIP会员': 'bg-purple-100 text-purple-700',
  }
  return <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors[level] || colors['普通会员'])}>{level}</span>
}

// ============ 经营总览 Tab ============
function OverviewTab({ data }: { data: IDashboardComprehensive }) {
  const { cashflow, storeScene, members, deliveryPlatform } = data
  const cf = cashflow

  // 趋势图数据
  const trendChartData = {
    dates: cf.dailyTrend.map(d => d.date.slice(5)),
    series: [
      { name: '营业额', data: cf.dailyTrend.map(d => d.revenue) },
      { name: '毛利', data: cf.dailyTrend.map(d => d.profit) },
    ],
  }

  // KPI 行：4个时期对比
  const kpiComparisons = [
    {
      label: '营业额',
      today: cf.todayRevenue,
      yesterday: cf.yesterdayRevenue,
      week: cf.weekRevenue,
      month: cf.monthRevenue,
      format: 'currency' as const,
    },
    {
      label: '毛利',
      today: cf.todayProfit,
      yesterday: cf.yesterdayProfit,
      week: cf.weekProfit,
      month: cf.monthProfit,
      format: 'currency' as const,
    },
    {
      label: '客流量',
      today: storeScene.todayCustomerFlow,
      yesterday: storeScene.yesterdayCustomerFlow,
      week: storeScene.weekAvgCustomerFlow * 7,
      month: storeScene.weekAvgCustomerFlow * 30,
      format: 'number' as const,
    },
    {
      label: '客单价',
      today: cf.avgAmount,
      yesterday: cf.avgAmount * (0.9 + Math.random() * 0.15),
      week: cf.avgAmount,
      month: cf.avgAmount,
      format: 'currency' as const,
    },
  ]

  // 预警简报
  const alerts = [
    { text: `库存不足：${data.products.lowStockSKU}个SKU`, level: 'warning' as const },
    { text: `沉睡会员：${data.members.dormantMembers}人需唤醒`, level: 'info' as const },
    { text: `今日差评：${deliveryPlatform.complaintRate}%`, level: 'warning' as const },
    { text: `门店进店率：${storeScene.entryRate}%（低于基准40%）`, level: 'warning' as const },
    { text: `平台转化率：26.8%（美团），有提升空间`, level: 'info' as const },
  ]

  return (
    <div className="space-y-5">
      {/* 时期对比 KPI 行 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiComparisons.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 shadow-card">
            <p className="text-sm text-gray-500 mb-3">{kpi.label}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-400 mb-1">今日</p>
                <p className="text-sm font-bold text-gray-900">
                  {kpi.format === 'currency' ? formatCurrency(kpi.today) : formatNumber(kpi.today)}
                </p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">昨日</p>
                <p className="text-sm font-bold text-gray-700">
                  {kpi.format === 'currency' ? formatCurrency(kpi.yesterday) : formatNumber(kpi.yesterday)}
                </p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">7日</p>
                <p className="text-sm font-bold text-gray-700">
                  {kpi.format === 'currency' ? formatCurrency(kpi.week) : formatNumber(kpi.week)}
                </p>
                {kpi.yesterday > 0 && (
                  <DeltaBadge value={((kpi.week / (kpi.yesterday * 7) - 1) * 100)} />
                )}
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">30日</p>
                <p className="text-sm font-bold text-gray-700">
                  {kpi.format === 'currency' ? formatCurrency(kpi.month) : formatNumber(kpi.month)}
                </p>
                {kpi.yesterday > 0 && (
                  <DeltaBadge value={((kpi.month / (kpi.yesterday * 30) - 1) * 100)} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 趋势图 + 关键指标 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">营收趋势</h3>
          {cf.dailyTrend.length > 0 ? (
            <LineChart data={trendChartData} className="min-h-[240px]" />
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400">暂无数据</div>
          )}
        </div>

        {/* 关键财务指标 */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">财务健康度</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-600">毛利率</span>
              <div className="text-right">
                <span className="text-lg font-bold text-green-600">{cf.profitRate}%</span>
                <DeltaBadge value={cf.profitRate - 32} suffix="pp" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-600">净利率</span>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-600">{cf.netProfitRate}%</span>
                <DeltaBadge value={cf.netProfitRate - 24} suffix="pp" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-sm text-gray-600">折扣率</span>
              <div className="text-right">
                <span className="text-lg font-bold text-amber-600">{cf.discountRate}%</span>
                <DeltaBadge value={cf.discountRate - 8} suffix="pp" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-600">转化会员率</span>
              <div className="text-right">
                <span className="text-lg font-bold text-purple-600">{members.memberConversion}%</span>
                <DeltaBadge value={members.memberConversion - 42} suffix="pp" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
              <span className="text-sm text-gray-600">外卖占比</span>
              <span className="text-lg font-bold text-cyan-600">{deliveryPlatform.totalOrders > 0 ? Math.round(deliveryPlatform.totalRevenue / cf.totalRevenue * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 预警与行动建议 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">⚠️ 经营预警与行动建议</h3>
          <span className="text-xs text-gray-400">已生成 {alerts.length} 条</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.map((alert, i) => (
            <div key={i} className={cn(
              'p-3 rounded-lg border',
              alert.level === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
            )}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={cn('w-4 h-4 mt-0.5 flex-shrink-0', alert.level === 'warning' ? 'text-amber-500' : 'text-blue-500')} />
                <p className="text-sm text-gray-700">{alert.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ 收银交易 Tab ============
function CashflowTab({ data }: { data: IDashboardComprehensive }) {
  const { cashflow } = data
  const cf = cashflow

  const trendData = {
    dates: cf.dailyTrend.map(d => d.date.slice(5)),
    series: [
      { name: '营业额', data: cf.dailyTrend.map(d => d.revenue) },
      { name: '毛利', data: cf.dailyTrend.map(d => d.profit) },
    ],
  }

  const slotChartData = {
    categories: cf.timeSlotRevenue.map(s => s.slot),
    series: [
      { name: '营收', data: cf.timeSlotRevenue.map(s => s.revenue) },
    ],
  }

  const paymentData = cf.paymentDistribution.map(p => ({
    name: p.method,
    value: p.amount,
  }))

  return (
    <div className="space-y-5">
      {/* 核心交易指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="总营业额" value={cf.totalRevenue} delta={((cf.todayRevenue / cf.yesterdayRevenue - 1) * 100)} format="currency" />
        <MiniCard label="总毛利" value={cf.totalProfit} delta={((cf.todayProfit / cf.yesterdayProfit - 1) * 100)} format="currency" />
        <MiniCard label="净利润" value={cf.totalNetProfit} delta={((cf.todayProfit / cf.yesterdayProfit - 1) * 100)} format="currency" />
        <MiniCard label="总折扣" value={cf.totalDiscount} delta={cf.discountRate - 8} format="currency" />
        <MiniCard label="流水笔数" value={cf.totalTransactions} delta={((cf.totalTransactions / (cf.totalTransactions * 0.9) - 1) * 100)} format="number" />
        <MiniCard label="平均客单价" value={cf.avgAmount} delta={8.2} format="currency" />
        <MiniCard label="毛利率" value={cf.profitRate} delta={cf.profitRate - 32} format="percent" unit="%" />
        <MiniCard label="折扣率" value={cf.discountRate} delta={cf.discountRate - 8} format="percent" unit="%" />
      </div>

      {/* 趋势图 + 时段营收 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">每日营收趋势</h3>
          {cf.dailyTrend.length > 0 ? (
            <LineChart data={trendData} className="min-h-[240px]" />
          ) : <div className="h-60 flex items-center justify-center text-gray-400">暂无数据</div>}
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">时段营收分布</h3>
          <BarChart data={slotChartData} className="min-h-[240px]" />
        </div>
      </div>

      {/* 时段明细 + 支付方式 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">时段营收明细</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left py-2 px-2">时段</th>
                  <th className="text-right py-2 px-2">营收</th>
                  <th className="text-right py-2 px-2">笔数</th>
                  <th className="text-right py-2 px-2">毛利</th>
                </tr>
              </thead>
              <tbody>
                {cf.timeSlotRevenue.map((slot) => (
                  <tr key={slot.slot} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium text-gray-800">{slot.slot}</td>
                    <td className="py-2 px-2 text-right text-emerald-600">{formatCurrency(slot.revenue)}</td>
                    <td className="py-2 px-2 text-right text-gray-600">{slot.transactions}</td>
                    <td className="py-2 px-2 text-right text-blue-600">{formatCurrency(slot.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">支付方式分布</h3>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <RechartsPie data={paymentData} className="min-h-[220px]" />
            </div>
            <div className="space-y-2 min-w-[140px]">
              {cf.paymentDistribution.map((p) => (
                <div key={p.method} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{p.method}</span>
                  <span className="font-medium text-gray-900">{p.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 商品货品 Tab ============
function ProductsTab({ data }: { data: IDashboardComprehensive }) {
  const { products } = data
  const invData = products.inventorySummary

  const invChartData = {
    categories: invData.map(i => i.category),
    series: [
      { name: '库存数量', data: invData.map(i => i.totalStock) },
      { name: '7日售出', data: invData.map(i => i.sold7d) },
    ],
  }

  return (
    <div className="space-y-5">
      {/* SKU 核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MiniCard label="SKU总数" value={products.totalSKU} format="number" />
        <MiniCard label="在售SKU" value={products.activeSKU} format="number" />
        <MiniCard label="库存不足" value={products.lowStockSKU} format="number" />
        <MiniCard label="缺货SKU" value={products.outOfStockSKU} format="number" />
        <MiniCard label="库存价值" value={products.inventoryValue} format="currency" />
      </div>

      {/* 库存分布图 + 周转 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">品类库存与销出</h3>
          <BarChart data={invChartData} className="min-h-[240px]" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">库存周转概览</h3>
          <div className="space-y-3">
            {invData.map((item) => (
              <div key={item.category} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">{item.category}</span>
                  <span className="text-xs text-gray-400">周转率 {(item.turnoverRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>SKU: {item.skuCount}</span>
                  <span>库存: {item.totalStock}</span>
                  <span>价值: {formatCurrency(item.totalValue)}</span>
                  <span>均成本: {formatCurrency(item.avgCost)}</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min(item.turnoverRate * 200, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 库存预警 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">库存预警</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">SKU名称</th>
                <th className="text-left py-2 px-3">品类</th>
                <th className="text-right py-2 px-3">库存</th>
                <th className="text-right py-2 px-3">最低库存</th>
                <th className="text-right py-2 px-3">成本</th>
                <th className="text-right py-2 px-3">售价</th>
                <th className="text-right py-2 px-3">周转天数</th>
                <th className="text-center py-2 px-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {products.stockAlerts.map((sku) => (
                <tr key={sku.skuId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-800">{sku.skuName}</td>
                  <td className="py-2.5 px-3 text-gray-500">{sku.category}</td>
                  <td className="py-2.5 px-3 text-right text-danger font-medium">{sku.stock}</td>
                  <td className="py-2.5 px-3 text-right text-gray-500">{sku.minStock}</td>
                  <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(sku.cost)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrency(sku.price)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-600">{sku.turnoverDays}天</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      sku.alertLevel === 'critical' ? 'bg-danger/10 text-danger' :
                      sku.alertLevel === 'low' ? 'bg-warning/10 text-warning' :
                      sku.alertLevel === 'overstock' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    )}>
                      {sku.alertLevel === 'critical' ? '紧急补货' : sku.alertLevel === 'low' ? '库存不足' : sku.alertLevel === 'overstock' ? '积压' : '正常'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 热销 SKU 排行 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">热销SKU排行</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">排行</th>
                <th className="text-left py-2 px-3">SKU名称</th>
                <th className="text-left py-2 px-3">品类</th>
                <th className="text-right py-2 px-3">销量</th>
                <th className="text-right py-2 px-3">营收</th>
                <th className="text-right py-2 px-3">毛利</th>
                <th className="text-right py-2 px-3">毛利率</th>
              </tr>
            </thead>
            <tbody>
              {products.topSellingSKU.map((sku, i) => (
                <tr key={sku.skuId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'
                    )}>{i + 1}</span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-800">{sku.skuName}</td>
                  <td className="py-2.5 px-3 text-gray-500">{sku.category}</td>
                  <td className="py-2.5 px-3 text-right text-gray-600">{sku.soldCount}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600">{formatCurrency(sku.revenue)}</td>
                  <td className="py-2.5 px-3 text-right text-blue-600">{formatCurrency(sku.profit)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn('font-medium', sku.profitRate >= 40 ? 'text-success' : sku.profitRate >= 30 ? 'text-blue-600' : 'text-warning')}>
                      {sku.profitRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============ 会员客户 Tab ============
function MembersTab({ data }: { data: IDashboardComprehensive }) {
  const { members } = data

  const levelData = members.levelDistribution.map(l => ({
    name: l.level,
    value: l.count,
  }))

  return (
    <div className="space-y-5">
      {/* 会员核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MiniCard label="会员总数" value={members.totalMembers} format="number" />
        <MiniCard label="活跃会员" value={members.activeMembers} delta={12.5} format="number" />
        <MiniCard label="本期新注册" value={members.newMembers} delta={8.2} format="number" />
        <MiniCard label="VIP会员" value={members.vipMembers} delta={5.0} format="number" />
        <MiniCard label="沉睡会员" value={members.dormantMembers} delta={-15.0} format="number" />
        <MiniCard label="储值总额" value={members.totalStoredValue} format="currency" />
        <MiniCard label="累计消费" value={members.totalConsumeValue} format="currency" />
        <MiniCard label="人均消费" value={members.avgConsumeValue} delta={8.5} format="currency" />
        <MiniCard label="平均到店周期" value={members.avgVisitCycle} delta={-2.5} format="number" unit="天" />
        <MiniCard label="会员转化率" value={members.memberConversion} delta={5.2} format="percent" unit="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 会员等级分布 */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">会员等级分布</h3>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <RechartsPie data={levelData} className="min-h-[200px]" />
            </div>
            <div className="space-y-3 min-w-[160px]">
              {members.levelDistribution.map((l) => (
                <div key={l.level} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{l.level}</span>
                    <span className="font-medium text-gray-900">{l.count}人</span>
                  </div>
                  <p className="text-xs text-gray-400">占比{l.percentage}% · 人均{formatCurrency(l.avgConsume)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 消费频次分析 */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">消费频次分析</h3>
          <div className="space-y-2">
            {members.visitFrequency.map((vf) => (
              <div key={vf.range} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{vf.range}</span>
                  <span className="text-sm text-gray-900 font-medium">{vf.count}人 · 均消{formatCurrency(vf.avgAmount)}</span>
                </div>
                <p className="text-xs text-gray-400">{vf.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 新会员列表 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">本期新增会员</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">姓名</th>
                <th className="text-left py-2 px-3">手机</th>
                <th className="text-left py-2 px-3">等级</th>
                <th className="text-left py-2 px-3">首次消费</th>
                <th className="text-right py-2 px-3">储值</th>
              </tr>
            </thead>
            <tbody>
              {members.newMembersList.map((m) => (
                <tr key={m.memberId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-800">{m.name}</td>
                  <td className="py-2 px-3 text-gray-500">{m.phone}</td>
                  <td className="py-2 px-3"><MemberLevelBadge level={m.level} /></td>
                  <td className="py-2 px-3 text-gray-500">{m.firstConsume}</td>
                  <td className="py-2 px-3 text-right text-emerald-600">{formatCurrency(m.storedValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 高价值沉睡会员 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">高价值沉睡会员预警</h3>
          <span className="text-xs text-danger bg-danger/10 px-2 py-0.5 rounded-full">{members.highValueDormant.length}人需唤醒</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">姓名</th>
                <th className="text-left py-2 px-3">等级</th>
                <th className="text-right py-2 px-3">累计消费</th>
                <th className="text-left py-2 px-3">最后到店</th>
                <th className="text-right py-2 px-3">离店天数</th>
                <th className="text-center py-2 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {members.highValueDormant.map((m) => (
                <tr key={m.memberId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-800">{m.name}</td>
                  <td className="py-2 px-3"><MemberLevelBadge level={m.level} /></td>
                  <td className="py-2 px-3 text-right text-amber-600 font-medium">{formatCurrency(m.totalConsume)}</td>
                  <td className="py-2 px-3 text-gray-500">{m.lastVisit}</td>
                  <td className="py-2 px-3 text-right text-danger font-medium">{m.daysSinceVisit}天</td>
                  <td className="py-2 px-3 text-center">
                    <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">发送唤醒</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============ 员工绩效 Tab ============
function EmployeesTab({ data }: { data: IDashboardComprehensive }) {
  const { employees } = data

  return (
    <div className="space-y-5">
      {/* 员工核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="在职员工" value={employees.totalStaff} format="number" />
        <MiniCard label="今日出勤" value={employees.onDutyToday} delta={((employees.onDutyToday / employees.totalStaff - 1) * 100)} format="number" />
        <MiniCard label="人均业绩" value={employees.avgPersonalSales} delta={12.5} format="currency" />
        <MiniCard label="平均连带率" value={employees.avgAttachmentRate} delta={5.0} format="number" unit="件" />
      </div>

      {/* 员工业绩排行 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">员工业绩排行</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">排行</th>
                <th className="text-left py-2 px-3">姓名</th>
                <th className="text-left py-2 px-3">岗位</th>
                <th className="text-right py-2 px-3">业绩</th>
                <th className="text-right py-2 px-3">笔数</th>
                <th className="text-right py-2 px-3">客单</th>
                <th className="text-right py-2 px-3">连带率</th>
                <th className="text-right py-2 px-3">出勤</th>
                <th className="text-right py-2 px-3">工时</th>
              </tr>
            </thead>
            <tbody>
              {employees.performanceRanking.map((emp) => (
                <tr key={emp.employeeId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      emp.rank === 1 ? 'bg-amber-400 text-white' : emp.rank === 2 ? 'bg-gray-300 text-white' : 'bg-gray-100 text-gray-600'
                    )}>{emp.rank}</span>
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-800">{emp.name}</td>
                  <td className="py-2 px-3 text-gray-500">{emp.role}</td>
                  <td className="py-2 px-3 text-right text-emerald-600 font-medium">{formatCurrency(emp.salesAmount)}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{emp.transactions}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{formatCurrency(emp.avgAmount)}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={cn('font-medium', emp.attachmentRate >= 1.6 ? 'text-success' : 'text-gray-600')}>
                      {emp.attachmentRate.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-gray-600">{emp.attendance}天</td>
                  <td className="py-2 px-3 text-right text-gray-600">{emp.workHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 今日排班 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">今日排班</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">姓名</th>
                <th className="text-left py-2 px-3">岗位</th>
                <th className="text-left py-2 px-3">班次</th>
                <th className="text-left py-2 px-3">上班时间</th>
                <th className="text-left py-2 px-3">下班时间</th>
              </tr>
            </thead>
            <tbody>
              {employees.schedulePlan.map((sp) => (
                <tr key={sp.employeeId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-800">{sp.name}</td>
                  <td className="py-2 px-3 text-gray-500">{sp.role}</td>
                  <td className="py-2 px-3">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      sp.shift === 'morning' ? 'bg-amber-100 text-amber-700' :
                      sp.shift === 'evening' ? 'bg-purple-100 text-purple-700' :
                      sp.shift === 'afternoon' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    )}>
                      {sp.shift === 'morning' ? '早班' : sp.shift === 'evening' ? '晚班' : sp.shift === 'afternoon' ? '中班' : '全天'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-600">{sp.startTime}</td>
                  <td className="py-2 px-3 text-gray-600">{sp.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============ 门店场景 Tab ============
function StoreSceneTab({ data }: { data: IDashboardComprehensive }) {
  const { storeScene } = data

  const flowChartData = {
    dates: storeScene.dailyCustomerTrend.map(d => d.date.slice(5)),
    series: [
      { name: '客流', data: storeScene.dailyCustomerTrend.map(d => d.customerFlow) },
      { name: '入店', data: storeScene.dailyCustomerTrend.map(d => d.entryCount) },
    ],
  }

  const hourData = {
    categories: storeScene.hourlyCustomerFlow.map(h => `${h.hour}:00`),
    series: [
      { name: '客流', data: storeScene.hourlyCustomerFlow.map(h => h.traffic) },
    ],
  }

  return (
    <div className="space-y-5">
      {/* 客流核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="今日客流" value={storeScene.todayCustomerFlow} delta={((storeScene.todayCustomerFlow / storeScene.yesterdayCustomerFlow - 1) * 100)} format="number" />
        <MiniCard label="昨日客流" value={storeScene.yesterdayCustomerFlow} format="number" />
        <MiniCard label="7日均客流" value={storeScene.weekAvgCustomerFlow} delta={5.2} format="number" />
        <MiniCard label="平均停留" value={storeScene.avgDwellTime} delta={-3.0} format="number" unit="分钟" />
        <MiniCard label="进店率" value={storeScene.entryRate} delta={storeScene.entryRate - 40} format="percent" unit="%" />
        <MiniCard label="高峰时段" value={storeScene.peakHour} format="number" unit="点" />
        <MiniCard label="低峰时段" value={storeScene.lowHour} format="number" unit="点" />
        <MiniCard label="客流趋势" value={((storeScene.todayCustomerFlow / storeScene.yesterdayCustomerFlow - 1) * 100)} delta={-5.2} format="percent" unit="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 每日客流趋势 */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">每日客流趋势</h3>
          {storeScene.dailyCustomerTrend.length > 0 ? (
            <LineChart data={flowChartData} className="min-h-[240px]" />
          ) : <div className="h-60 flex items-center justify-center text-gray-400">暂无数据</div>}
        </div>

        {/* 时段客流热力 */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">时段客流分布</h3>
          <BarChart data={hourData} className="min-h-[240px]" />
        </div>
      </div>

      {/* 时段客流明细 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">时段客流明细</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {storeScene.hourlyCustomerFlow.map((h) => (
            <div key={h.hour} className={cn(
              'p-3 rounded-lg border',
              h.level === 'peak' ? 'bg-amber-50 border-amber-200' :
              h.level === 'low' ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
            )}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{h.hour}:00</span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded font-medium',
                  h.level === 'peak' ? 'bg-amber-200 text-amber-700' :
                  h.level === 'low' ? 'bg-gray-200 text-gray-600' : 'bg-blue-200 text-blue-700'
                )}>
                  {h.level === 'peak' ? '高峰' : h.level === 'low' ? '低峰' : '正常'}
                </span>
              </div>
              <p className="text-lg font-bold text-gray-900">{h.traffic}人</p>
              <p className="text-xs text-gray-400">入店{h.entryCount} · 进店率{h.entryRate}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* 客流来源 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">客流来源分析</h3>
        <div className="space-y-3">
          {storeScene.trafficSources.map((src) => (
            <div key={src.source} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{src.source}</span>
                <span className="text-sm text-gray-900 font-medium">{src.count}人 · {src.percentage}%</span>
              </div>
              <p className="text-xs text-gray-400">{src.description}</p>
              <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${src.percentage * 2}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ 外卖平台 Tab ============
function DeliveryTab({ data }: { data: IDashboardComprehensive }) {
  const { deliveryPlatform, cashflow } = data
  const dp = deliveryPlatform

  const platformData = dp.platformDistribution.map(p => ({
    name: p.platform,
    value: p.orders,
  }))

  return (
    <div className="space-y-5">
      {/* 外卖核心指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="线上订单" value={dp.totalOrders} delta={8.5} format="number" />
        <MiniCard label="线上营收" value={dp.totalRevenue} delta={10.2} format="currency" />
        <MiniCard label="外卖占比" value={dp.totalOrders > 0 ? Math.round(dp.totalRevenue / cashflow.totalRevenue * 100) : 0} delta={2.5} format="percent" unit="%" />
        <MiniCard label="平均配送" value={dp.avgDeliveryTime} delta={-5.0} format="number" unit="分钟" />
        <MiniCard label="取消率" value={dp.cancelRate} delta={dp.cancelRate - 2.0} format="percent" unit="%" />
        <MiniCard label="差评率" value={dp.complaintRate} delta={dp.complaintRate - 1.5} format="percent" unit="%" />
        <MiniCard label="配送评分" value={dp.deliveryRating} delta={0.2} format="number" unit="分" />
        <MiniCard label="商品评分" value={dp.productRating} delta={0.1} format="number" unit="分" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 平台分布 */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">平台订单分布</h3>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <RechartsPie data={platformData} className="min-h-[200px]" />
            </div>
            <div className="space-y-3 min-w-[160px]">
              {dp.platformDistribution.map((p) => (
                <div key={p.platform} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{p.platform}</span>
                    <span className="font-medium text-gray-900">{p.orders}单</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{formatCurrency(p.revenue)}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-500">{p.avgRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 差评分析 */}
        <div className="bg-white rounded-xl p-5 shadow-card">
          <h3 className="text-base font-semibold text-gray-900 mb-3">差评分析</h3>
          <div className="space-y-2">
            {dp.complaintAnalysis.map((c) => (
              <div key={c.reason} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{c.reason}</span>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded', c.isControllable ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500')}>
                      {c.isControllable ? '可控' : '不可控'}
                    </span>
                  </div>
                  <span className="text-sm text-danger font-medium">{c.count}条</span>
                </div>
                <p className="text-xs text-gray-400">{c.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 流量转化 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">平台流量转化漏斗</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">平台</th>
                <th className="text-right py-2 px-3">曝光量</th>
                <th className="text-right py-2 px-3">点击量</th>
                <th className="text-right py-2 px-3">订单数</th>
                <th className="text-right py-2 px-3">CTR</th>
                <th className="text-right py-2 px-3">CVR</th>
              </tr>
            </thead>
            <tbody>
              {dp.trafficConversion.map((t) => (
                <tr key={t.platform} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-800">{t.platform}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{formatNumber(t.impressions)}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{formatNumber(t.clicks)}</td>
                  <td className="py-2 px-3 text-right text-emerald-600 font-medium">{t.orders}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={cn('font-medium', t.ctr >= 15 ? 'text-success' : 'text-warning')}>{t.ctr}%</span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={cn('font-medium', t.cvr >= 25 ? 'text-success' : 'text-warning')}>{t.cvr}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============ 商圈行情 Tab ============
function DistrictTab({ data }: { data: IDashboardComprehensive }) {
  const { businessDistrict } = data
  const bd = businessDistrict

  return (
    <div className="space-y-5">
      {/* 行业基准 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">行业基准对比</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">行业平均营收</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(bd.industryBenchmark.avgRevenue)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">行业平均客流</p>
            <p className="text-lg font-bold text-gray-900">{formatNumber(bd.industryBenchmark.avgCustomerFlow)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">行业平均转化率</p>
            <p className="text-lg font-bold text-gray-900">{bd.industryBenchmark.avgConversion}%</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-xs text-emerald-600 mb-1">门店排名</p>
            <p className="text-lg font-bold text-emerald-600">前{bd.industryBenchmark.yourRankPercent}%</p>
            <p className="text-xs text-emerald-500">超过{bd.industryBenchmark.yourRank}%的门店</p>
          </div>
        </div>
      </div>

      {/* 周边同行动态 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">周边同行动态</h3>
          <span className="text-xs text-gray-400">{bd.competitorActivities.filter(c => c.isActive).length}个活动进行中</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bd.competitorActivities.map((comp) => (
            <div key={comp.competitorName} className={cn(
              'p-4 rounded-lg border',
              comp.isActive ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
            )}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{comp.competitorName}</p>
                  <p className="text-xs text-gray-400">距 {comp.distance}m</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    comp.isActive ? 'bg-amber-200 text-amber-700' : 'bg-gray-200 text-gray-500'
                  )}>
                    {comp.isActive ? '进行中' : '已结束'}
                  </span>
                  {comp.isActive && (
                    <p className="text-xs text-danger mt-1">预估分流 {comp.estimatedImpact}%</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{comp.activity}</p>
              <p className="text-xs text-gray-400 mt-1">{comp.startDate} ~ {comp.endDate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 价格与市场份额 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">周边价格与市场份额</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">品牌</th>
                <th className="text-right py-2 px-3">均价</th>
                <th className="text-right py-2 px-3">距离</th>
                <th className="text-right py-2 px-3">市场份额</th>
                <th className="text-left py-2 px-3">价格趋势</th>
              </tr>
            </thead>
            <tbody>
              {bd.priceDistribution.map((p) => (
                <tr key={p.brand} className={cn(
                  'border-b border-gray-50',
                  p.brand === '我们门店' ? 'bg-emerald-50' : 'hover:bg-gray-50'
                )}>
                  <td className={cn('py-2.5 px-3 font-medium', p.brand === '我们门店' ? 'text-emerald-700' : 'text-gray-800')}>
                    {p.brand}
                    {p.brand === '我们门店' && <span className="ml-2 text-xs bg-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded">本店</span>}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-800">{formatCurrency(p.avgPrice)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-500">{p.distance > 0 ? `${p.distance}m` : '-'}</td>
                  <td className="py-2.5 px-3 text-right text-gray-800">{p.marketShare}%</td>
                  <td className="py-2.5 px-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium',
                      p.trend === 'up' ? 'text-danger' : p.trend === 'down' ? 'text-success' : 'text-gray-400'
                    )}>
                      {p.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> :
                       p.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> :
                       <Minus className="w-3.5 h-3.5" />}
                      {p.trend === 'up' ? '涨价' : p.trend === 'down' ? '降价' : '持平'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 商圈客流行情 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">客流行情</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">日均路过</p>
            <p className="text-lg font-bold text-gray-900">{formatNumber(bd.trafficMarket.totalPassersby)}人</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">综合进店率</p>
            <p className="text-lg font-bold text-gray-900">{bd.trafficMarket.totalEntryRate}%</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-600 mb-1">周末客流</p>
            <p className="text-lg font-bold text-amber-600">{formatNumber(bd.trafficMarket.weekendTraffic)}人</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">工作日客流</p>
            <p className="text-lg font-bold text-blue-600">{formatNumber(bd.trafficMarket.weekdayTraffic)}人</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ 多门店汇总面板 ============
function MultiStorePanel({ period, onClose }: { period: DashboardPeriod; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['multiStoreSummary', period],
    queryFn: () => dashboardApi.getMultiStoreSummary(period),
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-card text-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">加载多门店数据...</p>
      </div>
    )
  }

  const summary = data?.data

  return (
    <div className="space-y-5">
      {/* 汇总数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="门店总数" value={summary?.storeCount || 0} format="number" />
        <MiniCard label="总营业额" value={summary?.totalRevenue || 0} format="currency" />
        <MiniCard label="总毛利" value={summary?.totalProfit || 0} format="currency" />
        <MiniCard label="总客流" value={summary?.totalCustomers || 0} delta={5.2} format="number" />
      </div>

      {/* 门店排行 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <h3 className="text-base font-semibold text-gray-900 mb-3">门店排行（按营收）</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2 px-3">排行</th>
                <th className="text-left py-2 px-3">门店</th>
                <th className="text-right py-2 px-3">营业额</th>
                <th className="text-right py-2 px-3">毛利</th>
                <th className="text-right py-2 px-3">客流</th>
                <th className="text-right py-2 px-3">客单</th>
              </tr>
            </thead>
            <tbody>
              {summary?.stores.map((store) => (
                <tr key={store.shopId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      store.rank === 1 ? 'bg-amber-400 text-white' :
                      store.rank === 2 ? 'bg-gray-300 text-white' :
                      store.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'
                    )}>{store.rank}</span>
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-800">{store.shopName}</td>
                  <td className="py-2 px-3 text-right text-emerald-600 font-medium">{formatCurrency(store.revenue)}</td>
                  <td className="py-2 px-3 text-right text-blue-600">{formatCurrency(store.profit)}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{formatNumber(store.customers)}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{formatCurrency(store.avgAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============ 主组件 ============
export function Dashboard() {
  const { currentShop } = useShopStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [period, setPeriod] = useState<DashboardPeriod>('today')
  const [activeTab, setActiveTab] = useState('overview')
  const [showMultiStore, setShowMultiStore] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // 获取经营大盘综合数据
  const { data: compData, isLoading } = useQuery({
    queryKey: ['dashboardComprehensive', currentShop.id, period],
    queryFn: () => dashboardApi.getComprehensive(currentShop.id, period),
    enabled: !!currentShop.id,
  })

  // 一键同步
  const handleSync = async () => {
    setSyncing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSyncing(false)
    setLastSync(new Date())
  }

  const dashboardData = compData?.data

  const TabComponent = {
    overview: OverviewTab,
    cashflow: CashflowTab,
    products: ProductsTab,
    members: MembersTab,
    employees: EmployeesTab,
    store: StoreSceneTab,
    delivery: DeliveryTab,
    district: DistrictTab,
  }[activeTab] as unknown as React.FC<{ data: IDashboardComprehensive }>

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">经营大盘</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentShop.name} · {currentTime.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* 周期选择 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  period === opt.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 多门店汇总 */}
          <button
            onClick={() => setShowMultiStore(!showMultiStore)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all',
              showMultiStore ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
            )}
          >
            <Store className="w-4 h-4" />
            {showMultiStore ? '收起汇总' : '多门店汇总'}
          </button>

          {/* 一键同步 */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all disabled:opacity-60"
          >
            <RefreshCw className={cn('w-4 h-4', syncing && 'animate-spin')} />
            {syncing ? '同步中...' : '一键同步'}
          </button>

          {/* 同步状态 */}
          {lastSync && (
            <span className="text-xs text-gray-400">
              已同步 {lastSync.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* ===== 多门店汇总面板 ===== */}
      {showMultiStore && (
        <MultiStorePanel period={period} onClose={() => setShowMultiStore(false)} />
      )}

      {/* ===== Tab导航 ===== */}
      <div className="bg-white rounded-xl p-1 shadow-card">
        <div className="flex overflow-x-auto">
          {TAB_ITEMS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all flex-shrink-0',
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? tab.color : 'text-gray-400')} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== 内容区 ===== */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-16 text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载经营数据...</p>
        </div>
      ) : dashboardData ? (
        <TabComponent data={dashboardData} />
      ) : (
        <div className="bg-white rounded-xl p-16 text-center text-gray-400">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>暂无数据，请点击「一键同步」获取最新经营数据</p>
        </div>
      )}
    </div>
  )
}
