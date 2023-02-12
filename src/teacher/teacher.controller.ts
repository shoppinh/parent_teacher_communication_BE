import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from '../user/service/user.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Roles } from '../shared/decorator/roles.decorator';
import { ConstantRoles } from '../shared/utils/constant/role';
import { ApiException } from '../shared/type/api-exception.model';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { TeacherService } from './teacher.service';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { RemoveOrAssignStudentDto } from './dto/remove-assign-student.dto';
import { StudentService } from '../student/student.service';
import { ClassService } from '../class/class.service';
import { ApiResponse } from '../shared/response/api-response';
import { ProgressTrackingService } from '../progress-tracking/service/progress-tracking.service';
import { LeaveFormService } from '../progress-tracking/service/leave-form.service';

@ApiTags('Teacher')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/teacher')
@UseGuards(JwtGuard, RolesGuard)
export class TeacherController {
  constructor(
    private readonly _teacherService: TeacherService,
    private readonly _userService: UserService,
    private readonly _studentService: StudentService,
    private readonly _classService: ClassService,
    private readonly _progressTrackingService: ProgressTrackingService,
    private readonly _leaveFormService: LeaveFormService,
  ) {}

  @Get('profile')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getProfile(@GetUser() user: User, @I18n() i18n: I18nContext) {
    try {
      const userExisted = await this._userService.findById(user._id);
      if (!userExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_user`), HttpStatus.NOT_FOUND);
      }
      return this._teacherService.getProfile(user._id);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  //TODO: Get list progress tracking by teacher, class, year, semester
  @Get('progress-tracking/:classId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getListProgressTracking(@GetUser() user: User, @I18n() i18n: I18nContext, @Param('classId') classId: string) {
    // First have to select which subject does this teacher teach with teacherId and classId by teacher assignment collection
    // Secondly get list progress tracking by classId and subjectId
    // Filter by year and semester
  }

  //TODO: Input, edit, delete mark for student
  @Post('progress-tracking/assign-mark/:classId/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async assignMark(@Body() removeOrAssignStudentDto: RemoveOrAssignStudentDto, @I18n() i18n: I18nContext) {}

  //TODO: Accept, reject leave form
  @Post('leave-form/:classId/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async acceptOrRejectLeaveForm(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Post('assign-student')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async assignStudent(@Body() removeOrAssignStudentDto: RemoveOrAssignStudentDto, @I18n() i18n: I18nContext) {
    try {
      const { studentId, classId } = removeOrAssignStudentDto;
      const studentExisted = await this._studentService.findById(studentId);
      if (!studentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_student`), HttpStatus.NOT_FOUND);
      }

      const studentInstance = {
        classId: classId,
      };
      const result = await this._studentService.update(studentId, studentInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('remove-student')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async removeStudent(@Body() removeOrAssignStudentDto: RemoveOrAssignStudentDto, @I18n() i18n: I18nContext) {
    try {
      const { studentId, classId } = removeOrAssignStudentDto;
      const studentExisted = await this._studentService.findOne({ _id: studentId, classId: classId });
      if (!studentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_student`), HttpStatus.NOT_FOUND);
      }

      const studentInstance = {
        classId: null,
      };
      const result = await this._studentService.update(studentId, studentInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  //TODO: Add badge for student if student has good behavior
}
