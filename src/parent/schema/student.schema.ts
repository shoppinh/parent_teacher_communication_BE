import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Student extends BaseSchema {
  @Prop({ required: true })
  parentId: string;
  @Prop({ required: true })
  classId: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  age: number;
  @Prop({ required: true })
  gender: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);