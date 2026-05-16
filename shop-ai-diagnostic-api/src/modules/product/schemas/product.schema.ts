import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type ProductDocument = Product & Document

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  code: string

  @Prop({ required: true })
  category: string

  @Prop({ required: true })
  price: number

  @Prop({ required: true })
  cost: number

  @Prop({ default: 0 })
  stock: number

  @Prop({ default: 0 })
  minStock: number

  @Prop({ type: String, enum: ['active', 'inactive', 'offline'], default: 'active' })
  status: string
}

export const ProductSchema = SchemaFactory.createForClass(Product)

ProductSchema.index({ code: 1 }, { unique: true })
ProductSchema.index({ category: 1 })
