import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { Roles } from '../shared/decorator/roles.decorator';
import { ConstantRoles } from '../shared/utils/constant/role';
import { ApiException } from '../shared/type/api-exception.model';
import { GetAllEventDto } from './dto/get-all-event.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AddEventDto } from './dto/add-event.dto';
import { validateFields } from '../shared/utils';
import { EventService } from './event.service';
import { ApiResponse } from '../shared/response/api-response';
import { Types } from 'mongoose';

@ApiTags('Event')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/event')
@UseGuards(JwtGuard, RolesGuard)
export class EventController {
  constructor(private readonly _eventService: EventService) {}

  @Post('list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getEventList(@Body() getAllEventDto: GetAllEventDto, @I18n() i18n: I18nContext) {
    try {
      const { skip, sort, limit, search } = getAllEventDto;
      return this._eventService.getEventList(sort, search, skip, limit);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getEventDetail(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const eventExisted = await this._eventService.findById(id);
      if (!eventExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_event`), HttpStatus.NOT_FOUND);
      }
      const result = await this._eventService.getDetails(id);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Post('')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async addEvent(@Body() addEventDto: AddEventDto, @I18n() i18n: I18nContext) {
    try {
      const { title, content, date, startTime, endTime, participants } = addEventDto;
      await validateFields({ title, date, startTime, endTime, participants }, `common.required_field`, i18n);
      const mappedParticipants = participants.map((item) => {
        return new Types.ObjectId(item);
      });
      const eventInstance = {
        title,
        content,
        date,
        startTime,
        endTime,
        participants: mappedParticipants,
      };

      const result = await this._eventService.create(eventInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async editEvent(@Body() addEventDto: Partial<AddEventDto>, @I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      const { title, content, date, startTime, endTime, participants } = addEventDto;
      await validateFields({ id }, `common.required_field`, i18n);
      const existedEvent = await this._eventService.findById(id);
      if (!existedEvent) {
        throw new HttpException(await i18n.translate(`message.nonexistent_event`), HttpStatus.NOT_FOUND);
      }
      const mappedParticipants = participants.map((item) => {
        return new Types.ObjectId(item);
      });

      const eventInstance = {
        title,
        content,
        date,
        startTime,
        endTime,
        participants: mappedParticipants,
      };

      const result = await this._eventService.update(id, eventInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async removeEvent(@I18n() i18n: I18nContext, @Param('id') id: string) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const eventExisted = await this._eventService.findById(id);
      if (!eventExisted) {
        throw new HttpException(await i18n.translate(`message.nonexistent_event`), HttpStatus.NOT_FOUND);
      }
      await this._eventService.delete(id);
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
