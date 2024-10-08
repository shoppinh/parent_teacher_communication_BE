import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export type EventDocument = Event & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Event extends BaseSchema {
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: false })
  content: string;
  @Prop({ type: String, required: true })
  start: string;
  @Prop({ type: String, required: true })
  end: string;
  @Prop([{ type: Types.ObjectId, ref: User.name }])
  participants: string[];
  @Prop({ type: Boolean, required: true, default: false })
  allDay: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
