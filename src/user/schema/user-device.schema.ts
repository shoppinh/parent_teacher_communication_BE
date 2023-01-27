import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/shared/schema/base.schema';
import { Types, Document } from 'mongoose';
import { User } from './user.schema';

export type UserDeviceDocument = UserDevice & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
  timestamps: true,
  versionKey: false,
})
export class UserDevice extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: User;

  @Prop()
  fcmToken: string;
}

export const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);
