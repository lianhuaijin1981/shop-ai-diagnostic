import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { Diagnostic, DiagnosticDocument } from './schemas/diagnostic.schema'
import { Transaction, TransactionDocument } from './schemas/transaction.schema'
import { Customer, CustomerDocument } from './schemas/customer.schema'

export interface DiagnosticInput {
  shopId: string
  startDate: Date
  endDate: Date
}

export interface DimensionResult {
  value: number
  trend: 'up' | 'down' | 'stable'
  changeRate?: number
}

export interface ScoreResult {
  score: number
  trend: 'up' | 'down' | 'stable'
}

@Injectable()
export class DiagnosticService {
  private weights: Record<string, number>
  private benchmarks: Record<string, number>

  constructor(
    @InjectModel(Diagnostic.name) private diagnosticModel: Model<DiagnosticDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private configService: ConfigService,
  ) {
    // 从配置加载权重和基准值
    this.weights = this.configService.get('diagnostic.weights') || {
      customerFlow: 0.20,
      conversion: 0.25,
      avgAmount: 0.20,
      repurchase: 0.20,
      profit: 0.15,
    }
    this.benchmarks = this.configService.get('diagnostic.benchmarks') || {
      customerFlow: 100,      // 日均客流基准
      conversion: 40,        // 转化率基准(%)
      avgAmount: 200,        // 客单价基准(元)
      repurchase: 50,        // 复购率基准(%)
      profit: 30,           // 利润率基准(%)
    }
  }

  /**
   * 获取五维诊断结果
   */
  async getFiveDimensionDiagnostic(shopId: string, startDate: Date, endDate: Date) {
    const objectId = new Types.ObjectId(shopId)
    
    // 并行计算各维度数据
    const [
      customerFlowData,
      conversionData,
      avgAmountData,
      repurchaseData,
      profitData,
    ] = await Promise.all([
      this.calculateCustomerFlow(objectId, startDate, endDate),
      this.calculateConversion(objectId, startDate, endDate),
      this.calculateAvgAmount(objectId, startDate, endDate),
      this.calculateRepurchase(objectId, startDate, endDate),
      this.calculateProfit(objectId, startDate, endDate),
    ])

    // 计算各维度得分
    const scores = {
      customerFlow: this.calculateScore(customerFlowData.value, this.benchmarks.customerFlow, customerFlowData.trend),
      conversion: this.calculateScore(conversionData.value, this.benchmarks.conversion, conversionData.trend),
      avgAmount: this.calculateScore(avgAmountData.value, this.benchmarks.avgAmount, avgAmountData.trend),
      repurchase: this.calculateScore(repurchaseData.value, this.benchmarks.repurchase, repurchaseData.trend),
      profit: this.calculateScore(profitData.value, this.benchmarks.profit, profitData.trend),
    }

    // 计算加权总分
    const totalScore = (
      scores.customerFlow.score * this.weights.customerFlow +
      scores.conversion.score * this.weights.conversion +
      scores.avgAmount.score * this.weights.avgAmount +
      scores.repurchase.score * this.weights.repurchase +
      scores.profit.score * this.weights.profit
    )

    // 生成诊断建议
    const suggestions = this.generateSuggestions(scores, {
      customerFlow: customerFlowData,
      conversion: conversionData,
      avgAmount: avgAmountData,
      repurchase: repurchaseData,
      profit: profitData,
    })

    // 持久化诊断结果
    const diagnostic = new this.diagnosticModel({
      shopId: objectId,
      period: 'custom',
      periodRange: { start: startDate, end: endDate },
      scores: {
        customerFlow: { ...scores.customerFlow, ...customerFlowData, weight: this.weights.customerFlow, benchmark: this.benchmarks.customerFlow },
        conversion: { ...scores.conversion, ...conversionData, weight: this.weights.conversion, benchmark: this.benchmarks.conversion },
        avgAmount: { ...scores.avgAmount, ...avgAmountData, weight: this.weights.avgAmount, benchmark: this.benchmarks.avgAmount },
        repurchase: { ...scores.repurchase, ...repurchaseData, weight: this.weights.repurchase, benchmark: this.benchmarks.repurchase },
        profit: { ...scores.profit, ...profitData, weight: this.weights.profit, benchmark: this.benchmarks.profit },
      },
      totalScore: Math.round(totalScore * 100) / 100,
      suggestions,
    })

    return diagnostic.save()
  }

  /**
   * 获取诊断历史
   */
  async findByShop(shopId: string, limit = 10) {
    return this.diagnosticModel
      .find({ shopId: new Types.ObjectId(shopId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec()
  }

  /**
   * 获取最新诊断
   */
  async findLatest(shopId: string) {
    return this.diagnosticModel
      .findOne({ shopId: new Types.ObjectId(shopId) })
      .sort({ createdAt: -1 })
      .exec()
  }

  /**
   * 获取趋势分析
   */
  async getTrendAnalysis(shopId: string, days = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const diagnostics = await this.diagnosticModel
      .find({
        shopId: new Types.ObjectId(shopId),
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ createdAt: 1 })
      .exec()

    return diagnostics.map(d => ({
      date: d.createdAt.toISOString().split('T')[0],
      totalScore: d.totalScore,
      scores: d.scores,
    }))
  }

  /**
   * 计算客流维度
   * 公式: 日均客流 = 期间总客流 / 天数
   */
  private async calculateCustomerFlow(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<DimensionResult> {
    // 获取期间交易记录中的顾客数
    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          shopId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$customerId',
          visitCount: { $sum: 1 },
        },
      },
      {
        $count: 'totalCustomers',
      },
    ])

    // 获取期间顾客表的访问记录
    const customerVisits = await this.customerModel.aggregate([
      {
        $match: {
          shopId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $count: 'totalVisits',
      },
    ])

    // 计算天数
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1
    
    // 日均客流 = 总访问人次 / 天数
    const totalVisits = (customerVisits[0]?.totalVisits || 0) + (transactions[0]?.totalCustomers || 0)
    const dailyAvg = Math.round(totalVisits / days)

    // 计算趋势（与上期对比）
    const prevStart = new Date(startDate)
    prevStart.setDate(prevStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const prevEnd = new Date(startDate)
    prevEnd.setDate(prevEnd.getDate() - 1)

    const prevResult = await this.calculateCustomerFlow(shopId, prevStart, prevEnd)
    const changeRate = prevResult.value > 0 ? (dailyAvg - prevResult.value) / prevResult.value : 0

    return {
      value: dailyAvg,
      trend: changeRate > 0.05 ? 'up' : changeRate < -0.05 ? 'down' : 'stable',
      changeRate: Math.round(changeRate * 100),
    }
  }

  /**
   * 计算转化率维度
   * 公式: 转化率 = 成交顾客数 / 进店顾客数 × 100%
   */
  private async calculateConversion(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<DimensionResult> {
    // 获取进店顾客数（创建过交易或访问记录的顾客）
    const enteredCustomers = await this.transactionModel.distinct('customerId', {
      shopId,
      createdAt: { $gte: startDate, $lte: endDate },
    })

    // 获取成交顾客数（有实际购买的顾客，排除退款）
    const purchasedCustomers = await this.transactionModel.distinct('customerId', {
      shopId,
      createdAt: { $gte: startDate, $lte: endDate },
      totalAmount: { $gt: 0 },
    })

    const enteredCount = enteredCustomers.length || 1
    const purchasedCount = purchasedCustomers.length
    const conversionRate = (purchasedCount / enteredCount) * 100

    // 计算趋势
    const prevStart = new Date(startDate)
    prevStart.setDate(prevStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const prevEnd = new Date(startDate)
    prevEnd.setDate(prevEnd.getDate() - 1)

    const prevResult = await this.calculateConversion(shopId, prevStart, prevEnd)
    const changeRate = prevResult.value > 0 ? (conversionRate - prevResult.value) / prevResult.value : 0

    return {
      value: Math.round(conversionRate * 10) / 10,
      trend: changeRate > 2 ? 'up' : changeRate < -2 ? 'down' : 'stable',
      changeRate: Math.round(changeRate * 100),
    }
  }

  /**
   * 计算客单价维度
   * 公式: 客单价 = 总销售额 / 订单数
   */
  private async calculateAvgAmount(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<DimensionResult> {
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId,
          createdAt: { $gte: startDate, $lte: endDate },
          totalAmount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ])

    const totalSales = result[0]?.totalSales || 0
    const orderCount = result[0]?.orderCount || 1
    const avgAmount = totalSales / orderCount

    // 计算趋势
    const prevStart = new Date(startDate)
    prevStart.setDate(prevStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const prevEnd = new Date(startDate)
    prevEnd.setDate(prevEnd.getDate() - 1)

    const prevResult = await this.calculateAvgAmount(shopId, prevStart, prevEnd)
    const changeRate = prevResult.value > 0 ? (avgAmount - prevResult.value) / prevResult.value : 0

    return {
      value: Math.round(avgAmount * 100) / 100,
      trend: changeRate > 0.05 ? 'up' : changeRate < -0.05 ? 'down' : 'stable',
      changeRate: Math.round(changeRate * 100),
    }
  }

  /**
   * 计算复购率维度
   * 公式: 复购率 = 回头客数 / 总顾客数 × 100%
   */
  private async calculateRepurchase(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<DimensionResult> {
    // 获取所有有购买记录的顾客
    const customers = await this.transactionModel.aggregate([
      {
        $match: {
          shopId,
          createdAt: { $gte: startDate, $lte: endDate },
          totalAmount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$customerId',
          orderCount: { $sum: 1 },
        },
      },
    ])

    const totalCustomers = customers.length
    // 回头客：订单数 > 1 的顾客
    const repurchaseCustomers = customers.filter(c => c.orderCount > 1).length
    const repurchaseRate = totalCustomers > 0 ? (repurchaseCustomers / totalCustomers) * 100 : 0

    // 计算趋势
    const prevStart = new Date(startDate)
    prevStart.setDate(prevStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const prevEnd = new Date(startDate)
    prevEnd.setDate(prevEnd.getDate() - 1)

    const prevResult = await this.calculateRepurchase(shopId, prevStart, prevEnd)
    const changeRate = prevResult.value > 0 ? (repurchaseRate - prevResult.value) / prevResult.value : 0

    return {
      value: Math.round(repurchaseRate * 10) / 10,
      trend: changeRate > 2 ? 'up' : changeRate < -2 ? 'down' : 'stable',
      changeRate: Math.round(changeRate * 100),
    }
  }

  /**
   * 计算利润率维度
   * 公式: 利润率 = 利润 / 销售额 × 100%
   */
  private async calculateProfit(
    shopId: Types.ObjectId,
    startDate: Date,
    endDate: Date,
  ): Promise<DimensionResult> {
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId,
          createdAt: { $gte: startDate, $lte: endDate },
          totalAmount: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalProfit: { $sum: '$profit' },
        },
      },
    ])

    const totalSales = result[0]?.totalSales || 0
    const totalProfit = result[0]?.totalProfit || 0
    const profitRate = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0

    // 计算趋势
    const prevStart = new Date(startDate)
    prevStart.setDate(prevStart.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const prevEnd = new Date(startDate)
    prevEnd.setDate(prevEnd.getDate() - 1)

    const prevResult = await this.calculateProfit(shopId, prevStart, prevEnd)
    const changeRate = prevResult.value > 0 ? (profitRate - prevResult.value) / prevResult.value : 0

    return {
      value: Math.round(profitRate * 10) / 10,
      trend: changeRate > 2 ? 'up' : changeRate < -2 ? 'down' : 'stable',
      changeRate: Math.round(changeRate * 100),
    }
  }

  /**
   * 计算维度得分
   * 得分 = (实际值 / 基准值) × 100，上限100分
   */
  private calculateScore(value: number, benchmark: number, trend: 'up' | 'down' | 'stable'): ScoreResult {
    if (value === 0) {
      return { score: 0, trend: 'down' }
    }

    const rawScore = (value / benchmark) * 100
    const score = Math.min(Math.round(rawScore * 100) / 100, 100)

    return { score, trend }
  }

  /**
   * 生成诊断建议
   */
  private generateSuggestions(
    scores: Record<string, ScoreResult>,
    rawData: Record<string, DimensionResult>,
  ) {
    const suggestions = []
    const dimensionNames: Record<string, string> = {
      customerFlow: '客流',
      conversion: '转化率',
      avgAmount: '客单价',
      repurchase: '复购率',
      profit: '利润率',
    }

    const suggestionTemplates: Record<string, { high: string; medium: string }> = {
      customerFlow: {
        high: '客流明显低于行业基准，建议：1) 优化门店陈列 2) 加强引流推广 3) 开展促销活动吸引新客',
        medium: '客流有提升空间，建议：通过社交媒体、会员营销等方式增加曝光',
      },
      conversion: {
        high: '转化率偏低，建议：1) 提升导购服务水平 2) 优化产品体验 3) 开展限时优惠促进成交',
        medium: '转化率有待提升，建议：加强员工销售话术培训，提高客户转化',
      },
      avgAmount: {
        high: '客单价显著低于预期，建议：1) 推行组合销售 2) 推荐高价值商品 3) 设置满减活动',
        medium: '客单价有提升空间，建议：通过关联销售、套餐优惠等方式提高单笔订单金额',
      },
      repurchase: {
        high: '复购率较低，建议：1) 建立会员体系 2) 开展老客回馈活动 3) 优化售后服务',
        medium: '复购率有待提升，建议：通过定期回访、积分兑换等方式维护老客户',
      },
      profit: {
        high: '利润率偏低，建议：1) 优化采购渠道降低成本 2) 调整商品结构 3) 控制运营开支',
        medium: '利润率有优化空间，建议：关注高毛利商品的销售占比',
      },
    }

    for (const [dimension, scoreData] of Object.entries(scores)) {
      if (scoreData.score < 80) {
        const priority = scoreData.score < 60 ? 'high' : 'medium'
        const template = suggestionTemplates[dimension]?.[priority] || `${dimensionNames[dimension]}需要优化`

        suggestions.push({
          id: new Types.ObjectId().toString(),
          dimension,
          priority,
          title: `${dimensionNames[dimension]}优化建议`,
          description: template,
          action: '查看详细方案',
          currentValue: rawData[dimension]?.value || 0,
          benchmarkValue: this.benchmarks[dimension] || 0,
          expectedEffect: `预计提升${dimensionNames[dimension]}至${Math.min(this.benchmarks[dimension] * 1.1, 100).toFixed(0)}水平`,
        })
      }
    }

    // 按优先级排序
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }
}
