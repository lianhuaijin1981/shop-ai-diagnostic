import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  IApiResponse,
  IDashboardStats,
  IDiagnosticResult,
  IDiagnosticQuery,
  IProductDiagnostic,
  IProductDiagnosticQuery,
  ITask,
  ITaskQuery,
  IAlert,
  IPaginatedResponse,
  IShop,
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
  (response: AxiosResponse<IApiResponse<unknown>>) => {
    const { code, message } = response.data
    if (code !== 200) {
      console.error(`API Error: ${code} - ${message}`)
      return Promise.reject(new Error(message))
    }
    return response
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

  getStockAlerts: (shopId: string): Promise<IApiResponse<IStockAlert[]>> =>
    instance.get('/product-diagnostic/stock-alerts', { params: { shopId } }),
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
  login: (data: { username: string; password: string }): Promise<IApiResponse<{ token: string }>> =>
    instance.post('/auth/login', data),

  logout: (): Promise<IApiResponse<void>> => instance.post('/auth/logout'),

  getProfile: (): Promise<IApiResponse<IUser>> => instance.get('/auth/profile'),
}
