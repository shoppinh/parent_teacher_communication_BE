import { forwardRef, Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './service/comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schema/comment.schema';
import { CommentReaction, CommentReactionSchema } from './schema/comment-reaction.schema';
import { CommentReactionService } from './service/comment-reaction.service';
import { PostModule } from '../post/post.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService, CommentReactionService],
  exports: [CommentService, CommentReactionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },

      {
        name: CommentReaction.name,
        schema: CommentReactionSchema,
      },
    ]),
    forwardRef(() => PostModule),
  ],
})
export class CommentModule {}
