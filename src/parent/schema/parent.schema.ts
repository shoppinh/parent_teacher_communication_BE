import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User, UserSchema } from '../../user/schema/user.schema';

export type ParentDocument = Parent & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Parent extends BaseSchema {
  @Prop({ type: UserSchema, required: true })
  userId: User;
  @Prop({ required: true })
  address: string;
  @Prop({ required: false })
  ward?: string;
  @Prop({ required: false })
  district?: string;
  @Prop({ required: false })
  province?: string;
  @Prop({ required: false })
  country?: string;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);
