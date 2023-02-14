import { BadRequestException, Body, Controller, Delete, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiResponse } from 'src/shared/response/api-response';
import { ApiException } from 'src/shared/type/api-exception.model';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { UsernameLoginDto } from './dto/username-login.dto';
import { JwtPayloadInterface } from './model/jwt.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtGuard } from './guard/jwt-auth.guard';
import { CreateUserDeviceDto } from './dto/create-user-device.dto';
import { UserService } from '../user/service/user.service';
import { UserDeviceService } from '../user/service/user-device.service';
import { UserTokenService } from '../user/service/user-token.service';
import { GetUser } from '../shared/decorator/current-user.decorator';
import { User } from '../user/schema/user.schema';

@ApiTags('Auth')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/auth')
export class AuthController {
  constructor(private readonly _authService: AuthService, private readonly _userService: UserService, private readonly _userDeviceService: UserDeviceService) {}

  @Post('login')
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ApiException })
  async login(@Body() loginDto: UsernameLoginDto, @I18n() i18n: I18nContext): Promise<LoginResponseDto | any> {
    return new ApiResponse(await this._authService.login(loginDto, i18n));
  }

  @Post('generate-token')
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ApiException })
  async generateToken(@Body() payload: JwtPayloadInterface, @I18n() i18n: I18nContext): Promise<LoginResponseDto | any> {
    return new ApiResponse(
      this._authService.jwtEncrypt(payload, {
        expiredIn: process.env.EXPIRED_TIME_REMEMBER_LOGGED_IN,
        secretKey: process.env.JWT_PRIVATE_KEY,
      }),
    );
  }

  @Post('refresh-token')
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ApiException })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @I18n() i18n: I18nContext): Promise<LoginResponseDto | any> {
    return new ApiResponse(await this._authService.refreshToken(refreshTokenDto, i18n));
  }

  @Post('device-token')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiBadRequestResponse({ type: ApiException })
  async saveDeviceToken(@Body() createUserDevice: CreateUserDeviceDto) {
    const { userId, fcmToken } = createUserDevice;
    const existedUser = await this._userService.findById(userId);
    if (!existedUser) {
      throw new BadRequestException('USER_NOT_FOUND');
    }
    const existedDeviceToken = await this._userDeviceService.findOne({ fcmToken: fcmToken });
    let result;
    if (existedDeviceToken) {
      existedDeviceToken.user = existedUser;
      result = await this._userDeviceService.update(existedDeviceToken._id, { user: existedUser._id });
    } else {
      result = await this._userDeviceService.create({ fcmToken: fcmToken, user: existedUser });
    }
    return new ApiResponse(result);
  }

  @Delete('device-token/:fcmToken')
  @ApiBadRequestResponse({ type: ApiException })
  async deleteDeviceToken(@Param('fcmToken') fcmToken: string) {
    const existedDeviceToken = await this._userDeviceService.findOne({ fcmToken: fcmToken });
    if (existedDeviceToken) {
      await this._userDeviceService.delete(existedDeviceToken._id);
    }
    return new ApiResponse({
      deleted: true,
    });
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: ApiException })
  async logout(@GetUser() currentUser: User, @I18n() i18n: I18nContext, @Request() req) {
    try {
      const fcmToken = req.body?.fcmToken;
      if (currentUser && fcmToken) {
        try {
          const existedUserDevice = await this._userDeviceService.findOne({ fcmToken, _id: currentUser._id });
          if (existedUserDevice) {
            await this._userDeviceService.delete(existedUserDevice._id);
          }
        } catch (e) {
          console.log(e);
        }
      }
      const tokenAuthUser = req.headers.authorization?.split(' ')[1];
      await this._authService.logOut(tokenAuthUser);

      return new ApiResponse(await i18n.translate(`user.logout_success`));
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException(error);
    }
  }
}
