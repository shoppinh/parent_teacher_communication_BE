import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClassDocument = Class & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Class extends BaseSchema {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, default: false })
  isSchoolClass: boolean;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
