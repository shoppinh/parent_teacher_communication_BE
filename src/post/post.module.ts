import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './service/post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostReaction, PostReactionSchema } from './schema/post-reaction.schema';
import { Post, PostSchema } from './schema/post.schema';
import { PostReactionService } from './service/post-reaction.service';

@Module({
  providers: [PostService, PostReactionService],
  controllers: [PostController],
  exports: [PostService, PostReactionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },

      {
        name: PostReaction.name,
        schema: PostReactionSchema,
      },
    ]),
  ],
})
export class PostModule {}
