import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { MailsService } from 'src/mails/mails.service';
import { GetUser } from 'src/shared/decorator/current-user.decorator';
import { ApiResponse } from 'src/shared/response/api-response';
import { ApiException } from 'src/shared/type/api-exception.model';
import { validateFields } from 'src/shared/utils';
import { EmailInvitationDto } from './dto/email-invitation.dto';
import { User } from './schema/user.schema';
import { UserService } from './service/user.service';
import { ConstantRoles } from '../shared/utils/constant/role';
import { ParentService } from '../parent/parent.service';
import { TeacherService } from '../teacher/teacher.service';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';

@ApiTags('User')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(
    private readonly _userService: UserService,
    private readonly _mailService: MailsService,
    private readonly _parentService: ParentService,
    private readonly _teacherService: TeacherService,
  ) {}

  //TODO:(Later) Invite student, parent, teacher

  @Post('send-invitation')
  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async sendInvitation(@Body() emailInvitationDto: EmailInvitationDto, @I18n() i18n: I18nContext) {
    try {
      const { email, token } = emailInvitationDto;
      await validateFields({ email, token }, `common.required_field`, i18n);
      await this._mailService.sendUserInvitation(email, token);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetUser() user: User, @I18n() i18n: I18nContext) {
    try {
      const userExisted = await this._userService.findById(user._id);
      let result;
      if (!userExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_user`), HttpStatus.NOT_FOUND);
      }
      if (user.role === ConstantRoles.PARENT) {
        result = await this._parentService.getParentByUserId(user._id);
      } else if (user.role === ConstantRoles.SUPER_USER) {
        result = await this._userService.findById(user._id);
      } else if (user.role === ConstantRoles.TEACHER) {
        result = await this._teacherService.getTeacherByUserId(user._id);
      }
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
