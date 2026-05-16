import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type TaskDocument = Task & Document

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string

  @Prop()
  description: string

  @Prop({ type: String, enum: ['diagnostic', 'follow_up', 'inventory', 'training'] })
  type: string

  @Prop({ type: String, enum: ['high', 'medium', 'low'], default: 'medium' })
  priority: string

  @Prop({ type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' })
  status: string

  @Prop({ required: true })
  shopId: string

  @Prop({ required: true })
  assigneeId: string

  @Prop()
  assigneeName: string

  @Prop()
  relatedDiagnosticId: string

  @Prop({ required: true })
  dueDate: Date

  @Prop()
  completedAt: Date
}

export const TaskSchema = SchemaFactory.createForClass(Task)

TaskSchema.index({ shopId: 1, status: 1 })
TaskSchema.index({ assigneeId: 1 })
TaskSchema.index({ dueDate: 1 })
