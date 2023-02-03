import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { PostReaction, PostReactionDocument } from '../schema/post-reaction.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostReactionService extends BaseService<PostReaction> {
  constructor(@InjectModel(PostReaction.name) private readonly postReactionModel: Model<PostReactionDocument>) {
    super();
    this.model = postReactionModel;
  }
}
