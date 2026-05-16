import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { DiagnosticModule } from '../diagnostic/diagnostic.module'
import { AlertModule } from '../alert/alert.module'
import { TaskModule } from '../task/task.module'

@Module({
  imports: [DiagnosticModule, AlertModule, TaskModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
