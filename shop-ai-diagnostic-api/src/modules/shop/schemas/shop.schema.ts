import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type ShopDocument = Shop & Document

@Schema({ timestamps: true })
export class Shop {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  code: string

  @Prop()
  address: string

  @Prop()
  manager: string

  @Prop()
  phone: string

  @Prop({ type: String, enum: ['active', 'inactive', 'closed'], default: 'active' })
  status: string

  @Prop({ type: Object })
  metadata: Record<string, any>
}

export const ShopSchema = SchemaFactory.createForClass(Shop)
