// ============ 基础类型 ============

export interface IShop {
  id: string
  name: string
  code: string
  address: string
  manager: string
  phone: string
  status: 'active' | 'inactive' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface IEmployee {
  id: string
  name: string
  phone: string
  role: 'manager' | 'cashier' | 'sales' | 'stock'
  shopId: string
  status: 'active' | 'inactive'
}

export interface ICustomer {
  id: string
  name: string
  phone: string
  level: 'normal' | 'silver' | 'gold' | 'platinum'
  totalAmount: number
  visitCount: number
  lastVisitAt: string
  tags: string[]
}

export interface IProduct {
  id: string
  name: string
  code: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  status: 'active' | 'inactive' | 'offline'
}

export interface ITransaction {
  id: string
  shopId: string
  customerId?: string
  items: ITransactionItem[]
  totalAmount: number
  totalCost: number
  profit: number
  paymentMethod: 'cash' | 'wechat' | 'alipay' | 'card'
  createdAt: string
}

export interface ITransactionItem {
  productId: string
  productName: string
  quantity: number
  price: number
  cost: number
  discount: number
}

// ============ 诊断相关类型 ============

export interface IDiagnosticResult {
  id: string
  shopId: string
  period: {
    start: string
    end: string
  }
  scores: IFiveDimensionScores
  trends: IDiagnosticTrend[]
  alerts: IAlert[]
  suggestions: ISuggestion[]
  createdAt: string
}

export interface IFiveDimensionScores {
  // 五维诊断模型权重: 客流20% | 转化25% | 客单价20% | 复购20% | 利润15%
  customerFlow: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
  conversion: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
  avgAmount: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
  repurchase: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
  profit: {
    score: number
    weight: number
    value: number
    benchmark: number
    trend: 'up' | 'down' | 'stable'
  }
}

export interface IDiagnosticTrend {
  date: string
  customerFlow: number
  conversion: number
  avgAmount: number
  repurchase: number
  profit: number
}

export interface IAlert {
  id: string
  type: 'danger' | 'warning' | 'info'
  dimension: keyof IFiveDimensionScores
  title: string
  description: string
  value: number
  threshold: number
  createdAt: string
  status: 'pending' | 'processing' | 'resolved'
}

export interface ISuggestion {
  id: string
  dimension: keyof IFiveDimensionScores
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  expectedEffect: string
}

// ============ 货品诊断相关类型 ============

export interface IProductDiagnostic {
  id: string
  shopId: string
  period: {
    start: string
    end: string
  }
  fastMoving: IProductAnalysis[]
  slowMoving: IProductAnalysis[]
  stockAlerts: IStockAlert[]
  categoryAnalysis: ICategoryAnalysis[]
  createdAt: string
}

export interface IProductAnalysis {
  productId: string
  productName: string
  category: string
  salesAmount: number
  salesCount: number
  profit: number
  rank: number
}

export interface IStockAlert {
  productId: string
  productName: string
  currentStock: number
  minStock: number
  alertLevel: 'normal' | 'low' | 'critical'
  suggestedReorder: number
}

export interface ICategoryAnalysis {
  category: string
  salesAmount: number
  salesCount: number
  avgPrice: number
  profitRate: number
  salesRatio: number
}

// ============ 任务相关类型 ============

export interface ITask {
  id: string
  title: string
  description: string
  type: 'diagnostic' | 'follow_up' | 'inventory' | 'training'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  shopId: string
  assigneeId: string
  relatedDiagnosticId?: string
  dueDate: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ITaskComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
}

// ============ API响应类型 ============

export interface IApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
}

export interface IPaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface IDashboardStats {
  todaySales: number
  todayTransactions: number
  todayCustomers: number
  todayProfit: number
  weekTrend: IDailyStat[]
  realtimeAlertCount: number
  pendingTaskCount: number
}

export interface IDailyStat {
  date: string
  sales: number
  transactions: number
  customers: number
  profit: number
}

// ============ 请求参数类型 ============

export interface IDiagnosticQuery {
  shopId: string
  period: 'today' | 'week' | 'month' | 'quarter' | 'custom'
  startDate?: string
  endDate?: string
}

export interface IProductDiagnosticQuery {
  shopId: string
  period: 'today' | 'week' | 'month' | 'quarter'
  category?: string
}

export interface ITaskQuery {
  shopId: string
  status?: ITask['status']
  type?: ITask['type']
  assigneeId?: string
  page?: number
  pageSize?: number
}
