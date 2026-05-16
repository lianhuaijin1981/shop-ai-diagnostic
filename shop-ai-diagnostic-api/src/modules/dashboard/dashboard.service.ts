import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { DiagnosticService } from '../diagnostic/diagnostic.service'
import { AlertService } from '../alert/alert.service'
import { TaskService } from '../task/task.service'
import { Transaction, TransactionDocument } from '../diagnostic/schemas/transaction.schema'
import { Customer, CustomerDocument } from '../diagnostic/schemas/customer.schema'

export interface DashboardStats {
  todaySales: number
  todayTransactions: number
  todayCustomers: number
  todayProfit: number
  yesterdaySales: number
  salesChangeRate: number
  totalScore: number
  realtimeAlertCount: number
  pendingTaskCount: number
}

export interface TrendData {
  date: string
  sales: number
  transactions: number
  customers: number
  profit: number
}

export interface TopProduct {
  productId: string
  productName: string
  salesAmount: number
  salesCount: number
}

@Injectable()
export class DashboardService {
  constructor(
    private diagnosticService: DiagnosticService,
    private alertService: AlertService,
    private taskService: TaskService,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  /**
   * 获取经营大盘统计数据
   */
  async getStats(shopId: string): Promise<DashboardStats> {
    const objectId = new Types.ObjectId(shopId)
    
    // 获取今日和昨日的时间范围
    const today = this.getDateRange('today')
    const yesterday = this.getDateRange('yesterday')

    // 并行查询今日和昨日数据
    const [todayData, yesterdayData, alertStats, taskStats, latestDiagnostic] = await Promise.all([
      this.getPeriodStats(objectId, today.start, today.end),
      this.getPeriodStats(objectId, yesterday.start, yesterday.end),
      this.alertService.getStats(shopId),
      this.taskService.getStats(shopId),
      this.diagnosticService.findLatest(shopId),
    ])

    // 计算销售额变化率
    const salesChangeRate = yesterdayData.sales > 0
      ? ((todayData.sales - yesterdayData.sales) / yesterdayData.sales) * 100
      : 0

    return {
      todaySales: Math.round(todayData.sales * 100) / 100,
      todayTransactions: todayData.transactions,
      todayCustomers: todayData.customers,
      todayProfit: Math.round(todayData.profit * 100) / 100,
      yesterdaySales: Math.round(yesterdayData.sales * 100) / 100,
      salesChangeRate: Math.round(salesChangeRate * 10) / 10,
      totalScore: latestDiagnostic?.totalScore || 0,
      realtimeAlertCount: alertStats.pending + alertStats.processing,
      pendingTaskCount: taskStats.pending + taskStats.inProgress,
    }
  }

  /**
   * 获取趋势数据
   */
  async getTrends(shopId: string, days = 7): Promise<TrendData[]> {
    const objectId = new Types.ObjectId(shopId)
    const trends: TrendData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateRange = this.getDateRangeForDate(date)
      
      const stats = await this.getPeriodStats(objectId, dateRange.start, dateRange.end)
      
      trends.push({
        date: date.toISOString().split('T')[0],
        sales: Math.round(stats.sales * 100) / 100,
        transactions: stats.transactions,
        customers: stats.customers,
        profit: Math.round(stats.profit * 100) / 100,
      })
    }

    return trends
  }

  /**
   * 获取本周数据对比
   */
  async getWeekComparison(shopId: string) {
    const objectId = new Types.ObjectId(shopId)
    const today = new Date()
    
    // 本周数据
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay() + 1) // 周一
    thisWeekStart.setHours(0, 0, 0, 0)
    
    // 上周数据
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)

    const [thisWeekData, lastWeekData] = await Promise.all([
      this.getPeriodStats(objectId, thisWeekStart, today),
      this.getPeriodStats(objectId, lastWeekStart, lastWeekEnd),
    ])

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100 * 10) / 10
    }

    return {
      thisWeek: {
        sales: Math.round(thisWeekData.sales * 100) / 100,
        transactions: thisWeekData.transactions,
        customers: thisWeekData.customers,
        profit: Math.round(thisWeekData.profit * 100) / 100,
      },
      lastWeek: {
        sales: Math.round(lastWeekData.sales * 100) / 100,
        transactions: lastWeekData.transactions,
        customers: lastWeekData.customers,
        profit: Math.round(lastWeekData.profit * 100) / 100,
      },
      changes: {
        sales: calculateChange(thisWeekData.sales, lastWeekData.sales),
        transactions: calculateChange(thisWeekData.transactions, lastWeekData.transactions),
        customers: calculateChange(thisWeekData.customers, lastWeekData.customers),
        profit: calculateChange(thisWeekData.profit, lastWeekData.profit),
      },
    }
  }

  /**
   * 获取热销商品
   */
  async getTopProducts(shopId: string, days = 7, limit = 5): Promise<TopProduct[]> {
    const objectId = new Types.ObjectId(shopId)
    const dateRange = this.getDateRange('recent', days)

    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId: objectId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          salesAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          salesCount: { $sum: '$items.quantity' },
        },
      },
      { $sort: { salesAmount: -1 } },
      { $limit: limit },
    ])

    return result.map((item, index) => ({
      rank: index + 1,
      productId: item._id.toString(),
      productName: item.productName,
      salesAmount: Math.round(item.salesAmount * 100) / 100,
      salesCount: item.salesCount,
    }))
  }

  /**
   * 获取营业概览（每小时）
   */
  async getHourlyOverview(shopId: string) {
    const objectId = new Types.ObjectId(shopId)
    const today = this.getDateRange('today')

    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId: objectId,
          createdAt: { $gte: today.start, $lte: today.end },
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          sales: { $sum: '$totalAmount' },
          transactions: { $sum: 1 },
          customers: { $addToSet: '$customerId' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // 填充0-23小时的数据
    const hourlyData = []
    for (let hour = 0; hour < 24; hour++) {
      const found = result.find(r => r._id === hour)
      hourlyData.push({
        hour,
        label: `${String(hour).padStart(2, '0')}:00`,
        sales: found ? Math.round(found.sales * 100) / 100 : 0,
        transactions: found ? found.transactions : 0,
        customers: found ? found.customers.length : 0,
      })
    }

    return hourlyData
  }

  /**
   * 获取实时数据（用于WebSocket推送）
   */
  async getRealtimeData(shopId: string) {
    const stats = await this.getStats(shopId)
    const trends = await this.getTrends(shopId, 7)
    
    // 获取今日各小时数据
    const hourlyData = await this.getHourlyOverview(shopId)
    
    // 获取当前小时数据
    const currentHour = new Date().getHours()
    const currentHourData = hourlyData[currentHour]

    return {
      ...stats,
      trends,
      hourlyData,
      currentHourData,
      updateTime: new Date().toISOString(),
    }
  }

  /**
   * 获取时段分析
   */
  async getTimeSlotAnalysis(shopId: string) {
    const objectId = new Types.ObjectId(shopId)
    const today = this.getDateRange('today')

    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId: objectId,
          createdAt: { $gte: today.start, $lte: today.end },
        },
      },
      {
        $addFields: {
          timeSlot: {
            $switch: {
              branches: [
                { case: { $lt: [{ $hour: '$createdAt' }, 10] }, then: 'morning' },
                { case: { $lt: [{ $hour: '$createdAt' }, 14] }, then: 'noon' },
                { case: { $lt: [{ $hour: '$createdAt' }, 18] }, then: 'afternoon' },
                { case: { $lt: [{ $hour: '$createdAt' }, 22] }, then: 'evening' },
              ],
              default: 'night',
            },
          },
        },
      },
      {
        $group: {
          _id: '$timeSlot',
          sales: { $sum: '$totalAmount' },
          transactions: { $sum: 1 },
          customers: { $addToSet: '$customerId' },
        },
      },
    ])

    const slotNames: Record<string, string> = {
      morning: '早市 (06-10)',
      noon: '午市 (10-14)',
      afternoon: '下午 (14-18)',
      evening: '晚市 (18-22)',
      night: '夜市 (22-06)',
    }

    const totalSales = result.reduce((sum, r) => sum + r.sales, 0)

    return result.map(item => ({
      timeSlot: item._id,
      label: slotNames[item._id] || item._id,
      sales: Math.round(item.sales * 100) / 100,
      transactions: item.transactions,
      customers: item.customers.length,
      salesRatio: totalSales > 0 ? Math.round((item.sales / totalSales) * 1000) / 10 : 0,
    }))
  }

  /**
   * 获取支付方式分布
   */
  async getPaymentDistribution(shopId: string, days = 7) {
    const objectId = new Types.ObjectId(shopId)
    const dateRange = this.getDateRange('recent', days)

    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId: objectId,
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' },
        },
      },
      { $sort: { amount: -1 } },
    ])

    const totalAmount = result.reduce((sum, r) => sum + r.amount, 0)
    const methodNames: Record<string, string> = {
      cash: '现金',
      wechat: '微信支付',
      alipay: '支付宝',
      card: '银行卡',
    }

    return result.map(item => ({
      method: item._id,
      label: methodNames[item._id] || item._id,
      count: item.count,
      amount: Math.round(item.amount * 100) / 100,
      ratio: totalAmount > 0 ? Math.round((item.amount / totalAmount) * 1000) / 10 : 0,
    }))
  }

  // ==================== 私有方法 ====================

  /**
   * 获取指定时间段内的统计数据
   */
  private async getPeriodStats(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ) {
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          sales: { $sum: '$totalAmount' },
          transactions: { $sum: 1 },
          profit: { $sum: '$profit' },
          customers: { $addToSet: '$customerId' },
        },
      },
    ])

    if (result.length === 0) {
      return { sales: 0, transactions: 0, profit: 0, customers: 0 }
    }

    return {
      sales: result[0].sales || 0,
      transactions: result[0].transactions || 0,
      profit: result[0].profit || 0,
      customers: result[0].customers?.length || 0,
    }
  }

  /**
   * 获取日期范围
   */
  private getDateRange(type: 'today' | 'yesterday' | 'week' | 'month', days?: number) {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    switch (type) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        break
      case 'yesterday':
        start.setDate(now.getDate() - 1)
        start.setHours(0, 0, 0, 0)
        end.setDate(now.getDate() - 1)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        start.setDate(now.getDate() - 7)
        break
      case 'month':
        start.setMonth(now.getMonth() - 1)
        break
      case 'recent':
        start.setDate(now.getDate() - (days || 7))
        break
    }

    return { start, end }
  }

  /**
   * 获取指定日期的范围
   */
  private getDateRangeForDate(date: Date) {
    const start = new Date(date)
    const end = new Date(date)
    
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    
    return { start, end }
  }
}
