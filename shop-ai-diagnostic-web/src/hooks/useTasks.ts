import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskApi } from '@/api'
import type { ITask, ITaskQuery } from '@/types'

/**
 * 任务列表 Hook
 */
export function useTasks(params: ITaskQuery) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getList(params),
    enabled: !!params.shopId,
  })
}

/**
 * 任务详情 Hook
 */
export function useTask(id: string | null) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.getById(id!),
    enabled: !!id,
  })
}

/**
 * 创建任务 Mutation
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ITask>) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 更新任务 Mutation
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ITask> }) =>
      taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 完成任务 Mutation
 */
export function useCompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => taskApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * 删除任务 Mutation
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
