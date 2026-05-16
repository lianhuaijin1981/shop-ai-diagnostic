import { useQuery } from '@tanstack/react-query'
import { StatCard, AlertItem } from '@/components/common'
import { LineChart, PieChart } from '@/components/charts'
import { dashboardApi } from '@/api/http'
import { useShopStore } from '@/stores'
import { formatCurrency, formatNumber, formatPercent } from '@/utils'
import { DollarSign, ShoppingCart, Users, TrendingUp, Bell, ListChecks, TrendingDown, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Dashboard() {
  const { currentShop } = useShopStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // 获取统计数据
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', currentShop?.id],
    queryFn: () => dashboardApi.getStats(currentShop!.id),
    enabled: !!currentShop?.id,
    refetchInterval: 60000, // 每分钟自动刷新
  })

  // 获取趋势数据
  const { data: trendsData } = useQuery({
    queryKey: ['dashboardTrends', currentShop?.id],
    queryFn: () => dashboardApi.getTrends(currentShop!.id, 7),
    enabled: !!currentShop?.id,
  })

  const stats = statsData?.data
  const trends = trendsData?.data || []

  // Mock预警数据（实际应从API获取）
  const mockAlerts = [
    {
      id: '1',
      type: 'danger' as const,
      title: '客流异常下降',
      description: '本周客流较上周同期下降15%，建议关注',
      time: '10分钟前',
    },
    {
      id: '2',
      type: 'warning' as const,
      title: '转化率偏低',
      description: '当前转化率为32%，低于平均水平40%',
      time: '30分钟前',
    },
    {
      id: '3',
      type: 'info' as const,
      title: '库存预警',
      description: '商品A库存不足，建议及时补货',
      time: '1小时前',
    },
  ]

  // 趋势图数据
  const trendChartData = {
    dates: trends.map((t) => t.date.slice(5)), // MM-DD格式
    series: [
      { name: '销售额', data: trends.map((t) => t.sales) },
      { name: '利润', data: trends.map((t) => t.profit) },
    ],
  }

  // 趋势图标
  const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' | number }) => {
    if (trend === 'up' || trend > 0) return <TrendingUp className="w-4 h-4 text-success" />
    if (trend === 'down' || trend < 0) return <TrendingDown className="w-4 h-4 text-danger" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  if (!currentShop) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 mb-4">请先选择门店</p>
          <a href="/settings" className="text-primary-500 hover:text-primary-600">
            去设置
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">经营大盘</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentShop.name} ·{' '}
            {currentTime.toLocaleDateString('zh-CN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              statsLoading ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
            }`}
          >
            {statsLoading ? '加载中...' : '实时数据'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日销售额"
          value={stats?.todaySales || 0}
          format="currency"
          trend={stats?.salesChangeRate > 0 ? 'up' : stats?.salesChangeRate < 0 ? 'down' : 'stable'}
          trendValue={stats?.salesChangeRate || 0}
          icon={DollarSign}
          isLoading={statsLoading}
        />
        <StatCard
          title="今日订单数"
          value={stats?.todayTransactions || 0}
          format="number"
          trend="up"
          trendValue={8.5}
          icon={ShoppingCart}
          isLoading={statsLoading}
        />
        <StatCard
          title="今日客流"
          value={stats?.todayCustomers || 0}
          format="number"
          trend={stats?.todayCustomers > 80 ? 'up' : 'down'}
          trendValue={-5.2}
          icon={Users}
          isLoading={statsLoading}
        />
        <StatCard
          title="今日利润"
          value={stats?.todayProfit || 0}
          format="currency"
          trend="up"
          trendValue={15.3}
          icon={TrendingUp}
          isLoading={statsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">本周趋势</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-primary-500"></span>
                <span className="text-gray-500">销售额</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-success"></span>
                <span className="text-gray-500">利润</span>
              </div>
            </div>
          </div>
          {trends.length > 0 ? (
            <LineChart data={trendChartData} height={280} />
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400">
              暂无趋势数据
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">实时预警</h2>
            <span className="px-2 py-1 bg-danger/10 text-danger text-xs font-medium rounded-full">
              {stats?.realtimeAlertCount || 0} 条
            </span>
          </div>
          <div className="space-y-2">
            {mockAlerts.length > 0 ? (
              mockAlerts.map((alert) => <AlertItem key={alert.id} {...alert} />)
            ) : (
              <div className="text-center text-gray-400 py-8">暂无预警</div>
            )}
          </div>
          <a
            href="/alerts"
            className="block mt-4 text-center text-sm text-primary-500 hover:text-primary-600"
          >
            查看全部预警 →
          </a>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-50 text-primary-500">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">待处理预警</p>
              <p className="text-xl font-bold text-gray-900">{stats?.realtimeAlertCount || 0} 条</p>
            </div>
            <TrendIcon trend={stats?.realtimeAlertCount ? 'down' : 'stable'} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10 text-warning">
              <ListChecks className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">待完成任务</p>
              <p className="text-xl font-bold text-gray-900">{stats?.pendingTaskCount || 0} 项</p>
            </div>
            <TrendIcon trend={stats?.pendingTaskCount && stats.pendingTaskCount < 5 ? 'up' : 'down'} />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10 text-success">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">综合得分</p>
              <p className="text-xl font-bold text-success">
                {stats?.totalScore?.toFixed(1) || '--'} 分
              </p>
            </div>
            <TrendIcon trend={stats?.totalScore && stats.totalScore > 70 ? 'up' : 'down'} />
          </div>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">核心指标</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">客流得分</p>
            <p className="text-2xl font-bold text-primary-500">72</p>
            <p className="text-xs text-gray-400 mt-1">目标: 100</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">转化得分</p>
            <p className="text-2xl font-bold text-warning">65</p>
            <p className="text-xs text-gray-400 mt-1">目标: 80</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">客单得分</p>
            <p className="text-2xl font-bold text-success">85</p>
            <p className="text-xs text-gray-400 mt-1">目标: 85</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">复购得分</p>
            <p className="text-2xl font-bold text-primary-500">78</p>
            <p className="text-xs text-gray-400 mt-1">目标: 80</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">利润得分</p>
            <p className="text-2xl font-bold text-success">82</p>
            <p className="text-xs text-gray-400 mt-1">目标: 75</p>
          </div>
        </div>
      </div>
    </div>
  )
}
