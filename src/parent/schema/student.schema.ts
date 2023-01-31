import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Class } from '../../class/schema/class.schema';
import { Parent } from './parent.schema';

export type StudentDocument = Student & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Student extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: Parent.name, required: true })
  parentId: Parent;
  @Prop({ type: Types.ObjectId, ref: Class.name, required: true })
  classId: Class;
  @Prop({ required: true })
  name: string;
  @Prop({ required: false })
  age: number;
  @Prop({ required: false })
  gender: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
