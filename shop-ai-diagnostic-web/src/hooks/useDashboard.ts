import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '@/api'
import type { IDiagnosticQuery } from '@/types'

/**
 * Dashboard 统计数据 Hook
 */
export function useDashboardStats(shopId: string | null) {
  return useQuery({
    queryKey: ['dashboard', 'stats', shopId],
    queryFn: () => dashboardApi.getStats(shopId!),
    enabled: !!shopId,
    refetchInterval: 60000, // 每分钟自动刷新
  })
}

/**
 * Dashboard 趋势数据 Hook
 */
export function useDashboardTrends(shopId: string | null, days = 7) {
  return useQuery({
    queryKey: ['dashboard', 'trends', shopId, days],
    queryFn: () => dashboardApi.getTrends(shopId!, days),
    enabled: !!shopId,
  })
}
