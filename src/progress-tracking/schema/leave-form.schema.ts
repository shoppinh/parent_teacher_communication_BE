import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ConstantLeaveFormStatus } from '../../shared/utils/constant/progress';
import { Student } from '../../student/schema/student.schema';
import { Class } from '../../class/schema/class.schema';

export type LeaveFormDocument = LeaveForm & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class LeaveForm extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: Student.name, required: true })
  studentId: string;
  @Prop({ type: Types.ObjectId, ref: Class.name, required: true })
  classId: string;
  @Prop({ required: true })
  reason: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true, enum: ConstantLeaveFormStatus, default: ConstantLeaveFormStatus.PENDING })
  status: string;
  @Prop({ required: true })
  leaveDate: Date;
}

export const LeaveFormSchema = SchemaFactory.createForClass(LeaveForm);
