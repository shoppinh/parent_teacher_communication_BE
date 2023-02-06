import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Comment } from './comment.schema';
import { User } from '../../user/schema/user.schema';

export type CommentReactionDocument = CommentReaction & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class CommentReaction extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: Comment.name, required: true })
  commentId: Comment;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: User;

  @Prop({ required: false })
  reaction?: string;
}

export const CommentReactionSchema = SchemaFactory.createForClass(CommentReaction);
