import { useState, useCallback, useEffect, useMemo } from 'react'
import { BarChart, PieChart, LineChart } from '@/components/charts'
import { productDiagnosticApi } from '@/api/http'
import type {
  IProductStructureDiag, INewVsOldRatio, IProductRoleStructure,
  ICategoryStructureDiag, ISizeColorStockDiag,
  ISalesVelocityDiag, IVelocityClassification, ISlowMovingBacklog, ISlowMovingRootCause, IRootCauseLocation,
  IInventoryRiskDiag, IBacklogAlert, IStockoutAlert, ICrossSeasonRisk, ITurnoverRating,
  IOperationSolution, IClearancePlan, IReplenishmentSuggestion, INewProductSelection, IDisplayPriority,
} from '@/types'
import {
  Package, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, AlertCircle,
  CheckCircle, XCircle, BarChart3, PieChart as PieIcon, LineChart as LineIcon,
  Layers, ShoppingBag, Truck, ShieldAlert, RefreshCw, Download,
  ThumbsUp, ThumbsDown, Minus, Zap, ArrowRight, Info, Star,
  Clock, Calendar, MapPin, Weight, TrendingDown, Activity,
  FileText, ShoppingCart, Percent, DollarSign, TruckIcon,
} from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils'

// ============ 工具函数 ============
function classNames(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

function getDiagLevel(level: string) {
  if (level === 'balanced' || level === 'healthy') return { color: 'text-success', bg: 'bg-success/10', label: '健康' }
  if (level === 'new_heavy' || level === 'old_heavy' || level === 'imbalanced' || level === 'high' || level === 'critical')
    return { color: 'text-danger', bg: 'bg-danger/10', label: '危险' }
  if (level === 'medium') return { color: 'text-warning', bg: 'bg-warning/10', label: '预警' }
  return { color: 'text-gray-500', bg: 'bg-gray-100', label: '正常' }
}

function getVelocityBadge(level: string) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    hot:    { color: 'text-rose-600',   bg: 'bg-rose-100',   label: '爆款' },
    normal:  { color: 'text-blue-600',   bg: 'bg-blue-100',   label: '平销款' },
    slow:    { color: 'text-amber-600',  bg: 'bg-amber-100',  label: '慢销款' },
    dead:    { color: 'text-gray-500',   bg: 'bg-gray-100',   label: '死款' },
  }
  return map[level] || { color: 'text-gray-500', bg: 'bg-gray-100', label: level }
}

function getUrgencyBadge(urgency: string) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    high:   { color: 'text-red-700',   bg: 'bg-red-100',    label: '紧急' },
    medium: { color: 'text-amber-700', bg: 'bg-amber-100',  label: '中等' },
    low:    { color: 'text-blue-700',  bg: 'bg-blue-100',   label: '较低' },
  }
  return map[urgency] || { color: 'text-gray-500', bg: 'bg-gray-100', label: urgency }
}

function getTurnoverRatingBadge(rating: string) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    A: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'A（优秀）' },
    B: { color: 'text-blue-700',    bg: 'bg-blue-100',    label: 'B（良好）' },
    C: { color: 'text-amber-700',   bg: 'bg-amber-100',   label: 'C（一般）' },
    D: { color: 'text-red-700',     bg: 'bg-red-100',      label: 'D（较差）' },
  }
  return map[rating] || { color: 'text-gray-500', bg: 'bg-gray-100', label: rating }
}

// ============ Tab 配置 ============
const TABS = [
  { key: 'structure',   label: '货品结构诊断',   icon: Layers },
  { key: 'velocity',    label: '动销滞销判定',   icon: Activity },
  { key: 'risk',        label: '库存风险诊断',   icon: ShieldAlert },
  { key: 'solution',    label: '运营解决方案',   icon: FileText },
]

const PERIODS = [
  { key: 'today', label: '今日' },
  { key: 'week',  label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '本季' },
]

// ============ 主组件 ============
export function ProductDiagnostic() {
  const [activeTab, setActiveTab] = useState<string>('structure')
  const [period, setPeriod] = useState<string>('week')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // 四类数据
  const [structureData, setStructureData]   = useState<IProductStructureDiag | null>(null)
  const [velocityData, setVelocityData]     = useState<ISalesVelocityDiag | null>(null)
  const [riskData, setRiskData]             = useState<IInventoryRiskDiag | null>(null)
  const [solutionData, setSolutionData]     = useState<IOperationSolution | null>(null)

  // 获取所有数据
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        productDiagnosticApi.getProductStructure('shop_1', period),
        productDiagnosticApi.getSalesVelocity('shop_1', period),
        productDiagnosticApi.getInventoryRisk('shop_1', period),
        productDiagnosticApi.getOperationSolution('shop_1'),
      ])
      setStructureData(r1.data || null)
      setVelocityData(r2.data || null)
      setRiskData(r3.data || null)
      setSolutionData(r4.data || null)
    } catch (e: any) {
      setError(e?.message || '数据获取失败')
    } finally {
      setLoading(false)
    }
  }, [period])

  // 初始加载 + 周期切换时重新获取
  useEffect(() => { fetchAll() }, [period])

  // ============ 渲染：货品结构诊断 ============
  const renderStructureTab = () => {
    if (!structureData) return <div className="text-center py-20 text-gray-400">暂无数据</div>

    const { newVsOld, roleStructure, categoryStructure, sizeColorStock } = structureData

    // 新款/老款饼图数据
    const newOldPie = [
      { name: '新款', value: Math.round(newVsOld.newArrivalRatio * 100) },
      { name: '老款', value: Math.round(newVsOld.oldArrivalRatio * 100) },
    ]

    // 品类结构横向对比数据
    const catBar = {
      categories: categoryStructure.categories.map(c => c.category),
      series: [
        { name: '实际占比(%)', data: categoryStructure.categories.map(c => Math.round(c.salesRatio)) },
        { name: '基准占比(%)', data: categoryStructure.categories.map(c => categoryStructure.benchmark[c.category] || 10) },
      ],
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* 3.3.1.1 新款/老款占比分析 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-primary-500" /> 新款 / 老款占比分析
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[280px]">
              <PieChart data={newOldPie} />
            </div>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${newVsOld.diagnosis === 'balanced' ? 'bg-success/5 border border-success/20' : 'bg-danger/5 border border-danger/20'}`}>
                <p className="text-sm font-semibold mb-1">
                  诊断结论：
                  {newVsOld.diagnosis === 'balanced' ? '✅ 新款/老款比例健康' : newVsOld.diagnosis === 'new_heavy' ? '⚠️ 新款占比过高' : '⚠️ 老款占比过高'}
                </p>
                <p className="text-sm text-gray-600">{newVsOld.issue || '结构合理'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">新款占比</p>
                  <p className="text-xl font-bold text-gray-900">{newVsOld.newArrivalRatio}%</p>
                  <p className="text-xs text-gray-400">销售额占比 {newVsOld.newArrivalSalesRatio}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">老款占比</p>
                  <p className="text-xl font-bold text-gray-900">{newVsOld.oldArrivalRatio}%</p>
                  <p className="text-xs text-gray-400">销售额占比 {newVsOld.oldArrivalSalesRatio}%</p>
                </div>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                <p className="text-sm font-medium text-primary-700">💡 建议</p>
                <p className="text-sm text-primary-600 mt-1">{newVsOld.suggestion}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3.3.1.2 引流款/利润款/形象款结构 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" /> 引流款 / 利润款 / 形象款结构占比
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[280px]">
              <BarChart data={{
                categories: roleStructure.roles.map(r => r.roleLabel),
                series: [
                  { name: 'SKU数', data: roleStructure.roles.map(r => r.skuCount) },
                  { name: '销售额占比(%)', data: roleStructure.roles.map(r => Math.round(r.salesRatio)) },
                ],
              }} />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold mb-2">理想结构 vs 实际结构</p>
                <div className="space-y-2">
                  {roleStructure.roles.map(role => (
                    <div key={role.role} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{role.roleLabel}</span>
                      <span className={`font-medium ${role.role === 'profit' && role.salesRatio < 40 ? 'text-danger' : 'text-gray-900'}`}>
                        实际 {Math.round(role.salesRatio)}% / 理想 {roleStructure.idealStructure[role.role as keyof typeof roleStructure.idealStructure]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {roleStructure.issues.length > 0 && (
                <div className="p-3 bg-danger/5 rounded-lg border border-danger/20">
                  <p className="text-sm font-semibold text-danger mb-1">⚠️ 存在问题</p>
                  {roleStructure.issues.map((iss, i) => (
                    <p key={i} className="text-sm text-gray-600">{iss}</p>
                  ))}
                </div>
              )}
              {roleStructure.suggestions.length > 0 && (
                <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <p className="text-sm font-medium text-primary-700 mb-1">💡 优化建议</p>
                  {roleStructure.suggestions.map((sug, i) => (
                    <p key={i} className="text-sm text-primary-600">{sug}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3.3.1.3 品类结构失衡诊断 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-primary-500" /> 品类结构失衡诊断
          </h3>
          <div className="h-[260px] mb-4">
            <BarChart data={catBar} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">品类</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">实际占比</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">基准占比</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">毛利率</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">周转天数</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {categoryStructure.categories.map((cat, i) => {
                  const bench = categoryStructure.benchmark[cat.category] || 10
                  const statusMap: Record<string, { label: string; cls: string }> = {
                    healthy:      { label: '健康', cls: 'bg-success/10 text-success' },
                    over_weight:  { label: '占比过高', cls: 'bg-danger/10 text-danger' },
                    under_weight: { label: '占比不足', cls: 'bg-warning/10 text-warning' },
                    declining:     { label: '衰退', cls: 'bg-danger/10 text-danger' },
                  }
                  const st = statusMap[cat.status] || statusMap.healthy!
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-900">{cat.category}</td>
                      <td className={`py-2 px-3 text-right font-medium ${cat.salesRatio > bench * 1.3 ? 'text-danger' : cat.salesRatio < bench * 0.7 ? 'text-warning' : 'text-gray-900'}`}>{Math.round(cat.salesRatio)}%</td>
                      <td className="py-2 px-3 text-right text-gray-500">{bench}%</td>
                      <td className="py-2 px-3 text-right text-gray-900">{Math.round(cat.profitRate)}%</td>
                      <td className="py-2 px-3 text-right text-gray-900">{Math.round(cat.turnoverDays)}天</td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {categoryStructure.diagnosis && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${categoryStructure.imbalancedCategories.length > 0 ? 'bg-warning/5 border border-warning/20' : 'bg-success/5 border border-success/20'}`}>
              {categoryStructure.diagnosis}
            </div>
          )}
        </section>

        {/* 3.3.1.4 尺码颜色库存结构诊断 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> 尺码 / 颜色库存结构诊断
          </h3>
          <div className="mb-3 flex items-center gap-4">
            <span className="text-sm text-gray-500">问题SKU：</span>
            <span className="text-lg font-bold text-danger">{sizeColorStock.unreasonableSKU}</span>
            <span className="text-sm text-gray-500">/ 总计 {sizeColorStock.totalSKU} SKU</span>
            <span className="ml-auto text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              问题率 {sizeColorStock.unreasonableRate}%
            </span>
          </div>
          <div className="space-y-3">
            {sizeColorStock.issues.map((iss, i) => (
              <div key={i} className="p-4 border rounded-lg border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900">{iss.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    iss.issueType === 'size_imbalanced' ? 'bg-blue-100 text-blue-700' :
                    iss.issueType === 'color_imbalanced' ? 'bg-purple-100 text-purple-700' :
                    iss.issueType === 'over_stock' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {iss.issueType === 'size_imbalanced' ? '尺码不均' : iss.issueType === 'color_imbalanced' ? '颜色不均' : iss.issueType === 'over_stock' ? '库存过高' : '死库存'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{iss.issueDesc}</p>
                <p className="text-sm text-primary-600">💡 {iss.suggestion}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 综合诊断结论 */}
        <section className="bg-white rounded-xl p-6 shadow-card border-l-4 border-primary-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 货品结构综合诊断结论</h3>
          <p className="text-gray-700 mb-3">{structureData.overallDiagnosis}</p>
          <div className="space-y-1">
            {structureData.suggestions.map((s, i) => (
              <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span> {s}
              </p>
            ))}
          </div>
        </section>
      </div>
    )
  }

  // ============ 渲染：动销滞销智能判定 ============
  const renderVelocityTab = () => {
    if (!velocityData) return <div className="text-center py-20 text-gray-400">暂无数据</div>

    const { velocityClassification, slowMovingBacklog, slowMovingRootCause, rootCauseLocation } = velocityData

    // 动销分类汇总
    const velSummary = velocityClassification.categories.map(c => ({ name: c.levelLabel, value: c.skuCount }))
    const velDetail = velocityClassification.categories.find(c => c.level === 'hot')?.skus.slice(0, 5).map(s => ({ name: s.name, value: s.salesCount })) || []

    return (
      <div className="space-y-6 animate-fade-in">
        {/* 3.3.2.1 自动划分：爆款/平销款/慢销款/死款 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-500" /> 动销智能分类
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {velocityClassification.categories.map(cat => {
              const badge = getVelocityBadge(cat.level)
              return (
                <div key={cat.level} className="p-4 rounded-xl border bg-white border-gray-200 hover:shadow-md transition-shadow">
                  <div className={`inline-flex px-2 py-0.5 rounded text-xs font-bold mb-2 ${badge.bg} ${badge.color}`}>{badge.label}</div>
                  <p className="text-2xl font-bold text-gray-900">{cat.skuCount}<span className="text-sm font-normal text-gray-500"> SKU</span></p>
                  <p className="text-xs text-gray-500 mt-1">日均销量 {cat.avgSalesPerDay}/天</p>
                  <p className="text-xs text-gray-400">积压价值 ¥{formatNumber(cat.totalBacklogValue)}</p>
                </div>
              )
            })}
          </div>
          {/* 各类明细表 */}
          {velocityClassification.categories.map(cat => cat.skus.length > 0 && (
            <div key={cat.level} className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{getVelocityBadge(cat.level).label}明细</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 font-medium text-gray-500">SKU</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">名称</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">销量</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">库存</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">距上次销售</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">动销评分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.skus.map((sku, j) => (
                      <tr key={j} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-500">{sku.sku}</td>
                        <td className="py-2 px-3 font-medium text-gray-900">{sku.name}</td>
                        <td className="py-2 px-3 text-right">{sku.salesCount}</td>
                        <td className={`py-2 px-3 text-right ${sku.stock < 10 ? 'text-danger font-medium' : 'text-gray-900'}`}>{sku.stock}</td>
                        <td className={`py-2 px-3 text-right text-sm ${sku.daysSinceLastSale > 30 ? 'text-danger' : sku.daysSinceLastSale > 7 ? 'text-amber-600' : 'text-success'}`}>{sku.daysSinceLastSale}天</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            sku.velocityScore > 70 ? 'bg-success/10 text-success' : sku.velocityScore > 40 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                          }`}>
                            {Math.round(sku.velocityScore)}分
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <span className="font-semibold">分类规则：</span>
            {`爆款=连续14天每天销量≥5件 | 平销款=连续30天有销量 | 慢销款=连续30天销量<10件 | 死款=连续60天无销量`}
          </div>
        </section>

        {/* 3.3.2.2 滞销货品积压金额统计 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-danger" /> 滞销货品积压金额统计
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-danger/5 rounded-xl border border-danger/20">
              <p className="text-sm text-gray-500">滞销积压总金额</p>
              <p className="text-2xl font-bold text-danger">¥{formatNumber(slowMovingBacklog.totalBacklogValue)}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-gray-500">滞销SKU数</p>
              <p className="text-2xl font-bold text-amber-700">{slowMovingBacklog.totalBacklogSKU}<span className="text-sm font-normal"> 个</span></p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">按品类分解</p>
              <div className="space-y-1 mt-1">
                {slowMovingBacklog.backlogByCategory.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-600">{c.category}</span>
                    <span className="text-gray-900 font-medium">¥{formatNumber(c.backlogValue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">SKU</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">名称</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">成本积压</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">吊牌总额</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">库存天数</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">紧急度</th>
                </tr>
              </thead>
              <tbody>
                {slowMovingBacklog.backlogDetails.map((d, i) => {
                  const ub = getUrgencyBadge(d.urgency)
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-500">{d.sku}</td>
                      <td className="py-2 px-3 font-medium text-gray-900">{d.name}</td>
                      <td className="py-2 px-3 text-right text-danger">¥{formatNumber(d.costValue)}</td>
                      <td className="py-2 px-3 text-right text-gray-400">¥{formatNumber(d.retailValue)}</td>
                      <td className={`py-2 px-3 text-right text-sm ${d.daysInStock > 90 ? 'text-danger font-medium' : d.daysInStock > 60 ? 'text-amber-600' : 'text-gray-500'}`}>{d.daysInStock}天</td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${ub.bg} ${ub.color}`}>{ub.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3.3.2.3 季节性/款式/定价滞销区分 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-primary-500" /> 滞销根因分析
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[240px]">
              <PieChart data={slowMovingRootCause.causes.map(c => ({ name: c.causeLabel, value: c.percentage }))} />
            </div>
            <div className="space-y-3">
              {slowMovingRootCause.causes.map((c, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{c.causeLabel}</span>
                    <span className="text-sm text-gray-500">{c.percentage}% · {c.skuCount} SKU</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">积压金额 ¥{formatNumber(c.backlogValue)}</p>
                  <p className="text-xs text-primary-600">💡 {c.suggestion}</p>
                  {c.examples.length > 0 && <p className="text-xs text-gray-400 mt-1">典型SKU：{c.examples.join('、')}</p>}
                </div>
              ))}
            </div>
          </div>
          {slowMovingRootCause.seasonalDetail.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">季节性详情</p>
              {slowMovingRootCause.seasonalDetail.map((s, i) => (
                <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm">
                  <span className="font-medium text-amber-800">{s.season}：</span>
                  <span className="text-amber-700">{s.suggestion}</span>
                  <span className="ml-2 text-amber-600">（{s.skuCount} SKU）</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 综合诊断结论 */}
        <section className="bg-white rounded-xl p-6 shadow-card border-l-4 border-amber-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 动销滞销综合诊断结论</h3>
          <p className="text-gray-700 mb-3">{velocityData.overallDiagnosis}</p>
          <div className="space-y-1">
            {velocityData.topPriorityActions.map((a, i) => (
              <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span> {a}
              </p>
            ))}
          </div>
        </section>
      </div>
    )
  }

  // ============ 渲染：库存风险诊断 ============
  const renderRiskTab = () => {
    if (!riskData) return <div className="text-center py-20 text-gray-400">暂无数据</div>

    const { backlogAlert, stockoutAlert, crossSeasonRisk, turnoverRating } = riskData
    const riskInfo = getDiagLevel(riskData.riskLevel)

    return (
      <div className="space-y-6 animate-fade-in">
        {/* 风险等级总览 */}
        <div className={`p-5 rounded-xl border ${riskInfo.bg} border-current`}>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className={`w-6 h-6 ${riskInfo.color}`} />
            <span className={`text-lg font-bold ${riskInfo.color}`}>库存风险等级：{riskData.riskLevel.toUpperCase()}（{riskInfo.label}）</span>
          </div>
          <p className="text-sm text-gray-600">{riskData.overallDiagnosis}</p>
        </div>

        {/* 3.3.3.1 库存积压预警 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> 库存积压预警
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-danger/5 rounded-xl border border-danger/20">
              <p className="text-sm text-gray-500">积压总金额</p>
              <p className="text-2xl font-bold text-danger">¥{formatNumber(backlogAlert.totalBacklogValue)}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-gray-500">平均积压天数</p>
              <p className="text-2xl font-bold text-amber-700">{backlogAlert.backlogDays}<span className="text-sm font-normal"> 天</span></p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500">预警级别</p>
              <p className={`text-2xl font-bold ${
                backlogAlert.alertLevel === 'critical' ? 'text-red-600' : backlogAlert.alertLevel === 'high' ? 'text-amber-600' : 'text-blue-600'
              }`}>{backlogAlert.alertLevel.toUpperCase()}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">SKU</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">名称</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">库存</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">积压成本</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">积压天数</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">建议处理</th>
                </tr>
              </thead>
              <tbody>
                {backlogAlert.alertItems.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-500">{item.sku}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{item.name}</td>
                    <td className="py-2 px-3 text-right">{item.stock}</td>
                    <td className="py-2 px-3 text-right text-danger">¥{formatNumber(item.costValue)}</td>
                    <td className={`py-2 px-3 text-right text-sm ${item.daysInStock > 90 ? 'text-danger font-medium' : 'text-gray-500'}`}>{item.daysInStock}天</td>
                    <td className="py-2 px-3 text-sm text-primary-600">{item.suggestedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3.3.3.2 爆款断货缺货预警 */}
        <section className="bg-white rounded-xl p-6 shadow-card border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" /> 爆款断货缺货预警
          </h3>
          <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-red-700">{stockoutAlert.diagnosis}</p>
            <p className="text-sm text-red-600 mt-1">预计断货期间营收损失 ¥{formatNumber(stockoutAlert.totalRevenueRisk)}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">SKU</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">名称</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">当前库存</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">日均销量</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">预计断货</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">建议补货量</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">紧急度</th>
                </tr>
              </thead>
              <tbody>
                {stockoutAlert.riskItems.map((item, i) => {
                  const ub = getUrgencyBadge(item.urgency)
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-500">{item.sku}</td>
                      <td className="py-2 px-3 font-medium text-gray-900">{item.name}</td>
                      <td className={`py-2 px-3 text-right font-bold ${item.currentStock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{item.currentStock}</td>
                      <td className="py-2 px-3 text-right">{item.dailyAvgSales}</td>
                      <td className={`py-2 px-3 text-right text-sm font-medium ${item.daysUntilStockout <= 0 ? 'text-red-600' : item.daysUntilStockout <= 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {item.daysUntilStockout <= 0 ? '已断货！' : `${item.daysUntilStockout}天`}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-primary-600">{item.suggestedReorderQty}</td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${ub.bg} ${ub.color}`}>{ub.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3.3.3.3 跨季节库存风险 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" /> 跨季节库存积压风险
          </h3>
          <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-amber-800">当前季节：{crossSeasonRisk.currentSeason} → 下一季节：{crossSeasonRisk.nextSeason}</p>
            <p className="text-sm text-amber-700 mt-1">{crossSeasonRisk.diagnosis}</p>
            <p className="text-sm text-amber-600">风险金额 ¥{formatNumber(crossSeasonRisk.totalRiskValue)}</p>
          </div>
          <div className="space-y-2">
            {crossSeasonRisk.crossSeasonItems.map((item, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="ml-2 text-sm text-gray-500">（{item.category}·{item.season}）</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">库存 {item.stock} · 售罄率 {Math.round(item.sellThroughRate)}%</p>
                  <p className="text-xs text-primary-600">{item.recommendedAction}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3.3.3.4 库存周转效率评级 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-500" /> 库存周转效率评级
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-sm text-gray-500">综合评级</p>
              <p className={`text-4xl font-bold ${
                turnoverRating.overallRating === 'A' ? 'text-emerald-600' :
                turnoverRating.overallRating === 'B' ? 'text-blue-600' :
                turnoverRating.overallRating === 'C' ? 'text-amber-600' : 'text-red-600'
              }`}>{turnoverRating.overallRating}</p>
              <p className="text-xs text-gray-400">基准 {turnoverRating.benchmarkTurnoverDays}天</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-sm text-gray-500">实际周转天数</p>
              <p className="text-4xl font-bold text-gray-900">{turnoverRating.overallTurnoverDays}<span className="text-lg">天</span></p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-sm text-gray-500">较基准</p>
              <p className={`text-4xl font-bold ${turnoverRating.overallTurnoverDays > turnoverRating.benchmarkTurnoverDays ? 'text-danger' : 'text-success'}`}>
                {turnoverRating.overallTurnoverDays > turnoverRating.benchmarkTurnoverDays ? '+' : ''}{Math.round(((turnoverRating.overallTurnoverDays - turnoverRating.benchmarkTurnoverDays) / turnoverRating.benchmarkTurnoverDays) * 100)}%
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">品类</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">周转天数</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">基准</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">评级</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {turnoverRating.ratingDetail.map((d, i) => {
                  const rb = getTurnoverRatingBadge(d.rating)
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-900">{d.category}</td>
                      <td className={`py-2 px-3 text-right font-medium ${d.turnoverDays > d.benchmark ? 'text-danger' : 'text-success'}`}>{d.turnoverDays}天</td>
                      <td className="py-2 px-3 text-right text-gray-500">{d.benchmark}天</td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${rb.bg} ${rb.color}`}>{rb.label}</span></td>
                      <td className="py-2 px-3 text-sm text-gray-600">{d.status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    )
  }

  // ============ 渲染：运营解决方案 ============
  const renderSolutionTab = () => {
    if (!solutionData) return <div className="text-center py-20 text-gray-400">暂无数据</div>

    const { clearancePlan, replenishmentSuggestion, newProductSelection, displayPriority } = solutionData

    return (
      <div className="space-y-6 animate-fade-in">
        {/* 3.3.4.1 滞销清仓方案 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-danger" /> 滞销清仓方案
          </h3>
          <div className="mb-4 p-4 bg-danger/5 rounded-xl border border-danger/20">
            <p className="text-sm text-gray-500">清仓总价值</p>
            <p className="text-2xl font-bold text-danger">¥{formatNumber(clearancePlan.totalClearanceValue)}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {clearancePlan.strategies.map((s, i) => (
              <div key={i} className="p-4 border rounded-xl bg-white border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{s.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    s.recommendedAction === 'discount' ? 'bg-red-100 text-red-700' :
                    s.recommendedAction === 'bundle' ? 'bg-blue-100 text-blue-700' :
                    s.recommendedAction === 'gift' ? 'bg-purple-100 text-purple-700' :
                    s.recommendedAction === 'transfer' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {s.actionLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <p className="text-xs text-gray-500">库存</p>
                    <p className="font-medium">{s.currentStock}</p>
                  </div>
                  {s.discountRate > 0 && (
                    <div>
                      <p className="text-xs text-gray-500">建议折扣</p>
                      <p className="font-medium text-danger">{s.discountRate}%</p>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs text-gray-700 mb-2">
                  💬 话术：{s.script}
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  s.priority === 'high' ? 'bg-red-100 text-red-700' : s.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  优先级：{s.priority === 'high' ? '紧急' : s.priority === 'medium' ? '中等' : '较低'}
                </span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">推荐活动</p>
            <div className="space-y-2">
              {clearancePlan.activitySuggestions.map((a, i) => (
                <div key={i} className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary-700">{a.activityType}</span>
                    <span className="text-sm text-primary-600">预计清仓率 {a.expectedClearRate}%</span>
                  </div>
                  <p className="text-sm text-primary-600 mt-1">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3.3.4.2 爆款补货周期建议 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary-500" /> 爆款补货周期建议
          </h3>
          <div className="mb-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-sm text-primary-700">{replenishmentSuggestion.summary}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">SKU</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">名称</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">当前库存</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">日均销量</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">安全库存</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">建议补货量</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">交货周期</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">紧急度</th>
                </tr>
              </thead>
              <tbody>
                {replenishmentSuggestion.items.map((item, i) => {
                  const ub = getUrgencyBadge(item.urgency)
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-500">{item.sku}</td>
                      <td className="py-2 px-3 font-medium text-gray-900">{item.name}</td>
                      <td className={`py-2 px-3 text-right font-bold ${item.currentStock <= item.safetyStock * 0.3 ? 'text-red-600' : 'text-gray-900'}`}>{item.currentStock}</td>
                      <td className="py-2 px-3 text-right">{item.dailyAvgSales}</td>
                      <td className="py-2 px-3 text-right text-gray-500">{item.safetyStock}</td>
                      <td className="py-2 px-3 text-right font-medium text-primary-600">{item.suggestedReorderQty}</td>
                      <td className="py-2 px-3 text-right text-sm text-gray-500">{item.leadTime}天</td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${ub.bg} ${ub.color}`}>{ub.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3.3.4.3 上新选品方向建议 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> 上新选品方向建议
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {newProductSelection.directionSuggestions.map((d, i) => (
              <div key={i} className="p-4 border rounded-xl bg-white border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{d.category}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    d.riskLevel === 'low' ? 'bg-success/10 text-success' : d.riskLevel === 'medium' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                  }`}>
                    风险：{d.riskLevel === 'low' ? '低' : d.riskLevel === 'medium' ? '中' : '高'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{d.direction}</p>
                <p className="text-xs text-gray-500 mb-1">理由：{d.reason}</p>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-gray-500">预计毛利率</span>
                  <span className="font-medium text-success">{d.expectedProfitRate}%</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-gray-500">参考定价</span>
                  <span className="font-medium">¥{d.referencePrice}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-success/5 rounded-lg border border-success/20">
              <p className="text-sm font-semibold text-success mb-1">📈 趋势品类</p>
              {newProductSelection.trendingCategories.map((c, i) => (
                <p key={i} className="text-sm text-gray-700">• {c}</p>
              ))}
            </div>
            <div className="p-3 bg-danger/5 rounded-lg border border-danger/20">
              <p className="text-sm font-semibold text-danger mb-1">📉 衰退品类</p>
              {newProductSelection.decliningCategories.map((c, i) => (
                <p key={i} className="text-sm text-gray-700">• {c}</p>
              ))}
            </div>
          </div>
        </section>

        {/* 3.3.4.4 货品陈列优先排序建议 */}
        <section className="bg-white rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" /> 货品陈列优先排序建议
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-center py-2 px-3 font-medium text-gray-500 w-16">优先级</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">SKU</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">名称</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">建议位置</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">建议陈列量</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">理由</th>
                </tr>
              </thead>
              <tbody>
                {displayPriority.priorityList.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        item.priority <= 3 ? 'bg-primary-500 text-white' : item.priority <= 6 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500">{item.sku}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{item.name}</td>
                    <td className="py-2 px-3 text-sm text-gray-600">{item.positionLabel}</td>
                    <td className="py-2 px-3 text-right font-medium">{item.displayQty}</td>
                    <td className="py-2 px-3 text-sm text-gray-500">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">分区建议</p>
            <div className="space-y-2">
              {displayPriority.zoneSuggestions.map((z, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{z.zone}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-primary-600">{z.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ============ 主渲染 ============
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">货品全链路智能诊断</h1>
          <p className="text-sm text-gray-500 mt-1">3.3 货品全链路诊断 · 结构 / 动销 / 风险 / 方案</p>
        </div>
        <div className="flex items-center gap-2">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={classNames(
                'px-4 py-2 text-sm rounded-lg transition-colors',
                period === p.key ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              )}
            >
              {p.label}
            </button>
          ))}
          <button onClick={fetchAll} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors" title="刷新数据">
            <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">正在加载诊断数据...</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-danger/5 rounded-xl border border-danger/20 text-danger text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tab 导航 */}
      {!loading && (
        <>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={classNames(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all',
                    activeTab === tab.key
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  )}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab 内容 */}
          {activeTab === 'structure' && renderStructureTab()}
          {activeTab === 'velocity' && renderVelocityTab()}
          {activeTab === 'risk' && renderRiskTab()}
          {activeTab === 'solution' && renderSolutionTab()}
        </>
      )}
    </div>
  )
}
