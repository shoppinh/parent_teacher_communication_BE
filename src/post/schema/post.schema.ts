import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { Class } from '../../class/schema/class.schema';

export type PostDocument = Post & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Post extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  authorId: User;
  @Prop({ type: Types.ObjectId, ref: Class.name, required: true })
  classId: Class;

  @Prop({ required: false })
  title?: string;
  @Prop({ required: false })
  content?: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
