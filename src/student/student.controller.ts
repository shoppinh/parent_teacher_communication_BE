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

@ApiTags('Student')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/student')
@UseGuards(JwtGuard, RolesGuard)
export class StudentController {
  constructor(private readonly _studentService: StudentService, private readonly _classService: ClassService, private readonly _parentService: ParentService) {}

  //TODO: Get detail progress tracking
  @Get('progress-tracking/:progressId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getDetailProgressTracking(@GetUser() user: User, @I18n() i18n: I18nContext, @Param('progressId') id: string) {}

  //TODO: Teacher wants to see leave form of the student in the class
  @Get('leave-form/:classId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getListLeaveFormByClass(@GetUser() user: User, @I18n() i18n: I18nContext, @Param('classId') classId: string) {
    // Check if the teacher is the class admin, he/she can see the leave form of the student in the class
  }

  //TODO: Get detail leave form
  @Get('leave-form/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getDetailLeaveForm(@I18n() i18n: I18nContext, @Param('id') id: string) {
    // Check if the teacher is the class admin, he/she can see the leave form of the student in the class
    // or if the parent is the parent of the student, he/she can see the leave form of the student
  }

  //TODO: Get list leave form and stats about leave of each student
  @Get('leave-form/:studentId')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getListLeaveFormByStudent(@GetUser() user: User, @I18n() i18n: I18nContext, @Param('studentId') studentId: string) {}

  // Update student(children)
  @Put(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateStudent(@Body() studentDto: AddStudentDto, @I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      const { parentId, classId, name, age, gender } = studentDto;
      await validateFields({ id }, `common.required_field`, i18n);
      // Need to check if it is parent, then check if the student is belong to the parent and cannot update classId

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
      const studentInstance: any = {
        name: name.trim(),
        parentId: new Types.ObjectId(parentId),
        classId: new Types.ObjectId(classId),
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
