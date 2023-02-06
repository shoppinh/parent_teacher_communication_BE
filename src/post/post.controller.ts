import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommentService } from '../comment/service/comment.service';
import { CommentReactionService } from '../comment/service/comment-reaction.service';
import { PostService } from './service/post.service';
import { PostReactionService } from './service/post-reaction.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { Roles } from '../shared/decorator/roles.decorator';
import { ConstantRoles } from '../shared/utils/constant/role';
import { ApiException } from '../shared/type/api-exception.model';
import { I18n, I18nContext } from 'nestjs-i18n';
import { GetAllPostDto } from './dto/get-all-post.dto';
import { ApiResponse } from '../shared/response/api-response';
import { toListResponse, validateFields } from '../shared/utils';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';
import { AddPostDto } from './dto/add-post.dto';
import { ClassService } from '../class/class.service';
import { AddPostReactionDto } from './dto/add-post-reaction.dto';

@ApiTags('Post')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/post')
@UseGuards(JwtGuard, RolesGuard)
export class PostController {
  constructor(
    private readonly _commentService: CommentService,
    private readonly _commentReactionService: CommentReactionService,
    private readonly _postService: PostService,
    private readonly _postReactionService: PostReactionService,
    @Inject(() => ClassService) private readonly _classService: ClassService,
  ) {}

  @Post('list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllPost(@Body() getAllPostDto: GetAllPostDto, @I18n() i18n: I18nContext) {
    try {
      const { skip, limit, sort, search } = getAllPostDto;
      const result = await this._postService.getAllPost(sort, search, limit, skip);
      const [{ totalRecords, data }] = result;
      return new ApiResponse({
        ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('private-post-list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllPrivatePost(@Body() getAllPostDto: GetAllPostDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    try {
      const { skip, limit, sort, search } = getAllPostDto;
      const result = await this._postService.getAllPrivatePost(sort, search, limit, skip);
      const [{ totalRecords, data }] = result;
      return new ApiResponse({
        ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('class-post-list/:classId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllPostByClass(@Body() getAllPostDto: GetAllPostDto, @I18n() i18n: I18nContext, @GetUser() user: User, @Param('classId') classId: string) {
    try {
      const result = await this._postService.getAllPostByClass(user, getAllPostDto, classId, i18n);
      await validateFields({ classId }, `common.required_field`, i18n);
      const [{ totalRecords, data }] = result;
      return new ApiResponse({
        ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('add-post')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addPost(@Body() addPostDto: AddPostDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    try {
      const { classId, title } = addPostDto;
      await validateFields({ classId, title }, `common.required_field`, i18n);
      const classExisted = await this._classService.findById(classId);
      if (!classExisted) throw new HttpException(await i18n.translate(`message.nonexistent_class`), HttpStatus.BAD_REQUEST);
      const postInstance: AddPostDto = {
        ...addPostDto,
        authorId: user._id,
      };
      const result = await this._postService.create(postInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updatePost(@Body() updatePostDto: Partial<AddPostDto>, @I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    return this._postService.updatePost(updatePostDto, id, user, i18n);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getPostDetail(@I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    return this._postService.getPostDetail(id, user, i18n);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deletePost(@I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    return this._postService.deletePost(id, user, i18n);
  }

  @Post('reaction')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async reactPost(@Body() addPostReactionDto: AddPostReactionDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    return this._postReactionService.reactPost(addPostReactionDto, user, i18n);
  }

  @Delete('reaction/:postId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deletePostReaction(@I18n() i18n: I18nContext, @Param('postId') id: string, @GetUser() user: User) {
    return this._postReactionService.deletePostReaction(id, user, i18n);
  }
}
