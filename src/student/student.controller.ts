import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Roles } from '../shared/decorator/roles.decorator';
import { ConstantRoles } from '../shared/utils/constant/role';
import { ApiException } from '../shared/type/api-exception.model';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { AddStudentDto } from './dto/add-student.dto';
import { toListResponse, validateFields } from '../shared/utils';
import { Types } from 'mongoose';
import { ApiResponse } from '../shared/response/api-response';
import { StudentService } from './student.service';
import { GetAllStudentDto } from './dto/get-all-student.dto';
import { ClassService } from '../class/class.service';
import { ParentService } from '../parent/parent.service';
import { ProgressTrackingService } from '../progress-tracking/service/progress-tracking.service';
import { TeacherAssignmentService } from '../teacher-assignment/teacher-assignment.service';
import { TeacherService } from '../teacher/teacher.service';
import { LeaveFormService } from '../progress-tracking/service/leave-form.service';
import { GetAllLeaveForm } from '../progress-tracking/dto/get-all-leave-form.dto';

@ApiTags('Student')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/student')
@UseGuards(JwtGuard, RolesGuard)
export class StudentController {
  constructor(
    private readonly _studentService: StudentService,
    private readonly _classService: ClassService,
    private readonly _parentService: ParentService,
    private readonly _progressTrackingService: ProgressTrackingService,
    private readonly _teacherService: TeacherService,
    private readonly _teacherAssignmentService: TeacherAssignmentService,
    private readonly _leaveFormService: LeaveFormService,
  ) {}

  @Get('progress-tracking/:progressId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getDetailProgressTracking(@GetUser() user: User, @I18n() i18n: I18nContext, @Param('progressId') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const progressTrackingExisted = await this._progressTrackingService.findById(id);
      if (!progressTrackingExisted || !progressTrackingExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_progress_tracking'), HttpStatus.CONFLICT);
      }
      if (user.role === ConstantRoles.TEACHER) {
        // Check if the teacher is assign to this class by classId from progressTracking
        const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
        const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
          teacherId: teacherExisted._id,
          classId: progressTrackingExisted.classId,
        });
        if (!teacherAssignmentExisted || !teacherAssignmentExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_teacher_assignment'), HttpStatus.CONFLICT);
        }
      }
      if (user.role === ConstantRoles.PARENT) {
        // Check if the parent has the student in the class by studentId from progressTracking
        // find parent by userId
        const parentExisted = await this._parentService.getParentByUserId(user._id);

        const childExisted = await this._studentService.findOne({
          parentId: parentExisted._id,
          _id: progressTrackingExisted.studentId,
        });
        if (!childExisted || !childExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_student'), HttpStatus.CONFLICT);
        }
      }
      return new ApiResponse(progressTrackingExisted);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('leave-form-list-by-class/:classId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getListLeaveFormByClass(@Body() getAllLeaveFormDto: GetAllLeaveForm, @GetUser() user: User, @I18n() i18n: I18nContext, @Param('classId') classId: string) {
    // Check if the teacher is the class admin, he/she can see the leave form of the student in the class
    try {
      const { search, limit, skip, sort } = getAllLeaveFormDto;
      await validateFields({ classId }, `common.required_field`, i18n);
      const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
      if (!teacherExisted || !teacherExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_teacher'), HttpStatus.CONFLICT);
      }

      const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
        classId,
        teacherId: teacherExisted._id,
      });
      if (!teacherAssignmentExisted || !teacherAssignmentExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_teacher_assignment'), HttpStatus.CONFLICT);
      }
      if (!teacherAssignmentExisted.isClassAdmin) {
        throw new HttpException(await i18n.translate('message.not_class_admin'), HttpStatus.CONFLICT);
      }
      const [{ totalRecords, data }] = await this._leaveFormService.getAllLeaveFormWithFilter({ classId: new Types.ObjectId(classId) }, sort, search, limit, skip);

      return new ApiResponse({
        ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Get('leave-form/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getDetailLeaveForm(@I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    // Check if the teacher is the class admin, he/she can see the leave form of the student in the class
    // or if the parent is the parent of the student, he/she can see the leave form of the student
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const leaveFormExisted = await this._leaveFormService.findById(id);
      if (!leaveFormExisted || !leaveFormExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_leave_form'), HttpStatus.CONFLICT);
      }
      if (user.role === ConstantRoles.TEACHER) {
        const teacherExisted = await this._teacherService.getTeacherByUserId(user._id);
        if (!teacherExisted || !teacherExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_teacher'), HttpStatus.CONFLICT);
        }

        const teacherAssignmentExisted = await this._teacherAssignmentService.findOne({
          classId: leaveFormExisted.classId,
          teacherId: teacherExisted._id,
        });
        if (!teacherAssignmentExisted || !teacherAssignmentExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_teacher_assignment'), HttpStatus.CONFLICT);
        }
        if (!teacherAssignmentExisted.isClassAdmin) {
          throw new HttpException(await i18n.translate('message.not_class_admin'), HttpStatus.CONFLICT);
        }
      }
      if (user.role === ConstantRoles.PARENT) {
        // Check if the parent has the student in the class by studentId from progressTracking
        // find parent by userId
        const parentExisted = await this._parentService.getParentByUserId(user._id);

        const childExisted = await this._studentService.findOne({
          parentId: parentExisted._id,
          _id: leaveFormExisted.studentId,
        });
        if (!childExisted || !childExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_student'), HttpStatus.CONFLICT);
        }
      }

      return new ApiResponse(leaveFormExisted);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('leave-form-list-by-student/:studentId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getListLeaveFormByStudent(@Body() getAllLeaveFormDto: GetAllLeaveForm, @GetUser() user: User, @I18n() i18n: I18nContext, @Param('studentId') studentId: string) {
    try {
      const { search, limit, skip, sort } = getAllLeaveFormDto;
      await validateFields({ studentId }, `common.required_field`, i18n);
      // Check if the student is belonged to the parent
      const parentExisted = await this._parentService.getParentByUserId(user._id);

      const childExisted = await this._studentService.findOne({
        parentId: parentExisted._id,
        _id: studentId,
      });
      if (!childExisted || !childExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_student'), HttpStatus.CONFLICT);
      }
      const [{ totalRecords, data }] = await this._leaveFormService.getAllLeaveFormWithFilter({ studentId: new Types.ObjectId(studentId) }, sort, search, limit, skip);

      return new ApiResponse({
        ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Update student(children)
  @Put(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateStudent(@Body() studentDto: AddStudentDto, @I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    try {
      const { parentId, classId, name, age, gender } = studentDto;
      await validateFields({ id }, `common.required_field`, i18n);
      // Need to check if it is parent, then check if the student is belonged to the parent and cannot update classId
      if (user.role === ConstantRoles.PARENT) {
        // Check if the student is belonged to the parent
        const parentExisted = await this._parentService.getParentByUserId(user._id);

        const childExisted = await this._studentService.findOne({
          parentId: parentExisted._id,
          _id: id,
        });
        if (!childExisted || !childExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_student'), HttpStatus.CONFLICT);
        }
        if (classId) {
          throw new HttpException(await i18n.translate('message.not_allowed_update_field'), HttpStatus.CONFLICT);
        }
      }

      if (user.role === ConstantRoles.SUPER_USER) {
        //Check student exists
        const studentExisted = await this._studentService.findById(id);
        if (!studentExisted || !studentExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_student'), HttpStatus.CONFLICT);
        }
        //Check parent exists
        if (parentId) {
          const parentExisted = await this._parentService.findById(parentId);
          if (!parentExisted || !parentExisted?._id) {
            throw new HttpException(await i18n.translate('message.nonexistent_parent'), HttpStatus.CONFLICT);
          }
        }

        //Check class exists
        if (classId) {
          const classExisted = await this._classService.findById(classId);
          if (!classExisted || !classExisted?._id) {
            throw new HttpException(await i18n.translate('message.nonexistent_class'), HttpStatus.CONFLICT);
          }
        }
      }

      const studentInstance: any = {
        name: name.trim(),
        parentId: new Types.ObjectId(parentId),
        ...(classId && user.role === ConstantRoles.SUPER_USER && { classId: new Types.ObjectId(classId) }),
        age,
        gender,
        // age: age ? age : studentExisted?.age,
        // gender: gender ? gender : studentExisted?.gender,
      };
      const result = await this._studentService.update(id, studentInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Delete student(children)
  @Delete(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteStudent(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      // Need to check if it is parent, then check if the student is belong to the parent
      const student = await this._studentService.findOne({ _id: new Types.ObjectId(id) });

      if (!student) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'id' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this._studentService.delete(student._id);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Get student(children) by id
  @Get(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getStudentById(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      // Need to check if it is parent, then check if the student is belong to the parent
      const student = await this._studentService.getStudentDetail(id);

      if (!student) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'id' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      return new ApiResponse(student);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Add student(children)
  @Post('student')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addStudent(@Body() studentDto: AddStudentDto, @I18n() i18n: I18nContext) {
    try {
      const { parentId, classId, name, age, gender } = studentDto;
      await validateFields({ parentId, classId, name }, `common.required_field`, i18n);

      //Check parent exists
      const parentExisted = await this._parentService.findOne({ _id: new Types.ObjectId(parentId) });
      if (!parentExisted || !parentExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_parent'), HttpStatus.CONFLICT);
      }

      //Check class exists
      const classExisted = await this._classService.findOne({ _id: new Types.ObjectId(classId) });
      if (!classExisted || !classExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_class'), HttpStatus.CONFLICT);
      }
      const studentInstance: any = {
        name: name.trim(),
        parentId: new Types.ObjectId(parentId),
        classId: new Types.ObjectId(classId),
        age,
        gender,
      };
      const result = await this._studentService.create(studentInstance);
      return new ApiResponse(result);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Get all student(children)
  @Post('list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllStudent(@Body() getAllStudentDto: GetAllStudentDto, @I18n() i18n: I18nContext) {
    try {
      const { skip, limit, sort, search } = getAllStudentDto;

      const result = await this._studentService.getStudentList(sort, search, limit, skip);
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

  // Get all student(children) by parent
  @Get('list-by-parent/:parentId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllChildren(@I18n() i18n: I18nContext, @Param('parentId') parentId: string) {
    try {
      const parentExisted = await this._parentService.findById(parentId);
      if (!parentExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_parent`), HttpStatus.NOT_FOUND);
      }
      return this._studentService.findAll({ parentId: new Types.ObjectId(parentId) });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
