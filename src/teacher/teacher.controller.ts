import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
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
import { AssignMarkDto } from './dto/assign-mark.dto';
import { toListResponse, validateFields } from '../shared/utils';
import { TeacherAssignmentService } from '../teacher-assignment/teacher-assignment.service';
import { Types } from 'mongoose';
import { GetAllProgressDto } from '../progress-tracking/dto/get-all-progress-tracking.dto';
import { CheckLeaveFormDto } from '../progress-tracking/dto/check-leave-form.dto';

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
    private readonly _teacherAssignmentService: TeacherAssignmentService,
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
      const result = await this._teacherService.getProfile(user._id);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('progress-tracking-list-by-class/:classId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getListProgressTracking(@Body() getAllProgressTracking: GetAllProgressDto, @GetUser() user: User, @I18n() i18n: I18nContext, @Param('classId') classId: string) {
    try {
      const { year, semester, skip, limit, sort, search } = getAllProgressTracking;
      await validateFields({ classId }, `common.required_field`, i18n);
      // First have to select which subject does this teacher teach with teacherId and classId by teacher assignment collection
      const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
      const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
        teacherId: teacherExisted._id,
        classId: new Types.ObjectId(classId),
      });
      if (!teacherAssignmentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher_assignment`), HttpStatus.NOT_FOUND);
      }
      const [{ totalRecords, data }] = await this._progressTrackingService.getAllProgressTrackingWithFilter(
        {
          subjectId: teacherAssignmentExisted.subjectId,
          classId: new Types.ObjectId(classId),
          year,
          semester,
        },
        sort,
        search,
        limit,
        skip,
      );
      return new ApiResponse({
        ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
      });
      // Secondly get list progress tracking by classId and subjectId
      // Filter by year and semester
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('progress-tracking')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addNewProgressTracking(@Body() assignMarkDto: AssignMarkDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    try {
      const { studentId, classId, subjectId, finalExamMark, middleExamMark, frequentMark, averageMark, year, semester, note } = assignMarkDto;
      await validateFields({ classId, studentId, subjectId, year, semester }, `common.required_field`, i18n);
      // Check if the teacher is responsible for this progress tracking
      const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
      if (!teacherExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher`), HttpStatus.NOT_FOUND);
      }
      const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
        teacherId: teacherExisted._id,
        classId: new Types.ObjectId(classId),
        subjectId: new Types.ObjectId(subjectId),
      });
      if (!teacherAssignmentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher_assignment`), HttpStatus.NOT_FOUND);
      }
      const studentExisted = await this._studentService.findById(studentId);
      if (!studentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_student`), HttpStatus.NOT_FOUND);
      }
      const progressTrackingInstance = {
        year,
        semester,
        finalExamMark,
        frequentMark,
        middleExamMark,
        averageMark,
        studentId: studentExisted._id,
        classId: new Types.ObjectId(classId),
        subjectId: new Types.ObjectId(subjectId),
        note,
      };
      const result = await this._progressTrackingService.create(progressTrackingInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('progress-tracking/:progressId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async editProgressTracking(@Body() assignMarkDto: Partial<AssignMarkDto>, @I18n() i18n: I18nContext, @GetUser() user: User, @Param('progressId') progressId: string) {
    // Check if the teacher is responsible for this progress tracking
    try {
      const { studentId, classId, subjectId, year, semester, finalExamMark, frequentMark, averageMark, middleExamMark, note } = assignMarkDto;
      await validateFields({ progressId }, `common.required_field`, i18n);
      // Check if the teacher is responsible for this progress tracking
      const progressTrackingExisted = await this._progressTrackingService.findById(progressId);
      if (!progressTrackingExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_progress_tracking`), HttpStatus.NOT_FOUND);
      }

      const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
      if (!teacherExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher`), HttpStatus.NOT_FOUND);
      }
      const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
        teacherId: teacherExisted._id,
        classId: new Types.ObjectId(classId),
        subjectId: new Types.ObjectId(subjectId),
      });
      if (!teacherAssignmentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher_assignment`), HttpStatus.NOT_FOUND);
      }
      const studentExisted = await this._studentService.findById(studentId);
      if (!studentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_student`), HttpStatus.NOT_FOUND);
      }
      const progressTrackingInstance = {
        year,
        semester,
        finalExamMark,
        frequentMark,
        middleExamMark,
        averageMark,
        studentId: studentExisted._id,
        classId: new Types.ObjectId(classId),
        subjectId: new Types.ObjectId(subjectId),
        note,
      };
      const result = await this._progressTrackingService.update(progressId, progressTrackingInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('progress-tracking/:progressId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteProgressTracking(@I18n() i18n: I18nContext, @GetUser() user: User, @Param('progressId') progressId: string) {
    // Check if the teacher is responsible for this progress tracking
    try {
      await validateFields({ progressId }, `common.required_field`, i18n);
      // Check if the teacher is responsible for this progress tracking
      const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
      if (!teacherExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher`), HttpStatus.NOT_FOUND);
      }
      const progressExisted = await this._progressTrackingService.findById(progressId);
      if (!progressExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_progress_tracking`), HttpStatus.NOT_FOUND);
      }

      const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
        teacherId: teacherExisted._id,
        classId: progressExisted.classId,
        subjectId: progressExisted.subjectId,
      });
      if (!teacherAssignmentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher_assignment`), HttpStatus.NOT_FOUND);
      }

      await this._progressTrackingService.delete(progressId);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('leave-form/:formId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async acceptOrRejectLeaveForm(@Body() checkLeaveFormDto: CheckLeaveFormDto, @GetUser() user: User, @I18n() i18n: I18nContext, @Param('formId') formId: string) {
    try {
      const { status, classId } = checkLeaveFormDto;
      await validateFields({ formId, classId, status }, `common.required_field`, i18n);
      const formExisted = await this._leaveFormService.findById(formId);
      if (!formExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_leave_form`), HttpStatus.NOT_FOUND);
      }
      const classExisted = await this._classService.findById(classId);
      if (!classExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_class`), HttpStatus.NOT_FOUND);
      }
      const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
      if (!teacherExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher`), HttpStatus.NOT_FOUND);
      }
      const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
        teacherId: teacherExisted._id,
        classId: new Types.ObjectId(classId),
      });
      if (!teacherAssignmentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher_assignment`), HttpStatus.NOT_FOUND);
      }
      // Only teacher who is class admin can accept or reject leave form
      if (!teacherAssignmentExisted.isClassAdmin) {
        throw new HttpException(await i18n.translate(`message.not_class_admin`), HttpStatus.FORBIDDEN);
      }
      const result = await this._leaveFormService.update(formId, { status });
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('assign-student')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async assignStudent(@Body() removeOrAssignStudentDto: RemoveOrAssignStudentDto, @I18n() i18n: I18nContext) {
    // Only teacher who is class admin can accept or reject the invite request, but will check later
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
    // Only teacher who is class admin can remove student from class, but will check later
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
  @Get('teacher-assignment-detail/:classId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getTeacherAssignmentDetailByClassAndId(@GetUser() user: User, @I18n() i18n: I18nContext, @Param('classId') classId: string) {
    try {
      const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
      if (!teacherExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher`), HttpStatus.NOT_FOUND);
      }
      const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
        teacherId: teacherExisted._id,
        classId: new Types.ObjectId(classId),
      });
      if (!teacherAssignmentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_teacher_assignment`), HttpStatus.NOT_FOUND);
      }
      const result = await this._teacherAssignmentService.getTeacherAssignmentDetail(teacherAssignmentExisted._id);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  //TODO: (Later) Add badge for student if student has good behavior
}
