import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AddRoleDto } from 'src/auth/dto/add-role.dto';
import { JwtGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/role.guard';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { ApiException } from 'src/shared/type/api-exception.model';
import { ConstantRoles } from 'src/shared/utils/constant/role';
import { AddUserDto } from '../auth/dto/add-user.dto';
import { AddParentDto } from './dto/add-parent.dto';
import { AdminService } from './service/admin.service';
import { AddStudentDto } from './dto/add-student.dto';
import { AddClassDto } from './dto/add-class.dto';
import { AddTeacherDto } from './dto/add-teacher.dto';
import { AddSubjectDto } from './dto/add-subject.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { GetAllStudentDto } from './dto/get-all-student.dto';
import { AddTeacherAssignmentDto } from './dto/add-teacher-assignment.dto';
import { GetAllParentDto } from './dto/get-all-parent.dto';
import { GetAllClassDto } from './dto/get-all-class.dto';
import { GetAllTeacherDto } from './dto/get-all-teacher.dto';
import { GetAllSubjectDto } from './dto/get-all-subject.dto';
import { GetAllTeacherAssignmentDto } from './dto/get-all-teacher-assignment.dto';

@ApiTags('Admin')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/admin')
@UseGuards(JwtGuard, RolesGuard)
export class AdminController {
  constructor(private readonly _adminService: AdminService) {}

  @Post('add-roles')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addRoles(@Body() roles: AddRoleDto[], @I18n() i18n: I18nContext) {
    return this._adminService.addRoles(roles, i18n);
  }

  // User controller collection

  @Post('user/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllUser(@Body() getAllUserDto: GetAllUserDto, @I18n() i18n: I18nContext) {
    return this._adminService.getAllUser(getAllUserDto, i18n);
  }

  @Post('user')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addUser(@Body() userDto: AddUserDto, @I18n() i18n: I18nContext) {
    return this._adminService.addUser(userDto, i18n);
  }

  @Put('user/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateUser(@Body() userDto: AddUserDto, @I18n() i18n: I18nContext, @Param('id') id: string) {
    return this._adminService.updateUser(userDto, i18n, id);
  }

  @Delete('user/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteUser(@I18n() i18n: I18nContext, @Param('id') id: string) {
    return this._adminService.deleteUser(id, i18n);
  }

  // Parent Controller Collection

  @Post('parent')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addParent(@Body() parentDto: AddParentDto, @I18n() i18n: I18nContext) {
    return this._adminService.addParent(parentDto, i18n);
  }

  @Post('parent/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllParent(@Body() getAllParentDto: GetAllParentDto, @I18n() i18n: I18nContext) {
    return this._adminService.getAllParent(getAllParentDto, i18n);
  }

  @Get('parent/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getParentById(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Put('parent/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateParent(@Body() parentDto: AddParentDto, @I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Delete('parent/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteParent(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  // Student Controller Collection

  @Post('student')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addStudent(@Body() studentDto: AddStudentDto, @I18n() i18n: I18nContext) {
    return this._adminService.addStudent(studentDto, i18n);
  }

  @Post('student/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllStudent(@Body() getAllStudentDto: GetAllStudentDto, @I18n() i18n: I18nContext) {
    return this._adminService.getAllStudent(getAllStudentDto, i18n);
  }

  @Put('student/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateStudent(@Body() studentDto: AddStudentDto, @I18n() i18n: I18nContext, @Param('id') id: string) {
    return this._adminService.updateStudent(id, studentDto, i18n);
  }

  @Delete('student/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteStudent(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Get('student/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getStudentById(@I18n() i18n: I18nContext, @Param('id') id: string) {
    return this._adminService.getStudentDetail(id, i18n);
  }

  // Class Controller Collection

  @Post('class')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addClass(@Body() classDto: AddClassDto, @I18n() i18n: I18nContext) {
    return this._adminService.addClass(classDto, i18n);
  }

  @Post('class/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllClass(@Body() getAllClassDto: GetAllClassDto, @I18n() i18n: I18nContext) {
    return this._adminService.getAllClass(getAllClassDto, i18n);
  }

  @Get('class/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getClassById(@I18n() i18n: I18nContext, @Param('id') id: string) {
    return this._adminService.getClassDetail(id, i18n);
  }

  @Put('class/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateClass(@Body() classDto: AddClassDto, @I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Delete('class/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteClass(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  // Teacher Controller Collection

  @Post('teacher')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addTeacher(@Body() teacherDto: AddTeacherDto, @I18n() i18n: I18nContext) {
    return this._adminService.addTeacher(teacherDto, i18n);
  }

  @Post('teacher/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllTeacher(@Body() getAllTeacherDto: GetAllTeacherDto, @I18n() i18n: I18nContext) {}

  @Get('teacher/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getTeacherById(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Put('teacher/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateTeacher(@Body() teacherDto: AddTeacherDto, @I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Delete('teacher/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteTeacher(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  // Subject Controller Collection

  @Post('subject')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addSubject(@Body() subjectDto: AddSubjectDto, @I18n() i18n: I18nContext) {
    return this._adminService.addSubject(subjectDto, i18n);
  }

  @Post('subject/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllSubject(@Body() getAllSubjectDto: GetAllSubjectDto, @I18n() i18n: I18nContext) {}

  @Get('subject/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getSubjectById(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Put('subject/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateSubject(@Body() subjectDto: AddSubjectDto, @I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Delete('subject/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteSubject(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  // Teacher Assignment Controller Collection

  @Post('teacher-assignment')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addTeacherAssignment(@Body() teacherAssignmentDto: AddTeacherAssignmentDto, @I18n() i18n: I18nContext) {}

  @Post('teacher-assignment/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllTeacherAssignment(@Body() getAllTeacherAssignmentDto: GetAllTeacherAssignmentDto, @I18n() i18n: I18nContext) {}

  @Get('teacher-assignment/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getTeacherAssignmentById(@I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Put('teacher-assignment/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateTeacherAssignment(@Body() teacherAssignmentDto: AddTeacherAssignmentDto, @I18n() i18n: I18nContext, @Param('id') id: string) {}

  @Delete('teacher-assignment/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteTeacherAssignment(@I18n() i18n: I18nContext, @Param('id') id: string) {}
}
