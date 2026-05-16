import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger'
import { DiagnosticService } from './diagnostic.service'

@ApiTags('诊断管理')
@Controller('diagnostic')
export class DiagnosticController {
  constructor(private readonly diagnosticService: DiagnosticService) {}

  @Get('five-dimension')
  @ApiOperation({ summary: '获取五维诊断结果（最新）' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  async getFiveDimension(@Query('shopId') shopId: string) {
    const diagnostic = await this.diagnosticService.findLatest(shopId)
    return {
      code: 200,
      message: 'success',
      data: diagnostic,
    }
  }

  @Post('analyze')
  @ApiOperation({ summary: '执行诊断分析' })
  async analyze(
    @Body()
    body: {
      shopId: string
      startDate: string
      endDate: string
    },
  ) {
    const result = await this.diagnosticService.getFiveDimensionDiagnostic(
      body.shopId,
      new Date(body.startDate),
      new Date(body.endDate),
    )
    return {
      code: 200,
      message: '诊断完成',
      data: result,
    }
  }

  @Get('history')
  @ApiOperation({ summary: '获取诊断历史' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  @ApiQuery({ name: 'limit', required: false, description: '返回条数，默认10' })
  async getHistory(
    @Query('shopId') shopId: string,
    @Query('limit') limit?: number,
  ) {
    const diagnostics = await this.diagnosticService.findByShop(shopId, limit)
    return {
      code: 200,
      message: 'success',
      data: diagnostics,
    }
  }

  @Get('trend')
  @ApiOperation({ summary: '获取诊断趋势' })
  @ApiQuery({ name: 'shopId', required: true, description: '门店ID' })
  @ApiQuery({ name: 'days', required: false, description: '天数，默认30天' })
  async getTrend(
    @Query('shopId') shopId: string,
    @Query('days') days?: number,
  ) {
    const trends = await this.diagnosticService.getTrendAnalysis(shopId, days || 30)
    return {
      code: 200,
      message: 'success',
      data: trends,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取诊断详情' })
  @ApiParam({ name: 'id', description: '诊断记录ID' })
  async getById(@Param('id') id: string) {
    const diagnostic = await this.diagnosticService.findByShop(id)
    return {
      code: 200,
      message: 'success',
      data: diagnostic,
    }
  }
}
