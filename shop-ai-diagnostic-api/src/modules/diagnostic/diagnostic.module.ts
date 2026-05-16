import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DiagnosticController } from './diagnostic.controller'
import { DiagnosticService } from './diagnostic.service'
import { Diagnostic, DiagnosticSchema } from './schemas/diagnostic.schema'
import { Transaction, TransactionSchema } from './schemas/transaction.schema'
import { Customer, CustomerSchema } from './schemas/customer.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Diagnostic.name, schema: DiagnosticSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [DiagnosticController],
  providers: [DiagnosticService],
  exports: [DiagnosticService, MongooseModule],
})
export class DiagnosticModule {}
