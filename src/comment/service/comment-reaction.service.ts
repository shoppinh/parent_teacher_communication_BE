import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { CommentReaction, CommentReactionDocument } from '../schema/comment-reaction.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddCommentReactionDto } from '../dto/add-comment-reaction.dto';
import { User } from '../../user/schema/user.schema';
import { I18nContext } from 'nestjs-i18n';
import { validateFields } from '../../shared/utils';
import { ApiResponse } from '../../shared/response/api-response';

@Injectable()
export class CommentReactionService extends BaseService<CommentReaction> {
  constructor(@InjectModel(CommentReaction.name) private readonly commentReactionModel: Model<CommentReactionDocument>) {
    super();
    this.model = commentReactionModel;
  }

  async addCommentReaction(addCommentReactionDto: AddCommentReactionDto, user: User, i18n: I18nContext) {
    try {
      const { commentId, type } = addCommentReactionDto;
      await validateFields({ commentId, type }, `common.required_field`, i18n);
      const commentExisted = await this.findById(commentId);
      if (!commentExisted) {
        throw new HttpException(await i18n.translate(`message.comment_not_existed`), HttpStatus.BAD_REQUEST);
      }
      const reactionExisted = await this.model.findOne({ commentId, userId: user._id });
      if (reactionExisted) {
        const updateInstance: any = {
          type,
          commentId: new Types.ObjectId(commentId),
        };
        const result = await this.update(reactionExisted._id, updateInstance);
        return new ApiResponse(result);
      }
      const createInstance: any = {
        userId: user._id,
        type,
        commentId: new Types.ObjectId(commentId),
      };
      const result = await this.create(createInstance);

      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async deleteCommentReaction(id: string, user: User, i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedCommentReaction = await this.model.findOne({ commentId: id, userId: user._id });
      if (!existedCommentReaction) throw new HttpException(await i18n.translate(`message.nonexistent_comment_reaction`), HttpStatus.NOT_FOUND);
      await this.delete(existedCommentReaction._id);
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
