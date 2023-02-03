import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { CommentReaction, CommentReactionDocument } from '../schema/comment-reaction.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentReactionService extends BaseService<CommentReaction> {
  constructor(@InjectModel(CommentReaction.name) private readonly commentReactionModel: Model<CommentReactionDocument>) {
    super();
    this.model = commentReactionModel;
  }
}
