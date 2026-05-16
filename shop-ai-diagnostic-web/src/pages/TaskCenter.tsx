import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/utils'
import { useShopStore } from '@/stores'
import { taskApi } from '@/api/http'
import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle, MoreHorizontal, Trash2 } from 'lucide-react'
import type { ITask, ITaskQuery } from '@/types'

// 状态配置
const statusConfig = {
  pending: { label: '待处理', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
  in_progress: { label: '进行中', icon: AlertCircle, color: 'text-primary-500', bg: 'bg-primary-100' },
  completed: { label: '已完成', icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  cancelled: { label: '已取消', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50' },
}

// 优先级配置
const priorityConfig = {
  high: { label: '高', color: 'text-danger', bg: 'bg-danger/10' },
  medium: { label: '中', color: 'text-warning', bg: 'bg-warning/10' },
  low: { label: '低', color: 'text-gray-500', bg: 'bg-gray-100' },
}

// 任务类型配置
const typeConfig: Record<string, string> = {
  diagnostic: '诊断',
  follow_up: '跟进',
  inventory: '库存',
  training: '培训',
}

export function TaskCenter() {
  const { currentShop } = useShopStore()
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  // 查询任务列表
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', currentShop?.id, filterStatus, filterPriority, searchQuery, page],
    queryFn: () =>
      taskApi.getList({
        shopId: currentShop!.id,
        status: filterStatus as ITask['status'],
        priority: filterPriority as ITask['priority'],
        keyword: searchQuery || undefined,
        page,
        pageSize: 20,
      }),
    enabled: !!currentShop?.id,
  })

  // 完成任务
  const completeMutation = useMutation({
    mutationFn: (taskId: string) => taskApi.complete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // 删除任务
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => taskApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const tasks = tasksData?.data?.list || []
  const total = tasksData?.data?.total || 0
  const totalPages = tasksData?.data?.totalPages || 1

  // 统计各状态任务数
  const statusCounts = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const handleComplete = (taskId: string) => {
    if (confirm('确定要完成此任务吗？')) {
      completeMutation.mutate(taskId)
    }
  }

  const handleDelete = (taskId: string) => {
    if (confirm('确定要删除此任务吗？')) {
      deleteMutation.mutate(taskId)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    })
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">任务中心</h1>
          <p className="text-sm text-gray-500 mt-1">
            跟进问题处理进度 · 共 {total} 个任务
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" />
          创建任务
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className={cn(
            'p-4 rounded-lg border-2 cursor-pointer transition-colors',
            filterStatus === null ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white',
          )}
          onClick={() => setFilterStatus(null)}
        >
          <p className="text-sm text-gray-500">全部任务</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          const count = statusCounts[status] || 0
          if (status === 'cancelled') return null
          return (
            <div
              key={status}
              className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-colors',
                filterStatus === status
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white',
              )}
              onClick={() => setFilterStatus(filterStatus === status ? null : status)}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn('w-4 h-4', config.color)} />
                <p className="text-sm text-gray-500">{config.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterPriority || ''}
          onChange={(e) => {
            setFilterPriority(e.target.value || null)
            setPage(1)
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">全部优先级</option>
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          更多筛选
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无符合条件的任务</p>
            <button className="mt-4 text-primary-500 hover:text-primary-600">
              创建一个新任务
            </button>
          </div>
        ) : (
          tasks.map((task) => {
            const status = statusConfig[task.status] || statusConfig.pending
            const priority = priorityConfig[task.priority] || priorityConfig.medium
            const StatusIcon = status.icon
            const overdue = isOverdue(task.dueDate, task.status)

            return (
              <div
                key={task.id}
                className={cn(
                  'bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow',
                  overdue && 'border-l-4 border-danger',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn('p-2 rounded-lg', status.bg)}>
                      <StatusIcon className={cn('w-5 h-5', status.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span
                          className={cn('px-2 py-0.5 text-xs font-medium rounded', priority.bg, priority.color)}
                        >
                          {priority.label}优先级
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                          {typeConfig[task.type] || task.type}
                        </span>
                        {task.assignee && (
                          <span className="text-xs text-gray-400">
                            负责人：{(task.assignee as unknown as { name: string })?.name || task.assigneeId}
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-xs',
                            overdue ? 'text-danger font-medium' : 'text-gray-400',
                          )}
                        >
                          截止：{formatDate(task.dueDate)}
                          {overdue && ' (已逾期)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="px-3 py-1 text-sm bg-success text-white rounded-lg hover:bg-success/90"
                      >
                        完成
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
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
