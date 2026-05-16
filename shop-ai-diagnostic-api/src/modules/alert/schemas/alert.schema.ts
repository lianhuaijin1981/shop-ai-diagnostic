import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type AlertDocument = Alert & Document

@Schema({ timestamps: true })
export class Alert {
  @Prop({ type: String, enum: ['danger', 'warning', 'info'], required: true })
  type: string

  @Prop({ required: true })
  shopId: string

  @Prop({ required: true })
  dimension: string

  @Prop({ required: true })
  title: string

  @Prop()
  description: string

  @Prop({ required: true })
  value: number

  @Prop({ required: true })
  threshold: number

  @Prop({ type: String, enum: ['pending', 'processing', 'resolved'], default: 'pending' })
  status: string

  @Prop()
  resolvedAt: Date

  @Prop()
  resolvedBy: string
}

export const AlertSchema = SchemaFactory.createForClass(Alert)

AlertSchema.index({ shopId: 1, status: 1 })
AlertSchema.index({ dimension: 1 })
AlertSchema.index({ createdAt: -1 })
