import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
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

  @Post('add-user')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addUser(@Body() userDto: AddUserDto, @I18n() i18n: I18nContext) {
    return this._adminService.addUser(userDto, i18n);
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
