import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type CustomerDocument = Customer & Document

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  shopId: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  phone: string

  @Prop({ type: String, enum: ['normal', 'silver', 'gold', 'platinum'], default: 'normal' })
  level: string

  @Prop({ default: 0 })
  totalAmount: number

  @Prop({ default: 0 })
  visitCount: number

  @Prop()
  lastVisitAt: Date

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string
}

export const CustomerSchema = SchemaFactory.createForClass(Customer)

CustomerSchema.index({ shopId: 1, phone: 1 }, { unique: true })
CustomerSchema.index({ lastVisitAt: -1 })
