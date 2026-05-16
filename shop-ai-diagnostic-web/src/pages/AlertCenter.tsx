import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/utils'
import { useShopStore } from '@/stores'
import { alertApi } from '@/api/http'
import { Bell, CheckCircle, AlertTriangle, Info, Settings, Search, X } from 'lucide-react'
import type { IAlert } from '@/types'

// 类型配置
const typeConfig = {
  danger: { label: '危险', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
  warning: { label: '警告', icon: Bell, color: 'text-warning', bg: 'bg-warning/10' },
  info: { label: '提示', icon: Info, color: 'text-primary', bg: 'bg-primary/10' },
}

// 状态配置
const statusConfig = {
  pending: { label: '待处理', color: 'text-gray-500', bg: 'bg-gray-100' },
  processing: { label: '处理中', color: 'text-primary-500', bg: 'bg-primary-100' },
  resolved: { label: '已解决', color: 'text-success', bg: 'bg-success/10' },
}

// 维度标签
const dimensionLabels: Record<string, string> = {
  customerFlow: '客流',
  conversion: '转化',
  avgAmount: '客单价',
  repurchase: '复购',
  profit: '利润',
  inventory: '库存',
}

export function AlertCenter() {
  const { currentShop } = useShopStore()
  const queryClient = useQueryClient()
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterDimension, setFilterDimension] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  // 查询预警列表
  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts', currentShop?.id, filterType, filterStatus, filterDimension, searchQuery, page],
    queryFn: () =>
      alertApi.getList({
        shopId: currentShop!.id,
        type: filterType as IAlert['type'],
        status: filterStatus as IAlert['status'],
        dimension: filterDimension || undefined,
        page,
        pageSize: 20,
      }),
    enabled: !!currentShop?.id,
  })

  // 处理预警
  const processMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      alertApi.process(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  // 解决预警
  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution?: string }) =>
      alertApi.resolve(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const alerts = alertsData?.data?.list || []
  const total = alertsData?.data?.total || 0
  const totalPages = alertsData?.data?.totalPages || 1

  // 统计数据
  const alertCounts = alerts.reduce(
    (acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      acc[alert.status] = (acc[alert.status] || 0) + 1
      return acc
    },
    { all: total } as Record<string, number>,
  )

  const handleProcess = (id: string) => {
    processMutation.mutate({ id, note: '开始处理' })
  }

  const handleResolve = (id: string) => {
    resolveMutation.mutate({ id, resolution: '已处理' })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">预警中心</h1>
          <p className="text-sm text-gray-500 mt-1">
            实时监控异常预警 · 共 {total} 条预警
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Settings className="w-4 h-4" />
          预警规则
        </button>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <p className="text-sm text-gray-500">危险预警</p>
          </div>
          <p className="text-2xl font-bold text-danger mt-1">{alertCounts.danger || 0}</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-warning" />
            <p className="text-sm text-gray-500">警告预警</p>
          </div>
          <p className="text-2xl font-bold text-warning mt-1">{alertCounts.warning || 0}</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <p className="text-sm text-gray-500">提示预警</p>
          </div>
          <p className="text-2xl font-bold text-primary mt-1">{alertCounts.info || 0}</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <p className="text-sm text-gray-500">已解决</p>
          </div>
          <p className="text-2xl font-bold text-success mt-1">{alertCounts.resolved || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索预警..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        {/* 类型筛选 */}
        <div className="flex gap-2">
          {(['danger', 'warning', 'info'] as const).map((type) => {
            const config = typeConfig[type]
            const Icon = config.icon
            return (
              <button
                key={type}
                onClick={() => {
                  setFilterType(filterType === type ? null : type)
                  setPage(1)
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
                  filterType === type
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-gray-200 hover:bg-gray-50',
                )}
              >
                <Icon className={cn('w-4 h-4', config.color)} />
                <span className="text-sm">{config.label}</span>
              </button>
            )
          })}
        </div>

        {/* 状态筛选 */}
        <select
          value={filterStatus || ''}
          onChange={(e) => {
            setFilterStatus(e.target.value || null)
            setPage(1)
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="resolved">已解决</option>
        </select>

        {/* 维度筛选 */}
        <select
          value={filterDimension || ''}
          onChange={(e) => {
            setFilterDimension(e.target.value || null)
            setPage(1)
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部维度</option>
          <option value="customerFlow">客流</option>
          <option value="conversion">转化</option>
          <option value="avgAmount">客单价</option>
          <option value="repurchase">复购</option>
          <option value="profit">利润</option>
          <option value="inventory">库存</option>
        </select>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无符合条件的预警</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const type = typeConfig[alert.type] || typeConfig.info
            const status = statusConfig[alert.status] || statusConfig.pending
            const TypeIcon = type.icon

            return (
              <div
                key={alert.id}
                className={cn(
                  'bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow',
                  alert.type === 'danger' && 'border-l-4 border-danger',
                  alert.type === 'warning' && 'border-l-4 border-warning',
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-lg', type.bg)}>
                    <TypeIcon className={cn('w-5 h-5', type.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded', type.bg, type.color)}>
                          {type.label}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                          {dimensionLabels[alert.dimension] || alert.dimension}
                        </span>
                      </div>
                      <span className={cn('px-2 py-0.5 text-xs font-medium rounded', status.bg, status.color)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-xs text-gray-400">
                        当前值：{alert.value} / 阈值：{alert.threshold}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(alert.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === 'pending' && (
                      <button
                        onClick={() => handleProcess(alert.id)}
                        className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                      >
                        开始处理
                      </button>
                    )}
                    {alert.status === 'processing' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1.5 text-sm bg-success text-white rounded-lg hover:bg-success/90"
                      >
                        标记完成
                      </button>
                    )}
                    <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                      详情
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>
          <span className="px-4 py-1 text-sm text-gray-600">
            第 {page} / {totalPages} 页
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}
