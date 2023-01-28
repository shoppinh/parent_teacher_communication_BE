import { CanActivate, ExecutionContext, forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { isEmptyArray } from 'src/shared/utils';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector, private readonly i18n: I18nService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this._reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const user = context.switchToHttp()?.getRequest()?.user ?? null;

    if (user && !isEmptyArray(user?.role)) {
      const isCheckRole = roles.includes(user?.role);
      if (!isCheckRole) {
        throw new HttpException(await this.i18n.t('user.permission_denied'), HttpStatus.NON_AUTHORITATIVE_INFORMATION);
      }
      return isCheckRole;
    } else {
      return false;
    }
  }
}
