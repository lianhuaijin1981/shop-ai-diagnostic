import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type TransactionDocument = Transaction & Document

@Schema({ timestamps: true })
export class TransactionItem {
  @Prop({ required: true })
  productId: string

  @Prop({ required: true })
  productName: string

  @Prop({ required: true })
  quantity: number

  @Prop({ required: true })
  price: number

  @Prop({ required: true })
  cost: number

  @Prop({ default: 0 })
  discount: number
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  shopId: string

  @Prop()
  customerId: string

  @Prop({ type: [TransactionItem], default: [] })
  items: TransactionItem[]

  @Prop({ required: true })
  totalAmount: number

  @Prop({ required: true })
  totalCost: number

  @Prop({ required: true })
  profit: number

  @Prop({ type: String, enum: ['cash', 'wechat', 'alipay', 'card'] })
  paymentMethod: string

  @Prop({ required: true })
  createdAt: Date
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)

// 创建索引
TransactionSchema.index({ shopId: 1, createdAt: -1 })
TransactionSchema.index({ customerId: 1 })
