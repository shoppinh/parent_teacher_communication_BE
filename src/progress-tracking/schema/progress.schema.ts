import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Subject } from '../../admin/schema/subject.schema';
import { Student } from '../../student/schema/student.schema';
import { Class } from '../../class/schema/class.schema';

export type ProgressDocument = Progress & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Progress extends BaseSchema {
  @Prop({ required: false })
  frequentMark: number;
  @Prop({ required: false })
  middleExamMark: number;
  @Prop({ required: false })
  finalExamMark: number;

  @Prop({ required: false })
  averageMark: number;
  @Prop({ type: Types.ObjectId, ref: Subject.name, required: true })
  subjectId: string;
  @Prop({ type: Types.ObjectId, ref: Student.name, required: true })
  studentId: string;
  @Prop({ type: Types.ObjectId, ref: Class.name, required: true })
  classId: string;
  @Prop({ required: true })
  semester: number;
  @Prop({ required: true })
  year: number;
  @Prop({ required: false })
  note: string;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
