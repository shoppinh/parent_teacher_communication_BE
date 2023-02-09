import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isPhoneNumberValidation, isValidEmail, passwordGenerate, validateFields } from '../../shared/utils';
import { I18nContext } from 'nestjs-i18n';
import { RoleService } from '../../user/service/role.service';
import { UserService } from '../../user/service/user.service';
import { AddUserDto } from '../../auth/dto/add-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly _roleService: RoleService, private readonly _userService: UserService) {}

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
}
