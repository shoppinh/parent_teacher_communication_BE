import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { convertKeyRoles, isEmptyObjectOrArray, isPhoneNumberValidation, isValidEmail, passwordGenerate, toListResponse, validateFields } from '../../shared/utils';
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
import { GetAllUserDto } from '../dto/get-all-user.dto';
import { GetAllStudentDto } from '../dto/get-all-student.dto';
import { GetAllParentDto } from '../dto/get-all-parent.dto';
import { GetAllClassDto } from '../dto/get-all-class.dto';
import { GetAllTeacherDto } from '../dto/get-all-teacher.dto';
import { GetAllSubjectDto } from '../dto/get-all-subject.dto';
import { AddTeacherAssignmentDto } from '../dto/add-teacher-assignment.dto';
import { TeacherAssignmentService } from '../../teacher-assignment/teacher-assignment.service';
import { GetAllTeacherAssignmentDto } from '../dto/get-all-teacher-assignment.dto';

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
    private readonly _teacherAssignmentService: TeacherAssignmentService,
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

  async addSingleUser(userDto: AddUserDto, i18n: I18nContext) {
    const { mobilePhone, username, email, firstName, lastName, isActive, roleKey, password } = userDto;
    await validateFields({ mobilePhone, email, username, roleKey, password }, `common.required_field`, i18n);

    if (!isPhoneNumberValidation(mobilePhone)) {
      throw new HttpException(await i18n.translate(`user.phone_invalid_field`), HttpStatus.BAD_REQUEST);
    }

    if (!isValidEmail(email)) {
      throw new HttpException(await i18n.translate(`user.email_invalid_field`), HttpStatus.BAD_REQUEST);
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

    return await this._userService.create(userInstance);
  }

  async getUserDetail(id: string, i18n: I18nContext) {
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

  async updateUser(userDto: Partial<AddUserDto>, i18n: I18nContext, id: string) {
    try {
      const { mobilePhone, username, email, firstName, lastName, isActive, roleKey, password } = userDto;
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

  async deleteUser(id: string, i18n: I18nContext) {
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

  async getAllUser(getAllUserDto: GetAllUserDto, i18n: I18nContext) {
    try {
      const { skip, limit, sort, search } = getAllUserDto;

      const result = await this._userService.getUserList(sort, search, limit, skip);
      const [{ totalRecords, data }] = result;
      return new ApiResponse({
        ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
      });
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  // Student logic section
  async addStudent(studentDto: AddStudentDto, i18n: I18nContext) {
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

  async getAllStudent(getAllStudentDto: GetAllStudentDto, i18n: I18nContext) {
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

  async getStudentDetail(id: string, i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
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

  async deleteStudent(id: string, i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
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

  async updateStudent(id: string, studentDto: Partial<AddStudentDto>, i18n: I18nContext) {
    try {
      const { parentId, classId, name, age, gender } = studentDto;
      await validateFields({ id }, `common.required_field`, i18n);

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

  // Parent logic section
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

  async getAllParent(getAllParentDto: GetAllParentDto, i18n: I18nContext) {
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

  async getParentDetail(id: string, i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const parent = await this._parentService.getParentDetail(id);

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

  async updateParent(id: string, parentDto: AddParentDto, i18n: I18nContext) {
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

  async deleteParent(id: string, i18n: I18nContext) {
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

  // Teacher logic section

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

  async getAllTeacher(getAllTeacherDto: GetAllTeacherDto, i18n: I18nContext) {
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

  async getTeacherDetail(id: string, i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const teacher = await this._teacherService.getTeacherDetail(id);
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

  async updateTeacher(id: string, teacherDto: Partial<AddTeacherDto>, i18n: I18nContext) {
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

  async deleteTeacher(id: string, i18n: I18nContext) {
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

  // Class logic section
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

  async getAllClass(getAllClassDto: GetAllClassDto, i18n: I18nContext) {
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

  async getClassDetail(id: string, i18n: I18nContext) {
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

  async updateClass(id: string, classDto: Partial<AddClassDto>, i18n: I18nContext) {
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

  async deleteClass(id: string, i18n: I18nContext) {
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

  // Subject logic section
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

  async getAllSubject(getAllSubjectDto: GetAllSubjectDto, i18n: I18nContext) {
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

  async getSubjectDetail(id: string, i18n: I18nContext) {
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

  async updateSubject(id: string, subjectDto: Partial<AddSubjectDto>, i18n: I18nContext) {
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

  async deleteSubject(id: string, i18n: I18nContext) {
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

  // Teacher assignment logic section

  async addTeacherAssignment(teacherAssignmentDto: AddTeacherAssignmentDto, i18n: I18nContext) {
    try {
      const { teacherId, classId, subjectId } = teacherAssignmentDto;
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
      };

      const result = await this._teacherAssignmentService.create(teacherAssignmentInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async getAllTeacherAssignment(getAllTeacherAssignmentDto: GetAllTeacherAssignmentDto, i18n: I18nContext) {
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

  async getTeacherAssignmentDetail(id: string, i18n: I18nContext) {
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

  async updateTeacherAssignment(id: string, teacherAssignmentDto: Partial<AddTeacherAssignmentDto>, i18n: I18nContext) {
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

  async deleteTeacherAssignment(id: string, i18n: I18nContext) {
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
