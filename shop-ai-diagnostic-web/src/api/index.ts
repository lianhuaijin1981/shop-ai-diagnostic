/**
 * API 统一导出
 * 使用方式: import { dashboardApi, diagnosticApi } from '@/api'
 */
export {
  default as http,
  dashboardApi,
  diagnosticApi,
  productApi,
  taskApi,
  shopApi,
  authApi,
  alertApi,
} from './http'

// 导出类型供外部使用
export type { IApiResponse, IPaginatedResponse } from './http'
