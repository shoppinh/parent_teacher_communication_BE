import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { Class } from '../../class/schema/class.schema';
import { ConstantPostType } from '../../shared/utils/constant/post';

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

  @Prop({ required: true })
  title: string;
  @Prop({ required: false })
  content?: string;
  @Prop({ required: false })
  description?: string;
  @Prop({ required: false })
  coverImg?: string;
  @Prop({ enum: ConstantPostType, required: true, default: ConstantPostType.PUBLIC })
  type: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
