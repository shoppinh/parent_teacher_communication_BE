import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export type TeacherDocument = Teacher & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Teacher extends BaseSchema {
  @Prop({ default: null })
  userId: User;
  @Prop({ required: true })
  address: string;
  @Prop({ required: false })
  gender: string;
  @Prop({ required: false })
  degree: string;
  @Prop({ required: false })
  age: number;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
