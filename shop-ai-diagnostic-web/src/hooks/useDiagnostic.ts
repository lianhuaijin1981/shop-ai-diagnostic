import { useQuery } from '@tanstack/react-query'
import { diagnosticApi } from '@/api'
import type { IDiagnosticQuery } from '@/types'

/**
 * 五维诊断 Hook
 */
export function useFiveDimensionDiagnostic(params: IDiagnosticQuery) {
  return useQuery({
    queryKey: ['diagnostic', 'five-dimension', params],
    queryFn: () => diagnosticApi.getFiveDimension(params),
    enabled: !!params.shopId,
  })
}

/**
 * 诊断趋势 Hook
 */
export function useDiagnosticTrends(
  shopId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ['diagnostic', 'trends', shopId, startDate, endDate],
    queryFn: () => diagnosticApi.getTrends(shopId, startDate, endDate),
    enabled: !!shopId && !!startDate && !!endDate,
  })
}

/**
 * 预警列表 Hook
 */
export function useAlerts(shopId: string) {
  return useQuery({
    queryKey: ['diagnostic', 'alerts', shopId],
    queryFn: () => diagnosticApi.getAlerts(shopId),
    enabled: !!shopId,
  })
}
