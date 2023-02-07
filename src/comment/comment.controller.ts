import { Body, Controller, Delete, HttpCode, HttpStatus, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
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

@ApiTags('Comment')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/comment')
@UseGuards(JwtGuard, RolesGuard)
export class CommentController {
  constructor(private readonly _commentService: CommentService, private readonly _commentReactionService: CommentReactionService) {}

  @Post('add-comment')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addComment(@Body() addCommentDto: AddCommentDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    return this._commentService.addComment(addCommentDto, user, i18n);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateComment(@Body() updateCommentDto: Partial<AddCommentDto>, @I18n() i18n: I18nContext, @GetUser() user: User, @Param('id') id: string) {
    return this._commentService.updateComment(updateCommentDto, user, i18n, id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteComment(@I18n() i18n: I18nContext, @GetUser() user: User, @Param('id') id: string) {
    return this._commentService.deleteComment(user, i18n, id);
  }

  @Post('reaction')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addCommentReaction(@Body() addCommentReactionDto: AddCommentReactionDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    return this._commentReactionService.addCommentReaction(addCommentReactionDto, user, i18n);
  }

  @Delete('reaction/:postId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteCommentReaction(@I18n() i18n: I18nContext, @GetUser() user: User, @Param('postId') id: string) {
    return this._commentReactionService.deleteCommentReaction(id, user, i18n);
  }
}
