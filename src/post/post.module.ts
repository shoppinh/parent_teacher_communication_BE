import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './service/post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentReaction, CommentReactionSchema } from './schema/comment-reaction.schema';
import { PostReaction, PostReactionSchema } from './schema/post-reaction.schema';
import { CommentSchema } from './schema/comment.schema';
import { Post, PostSchema } from './schema/post.schema';
import { PostReactionService } from './service/post-reaction.service';
import { CommentReactionService } from './service/comment-reaction.service';
import { CommentService } from './service/comment.service';

@Module({
  providers: [PostService, PostReactionService, CommentReactionService, CommentService],
  controllers: [PostController],
  exports: [PostService, PostReactionService, CommentReactionService, CommentService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: PostReaction.name,
        schema: PostReactionSchema,
      },
      {
        name: CommentReaction.name,
        schema: CommentReactionSchema,
      },
    ]),
  ],
})
export class PostModule {}
