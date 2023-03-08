import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
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
import { Types } from 'mongoose';
import { ParentService } from '../parent/parent.service';
import { TeacherAssignmentService } from '../teacher-assignment/teacher-assignment.service';
import { TeacherService } from 'src/teacher/teacher.service';

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
    private readonly _classService: ClassService,
    private readonly _parentService: ParentService,
    private readonly _teacherService: TeacherService,
    private readonly _teacherAssignmentService: TeacherAssignmentService,
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
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllPostByClass(@Body() getAllPostDto: GetAllPostDto, @I18n() i18n: I18nContext, @GetUser() user: User, @Param('classId') classId: string) {
    try {
      await validateFields({ classId }, `common.required_field`, i18n);
      // Check if class existed
      const classExisted = await this._classService.findById(classId);
      if (!classExisted) {
        throw new HttpException(i18n.translate('message.nonexistent_class'), HttpStatus.NOT_FOUND);
      }
      // Find if user(parent) has right to access the class
      if (user.role === ConstantRoles.PARENT) {
        const childrenList = await this._parentService
          .createParentStudentRelationAggregation()
          .match({
            'children.classId': new Types.ObjectId(classId),
          })
          .exec();
        if (!childrenList.length) {
          throw new HttpException(i18n.translate('message.parent_has_no_right_to_access_class'), HttpStatus.FORBIDDEN);
        }
      }
      // find if user(teacher) has right to access the class
      if (user.role === ConstantRoles.TEACHER) {
        const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
        const teacherClassExisted = await this._teacherAssignmentService.findOne({ classId: new Types.ObjectId(classId), teacherId: new Types.ObjectId(teacherExisted._id) });
        if (!teacherClassExisted) {
          throw new HttpException(i18n.translate('message.teacher_has_no_right_to_access_class'), HttpStatus.FORBIDDEN);
        }
      }

      const result = await this._postService.getAllPostByClass(user, getAllPostDto, classId);
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
  @Roles(ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addPost(@Body() addPostDto: AddPostDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    try {
      const { classId, title, description, type, content, coverImg } = addPostDto;
      await validateFields({ classId, title }, `common.required_field`, i18n);
      const classExisted = await this._classService.findById(classId);
      if (!classExisted) throw new HttpException(await i18n.translate(`message.nonexistent_class`), HttpStatus.BAD_REQUEST);
      const postInstance: any = {
        title,
        description,
        type,
        content,
        coverImg,
        authorId: user._id,
        classId: new Types.ObjectId(classId),
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
  @Roles(ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updatePost(@Body() updatePostDto: Partial<AddPostDto>, @I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    try {
      const { classId, title, type, description, content, coverImg } = updatePostDto;
      await validateFields({ id }, `common.required_field`, i18n);
      const existedPost = await this._postService.findById(id);
      if (!existedPost) throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.BAD_REQUEST);
      if (existedPost.authorId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);

      if (classId) {
        const classExisted = await this._classService.findById(classId);
        if (!classExisted) throw new HttpException(await i18n.translate(`message.nonexistent_class`), HttpStatus.BAD_REQUEST);
      }

      const updatePostInstance: any = {
        title,
        type,
        description,
        content,
        coverImg,
        authorId: user._id,
        classId: new Types.ObjectId(classId),
      };
      const result = await this._postService.update(id, updatePostInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getPostDetail(@I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    await validateFields({ id }, `common.required_field`, i18n);
    const existedPost = await this._postService.findById(id);
    if (!existedPost) throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.BAD_REQUEST);
    if (existedPost.authorId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);
    return this._postService.getPostDetail(id, user, i18n);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deletePost(@I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedPost = await this._postService.findById(id);
      if (!existedPost) throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.BAD_REQUEST);
      if (existedPost.authorId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);

      await this._postService.delete(id);
      await this._commentService.deleteByCondition({ postId: id });
      await this._postReactionService.deleteByCondition({ postId: id });
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
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async reactPost(@Body() addPostReactionDto: AddPostReactionDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    try {
      const { postId, type } = addPostReactionDto;
      await validateFields({ postId, type }, `common.required_field`, i18n);
      const postExisted = await this._postService.findById(postId);
      if (!postExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.NOT_FOUND);
      }
      const reactionExisted = await this._postReactionService.findOne({ postId, userId: user._id });
      if (reactionExisted) {
        const result = await this._postReactionService.update(reactionExisted._id, {
          type,
          postId: new Types.ObjectId(postId),
        });
        return new ApiResponse(result);
      }

      const result = await this._postReactionService.create({ type, userId: user._id, postId: new Types.ObjectId(postId) });
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('reaction/:postId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deletePostReaction(@I18n() i18n: I18nContext, @Param('postId') id: string, @GetUser() user: User) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedPostReaction = await this._postReactionService.findOne({ postId: id, userId: user._id });
      if (!existedPostReaction) throw new HttpException(await i18n.translate(`message.nonexistent_post_reaction`), HttpStatus.NOT_FOUND);
      await this._postReactionService.delete(existedPostReaction._id);
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
