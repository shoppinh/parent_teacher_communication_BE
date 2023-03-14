import { Controller, Get, HttpCode, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { ApiException } from '../shared/type/api-exception.model';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ClassService } from '../class/class.service';
import { ApiResponse } from '../shared/response/api-response';

@ApiTags('Settings')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly _classService: ClassService) {}
  @Get('get-settings')
  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getSettings(@I18n() i18n: I18nContext) {
    try {
      const schoolInfo = await this._classService.findOne({ isSchoolClass: true });
      return new ApiResponse({
        schoolInfo,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
