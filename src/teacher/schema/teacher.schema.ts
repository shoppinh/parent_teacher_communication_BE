import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Teacher extends BaseSchema {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  address: string;
  @Prop({ required: false })
  gender: string;
  @Prop({ required: false })
  degree: string;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
