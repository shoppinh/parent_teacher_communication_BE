import { Body, Controller, forwardRef, Get, HttpCode, HttpException, HttpStatus, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Roles } from '../shared/decorator/roles.decorator';
import { ConstantRoles } from '../shared/utils/constant/role';
import { ApiException } from '../shared/type/api-exception.model';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiResponse } from '../shared/response/api-response';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { UserService } from '../user/service/user.service';
import { AddLeaveFormDto } from './dto/add-leave-form.dto';
import { LeaveFormService } from '../progress-tracking/service/leave-form.service';
import { validateFields } from '../shared/utils';
import { StudentService } from '../student/student.service';
import { ClassService } from '../class/class.service';
import { Types } from 'mongoose';

@ApiTags('Parent')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/parent')
@UseGuards(JwtGuard, RolesGuard)
export class ParentController {
  constructor(
    private readonly _parentService: ParentService,
    private readonly _userService: UserService,
    private readonly _leaveFormService: LeaveFormService,
    private readonly _studentService: StudentService,
    private readonly _classService: ClassService,
  ) {}

  @Post('leave-form')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async submitLeaveForm(@Body() addLeaveFormDto: AddLeaveFormDto, @GetUser() user: User, @I18n() i18n: I18nContext) {
    try {
      const { studentId, classId, reason, title, leaveDate } = addLeaveFormDto;
      await validateFields({ classId, reason, studentId }, `common.required_field`, i18n);
      const studentExisted = await this._studentService.findById(studentId);
      if (!studentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_student`), HttpStatus.NOT_FOUND);
      }
      const classExisted = await this._classService.findById(classId);
      if (!classExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_class`), HttpStatus.NOT_FOUND);
      }
      const leaveFormInstance = {
        studentId: new Types.ObjectId(studentId),
        classId: new Types.ObjectId(classId),
        reason,
        title,
        leaveDate: new Date(leaveDate),
      };
      const result = await this._leaveFormService.create(leaveFormInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('leave-form/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateLeaveForm(@Body() updateLeaveFormDto: Partial<AddLeaveFormDto>, @GetUser() user: User, @I18n() i18n: I18nContext, @Param('id') formId: string) {
    try {
      const { studentId, classId, reason, title, leaveDate } = updateLeaveFormDto;
      await validateFields({ classId, formId, studentId }, `common.required_field`, i18n);
      const studentExisted = await this._studentService.findById(studentId);
      if (!studentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_student`), HttpStatus.NOT_FOUND);
      }
      const classExisted = await this._classService.findById(classId);
      if (!classExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_class`), HttpStatus.NOT_FOUND);
      }
      const leaveFormInstance = {
        reason,
        title,
        leaveDate: new Date(leaveDate),
      };
      const result = await this._leaveFormService.update(formId, leaveFormInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
