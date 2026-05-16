import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ShopService } from './shop.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('门店')
@Controller('shops')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  @ApiOperation({ summary: '获取门店列表' })
  async findAll() {
    return this.shopService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: '获取门店详情' })
  async findOne(@Param('id') id: string) {
    return this.shopService.findById(id)
  }

  @Post()
  @ApiOperation({ summary: '创建门店' })
  async create(@Body() data: any) {
    return this.shopService.create(data)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新门店' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.shopService.update(id, data)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除门店' })
  async delete(@Param('id') id: string) {
    return this.shopService.delete(id)
  }
}
