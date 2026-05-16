import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertApi } from '@/api'
import type { IAlert, IAlertQuery } from '@/types'

/**
 * 预警列表 Hook
 */
export function useAlerts(params: IAlertQuery) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertApi.getList(params),
    enabled: !!params.shopId,
  })
}

/**
 * 处理预警 Mutation
 */
export function useProcessAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      alertApi.process(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

/**
 * 解决预警 Mutation
 */
export function useResolveAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution?: string }) =>
      alertApi.resolve(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}
