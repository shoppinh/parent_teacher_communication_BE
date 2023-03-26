import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
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
import { AddStudentDto } from '../student/dto/add-student.dto';
import { AddClassDto } from './dto/add-class.dto';
import { AddTeacherDto } from './dto/add-teacher.dto';
import { AddSubjectDto } from './dto/add-subject.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { GetAllStudentDto } from '../student/dto/get-all-student.dto';
import { AddTeacherAssignmentDto } from './dto/add-teacher-assignment.dto';
import { GetAllParentDto } from './dto/get-all-parent.dto';
import { GetAllClassDto } from './dto/get-all-class.dto';
import { GetAllTeacherDto } from './dto/get-all-teacher.dto';
import { GetAllSubjectDto } from './dto/get-all-subject.dto';
import { GetAllTeacherAssignmentDto } from './dto/get-all-teacher-assignment.dto';
import { ApiResponse } from '../shared/response/api-response';
import { convertKeyRoles, isEmptyObjectOrArray, isPhoneNumberValidation, isValidEmail, passwordGenerate, toListResponse, validateFields } from '../shared/utils';
import { UserService } from '../user/service/user.service';
import { RoleService } from '../user/service/role.service';
import { Types } from 'mongoose';
import { ParentService } from '../parent/parent.service';
import { TeacherService } from '../teacher/teacher.service';
import { TeacherAssignmentService } from '../teacher-assignment/teacher-assignment.service';
import { SubjectService } from './service/subject.service';
import { ClassService } from '../class/class.service';
import { StudentService } from '../student/student.service';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';

@ApiTags('Admin')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/admin')
@UseGuards(JwtGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly _adminService: AdminService,
    private readonly _userService: UserService,
    private readonly _roleService: RoleService,
    private readonly _parentService: ParentService,
    private readonly _teacherService: TeacherService,
    private readonly _teacherAssignmentService: TeacherAssignmentService,
    private readonly _subjectService: SubjectService,
    private readonly _classService: ClassService,
    private readonly _studentService: StudentService,
  ) {}

  @Post('add-roles')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addRoles(@Body() roles: AddRoleDto[], @I18n() i18n: I18nContext) {
    try {
      await validateFields({ roles }, `common.required_field`, i18n);
      const getInputRoles = roles.map((el) => convertKeyRoles(el.roleKey));
      const findAllRoles = await this._roleService.findAll({ roleKey: { $in: getInputRoles } });
      let roleItemToCreate = [];
      const rolesResult = [];
      if (!isEmptyObjectOrArray(findAllRoles)) {
        roleItemToCreate = findAllRoles.map((el) => el.roleKey);
        for (const role of findAllRoles) {
          const findRole = roles.find((el) => convertKeyRoles(el.roleKey) === role.roleKey);
          if (!isEmptyObjectOrArray(findRole)) {
            role.isActive = findRole?.isActive;
            role.roleKey = convertKeyRoles(findRole.roleKey);
            role.roleName = findRole.roleName;
            rolesResult.push(await this._roleService.update(role._id, role));
          }
        }
      }

      if (!isEmptyObjectOrArray(roles)) {
        const rolesArray = roles.filter((el) => !roleItemToCreate.includes(convertKeyRoles(el.roleKey)));
        if (!isEmptyObjectOrArray(rolesArray)) {
          for (const role of rolesArray) {
            const item = {
              isActive: role.isActive,
              roleKey: convertKeyRoles(role.roleKey),
              roleName: role.roleName,
            };
            rolesResult.push(await this._roleService.create(item));
          }
        }
      }
      return new ApiResponse({
        success: true,
        rolesResult,
      });
    } catch (error) {
      console.log('🚀 ~ file: admin.controller.ts:30 ~ addRoles ~ error', error);
      throw new HttpException(error?.response ?? (await i18n.translate('message.internal_server_error')), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // User controller collection

  @Post('user/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllUser(@Body() getAllUserDto: GetAllUserDto, @I18n() i18n: I18nContext) {
    try {
      const { skip, limit, sort, search } = getAllUserDto;

      const result = await this._userService.getUserList(sort, search, limit, skip);
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

  @Get('user/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getUserDetail(@Param('id') id: string, @I18n() i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      //Check if user exists
      const user = await this._userService.findOne({ _id: new Types.ObjectId(id) }, { password: 0 });
      if (!user) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'user' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }

      return new ApiResponse(user);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('user')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addUser(@Body() userDto: AddUserDto, @I18n() i18n: I18nContext) {
    try {
      const user = await this._adminService.addSingleUser(userDto, i18n);
      return new ApiResponse(user);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('user/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateUser(@Body() userDto: Partial<AddUserDto>, @I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      const { mobilePhone, username, email, firstName, lastName, fullName, isActive, roleKey, password } = userDto;
      await validateFields({ id }, `common.required_field`, i18n);

      if (mobilePhone && !isPhoneNumberValidation(mobilePhone)) {
        throw new HttpException(await i18n.translate(`user.phone_invalid_field`), HttpStatus.BAD_REQUEST);
      }
      if (email && !isValidEmail(email)) {
        throw new HttpException(await i18n.translate(`user.email_invalid_field`), HttpStatus.BAD_REQUEST);
      }
      //Check Email
      const userExistedEmail = await this._userService.findOne({ email });
      if (userExistedEmail && email !== userExistedEmail.email && userExistedEmail?._id) {
        throw new HttpException(await i18n.translate('message.existed_email'), HttpStatus.CONFLICT);
      }

      // Check phone
      const userExistedPhone = await this._userService.findOne({ mobilePhone });
      if (userExistedPhone && mobilePhone !== userExistedPhone.mobilePhone && userExistedPhone?._id) {
        throw new HttpException(await i18n.translate('message.existed_phone_number'), HttpStatus.CONFLICT);
      }

      //Check if role exists
      if (roleKey) {
        const getAllRole = await this._roleService.getAllRole();
        const allRoleKeyExist = getAllRole.map((el) => el?.roleKey?.toString().toLocaleUpperCase());
        const isRoleKeyInAllRole = allRoleKeyExist.includes(roleKey.toLocaleUpperCase());
        if (!isRoleKeyInAllRole) {
          throw new HttpException(
            await i18n.translate(`common.not_found`, {
              args: { fieldName: 'roleKey' },
            }),
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      //User need to update
      const user = await this._userService.findOne({ _id: new Types.ObjectId(id) });
      if (!user) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'id' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      const userInstance: any = {
        mobilePhone: mobilePhone && mobilePhone.trim(),
        username: username && username.trim(),
        email: email && email.trim(),
        isActive,
        firstname: firstName,
        fullname: fullName,
        lastname: lastName,
        role: roleKey,
        password: password && (await passwordGenerate(password)),
      };
      const result = await this._userService.update(id, userInstance);
      return new ApiResponse(result);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('user/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteUser(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const user = await this._userService.findById(id);
      const parent = await this._parentService.findOne({ userId: new Types.ObjectId(id) });
      const teacher = await this._teacherService.findOne({ userId: new Types.ObjectId(id) });

      if (!user) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'id' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      if (parent) {
        await this._parentService.delete(parent._id);
      }
      if (teacher) {
        await this._teacherService.delete(teacher._id);
      }
      await this._userService.delete(user._id);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Parent Controller Collection

  @Post('parent')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addParent(@Body() parentDto: AddParentDto, @I18n() i18n: I18nContext) {
    try {
      const { address, ward, district, country, province, job, gender, age, ...userDto } = parentDto;

      const user = await this._adminService.addSingleUser(userDto, i18n);
      const parentInstance: any = {
        address,
        ward,
        district,
        province,
        country,
        job,
        gender,
        age,
        userId: user,
      };

      const parent = await this._parentService.create(parentInstance);
      return new ApiResponse(parent);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('parent/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllParent(@Body() getAllParentDto: GetAllParentDto, @I18n() i18n: I18nContext) {
    try {
      const { skip, limit, sort, search } = getAllParentDto;

      const result = await this._parentService.getParentList(sort, search, limit, skip);
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

  @Get('parent/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getParentById(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const parent = await this._parentService.findById(id);

      if (!parent) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'id' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      return new ApiResponse(parent);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('parent/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateParent(@Body() parentDto: AddParentDto, @I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      const { address, gender, age, job, ward, district, province, country, ...userDto } = parentDto;
      await validateFields({ id, email: userDto.email }, `common.required_field`, i18n);

      const existedParent = await this._parentService.findById(id);
      if (!existedParent || !existedParent?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_parent'), HttpStatus.CONFLICT);
      }

      //Check Email
      const userExistedEmail = await this._userService.findOne({ email: userDto.email });
      if (userExistedEmail && userDto.email !== userExistedEmail.email && userExistedEmail?._id) {
        throw new HttpException(await i18n.translate('message.existed_email'), HttpStatus.CONFLICT);
      }

      // Check phone
      const userExistedPhone = await this._userService.findOne({ mobilePhone: userDto.mobilePhone });
      if (userExistedPhone && userDto.mobilePhone !== userExistedPhone.mobilePhone && userExistedPhone?._id) {
        throw new HttpException(await i18n.translate('message.existed_phone_number'), HttpStatus.CONFLICT);
      }

      await this._userService.update(existedParent.userId._id, userDto);
      const parentInstance: any = {
        address,
        ward,
        district,
        province,
        country,
        job,
        gender,
        age,
        userId: existedParent.userId._id,
      };
      const result = await this._parentService.update(id, parentInstance, 'userId');
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('parent/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteParent(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const parent = await this._parentService.findById(id);
      if (!parent || !parent?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_parent'), HttpStatus.CONFLICT);
      }

      await this._userService.delete(parent.userId._id);
      await this._parentService.delete(id);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Student Controller Collection
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

  // Add student(children)
  @Post('/student')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addStudent(@Body() studentDto: AddStudentDto, @I18n() i18n: I18nContext) {
    try {
      const { parentId, classId, name, age, gender, relationship } = studentDto;
      await validateFields({ classId, name }, `common.required_field`, i18n);

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
        relationship,
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

  // Update student(children)
  @Put('/student/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateStudent(@Body() studentDto: AddStudentDto, @I18n() i18n: I18nContext, @Param('id') id: string, @GetUser() user: User) {
    try {
      const { parentId, classId, name, age, gender, relationship } = studentDto;
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
        relationship,
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
  @Delete('/student/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
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
  @Get('/student/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
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

  // Class Controller Collection

  @Post('class')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addClass(@Body() classDto: AddClassDto, @I18n() i18n: I18nContext) {
    try {
      const { name } = classDto;
      await validateFields({ name }, `common.required_field`, i18n);

      //Check class name exists
      const classExisted = await this._classService.findOne({ name });
      if (classExisted && classExisted?._id) {
        throw new HttpException(await i18n.translate('message.existed_class_name'), HttpStatus.CONFLICT);
      }
      const result = await this._classService.create(classDto);
      return new ApiResponse(result);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('class/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllClass(@Body() getAllClassDto: GetAllClassDto, @I18n() i18n: I18nContext) {
    try {
      const { skip, limit, sort, search } = getAllClassDto;

      const result = await this._classService.getClassList(sort, search, limit, skip);
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

  @Get('class/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getClassById(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const result = this._classService.findById(id);

      if (!result) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'id' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('class/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateClass(@Body() classDto: AddClassDto, @I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const classExisted = await this._classService.findById(id);
      if (!classExisted || !classExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_class'), HttpStatus.CONFLICT);
      }
      const result = await this._classService.update(id, classDto);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('class/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteClass(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const classExisted = await this._classService.findById(id);
      if (!classExisted || !classExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_class'), HttpStatus.CONFLICT);
      }
      await this._classService.delete(id);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Teacher Controller Collection

  @Post('teacher')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addTeacher(@Body() teacherDto: AddTeacherDto, @I18n() i18n: I18nContext) {
    try {
      const { address, age, gender, degree, ...userDto } = teacherDto;
      const user = await this._adminService.addSingleUser(userDto, i18n);
      const teacherInstance: any = {
        address,
        age,
        gender,
        degree,
        userId: user,
      };
      const teacher = await this._teacherService.create(teacherInstance);
      return new ApiResponse(teacher);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('teacher/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllTeacher(@Body() getAllTeacherDto: GetAllTeacherDto, @I18n() i18n: I18nContext) {
    try {
      const { sort, search, limit, skip } = getAllTeacherDto;
      const result = await this._teacherService.getTeacherList(sort, search, limit, skip);
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

  @Get('teacher/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getTeacherById(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const teacher = await this._teacherService.findById(id);
      if (!teacher || !teacher?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_teacher'), HttpStatus.CONFLICT);
      }
      return new ApiResponse(teacher);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('teacher/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateTeacher(@Body() teacherDto: AddTeacherDto, @I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      const { address, gender, degree, age, ...userDto } = teacherDto;
      await validateFields({ id }, `common.required_field`, i18n);
      const existedTeacher = await this._teacherService.findById(id);
      if (!existedTeacher || !existedTeacher?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_teacher'), HttpStatus.CONFLICT);
      }

      //Check Email
      const userExistedEmail = await this._userService.findOne({ email: teacherDto.email });
      if (userExistedEmail && teacherDto.email !== userExistedEmail.email && userExistedEmail?._id) {
        throw new HttpException(await i18n.translate('message.existed_email'), HttpStatus.CONFLICT);
      }

      // Check phone
      const userExistedPhone = await this._userService.findOne({ mobilePhone: teacherDto.mobilePhone });
      if (userExistedPhone && teacherDto.mobilePhone !== userExistedPhone.mobilePhone && userExistedPhone?._id) {
        throw new HttpException(await i18n.translate('message.existed_phone_number'), HttpStatus.CONFLICT);
      }

      const teacherInstance: any = {
        address,
        gender,
        degree,
        age,
      };
      await this._userService.update(existedTeacher.userId._id, userDto);
      const result = await this._teacherService.update(id, teacherInstance, 'userId');
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('teacher/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteTeacher(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const teacher = await this._teacherService.findById(id);
      if (!teacher || !teacher?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_teacher'), HttpStatus.CONFLICT);
      }

      await this._userService.delete(teacher.userId._id);
      await this._teacherService.delete(id);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Subject Controller Collection

  @Post('subject')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addSubject(@Body() subjectDto: AddSubjectDto, @I18n() i18n: I18nContext) {
    try {
      const { name } = subjectDto;
      await validateFields({ name }, `common.required_field`, i18n);

      //Check subject name exists
      const subjectExisted = await this._subjectService.findOne({ name });
      if (subjectExisted && subjectExisted?._id) {
        throw new HttpException(await i18n.translate('message.existed_subject_name'), HttpStatus.CONFLICT);
      }
      const result = await this._subjectService.create(subjectDto);
      return new ApiResponse(result);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('subject/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllSubject(@Body() getAllSubjectDto: GetAllSubjectDto, @I18n() i18n: I18nContext) {
    try {
      const { skip, limit, sort, search } = getAllSubjectDto;

      const result = await this._subjectService.getSubjectList(sort, search, limit, skip);
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

  @Get('subject/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getSubjectById(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const result = this._subjectService.findById(id);

      if (!result) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'id' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('subject/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateSubject(@Body() subjectDto: Partial<AddSubjectDto>, @I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const subjectExisted = await this._subjectService.findById(id);
      if (!subjectExisted || !subjectExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_subject'), HttpStatus.CONFLICT);
      }
      const result = await this._subjectService.update(id, subjectDto);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('subject/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteSubject(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const subjectExisted = await this._subjectService.findById(id);
      if (!subjectExisted || !subjectExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_subject'), HttpStatus.CONFLICT);
      }
      await this._subjectService.delete(id);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Teacher Assignment Controller Collection

  @Post('teacher-assignment')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addTeacherAssignment(@Body() teacherAssignmentDto: AddTeacherAssignmentDto, @I18n() i18n: I18nContext) {
    try {
      const { teacherId, classId, subjectId, isClassAdmin } = teacherAssignmentDto;
      await validateFields({ teacherId, classId, subjectId }, `common.required_field`, i18n);

      //Check teacher exists
      const teacherExisted = await this._teacherService.findById(teacherId);
      if (!teacherExisted || !teacherExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_teacher'), HttpStatus.CONFLICT);
      }

      //Check class exists
      const classExisted = await this._classService.findById(classId);
      if (!classExisted || !classExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_class'), HttpStatus.CONFLICT);
      }

      //Check subject exists
      const subjectExisted = await this._subjectService.findById(subjectId);
      if (!subjectExisted || !subjectExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_subject'), HttpStatus.CONFLICT);
      }

      const teacherAssignmentInstance: any = {
        teacherId: new Types.ObjectId(teacherId),
        classId: new Types.ObjectId(classId),
        subjectId: new Types.ObjectId(subjectId),
        isClassAdmin,
      };

      const result = await this._teacherAssignmentService.create(teacherAssignmentInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('teacher-assignment/list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getAllTeacherAssignment(@Body() getAllTeacherAssignmentDto: GetAllTeacherAssignmentDto, @I18n() i18n: I18nContext) {
    try {
      const { skip, limit, sort, search } = getAllTeacherAssignmentDto;

      const result = await this._teacherAssignmentService.getTeacherAssignmentList(sort, search, limit, skip);
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

  @Get('teacher-assignment/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getTeacherAssignmentById(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const assignment = await this._teacherAssignmentService.getTeacherAssignmentDetail(id);

      if (!assignment) {
        throw new HttpException(
          await i18n.translate(`common.not_found`, {
            args: { fieldName: 'id' },
          }),
          HttpStatus.BAD_REQUEST,
        );
      }
      return new ApiResponse(assignment);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put('teacher-assignment/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async updateTeacherAssignment(@Body() teacherAssignmentDto: Partial<AddTeacherAssignmentDto>, @I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      const { teacherId, classId, subjectId } = teacherAssignmentDto;
      await validateFields({ id }, `common.required_field`, i18n);
      const assignmentExisted = await this._teacherAssignmentService.findById(id);
      if (!assignmentExisted || !assignmentExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_assignment'), HttpStatus.CONFLICT);
      }
      // Check teacher exists
      if (teacherId) {
        const teacherExisted = await this._teacherService.findById(teacherId);
        if (!teacherExisted || !teacherExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_teacher'), HttpStatus.CONFLICT);
        }
      }

      // Check class exists
      if (classId) {
        const classExisted = await this._classService.findById(classId);
        if (!classExisted || !classExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_class'), HttpStatus.CONFLICT);
        }
      }

      // Check subject exists

      if (subjectId) {
        const subjectExisted = await this._subjectService.findById(subjectId);
        if (!subjectExisted || !subjectExisted?._id) {
          throw new HttpException(await i18n.translate('message.nonexistent_subject'), HttpStatus.CONFLICT);
        }
      }
      const result = await this._teacherAssignmentService.update(id, teacherAssignmentDto);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete('teacher-assignment/:id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async deleteTeacherAssignment(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const assignmentExisted = await this._teacherAssignmentService.findById(id);
      if (!assignmentExisted || !assignmentExisted?._id) {
        throw new HttpException(await i18n.translate('message.nonexistent_assignment'), HttpStatus.CONFLICT);
      }
      await this._teacherAssignmentService.delete(id);
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
