import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Task, TaskDocument, TaskComment } from './schemas/task.schema'

export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  highPriority: number
}

export interface TaskQuery {
  shopId: string
  status?: Task['status']
  type?: Task['type']
  priority?: Task['priority']
  assigneeId?: string
  page?: number
  pageSize?: number
  startDate?: Date
  endDate?: Date
  keyword?: string
}

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  /**
   * 获取任务列表（分页）
   */
  async findAll(query: TaskQuery) {
    const {
      shopId,
      status,
      type,
      priority,
      assigneeId,
      page = 1,
      pageSize = 20,
      keyword,
    } = query

    const filter: any = { shopId: new Types.ObjectId(shopId) }

    if (status) {
      filter.status = status
    }
    if (type) {
      filter.type = type
    }
    if (priority) {
      filter.priority = priority
    }
    if (assigneeId) {
      filter.assigneeId = new Types.ObjectId(assigneeId)
    }
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ]
    }

    const [list, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .populate('assigneeId', 'name phone')
        .populate('relatedDiagnosticId', 'totalScore')
        .sort({ priority: -1, dueDate: 1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.taskModel.countDocuments(filter).exec(),
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
   * 根据ID获取任务详情
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('任务不存在')
    }
    
    const task = await this.taskModel
      .findById(id)
      .populate('assigneeId', 'name phone role')
      .populate('relatedDiagnosticId', 'totalScore scores createdAt')
      .exec()

    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    return task
  }

  /**
   * 创建任务
   */
  async create(data: Partial<Task>) {
    // 验证必填字段
    if (!data.title) {
      throw new BadRequestException('任务标题不能为空')
    }
    if (!data.shopId) {
      throw new BadRequestException('门店ID不能为空')
    }
    if (!data.assigneeId) {
      throw new BadRequestException('负责人不能为空')
    }

    const task = new this.taskModel({
      ...data,
      shopId: new Types.ObjectId(data.shopId),
      assigneeId: new Types.ObjectId(data.assigneeId),
      relatedDiagnosticId: data.relatedDiagnosticId 
        ? new Types.ObjectId(data.relatedDiagnosticId) 
        : undefined,
      status: 'pending',
      priority: data.priority || 'medium',
      type: data.type || 'diagnostic',
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    })
    return task.save()
  }

  /**
   * 批量创建任务
   */
  async batchCreate(tasks: Partial<Task>[]) {
    const results = await Promise.all(tasks.map(task => this.create(task)))
    return results
  }

  /**
   * 更新任务
   */
  async update(id: string, data: Partial<Task>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('任务不存在')
    }

    const updateData: any = { ...data, updatedAt: new Date() }
    
    if (data.assigneeId) {
      updateData.assigneeId = new Types.ObjectId(data.assigneeId)
    }
    if (data.relatedDiagnosticId) {
      updateData.relatedDiagnosticId = new Types.ObjectId(data.relatedDiagnosticId)
    }

    const task = await this.taskModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec()

    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    return task
  }

  /**
   * 开始处理任务
   */
  async start(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('任务不存在')
    }

    const task = await this.taskModel
      .findByIdAndUpdate(
        id,
        {
          status: 'in_progress',
          startedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec()

    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    return task
  }

  /**
   * 完成任务
   */
  async complete(id: string, completionNote?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('任务不存在')
    }

    const task = await this.taskModel
      .findByIdAndUpdate(
        id,
        {
          status: 'completed',
          completedAt: new Date(),
          completionNote,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec()

    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    return task
  }

  /**
   * 取消任务
   */
  async cancel(id: string, reason?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('任务不存在')
    }

    const task = await this.taskModel
      .findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: reason,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec()

    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    return task
  }

  /**
   * 删除任务
   */
  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('任务不存在')
    }

    const result = await this.taskModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException('任务不存在')
    }
    return result
  }

  /**
   * 添加评论
   */
  async addComment(id: string, userId: string, content: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('任务不存在')
    }

    const comment: TaskComment = {
      id: new Types.ObjectId().toString(),
      userId: new Types.ObjectId(userId),
      content,
      createdAt: new Date(),
    }

    const task = await this.taskModel
      .findByIdAndUpdate(
        id,
        {
          $push: { comments: comment },
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec()

    if (!task) {
      throw new NotFoundException('任务不存在')
    }
    return { task, comment }
  }

  /**
   * 获取任务统计
   */
  async getStats(shopId: string) {
    const now = new Date()

    const result = await this.taskModel.aggregate([
      { $match: { shopId: new Types.ObjectId(shopId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'pending'] },
                    { $lt: ['$dueDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    if (result.length === 0) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        highPriority: 0,
        overdue: 0,
      }
    }

    return result[0] as TaskStats
  }

  /**
   * 获取待办任务（今日/本周到期）
   */
  async getUpcoming(shopId: string, days = 7) {
    const now = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    return this.taskModel
      .find({
        shopId: new Types.ObjectId(shopId),
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $gte: now, $lte: endDate },
      })
      .populate('assigneeId', 'name phone')
      .sort({ priority: -1, dueDate: 1 })
      .limit(10)
      .exec()
  }

  /**
   * 获取过期任务
   */
  async getOverdue(shopId: string) {
    const now = new Date()

    return this.taskModel
      .find({
        shopId: new Types.ObjectId(shopId),
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $lt: now },
      })
      .populate('assigneeId', 'name phone')
      .sort({ priority: -1, dueDate: 1 })
      .exec()
  }

  /**
   * 获取任务趋势（本周完成情况）
   */
  async getTrend(shopId: string, days = 7) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await this.taskModel.aggregate([
      {
        $match: {
          shopId: new Types.ObjectId(shopId),
          completedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // 填充缺失的日期
    const trend = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const found = result.find(r => r._id === dateStr)
      trend.push({
        date: dateStr,
        completed: found?.count || 0,
      })
    }

    return trend
  }

  /**
   * 获取任务列表（供下拉选择）
   */
  async getOptions(shopId: string, status?: Task['status']) {
    const filter: any = { shopId: new Types.ObjectId(shopId) }
    if (status) {
      filter.status = status
    }

    const tasks = await this.taskModel
      .find(filter)
      .select('_id title type priority dueDate')
      .sort({ priority: -1, dueDate: 1 })
      .limit(50)
      .exec()

    return tasks.map(task => ({
      value: task._id.toString(),
      label: task.title,
      type: task.type,
      priority: task.priority,
      dueDate: task.dueDate,
    }))
  }

  /**
   * 根据诊断结果自动创建任务
   */
  async createFromDiagnostic(shopId: string, diagnosticId: string, suggestions: any[]) {
    const tasks = suggestions
      .filter(s => s.priority === 'high')
      .map(suggestion => ({
        title: `优化${suggestion.dimension}`,
        description: suggestion.description,
        type: 'diagnostic' as const,
        priority: suggestion.priority,
        shopId,
        assigneeId: null, // 需要手动分配
        relatedDiagnosticId: diagnosticId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后到期
      }))

    if (tasks.length > 0) {
      return this.batchCreate(tasks)
    }
    return []
  }
}
