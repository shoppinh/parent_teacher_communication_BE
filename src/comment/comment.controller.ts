import { Body, Controller, Delete, HttpCode, HttpException, HttpStatus, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Roles } from '../shared/decorator/roles.decorator';
import { ConstantRoles } from '../shared/utils/constant/role';
import { ApiException } from '../shared/type/api-exception.model';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AddCommentDto } from './dto/add-comment.dto';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';
import { AddCommentReactionDto } from './dto/add-comment-reaction.dto';
import { CommentService } from './service/comment.service';
import { CommentReactionService } from './service/comment-reaction.service';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { validateFields } from '../shared/utils';
import { Types } from 'mongoose';
import { ApiResponse } from '../shared/response/api-response';
import { PostService } from '../post/service/post.service';

@ApiTags('Comment')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/comment')
@UseGuards(JwtGuard, RolesGuard)
export class CommentController {
  constructor(private readonly _commentService: CommentService, private readonly _commentReactionService: CommentReactionService, private readonly _postService: PostService) {}

  @Post('add-comment')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addComment(@Body() addCommentDto: AddCommentDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    try {
      const { postId, content } = addCommentDto;
      await validateFields({ postId }, `common.required_field`, i18n);
      const postExisted = await this._postService.findById(postId);
      if (!postExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.NOT_FOUND);
      }
      const commentInstance: any = {
        content,
        userId: new Types.ObjectId(user._id),
        postId: new Types.ObjectId(postId),
      };
      await this._commentService.create(commentInstance);
      const result = await this._commentService.getAllCommentByPostId(postId);
      return new ApiResponse({
        list: result,
        postId: postId,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateComment(@Body() updateCommentDto: Partial<AddCommentDto>, @I18n() i18n: I18nContext, @GetUser() user: User, @Param('id') id: string) {
    try {
      const { postId, content } = updateCommentDto;
      await validateFields({ id }, `common.required_field`, i18n);
      if (postId) {
        const postExisted = await this._postService.findById(postId);
        if (!postExisted) {
          throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.NOT_FOUND);
        }
      }
      const existedComment = await this._commentService.findById(id);
      if (!existedComment) throw new HttpException(await i18n.translate(`message.nonexistent_comment`), HttpStatus.BAD_REQUEST);

      if (existedComment.userId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);

      const updateCommentInstance: any = {
        content,
        userId: user._id,
        postId: new Types.ObjectId(postId),
      };
      const result = await this._commentService.update(id, updateCommentInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteComment(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedComment = await this._commentService.findById(id);
      if (!existedComment) throw new HttpException(await i18n.translate(`message.nonexistent_comment`), HttpStatus.BAD_REQUEST);

      await this._commentService.delete(id);
      await this._commentReactionService.deleteByCondition({ commentId: id });

      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('reaction')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addCommentReaction(@Body() addCommentReactionDto: AddCommentReactionDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    try {
      const { commentId, type } = addCommentReactionDto;
      await validateFields({ commentId, type }, `common.required_field`, i18n);
      const commentExisted = await this._commentReactionService.findById(commentId);
      if (!commentExisted) {
        throw new HttpException(await i18n.translate(`message.comment_not_existed`), HttpStatus.BAD_REQUEST);
      }
      const reactionExisted = await this._commentReactionService.findOne({ commentId, userId: user._id });
      if (reactionExisted) {
        const updateInstance: any = {
          type,
          commentId: new Types.ObjectId(commentId),
        };
        const result = await this._commentReactionService.update(reactionExisted._id, updateInstance);
        return new ApiResponse(result);
      }
      const createInstance: any = {
        userId: user._id,
        type,
        commentId: new Types.ObjectId(commentId),
      };
      const result = await this._commentReactionService.create(createInstance);

      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('reaction/:commentId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteCommentReaction(@I18n() i18n: I18nContext, @GetUser() user: User, @Param('commentId') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedCommentReaction = await this._commentReactionService.findOne({ commentId: id, userId: user._id });
      if (!existedCommentReaction) throw new HttpException(await i18n.translate(`message.nonexistent_comment_reaction`), HttpStatus.NOT_FOUND);
      await this._commentReactionService.delete(existedCommentReaction._id);
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
