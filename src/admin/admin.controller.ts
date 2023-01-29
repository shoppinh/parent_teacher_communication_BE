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

  @Get('user')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllUser(@Body() getAllUserDto: GetAllUserDto,@I18n() i18n: I18nContext) {
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

  @Post('add-parent')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addParent(@Body() parentDto: AddParentDto, @I18n() i18n: I18nContext) {
    return this._adminService.addParent(parentDto, i18n);
  }

  @Post('add-student')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addStudent(@Body() studentDto: AddStudentDto, @I18n() i18n: I18nContext) {
    return this._adminService.addStudent(studentDto, i18n);
  }

  @Post('add-class')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addClass(@Body() classDto: AddClassDto, @I18n() i18n: I18nContext) {
    return this._adminService.addClass(classDto, i18n);
  }

  @Post('add-teacher')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addTeacher(@Body() teacherDto: AddTeacherDto, @I18n() i18n: I18nContext) {
    return this._adminService.addTeacher(teacherDto, i18n);
  }

  @Post('add-subject')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addSubject(@Body() subjectDto: AddSubjectDto, @I18n() i18n: I18nContext) {
    return this._adminService.addSubject(subjectDto, i18n);
  }
}
