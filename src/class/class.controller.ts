import { Controller, Get, HttpCode, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
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
import { toListResponse } from '../shared/utils';

@ApiTags('Class')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/class')
@UseGuards(JwtGuard, RolesGuard)
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly teacherAssignmentService: TeacherAssignmentService,
    private readonly teacherService: TeacherService,
    private readonly parentService: ParentService,
  ) {}

  @Get('list-by-role')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.PARENT)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getListByRole(@GetUser() user, @I18n() i18n: I18nContext) {
    try {
      if (user.role === ConstantRoles.PARENT) {
        const classExisted = await this.parentService.getClassListForParent(user._id);
        return new ApiResponse({
          ...toListResponse([classExisted, classExisted.length ?? 0]),
        });
      } else if (user.role === ConstantRoles.TEACHER) {
        const teacherExisted = await this.teacherService.getTeacherByUserId(user._id);
        const classExisted = await this.teacherAssignmentService.getTeacherAssignmentListForTeacher(teacherExisted._id);
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
}
