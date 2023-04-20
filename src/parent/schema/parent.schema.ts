import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from 'src/shared/schema/base.schema';
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
  @Prop({ required: false })
  gender?: string;
  @Prop({ required: false })
  job?: string;
  @Prop({ required: false })
  age?: number;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);
