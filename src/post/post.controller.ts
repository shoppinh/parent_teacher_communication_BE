import { Body, Controller, HttpCode, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './service/comment.service';
import { CommentReactionService } from './service/comment-reaction.service';
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
import { toListResponse } from '../shared/utils';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';

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
    private readonly _postReactService: PostReactionService,
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

  @Post('list-by-class/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllPostByClass(@Body() getAllPostDto: GetAllPostDto, @I18n() i18n: I18nContext, @GetUser() user: User, @Param('id') id: string) {
    try {
      const result = await this._postService.getAllPostByClass(user, getAllPostDto, id, i18n);
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
}
