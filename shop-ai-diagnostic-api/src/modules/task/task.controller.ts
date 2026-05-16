import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { TaskService } from './task.service'

@ApiTags('任务')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: '获取任务列表' })
  async findAll(
    @Query('shopId') shopId: string,
    @Query('status') status?: string,
  ) {
    const list = await this.taskService.findAll(shopId, status)
    return {
      code: 200,
      message: 'success',
      data: { list, total: list.length },
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取任务详情' })
  async findOne(@Param('id') id: string) {
    return this.taskService.findById(id)
  }

  @Post()
  @ApiOperation({ summary: '创建任务' })
  async create(@Body() data: any) {
    return this.taskService.create(data)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新任务' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.taskService.update(id, data)
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成任务' })
  async complete(@Param('id') id: string) {
    return this.taskService.complete(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  async delete(@Param('id') id: string) {
    await this.taskService.delete(id)
    return { code: 200, message: 'success' }
  }
}
