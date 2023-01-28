import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiResponse } from 'src/shared/response/api-response';
import { ApiException } from 'src/shared/type/api-exception.model';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { UsernameLoginDto } from './dto/username-login.dto';
import { JwtPayloadInterface } from './model/jwt.interface';

@ApiTags('Auth')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('login')
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ApiException })
  async login(@Body() loginDto: UsernameLoginDto, @I18n() i18n: I18nContext): Promise<LoginResponseDto | any> {
    return new ApiResponse(await this.authService.login(loginDto, i18n));
  }

  @Post('generate-token')
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ type: ApiException })
  async generateToken(@Body() payload: JwtPayloadInterface, @I18n() i18n: I18nContext): Promise<LoginResponseDto | any> {
    return new ApiResponse(
      this.authService.jwtEncrypt(payload, {
        expiredIn: process.env.EXPIRED_TIME_REMEMBER_LOGGED_IN,
        secretKey: process.env.JWT_PRIVATE_KEY,
      }),
    );
  }
}
