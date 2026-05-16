import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Alert, AlertDocument } from './schemas/alert.schema'

export interface AlertStats {
  total: number
  danger: number
  warning: number
  info: number
  pending: number
  processing: number
  resolved: number
}

export interface AlertRule {
  dimension: string
  dangerThreshold: number
  warningThreshold: number
  infoThreshold?: number
}

@Injectable()
export class AlertService {
  // 默认预警规则（可配置）
  private defaultAlertRules: AlertRule[] = [
    { dimension: 'customerFlow', dangerThreshold: 70, warningThreshold: 85 },
    { dimension: 'conversion', dangerThreshold: 30, warningThreshold: 35 },
    { dimension: 'avgAmount', dangerThreshold: 150, warningThreshold: 180 },
    { dimension: 'repurchase', dangerThreshold: 35, warningThreshold: 40 },
    { dimension: 'profit', dangerThreshold: 20, warningThreshold: 25 },
  ]

  constructor(@InjectModel(Alert.name) private alertModel: Model<AlertDocument>) {}

  /**
   * 获取预警列表
   */
  async findAll(
    shopId: string,
    options?: {
      status?: Alert['status']
      type?: Alert['type']
      dimension?: string
      page?: number
      pageSize?: number
      startDate?: Date
      endDate?: Date
    }
  ) {
    const query: any = { shopId: new Types.ObjectId(shopId) }
    
    if (options?.status) {
      query.status = options.status
    }
    if (options?.type) {
      query.type = options.type
    }
    if (options?.dimension) {
      query.dimension = options.dimension
    }
    if (options?.startDate || options?.endDate) {
      query.createdAt = {}
      if (options.startDate) {
        query.createdAt.$gte = options.startDate
      }
      if (options.endDate) {
        query.createdAt.$lte = options.endDate
      }
    }

    const page = options?.page || 1
    const pageSize = options?.pageSize || 20

    const [list, total] = await Promise.all([
      this.alertModel
        .find(query)
        .sort({ createdAt: -1, type: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.alertModel.countDocuments(query).exec(),
    ])

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * 根据ID获取预警详情
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('预警不存在')
    }
    
    const alert = await this.alertModel.findById(id).exec()
    if (!alert) {
      throw new NotFoundException('预警不存在')
    }
    return alert
  }

  /**
   * 创建预警
   */
  async create(data: Partial<Alert>) {
    // 检查是否已存在相同维度未处理的预警
    if (data.dimension && data.shopId) {
      const existing = await this.alertModel.findOne({
        shopId: data.shopId,
        dimension: data.dimension,
        status: { $in: ['pending', 'processing'] },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24小时内
      }).exec()

      if (existing) {
        // 更新现有预警
        existing.value = data.value || existing.value
        existing.description = data.description || existing.description
        return existing.save()
      }
    }

    const alert = new this.alertModel({
      ...data,
      shopId: data.shopId ? new Types.ObjectId(data.shopId) : undefined,
      createdAt: new Date(),
      status: 'pending',
    })
    return alert.save()
  }

  /**
   * 批量创建预警
   */
  async batchCreate(alerts: Partial<Alert>[]) {
    const results = await Promise.all(
      alerts.map(alert => this.create(alert))
    )
    return results
  }

  /**
   * 处理预警
   */
  async process(id: string, userId: string, note?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('预警不存在')
    }
    
    const alert = await this.alertModel
      .findByIdAndUpdate(
        id,
        {
          status: 'processing',
          processingAt: new Date(),
          processingBy: userId,
          processingNote: note,
        },
        { new: true },
      )
      .exec()
    
    if (!alert) {
      throw new NotFoundException('预警不存在')
    }
    return alert
  }

  /**
   * 解决预警
   */
  async resolve(id: string, userId: string, resolution?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('预警不存在')
    }
    
    const alert = await this.alertModel
      .findByIdAndUpdate(
        id,
        {
          status: 'resolved',
          resolvedAt: new Date(),
          resolvedBy: userId,
          resolution,
        },
        { new: true },
      )
      .exec()
    
    if (!alert) {
      throw new NotFoundException('预警不存在')
    }
    return alert
  }

  /**
   * 忽略预警
   */
  async ignore(id: string, userId: string, reason?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('预警不存在')
    }
    
    const alert = await this.alertModel
      .findByIdAndUpdate(
        id,
        {
          status: 'resolved',
          resolvedAt: new Date(),
          resolvedBy: userId,
          resolution: reason || '已忽略',
        },
        { new: true },
      )
      .exec()
    
    if (!alert) {
      throw new NotFoundException('预警不存在')
    }
    return alert
  }

  /**
   * 获取预警统计
   */
  async getStats(shopId: string, startDate?: Date, endDate?: Date) {
    const matchQuery: any = { shopId: new Types.ObjectId(shopId) }
    
    if (startDate || endDate) {
      matchQuery.createdAt = {}
      if (startDate) {
        matchQuery.createdAt.$gte = startDate
      }
      if (endDate) {
        matchQuery.createdAt.$lte = endDate
      }
    }

    const result = await this.alertModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          danger: {
            $sum: { $cond: [{ $eq: ['$type', 'danger'] }, 1, 0] },
          },
          warning: {
            $sum: { $cond: [{ $eq: ['$type', 'warning'] }, 1, 0] },
          },
          info: {
            $sum: { $cond: [{ $eq: ['$type', 'info'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          processing: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
        },
      },
    ])

    if (result.length === 0) {
      return {
        total: 0,
        danger: 0,
        warning: 0,
        info: 0,
        pending: 0,
        processing: 0,
        resolved: 0,
      }
    }

    return result[0] as AlertStats
  }

  /**
   * 获取待处理预警数量
   */
  async getPendingCount(shopId: string) {
    return this.alertModel.countDocuments({
      shopId: new Types.ObjectId(shopId),
      status: 'pending',
    }).exec()
  }

  /**
   * 获取预警趋势
   */
  async getTrend(shopId: string, days = 7) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await this.alertModel.aggregate([
      {
        $match: {
          shopId: new Types.ObjectId(shopId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          types: {
            $push: {
              type: '$_id.type',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return result.map(item => {
      const types: Record<string, number> = { danger: 0, warning: 0, info: 0 }
      item.types.forEach((t: { type: string; count: number }) => {
        types[t.type] = t.count
      })
      return {
        date: item._id,
        ...types,
        total: item.total,
      }
    })
  }

  /**
   * 根据诊断结果检查并创建预警
   */
  async checkAndCreateAlerts(
    shopId: string,
    scores: {
      customerFlow?: { score: number; value: number }
      conversion?: { score: number; value: number }
      avgAmount?: { score: number; value: number }
      repurchase?: { score: number; value: number }
      profit?: { score: number; value: number }
    },
    customRules?: AlertRule[]
  ) {
    const rules = customRules || this.defaultAlertRules
    const alerts: Partial<Alert>[] = []
    const dimensionNames: Record<string, string> = {
      customerFlow: '客流',
      conversion: '转化率',
      avgAmount: '客单价',
      repurchase: '复购率',
      profit: '利润率',
    }

    for (const rule of rules) {
      const score = scores[rule.dimension as keyof typeof scores]
      if (!score) continue

      const value = score.value
      let alertType: Alert['type'] | null = null
      let threshold = 0

      if (value < rule.dangerThreshold) {
        alertType = 'danger'
        threshold = rule.dangerThreshold
      } else if (value < rule.warningThreshold) {
        alertType = 'warning'
        threshold = rule.warningThreshold
      }

      if (alertType) {
        alerts.push({
          type: alertType,
          shopId: shopId,
          dimension: rule.dimension,
          title: `${dimensionNames[rule.dimension]}预警`,
          description: `当前${dimensionNames[rule.dimension]}为${value}，${alertType === 'danger' ? '低于危险' : '低于警告'}阈值${threshold}`,
          value,
          threshold,
          status: 'pending',
        })
      }
    }

    if (alerts.length > 0) {
      return this.batchCreate(alerts)
    }
    return []
  }

  /**
   * 获取各维度预警统计
   */
  async getDimensionStats(shopId: string) {
    const result = await this.alertModel.aggregate([
      {
        $match: {
          shopId: new Types.ObjectId(shopId),
          status: 'pending',
        },
      },
      {
        $group: {
          _id: '$dimension',
          count: { $sum: 1 },
          dangerCount: {
            $sum: { $cond: [{ $eq: ['$type', 'danger'] }, 1, 0] },
          },
          warningCount: {
            $sum: { $cond: [{ $eq: ['$type', 'warning'] }, 1, 0] },
          },
        },
      },
    ])

    return result.map(item => ({
      dimension: item._id,
      total: item.count,
      danger: item.dangerCount,
      warning: item.warningCount,
    }))
  }

  /**
   * 删除已解决的旧预警
   */
  async cleanup(daysToKeep = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await this.alertModel.deleteMany({
      status: 'resolved',
      resolvedAt: { $lt: cutoffDate },
    }).exec()

    return { deletedCount: result.deletedCount }
  }
}
