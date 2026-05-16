import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ProductService } from './product.service'

@ApiTags('货品')
@Controller('product-diagnostic')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('stock-alerts')
  @ApiOperation({ summary: '获取库存预警列表' })
  @ApiQuery({ name: 'shopId', required: true })
  async getStockAlerts(@Query('shopId') shopId: string) {
    return {
      code: 200,
      message: 'success',
      data: await this.productService.getStockAlerts(shopId),
    }
  }
}
