import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ParentDocument = Parent & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Parent extends BaseSchema {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  address: string;
  @Prop({ required: true })
  isActive: boolean;
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