import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type DiagnosticDocument = Diagnostic & Document

interface DimensionScore {
  score: number
  weight: number
  value: number
  benchmark: number
  trend: 'up' | 'down' | 'stable'
}

@Schema({ timestamps: true })
export class Diagnostic {
  @Prop({ required: true })
  shopId: string

  @Prop({ required: true })
  period: string

  @Prop({ type: Object })
  periodRange: { start: Date; end: Date }

  @Prop({ type: Object })
  scores: {
    customerFlow: DimensionScore
    conversion: DimensionScore
    avgAmount: DimensionScore
    repurchase: DimensionScore
    profit: DimensionScore
  }

  @Prop({ type: Number })
  totalScore: number

  @Prop({ type: Object })
  suggestions: Array<{
    dimension: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    action: string
  }>

  @Prop({ type: String, enum: ['pending', 'processing', 'completed'], default: 'completed' })
  status: string
}

export const DiagnosticSchema = SchemaFactory.createForClass(Diagnostic)
