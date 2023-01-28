import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { convertKeyRoles, isEmptyObjectOrArray, isPhoneNumberValidation, passwordGenerate, validateFields } from '../../shared/utils';
import { Types } from 'mongoose';
import { ApiResponse } from '../../shared/response/api-response';
import { AddParentDto } from '../dto/add-parent.dto';
import { I18nContext } from 'nestjs-i18n';
import { RoleService } from '../../user/service/role.service';
import { UserService } from '../../user/service/user.service';
import { ParentService } from '../../parent/parent.service';
import { AddRoleDto } from '../../auth/dto/add-role.dto';
import { AddUserDto } from '../../auth/dto/add-user.dto';
import { AddStudentDto } from '../dto/add-student.dto';
import { ClassService } from '../../class/class.service';
import { StudentService } from './student.service';
import { AddClassDto } from '../dto/add-class.dto';
import { AddTeacherDto } from '../dto/add-teacher.dto';
import { TeacherService } from '../../teacher/teacher.service';
import { AddSubjectDto } from '../dto/add-subject.dto';
import { SubjectService } from './subject.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly _roleService: RoleService,
    private readonly _userService: UserService,
    private readonly _parentService: ParentService,
    private readonly _classService: ClassService,
    private readonly _studentService: StudentService,
    private readonly _teacherService: TeacherService,
    private readonly _subjectService: SubjectService,
  ) {}

  async addRoles(roles: AddRoleDto[], i18n: I18nContext) {
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

  async addUser(userDto: AddUserDto, i18n: I18nContext) {
    try {
      const user = await this.addSingleUser(userDto, i18n);
      return new ApiResponse(user);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async addParent(parentDto: AddParentDto, i18n: I18nContext) {
    try {
      const { address, ward, district, country, province, job, gender, age, ...userDto } = parentDto;

      const user = await this.addSingleUser(userDto, i18n);

      const parentInstance: any = {
        address,
        ward,
        district,
        province,
        country,
        job,
        gender,
        age,
        userId: user._id,
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

  async addTeacher(teacherDto: AddTeacherDto, i18n: I18nContext) {
    try {
      const { address, age, gender, degree, ...userDto } = teacherDto;
      const user = await this.addSingleUser(userDto, i18n);
      const teacherInstance: any = {
        address,
        age,
        gender,
        degree,
        userId: user._id,
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

  async addStudent(studentDto: AddStudentDto, i18n: I18nContext) {
    try {
      const { parentId, classId, name } = studentDto;
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
      const result = await this._studentService.create(studentDto);
      return new ApiResponse(result);
    } catch (error) {
      console.log('error', error);
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async addClass(classDto: AddClassDto, i18n: I18nContext) {
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

  async addSubject(subjectDto: AddSubjectDto, i18n: I18nContext) {
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

  async addSingleUser(userDto: AddUserDto, i18n: I18nContext) {
    const { mobilePhone, username, email, firstName, lastName, isActive, roleKey, password } = userDto;
    await validateFields({ mobilePhone, email, username, roleKey, password }, `common.required_field`, i18n);

    if (!isPhoneNumberValidation(mobilePhone)) {
      throw new HttpException(await i18n.translate(`user.phone_invalid_field`), HttpStatus.BAD_REQUEST);
    }

    //Check Email
    const userExistedEmail = await this._userService.findOne({ email });
    if (userExistedEmail && userExistedEmail?._id) {
      throw new HttpException(await i18n.translate('message.existed_email'), HttpStatus.CONFLICT);
    }
    //Check if role exists
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
    //Check phone
    const userExistedPhone = await this._userService.findOne({ mobilePhone });
    if (userExistedPhone && userExistedPhone?._id) {
      throw new HttpException(await i18n.translate('message.existed_phone_number'), HttpStatus.CONFLICT);
    }
    const hashPassword = await passwordGenerate(password);

    const userInstance: any = {
      mobilePhone,
      username,
      email,
      isActive,
      firstname: firstName,
      lastname: lastName,
      role: roleKey,
      password: hashPassword,
    };

    const user = await this._userService.create(userInstance);
    return user;
  }
}
