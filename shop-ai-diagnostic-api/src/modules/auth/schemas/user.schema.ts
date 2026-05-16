import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  name: string

  @Prop()
  phone: string

  @Prop()
  email: string

  @Prop({ type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' })
  role: string

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string

  @Prop()
  shopId: string
}

export const UserSchema = SchemaFactory.createForClass(User)
