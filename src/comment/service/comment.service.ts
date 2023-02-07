import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Comment, CommentDocument } from '../schema/comment.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { I18nContext } from 'nestjs-i18n';
import { AddCommentDto } from '../dto/add-comment.dto';
import { User } from '../../user/schema/user.schema';
import { PostService } from '../../post/service/post.service';
import { ApiResponse } from '../../shared/response/api-response';
import { validateFields } from '../../shared/utils';

@Injectable()
export class CommentService extends BaseService<Comment> {
  constructor(@InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>, @Inject(forwardRef(() => PostService)) private readonly _postService: PostService) {
    super();
    this.model = commentModel;
  }

  async addComment(addCommentDto: AddCommentDto, user: User, i18n: I18nContext) {
    try {
      const { postId } = addCommentDto;
      await validateFields({ postId }, `common.required_field`, i18n);
      const postExisted = await this._postService.findById(postId);
      if (!postExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.NOT_FOUND);
      }
      const commentInstance: any = {
        ...addCommentDto,
        userId: user._id,
        postId: new Types.ObjectId(postId),
      };
      const result = await this.create(commentInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async updateComment(updateCommentDto: Partial<AddCommentDto>, user, i18n, id) {
    try {
      const { postId } = updateCommentDto;
      await validateFields({ id }, `common.required_field`, i18n);
      if (postId) {
        const postExisted = await this._postService.findById(postId);
        if (!postExisted) {
          throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.NOT_FOUND);
        }
      }
      const existedComment = await this.findById(id);
      if (!existedComment) throw new HttpException(await i18n.translate(`message.nonexistent_comment`), HttpStatus.BAD_REQUEST);

      if (existedComment.userId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);

      const updateCommentInstance: any = {
        ...updateCommentDto,
        userId: user._id,
        postId: new Types.ObjectId(postId),
      };
      const result = await this.update(id, updateCommentInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async deleteComment(user: User, i18n: I18nContext, id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedComment = await this.findById(id);
      if (!existedComment) throw new HttpException(await i18n.translate(`message.nonexistent_comment`), HttpStatus.BAD_REQUEST);

      if (existedComment.userId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);

      await this.delete(id);
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
