import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { PostReaction, PostReactionDocument } from '../schema/post-reaction.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddPostReactionDto } from '../dto/add-post-reaction.dto';
import { I18nContext } from 'nestjs-i18n';
import { User } from '../../user/schema/user.schema';
import { validateFields } from '../../shared/utils';
import { ApiResponse } from '../../shared/response/api-response';

@Injectable()
export class PostReactionService extends BaseService<PostReaction> {
  constructor(@InjectModel(PostReaction.name) private readonly postReactionModel: Model<PostReactionDocument>) {
    super();
    this.model = postReactionModel;
  }

  async reactPost(addPostReactionDto: AddPostReactionDto, user: User, i18n: I18nContext) {
    try {
      const { postId, type } = addPostReactionDto;
      await validateFields({ postId, type }, `common.required_field`, i18n);
      const postExisted = await this.findById(postId);
      if (!postExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.NOT_FOUND);
      }
      const reactionExisted = await this.model.findOne({ postId, userId: user._id });
      if (reactionExisted) {
        const result = await this.update(reactionExisted._id, addPostReactionDto);
        return new ApiResponse(result);
      }
      const result = await this.create({ ...addPostReactionDto, userId: user._id });
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
  async deletePostReaction(id: string, user: User, i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedPostReaction = await this.model.findOne({ postId: id, userId: user._id });
      if (!existedPostReaction) throw new HttpException(await i18n.translate(`message.nonexistent_post_reaction`), HttpStatus.NOT_FOUND);
      await this.delete(existedPostReaction._id);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
