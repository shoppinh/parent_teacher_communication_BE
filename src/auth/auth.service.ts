import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { IHelperJwtOptions } from 'src/shared/utils/interface';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { JwtPayloadInterface } from './model/jwt.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(@Inject(forwardRef(() => UserService)) readonly _userService: UserService, private readonly jwtService: JwtService) {}

  async validateUser(validatePayload: JwtPayloadInterface): Promise<User> {
    const { mobilePhone } = validatePayload;
    return await this._userService.findOne({ mobilePhone });
  }
  jwtEncrypt(payload: Record<string, any>, options: IHelperJwtOptions): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_PRIVATE_KEY,
      expiresIn: options.expiredIn || process.env.JWT_EXPIRED_TIME,
      notBefore: options.notBefore || 0,
    });
  }

  jwtDecrypt(token: string): Record<string, any> {
    return this.jwtService.decode(token) as Record<string, any>;
  }

  jwtVerify(token: string, options?: IHelperJwtOptions): boolean {
    try {
      this.jwtService.verify(token, {
        secret: process.env.JWT_PRIVATE_KEY,
      });
      return true;
    } catch (e) {
      console.log('🚀 ~ file: auth.service.ts:36 ~ AuthService ~ jwtVerify ~ e', e);
      return false;
    }
  }
}
