import React from 'react'
import { cn, formatCurrency, formatNumber, formatPercent, getTrendIcon, getTrendColor } from '@/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  format?: 'currency' | 'number' | 'percent'
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  icon?: LucideIcon
  className?: string
}

export function StatCard({
  title,
  value,
  format = 'number',
  trend,
  trendValue,
  icon: Icon,
  className,
}: StatCardProps) {
  const formattedValue = {
    currency: formatCurrency(value),
    number: formatNumber(value),
    percent: formatPercent(value),
  }[format]

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  }[trend || 'stable']

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          {trend && trendValue !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor(trend))}>
              <TrendIcon className="w-4 h-4" />
              <span>
                {getTrendIcon(trend)} {formatPercent(Math.abs(trendValue))}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-primary-50 text-primary-500">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

interface ScoreCardProps {
  title: string
  score: number
  value: number
  benchmark: number
  weight: number
  trend: 'up' | 'down' | 'stable'
  unit?: string
  className?: string
}

export function ScoreCard({
  title,
  score,
  value,
  benchmark,
  weight,
  trend,
  unit = '',
  className,
}: ScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-success'
    if (s >= 60) return 'text-warning'
    return 'text-danger'
  }

  const getScoreBgColor = (s: number) => {
    if (s >= 80) return 'bg-success'
    if (s >= 60) return 'bg-warning'
    return 'bg-danger'
  }

  return (
    <div className={cn('bg-white rounded-xl p-5 shadow-card', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-full text-white font-medium',
            getScoreBgColor(score),
          )}
        >
          {getTrendIcon(trend)} {trend === 'up' ? '上升' : trend === 'down' ? '下降' : '持平'}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className={cn('text-3xl font-bold', getScoreColor(score))}>
            {score.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400 ml-1">分</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            当前值：{value.toFixed(2)}
            {unit}
          </p>
          <p className="text-xs text-gray-400">
            基准值：{benchmark.toFixed(2)}
            {unit}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>综合权重</span>
          <span>{(weight * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', getScoreBgColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  )
}

interface AlertItemProps {
  type: 'danger' | 'warning' | 'info'
  title: string
  description: string
  time: string
  onClick?: () => void
}

export function AlertItem({ type, title, description, time, onClick }: AlertItemProps) {
  const typeConfig = {
    danger: {
      bg: 'bg-danger/10',
      text: 'text-danger',
      icon: '●',
    },
    warning: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      icon: '▲',
    },
    info: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      icon: '◆',
    },
  }[type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
        onClick ? 'cursor-pointer' : '',
      )}
      onClick={onClick}
    >
      <span className={cn('text-sm mt-0.5', typeConfig.text)}>{typeConfig.icon}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}

interface LoadingProps {
  text?: string
}

export function Loading({ text = '加载中...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">{text}</span>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {icon && <div className="text-gray-300 mb-4">{icon}</div>}
      <p className="text-gray-600 font-medium">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
    </div>
  )
}
