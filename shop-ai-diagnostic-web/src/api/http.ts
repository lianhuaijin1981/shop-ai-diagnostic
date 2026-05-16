import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type {
  IApiResponse,
  IDashboardStats,
  IDiagnosticResult,
  IDiagnosticQuery,
  IDiagnosticTrend,
  IProductDiagnostic,
  IProductDiagnosticQuery,
  IProductAnalysis,
  IProductStockAlert,
  IDashboardStockAlert,
  ITask,
  ITaskQuery,
  IAlert,
  IAlertQuery,
  IPaginatedResponse,
  IShop,
  IUser,
  IDailyStat,
  IReport,
  ICustomer,
  ITransaction,
  IDepCustomerFlowAnalysis,
  IDepConversionAnalysis,
  IDepAvgAmountAnalysis,
  IDepRepurchaseAnalysis,
  IDepProfitAnalysis,
  IDashboardComprehensive,
  IMultiStoreTotal,
  DashboardPeriod,
  IProductStructureDiag,
  ISalesVelocityDiag,
  IInventoryRiskDiag,
  IOperationSolution,
} from '@/types'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { code, message } = (response as AxiosResponse<IApiResponse<unknown>>).data
    if (code !== 200) {
      console.error(`API Error: ${code} - ${message}`)
      return Promise.reject(new Error(message))
    }
    return (response as AxiosResponse<IApiResponse<unknown>>).data as any
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          console.error('无权限访问')
          break
        case 500:
          console.error('服务器错误')
          break
        default:
          console.error(data?.message || '请求失败')
      }
    }
    return Promise.reject(error)
  },
)

export default instance

// ============ Dashboard API ============

export const dashboardApi = {
  getStats: (shopId: string): Promise<IApiResponse<IDashboardStats>> =>
    instance.get(`/dashboard/stats`, { params: { shopId } }),

  getTrends: (shopId: string, days = 7): Promise<IApiResponse<IDailyStat[]>> =>
    instance.get(`/dashboard/trends`, { params: { shopId, days } }),

  // 经营大盘7大类综合数据
  getComprehensive: (shopId: string, period: DashboardPeriod): Promise<IApiResponse<IDashboardComprehensive>> =>
    instance.get(`/dashboard/comprehensive`, { params: { shopId, period } }),

  // 多门店汇总
  getMultiStoreSummary: (period: DashboardPeriod): Promise<IApiResponse<IMultiStoreTotal>> =>
    instance.get(`/dashboard/multi-store-summary`, { params: { period } }),
}

// ============ Diagnostic API ============

export const diagnosticApi = {
  getFiveDimension: (params: IDiagnosticQuery): Promise<IApiResponse<IDiagnosticResult>> =>
    instance.get('/diagnostic/five-dimension', { params }),

  getTrends: (
    shopId: string,
    startDate: string,
    endDate: string,
  ): Promise<IApiResponse<IDiagnosticTrend[]>> =>
    instance.get('/diagnostic/trends', { params: { shopId, startDate, endDate } }),

  getAlerts: (shopId: string): Promise<IApiResponse<IAlert[]>> =>
    instance.get('/diagnostic/alerts', { params: { shopId } }),

  resolveAlert: (alertId: string): Promise<IApiResponse<void>> =>
    instance.post(`/diagnostic/alerts/${alertId}/resolve`),
}

// ============ Product Diagnostic API ============

export const productApi = {
  getDiagnostic: (params: IProductDiagnosticQuery): Promise<IApiResponse<IProductDiagnostic>> =>
    instance.get('/product-diagnostic', { params }),

  getFastMoving: (
    shopId: string,
    period: string,
    limit = 10,
  ): Promise<IApiResponse<IProductAnalysis[]>> =>
    instance.get('/product-diagnostic/fast-moving', { params: { shopId, period, limit } }),

  getSlowMoving: (
    shopId: string,
    period: string,
    limit = 10,
  ): Promise<IApiResponse<IProductAnalysis[]>> =>
    instance.get('/product-diagnostic/slow-moving', { params: { shopId, period, limit } }),

  getStockAlerts: (shopId: string): Promise<IApiResponse<IProductStockAlert[]>> =>
    instance.get('/product-diagnostic/stock-alerts', { params: { shopId } }),
}

// ============ 货品全链路智能诊断 API ============

export const productDiagnosticApi = {
  // 3.3.1 货品结构诊断
  getProductStructure: (shopId: string, period: string): Promise<IApiResponse<IProductStructureDiag>> =>
    instance.get('/diagnostic/product-structure', { params: { shopId, period } }),

  // 3.3.2 动销滞销智能判定
  getSalesVelocity: (shopId: string, period: string): Promise<IApiResponse<ISalesVelocityDiag>> =>
    instance.get('/diagnostic/sales-velocity', { params: { shopId, period } }),

  // 3.3.3 库存风险诊断
  getInventoryRisk: (shopId: string, period: string): Promise<IApiResponse<IInventoryRiskDiag>> =>
    instance.get('/diagnostic/inventory-risk', { params: { shopId, period } }),

  // 3.3.4 货品运营解决方案
  getOperationSolution: (shopId: string): Promise<IApiResponse<IOperationSolution>> =>
    instance.get('/diagnostic/operation-solution', { params: { shopId } }),
}

// ============ Task API ============

export const taskApi = {
  getList: (params: ITaskQuery): Promise<IApiResponse<IPaginatedResponse<ITask>>> =>
    instance.get('/tasks', { params }),

  getById: (id: string): Promise<IApiResponse<ITask>> => instance.get(`/tasks/${id}`),

  create: (data: Partial<ITask>): Promise<IApiResponse<ITask>> =>
    instance.post('/tasks', data),

  update: (id: string, data: Partial<ITask>): Promise<IApiResponse<ITask>> =>
    instance.put(`/tasks/${id}`, data),

  complete: (id: string): Promise<IApiResponse<void>> =>
    instance.post(`/tasks/${id}/complete`),

  delete: (id: string): Promise<IApiResponse<void>> => instance.delete(`/tasks/${id}`),
}

// ============ Shop API ============

export const shopApi = {
  getList: (): Promise<IApiResponse<IShop[]>> => instance.get('/shops'),

  getById: (id: string): Promise<IApiResponse<IShop>> => instance.get(`/shops/${id}`),
}

// ============ Auth API ============

export const authApi = {
  login: (data: { username: string; password: string }): Promise<IApiResponse<{ token: string; user: IUser }>> =>
    instance.post('/auth/login', data),

  logout: (): Promise<IApiResponse<void>> => instance.post('/auth/logout'),

  getProfile: (): Promise<IApiResponse<IUser>> => instance.get('/auth/profile'),
}

// ============ Alert API ============

export const alertApi = {
  getList: (params: IAlertQuery): Promise<IApiResponse<IPaginatedResponse<IAlert>>> =>
    instance.get('/diagnostic/alerts', { params }),

  getById: (id: string): Promise<IApiResponse<IAlert>> =>
    instance.get(`/diagnostic/alerts/${id}`),

  process: (id: string, note?: string): Promise<IApiResponse<void>> =>
    instance.post(`/diagnostic/alerts/${id}/process`, { note }),

  resolve: (id: string, resolution?: string): Promise<IApiResponse<void>> =>
    instance.post(`/diagnostic/alerts/${id}/resolve`, { resolution }),
}

// ============ Report API ============

export const reportApi = {
  getList: (shopId: string): Promise<IApiResponse<IReport[]>> =>
    instance.get('/reports', { params: { shopId } }),
  getById: (id: string): Promise<IApiResponse<IReport>> =>
    instance.get(`/reports/${id}`),
  generate: (shopId: string, period?: string): Promise<IApiResponse<IReport>> =>
    instance.post('/reports/generate', { shopId, period: period || 'week' }),
}

// ============ Customer API ============

export const customerApi = {
  getList: (shopId: string): Promise<IApiResponse<ICustomer[]>> =>
    instance.get('/customers', { params: { shopId } }),
  getById: (id: string): Promise<IApiResponse<ICustomer>> =>
    instance.get(`/customers/${id}`),
  create: (data: Partial<ICustomer>): Promise<IApiResponse<ICustomer>> =>
    instance.post('/customers', data),
  update: (id: string, data: Partial<ICustomer>): Promise<IApiResponse<ICustomer>> =>
    instance.put(`/customers/${id}`, data),
  delete: (id: string): Promise<IApiResponse<void>> =>
    instance.delete(`/customers/${id}`),
}

// ============ 深度诊断 API ============

export interface IDiagnosticPeriodQuery {
  shopId: string
  period: 'today' | 'week' | 'month' | 'quarter'
  startDate?: string
  endDate?: string
}

export const depDiagnosticApi = {
  // 客流深度分析
  getCustomerFlowAnalysis: (params: IDiagnosticPeriodQuery): Promise<IApiResponse<IDepCustomerFlowAnalysis>> =>
    instance.get('/diagnostic/deep/customer-flow', { params }),

  // 转化深度分析
  getConversionAnalysis: (params: IDiagnosticPeriodQuery): Promise<IApiResponse<IDepConversionAnalysis>> =>
    instance.get('/diagnostic/deep/conversion', { params }),

  // 客单价深度分析
  getAvgAmountAnalysis: (params: IDiagnosticPeriodQuery): Promise<IApiResponse<IDepAvgAmountAnalysis>> =>
    instance.get('/diagnostic/deep/avg-amount', { params }),

  // 复购深度分析
  getRepurchaseAnalysis: (params: IDiagnosticPeriodQuery): Promise<IApiResponse<IDepRepurchaseAnalysis>> =>
    instance.get('/diagnostic/deep/repurchase', { params }),

  // 利润深度分析
  getProfitAnalysis: (params: IDiagnosticPeriodQuery): Promise<IApiResponse<IDepProfitAnalysis>> =>
    instance.get('/diagnostic/deep/profit', { params }),
}

// ============ Transaction API ============

export const transactionApi = {
  getList: (shopId: string, page = 1, pageSize = 20): Promise<IApiResponse<IPaginatedResponse<ITransaction>>> =>
    instance.get('/transactions', { params: { shopId, page, pageSize } }),
  getById: (id: string): Promise<IApiResponse<ITransaction>> =>
    instance.get(`/transactions/${id}`),
}
