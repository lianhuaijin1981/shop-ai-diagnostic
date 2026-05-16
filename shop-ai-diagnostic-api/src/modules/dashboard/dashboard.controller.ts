import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { DashboardService } from './dashboard.service'

@ApiTags('经营大盘')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '获取经营统计' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  async getStats(@Query('shopId') shopId: string) {
    const stats = await this.dashboardService.getStats(shopId)
    return {
      code: 200,
      message: 'success',
      data: stats,
    }
  }

  @Get('trends')
  @ApiOperation({ summary: '获取趋势数据' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  @ApiQuery({ name: 'days', required: false, description: '天数，默认7天' })
  async getTrends(
    @Query('shopId') shopId: string,
    @Query('days') days?: number,
  ) {
    const trends = await this.dashboardService.getTrends(shopId, days || 7)
    return {
      code: 200,
      message: 'success',
      data: trends,
    }
  }

  @Get('week-comparison')
  @ApiOperation({ summary: '获取本周数据对比' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  async getWeekComparison(@Query('shopId') shopId: string) {
    const comparison = await this.dashboardService.getWeekComparison(shopId)
    return {
      code: 200,
      message: 'success',
      data: comparison,
    }
  }

  @Get('top-products')
  @ApiOperation({ summary: '获取热销商品' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  @ApiQuery({ name: 'days', required: false, description: '天数，默认7天' })
  @ApiQuery({ name: 'limit', required: false, description: '返回条数，默认5' })
  async getTopProducts(
    @Query('shopId') shopId: string,
    @Query('days') days?: number,
    @Query('limit') limit?: number,
  ) {
    const products = await this.dashboardService.getTopProducts(
      shopId,
      days || 7,
      limit || 5,
    )
    return {
      code: 200,
      message: 'success',
      data: products,
    }
  }

  @Get('hourly')
  @ApiOperation({ summary: '获取每小时营业数据' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  async getHourlyOverview(@Query('shopId') shopId: string) {
    const hourlyData = await this.dashboardService.getHourlyOverview(shopId)
    return {
      code: 200,
      message: 'success',
      data: hourlyData,
    }
  }

  @Get('time-slot')
  @ApiOperation({ summary: '获取时段分析' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  async getTimeSlotAnalysis(@Query('shopId') shopId: string) {
    const analysis = await this.dashboardService.getTimeSlotAnalysis(shopId)
    return {
      code: 200,
      message: 'success',
      data: analysis,
    }
  }

  @Get('payment-distribution')
  @ApiOperation({ summary: '获取支付方式分布' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  @ApiQuery({ name: 'days', required: false, description: '天数，默认7天' })
  async getPaymentDistribution(
    @Query('shopId') shopId: string,
    @Query('days') days?: number,
  ) {
    const distribution = await this.dashboardService.getPaymentDistribution(
      shopId,
      days || 7,
    )
    return {
      code: 200,
      message: 'success',
      data: distribution,
    }
  }

  @Get('realtime')
  @ApiOperation({ summary: '获取实时数据' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  async getRealtimeData(@Query('shopId') shopId: string) {
    const realtime = await this.dashboardService.getRealtimeData(shopId)
    return {
      code: 200,
      message: 'success',
      data: realtime,
    }
  }
}
