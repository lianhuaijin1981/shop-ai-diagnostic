import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Shop, ShopDocument } from './schemas/shop.schema'

export interface ShopStats {
  totalSales: number
  totalTransactions: number
  totalCustomers: number
  totalProfit: number
  avgDailySales: number
}

@Injectable()
export class ShopService {
  constructor(@InjectModel(Shop.name) private shopModel: Model<ShopDocument>) {}

  /**
   * 获取所有门店
   */
  async findAll() {
    return this.shopModel.find().exec()
  }

  /**
   * 获取门店列表（分页）
   */
  async findPaginated(page = 1, pageSize = 20, filter?: { status?: string; keyword?: string }) {
    const query: any = {}
    
    if (filter?.status) {
      query.status = filter.status
    }
    
    if (filter?.keyword) {
      query.$or = [
        { name: { $regex: filter.keyword, $options: 'i' } },
        { code: { $regex: filter.keyword, $options: 'i' } },
        { address: { $regex: filter.keyword, $options: 'i' } },
      ]
    }

    const [list, total] = await Promise.all([
      this.shopModel
        .find(query)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.shopModel.countDocuments(query).exec(),
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
   * 根据ID获取门店
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('门店不存在')
    }
    
    const shop = await this.shopModel.findById(id).exec()
    if (!shop) {
      throw new NotFoundException('门店不存在')
    }
    return shop
  }

  /**
   * 创建门店
   */
  async create(data: Partial<Shop>) {
    // 生成门店编码
    const count = await this.shopModel.countDocuments().exec()
    const shopCode = `SHOP${String(count + 1).padStart(4, '0')}`
    
    const shop = new this.shopModel({
      ...data,
      code: shopCode,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return shop.save()
  }

  /**
   * 更新门店信息
   */
  async update(id: string, data: Partial<Shop>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('门店不存在')
    }
    
    const shop = await this.shopModel
      .findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true })
      .exec()
    
    if (!shop) {
      throw new NotFoundException('门店不存在')
    }
    return shop
  }

  /**
   * 删除门店（软删除）
   */
  async delete(id: string) {
    return this.update(id, { status: 'closed' })
  }

  /**
   * 永久删除门店
   */
  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('门店不存在')
    }
    
    const result = await this.shopModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException('门店不存在')
    }
    return result
  }

  /**
   * 获取门店基础统计
   */
  async getBasicStats(shopId: string) {
    const shop = await this.findById(shopId)
    
    return {
      id: shop._id,
      name: shop.name,
      code: shop.code,
      address: shop.address,
      manager: shop.manager,
      status: shop.status,
    }
  }

  /**
   * 更新门店配置
   */
  async updateConfig(id: string, config: Partial<Shop['config']>) {
    const shop = await this.findById(id)
    shop.config = { ...shop.config, ...config }
    shop.updatedAt = new Date()
    return shop.save()
  }

  /**
   * 获取门店营业时间
   */
  async getBusinessHours(id: string) {
    const shop = await this.findById(id)
    return shop.businessHours
  }

  /**
   * 更新营业时间
   */
  async updateBusinessHours(id: string, hours: Shop['businessHours']) {
    const shop = await this.findById(id)
    shop.businessHours = hours
    shop.updatedAt = new Date()
    return shop.save()
  }

  /**
   * 检查门店是否营业中
   */
  async isOpen(id: string) {
    const shop = await this.findById(id)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const currentTime = now.toTimeString().slice(0, 5)
    
    const todayHours = shop.businessHours?.find(h => h.day === dayOfWeek)
    
    if (!todayHours || !todayHours.isOpen) {
      return { isOpen: false, reason: '今日休息' }
    }
    
    if (currentTime < todayHours.openTime || currentTime > todayHours.closeTime) {
      return { isOpen: false, reason: '已打烊' }
    }
    
    return { isOpen: true }
  }

  /**
   * 获取门店列表（供下拉选择）
   */
  async getOptions() {
    const shops = await this.shopModel
      .find({ status: 'active' })
      .select('_id name code')
      .exec()
    
    return shops.map(shop => ({
      value: shop._id.toString(),
      label: shop.name,
      code: shop.code,
    }))
  }
}
