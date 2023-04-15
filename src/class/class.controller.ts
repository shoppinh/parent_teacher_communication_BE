import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { Roles } from '../shared/decorator/roles.decorator';
import { ConstantRoles } from '../shared/utils/constant/role';
import { ApiException } from '../shared/type/api-exception.model';
import { I18n, I18nContext } from 'nestjs-i18n';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { ClassService } from './class.service';
import { TeacherAssignmentService } from '../teacher-assignment/teacher-assignment.service';
import { TeacherService } from '../teacher/teacher.service';
import { ParentService } from '../parent/parent.service';
import { ApiResponse } from '../shared/response/api-response';
import { toListResponse, validateFields } from '../shared/utils';
import { StudentService } from '../student/student.service';
import { LeaveFormService } from '../progress-tracking/service/leave-form.service';
import { Types } from 'mongoose';

@ApiTags('Class')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/class')
@UseGuards(JwtGuard, RolesGuard)
export class ClassController {
  constructor(
    private readonly _classService: ClassService,
    private readonly _teacherAssignmentService: TeacherAssignmentService,
    private readonly _teacherService: TeacherService,
    private readonly _parentService: ParentService,
    private readonly _studentService: StudentService,
    private readonly _leaveFormService: LeaveFormService,
  ) {}

  @Get('list-by-role')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.PARENT, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getListByRole(@GetUser() user, @I18n() i18n: I18nContext) {
    try {
      if (user.role === ConstantRoles.PARENT) {
        const classExisted = await this._parentService.getClassListForParent(user._id);
        return new ApiResponse({
          ...toListResponse([classExisted, classExisted.length ?? 0]),
        });
      } else if (user.role === ConstantRoles.TEACHER) {
        const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
        const classExisted = await this._teacherAssignmentService.getTeacherAssignmentListForTeacher(teacherExisted._id);
        return new ApiResponse({
          ...toListResponse([classExisted, classExisted.length ?? 0]),
        });
      } else {
        const classExisted = await this._classService.findAll({ isSchoolClass: false });
        return new ApiResponse({
          ...toListResponse([classExisted, classExisted.length ?? 0]),
        });
      }
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.PARENT, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  async getClassDetail(@I18n() i18n: I18nContext, @Param('id') classId: string) {
    try {
      await validateFields({ classId }, `common.required_field`, i18n);

      const classExisted = await this._classService.findById(classId);
      if (!classExisted) {
        throw new HttpException(await i18n.translate(`message.class_not_found`), HttpStatus.BAD_REQUEST);
      }
      const teacherAssignmentList = await this._teacherAssignmentService.getTeacherAssignmentListForClass(classId);
      const parentList = await this._parentService.getParentListForClass(classId);
      const studentList = await this._studentService.getAllStudentByClass(classId);
      const [{ data: leaveFormList }] = await this._leaveFormService.getAllLeaveFormWithFilter({ classId: new Types.ObjectId(classId) });
      return new ApiResponse({
        classInfo: classExisted,
        teacherAssignments: teacherAssignmentList,
        parents: parentList,
        students: studentList,
        leaveForm: leaveFormList,
      });
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
