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
  @Prop({ type: String, required: true })
  content: string;
  @Prop({ type: Date, required: true })
  date: string;
  @Prop({ type: String, required: true })
  startTime: string;
  @Prop({ type: String, required: true })
  endTime: string;
  @Prop([{ type: Types.ObjectId, ref: User.name }])
  participants: string[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
