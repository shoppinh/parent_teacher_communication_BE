import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Teacher } from '../../teacher/schema/teacher.schema';
import { Subject } from '../../admin/schema/subject.schema';
import { Class } from '../../class/schema/class.schema';

export type TeacherAssignmentDocument = TeacherAssignment & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class TeacherAssignment extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: Teacher.name, required: true })
  teacherId: Teacher;
  @Prop({ type: Types.ObjectId, ref: Subject.name, required: true })
  subjectId: Subject;
  @Prop({ type: Types.ObjectId, ref: Class.name, required: true })
  classId: Class;
}

export const TeacherAssignmentSchema = SchemaFactory.createForClass(TeacherAssignment);