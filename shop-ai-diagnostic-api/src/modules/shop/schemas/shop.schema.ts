import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type ShopDocument = Shop & Document

// 营业时间配置
export interface BusinessHours {
  day: number        // 0-6 星期 (0=周日)
  isOpen: boolean
  openTime: string   // HH:mm
  closeTime: string  // HH:mm
}

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

  // 门店配置
  @Prop({ type: Object, default: {} })
  config: Record<string, any>

  // 营业时间
  @Prop({ type: Array, default: [
    { day: 0, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 1, isOpen: true, openTime: '09:00', closeTime: '21:00' },
    { day: 2, isOpen: true, openTime: '09:00', closeTime: '21:00' },
    { day: 3, isOpen: true, openTime: '09:00', closeTime: '21:00' },
    { day: 4, isOpen: true, openTime: '09:00', closeTime: '21:00' },
    { day: 5, isOpen: true, openTime: '09:00', closeTime: '21:00' },
    { day: 6, isOpen: true, openTime: '10:00', closeTime: '18:00' },
  ]})
  businessHours: BusinessHours[]
}

export const ShopSchema = SchemaFactory.createForClass(Shop)
