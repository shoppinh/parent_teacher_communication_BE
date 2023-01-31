import { HttpException, HttpStatus } from '@nestjs/common';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import { I18nContext } from 'nestjs-i18n';
import * as _ from 'lodash';
import { genSalt, hash } from 'bcryptjs';
export function isEmptyArray(objects: any) {
  if (!objects) {
    return true;
  }
  return !objects.length;
}
export function isEmptyObject(objects: any) {
  if (!objects) {
    return true;
  }
  return !Object.keys(objects).length;
}
export function isEmptyObjectOrArray(objects: any) {
  if (!objects) {
    return true;
  }
  if (Array.isArray(objects)) {
    return isEmptyArray(objects);
  }
  return isEmptyObject(objects);
}
export const isValidEmail = (email: string) => {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
};
export const isPhoneNumberValidation = (number: string) => {
  try {
    if (number[0] === '0') {
      number = number.replace('0', process.env.PHONE_COUNTRY_CODE_DEFAULT);
    }

    if (number[0] !== '+') {
      number = `+${number}`;
    }

    const codes = process.env.PHONE_COUNTRY_CODES?.split(',');
    let valid = false;
    for (const code of codes) {
      const _code = code.split('|')[0]?.toUpperCase();
      const numberParse = parsePhoneNumber(number);
      valid = numberParse.country === _code && isValidPhoneNumber(number);
      if (valid) break;
    }
    return valid;
  } catch (e) {
    return false;
  }
};
export const standardPhoneNumber = (number: string) => {
  number = number.trim();
  if (!number) {
    return number;
  }

  if (number[0] === '0') {
    number = number.replace('0', process.env.PHONE_COUNTRY_CODE_DEFAULT);
  }

  if (number[0] !== '+') {
    number = `+${number}`;
  }
  return number;
};
export const validateFields = async (fields: any, message: string, i18n: I18nContext) => {
  for (const field in fields) {
    if (!fields[field] || ((_.isArray(fields[field]) || _.isObject(fields[field])) && isEmptyObjectOrArray(fields[field]))) {
      throw new HttpException(
        await i18n.translate(message, {
          args: { fieldName: field },
        }),
        HttpStatus.BAD_REQUEST,
      );
    }
  }
};
export const convertKeyRoles = (key: string) => {
  return key?.toString()?.trim()?.split(' ')?.join('_')?.toLocaleUpperCase();
};
export const passwordGenerate = async (password: string) => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};
export function toListResponse(objects: any) {
  let results = {
    totalItem: 0,
    data: [],
  };
  if (!isEmptyObjectOrArray(objects[0])) {
    results = {
      totalItem: objects[1],
      data: objects[0],
    };
  }
  return results;
}
