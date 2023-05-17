import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './service/post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostReaction, PostReactionSchema } from './schema/post-reaction.schema';
import { Post, PostSchema } from './schema/post.schema';
import { PostReactionService } from './service/post-reaction.service';
import { ParentModule } from '../parent/parent.module';
import { ClassModule } from '../class/class.module';
import { TeacherAssignmentModule } from '../teacher-assignment/teacher-assignment.module';
import { CommentModule } from '../comment/comment.module';
import { TeacherModule } from '../teacher/teacher.module';
import { MailsModule } from 'src/mails/mails.module';

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
    ParentModule,
    ClassModule,
    TeacherAssignmentModule,
    CommentModule,
    TeacherModule,
    MailsModule,
  ],
})
export class PostModule {}
