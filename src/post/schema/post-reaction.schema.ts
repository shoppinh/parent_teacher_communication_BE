import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { Post } from './post.schema';

export type PostReactionDocument = PostReaction & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class PostReaction extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  postId: Post;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: User;

  @Prop({ required: true })
  type: string;
}

export const PostReactionSchema = SchemaFactory.createForClass(PostReaction);
