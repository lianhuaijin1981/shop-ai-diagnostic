import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Product, ProductDocument } from './schemas/product.schema'
import { Transaction, TransactionDocument } from '../diagnostic/schemas/transaction.schema'

export interface ProductAnalysis {
  productId: string
  productName: string
  category: string
  salesAmount: number
  salesCount: number
  profit: number
  profitRate: number
  rank: number
}

export interface StockAlert {
  productId: string
  productName: string
  category: string
  currentStock: number
  minStock: number
  alertLevel: 'normal' | 'low' | 'critical'
  suggestedReorder: number
}

export interface CategoryAnalysis {
  category: string
  salesAmount: number
  salesCount: number
  avgPrice: number
  profitRate: number
  salesRatio: number
  productCount: number
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  /**
   * 获取所有商品
   */
  async findAll(filter?: { status?: string; category?: string; keyword?: string }) {
    const query: any = {}
    
    if (filter?.status) {
      query.status = filter.status
    }
    
    if (filter?.category) {
      query.category = filter.category
    }
    
    if (filter?.keyword) {
      query.$or = [
        { name: { $regex: filter.keyword, $options: 'i' } },
        { code: { $regex: filter.keyword, $options: 'i' } },
      ]
    }

    return this.productModel.find(query).exec()
  }

  /**
   * 分页查询
   */
  async findPaginated(page = 1, pageSize = 20, filter?: { status?: string; category?: string; keyword?: string }) {
    const query: any = {}
    
    if (filter?.status) {
      query.status = filter.status
    }
    
    if (filter?.category) {
      query.category = filter.category
    }
    
    if (filter?.keyword) {
      query.$or = [
        { name: { $regex: filter.keyword, $options: 'i' } },
        { code: { $regex: filter.keyword, $options: 'i' } },
      ]
    }

    const [list, total] = await Promise.all([
      this.productModel
        .find(query)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.productModel.countDocuments(query).exec(),
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
   * 根据ID获取商品
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('商品不存在')
    }
    
    const product = await this.productModel.findById(id).exec()
    if (!product) {
      throw new NotFoundException('商品不存在')
    }
    return product
  }

  /**
   * 根据分类获取商品
   */
  async findByCategory(category: string) {
    return this.productModel.find({ category, status: 'active' }).exec()
  }

  /**
   * 获取商品分类列表
   */
  async getCategories() {
    const categories = await this.productModel.distinct('category').exec()
    return categories.filter(c => c).map(category => ({
      value: category,
      label: category,
    }))
  }

  /**
   * 创建商品
   */
  async create(data: Partial<Product>) {
    const count = await this.productModel.countDocuments().exec()
    const productCode = `PROD${String(count + 1).padStart(6, '0')}`
    
    const product = new this.productModel({
      ...data,
      code: productCode,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return product.save()
  }

  /**
   * 更新商品
   */
  async update(id: string, data: Partial<Product>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('商品不存在')
    }
    
    const product = await this.productModel
      .findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true })
      .exec()
    
    if (!product) {
      throw new NotFoundException('商品不存在')
    }
    return product
  }

  /**
   * 删除商品（软删除）
   */
  async delete(id: string) {
    return this.update(id, { status: 'offline' })
  }

  /**
   * 批量更新库存
   */
  async batchUpdateStock(updates: { id: string; stock: number }[]) {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(update.id) },
        update: { 
          $set: { 
            stock: update.stock,
            updatedAt: new Date(),
          },
        },
      },
    }))
    
    return this.productModel.bulkWrite(bulkOps)
  }

  /**
   * 获取库存预警列表
   */
  async getStockAlerts(shopId?: string) {
    const products = await this.productModel.find({ status: 'active' }).exec()
    
    const alerts: StockAlert[] = []
    
    for (const product of products) {
      if (product.stock < product.minStock) {
        const alertLevel = product.stock < product.minStock * 0.3 ? 'critical' : 'low'
        // 建议补货量 = 最低库存 × 2 - 当前库存
        const suggestedReorder = Math.max(product.minStock * 2 - product.stock, product.minStock)
        
        alerts.push({
          productId: product._id.toString(),
          productName: product.name,
          category: product.category,
          currentStock: product.stock,
          minStock: product.minStock,
          alertLevel,
          suggestedReorder,
        })
      }
    }
    
    // 按预警级别排序
    return alerts.sort((a, b) => {
      const levelOrder = { critical: 0, low: 1, normal: 2 }
      return levelOrder[a.alertLevel] - levelOrder[b.alertLevel]
    })
  }

  /**
   * 获取快消品分析（销量TOP）
   */
  async getFastMovingProducts(shopId: string, startDate: Date, endDate: Date, limit = 10) {
    const objectId = new Types.ObjectId(shopId)
    
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId: objectId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          category: { $first: '$items.category' },
          salesAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          salesCount: { $sum: '$items.quantity' },
          profit: { $sum: { $multiply: [{ $subtract: ['$items.price', '$items.cost'] }, '$items.quantity'] } },
        },
      },
      { $sort: { salesAmount: -1 } },
      { $limit: limit },
    ])

    const totalSales = result.reduce((sum, item) => sum + item.salesAmount, 0)
    
    return result.map((item, index): ProductAnalysis => ({
      productId: item._id.toString(),
      productName: item.productName,
      category: item.category,
      salesAmount: Math.round(item.salesAmount * 100) / 100,
      salesCount: item.salesCount,
      profit: Math.round(item.profit * 100) / 100,
      profitRate: item.salesAmount > 0 ? Math.round((item.profit / item.salesAmount) * 1000) / 10 : 0,
      rank: index + 1,
      salesRatio: totalSales > 0 ? Math.round((item.salesAmount / totalSales) * 1000) / 10 : 0,
    }))
  }

  /**
   * 获取滞销品分析（销量BOTTOM）
   */
  async getSlowMovingProducts(shopId: string, startDate: Date, endDate: Date, limit = 10) {
    const objectId = new Types.ObjectId(shopId)
    
    // 先获取所有有销售的商品
    const soldProducts = await this.transactionModel.aggregate([
      {
        $match: {
          shopId: objectId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          category: { $first: '$items.category' },
          salesAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          salesCount: { $sum: '$items.quantity' },
          profit: { $sum: { $multiply: [{ $subtract: ['$items.price', '$items.cost'] }, '$items.quantity'] } },
        },
      },
      { $sort: { salesAmount: 1 } },
    ])

    // 获取所有活跃商品
    const allProducts = await this.productModel.find({ status: 'active' }).exec()
    const soldProductIds = new Set(soldProducts.map(p => p._id.toString()))
    
    // 找出未销售的商品
    const unsoldProducts = allProducts
      .filter(p => !soldProductIds.has(p._id.toString()))
      .map(p => ({
        _id: p._id,
        productName: p.name,
        category: p.category,
        salesAmount: 0,
        salesCount: 0,
        profit: 0,
      }))

    // 合并并取最后N个
    const combined = [...soldProducts, ...unsoldProducts].slice(0, limit)
    const totalSales = soldProducts.reduce((sum, item) => sum + item.salesAmount, 0)
    
    return combined.map((item, index): ProductAnalysis => ({
      productId: item._id.toString(),
      productName: item.productName,
      category: item.category,
      salesAmount: Math.round(item.salesAmount * 100) / 100,
      salesCount: item.salesCount,
      profit: Math.round(item.profit * 100) / 100,
      profitRate: item.salesAmount > 0 ? Math.round((item.profit / item.salesAmount) * 1000) / 10 : 0,
      rank: index + 1,
      salesRatio: totalSales > 0 && item.salesAmount > 0 ? Math.round((item.salesAmount / totalSales) * 1000) / 10 : 0,
    }))
  }

  /**
   * 获取分类分析
   */
  async getCategoryAnalysis(shopId: string, startDate: Date, endDate: Date) {
    const objectId = new Types.ObjectId(shopId)
    
    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId: objectId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          salesAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          salesCount: { $sum: '$items.quantity' },
          totalCost: { $sum: { $multiply: ['$items.cost', '$items.quantity'] } },
          productCount: { $addToSet: '$items.productId' },
        },
      },
      { $sort: { salesAmount: -1 } },
    ])

    const totalSales = result.reduce((sum, item) => sum + item.salesAmount, 0)
    const totalProfit = result.reduce((sum, item) => sum + (item.salesAmount - item.totalCost), 0)
    
    return result.map((item): CategoryAnalysis => ({
      category: item._id,
      salesAmount: Math.round(item.salesAmount * 100) / 100,
      salesCount: item.salesCount,
      avgPrice: item.salesCount > 0 ? Math.round((item.salesAmount / item.salesCount) * 100) / 100 : 0,
      profitRate: item.salesAmount > 0 
        ? Math.round(((item.salesAmount - item.totalCost) / item.salesAmount) * 1000) / 10 
        : 0,
      salesRatio: totalSales > 0 ? Math.round((item.salesAmount / totalSales) * 1000) / 10 : 0,
      productCount: item.productCount.length,
    }))
  }

  /**
   * 获取商品销售趋势
   */
  async getProductTrend(shopId: string, productId: string, days = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await this.transactionModel.aggregate([
      {
        $match: {
          shopId: new Types.ObjectId(shopId),
          'items.productId': new Types.ObjectId(productId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $match: {
          'items.productId': new Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          salesAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          salesCount: { $sum: '$items.quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    return result.map(item => ({
      date: item._id,
      salesAmount: Math.round(item.salesAmount * 100) / 100,
      salesCount: item.salesCount,
    }))
  }

  /**
   * 获取商品选项列表
   */
  async getOptions(category?: string) {
    const query: any = { status: 'active' }
    if (category) {
      query.category = category
    }
    
    const products = await this.productModel
      .find(query)
      .select('_id name code category price stock')
      .exec()
    
    return products.map(product => ({
      value: product._id.toString(),
      label: product.name,
      code: product.code,
      category: product.category,
      price: product.price,
      stock: product.stock,
    }))
  }
}
