import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { DiagnosticModule } from '../diagnostic/diagnostic.module'
import { AlertModule } from '../alert/alert.module'
import { TaskModule } from '../task/task.module'
import { Transaction, TransactionSchema } from '../diagnostic/schemas/transaction.schema'
import { Customer, CustomerSchema } from '../diagnostic/schemas/customer.schema'

@Module({
  imports: [
    DiagnosticModule,
    AlertModule,
    TaskModule,
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
