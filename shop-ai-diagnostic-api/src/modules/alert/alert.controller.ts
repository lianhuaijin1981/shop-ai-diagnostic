import { Controller, Get, Post, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { AlertService } from './alert.service'

@ApiTags('预警')
@Controller('diagnostic/alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @ApiOperation({ summary: '获取预警列表' })
  @ApiQuery({ name: 'shopId', required: true })
  async findAll(
    @Query('shopId') shopId: string,
    @Query('status') status?: string,
  ) {
    return {
      code: 200,
      message: 'success',
      data: await this.alertService.findAll(shopId, status),
    }
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: '解决预警' })
  async resolve(@Param('id') id: string) {
    return this.alertService.resolve(id, 'current-user')
  }
}
