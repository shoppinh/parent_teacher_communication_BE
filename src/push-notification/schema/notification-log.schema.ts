import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { BaseSchema } from '../../shared/schema/base.schema';
import { User } from '../../user/schema/user.schema';
import { NotificationType } from '../../shared/utils/constant/message';

export type NotificationLogDocument = NotificationLog & Document;

@Schema()
export class NotificationLog extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: User.name })
  user: User;

  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({ enum: NotificationType, default: NotificationType.SYSTEM_NOTIFICATION })
  type: string;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: false })
  deleted: boolean;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);
