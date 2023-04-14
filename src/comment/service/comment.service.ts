import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Comment, CommentDocument } from '../schema/comment.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PostService } from '../../post/service/post.service';
import { CommentReactionService } from './comment-reaction.service';

@Injectable()
export class CommentService extends BaseService<Comment> {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    private readonly _commentReactionService: CommentReactionService,
    @Inject(forwardRef(() => PostService)) private readonly _postService: PostService,
  ) {
    super();
    this.model = commentModel;
  }

  async getAllCommentByPostId(postId: string) {
    const aggregation = this.model
      .aggregate()
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
      })
      .unwind({
        path: '$userId',
      })
      .match({
        postId: new Types.ObjectId(postId),
      })
      .project({
        __v: 0,
      });

    return await aggregation.exec();
  }
}
