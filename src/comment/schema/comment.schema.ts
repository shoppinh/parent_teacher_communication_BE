import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User, UserSchema } from '../../user/schema/user.schema';
import { Post } from '../../post/schema/post.schema';

export type CommentDocument = Comment & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class Comment extends BaseSchema {
  @Prop({ type: UserSchema, required: true })
  userId: User;
  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  postId: Post;

  @Prop({ required: false })
  content?: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
