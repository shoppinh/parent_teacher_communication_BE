import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeacherAssignmentDocument = TeacherAssignment & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class TeacherAssignment extends BaseSchema {
  @Prop({ required: true })
  teacherId: string;
  @Prop({ required: true })
  subjectId: string;
  @Prop({ required: true })
  subjectName: string;
  @Prop({ required: true })
  classId: string;
}

export const TeacherAssignmentSchema = SchemaFactory.createForClass(TeacherAssignment);