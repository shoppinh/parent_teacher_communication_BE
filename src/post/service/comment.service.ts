import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Comment, CommentDocument } from '../schema/comment.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentService extends BaseService<Comment> {
  constructor(@InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>) {
    super();
    this.model = commentModel;
  }
}
