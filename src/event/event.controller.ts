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
import { toListResponse, validateFields } from '../shared/utils';
import { EventService } from './event.service';
import { ApiResponse } from '../shared/response/api-response';
import { Types } from 'mongoose';
import { GetUser } from 'src/shared/decorator/current-user.decorator';
import { User } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/service/user.service';
import { MailsService } from 'src/mails/mails.service';

@ApiTags('Event')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/event')
@UseGuards(JwtGuard, RolesGuard)
export class EventController {
  constructor(private readonly _eventService: EventService, private readonly _userService: UserService, private readonly _mailService: MailsService) {}

  @Post('list')
  @ApiBearerAuth()
  @Roles(ConstantRoles.PARENT, ConstantRoles.TEACHER, ConstantRoles.SUPER_USER)
  @ApiBadRequestResponse({ type: ApiException })
  @HttpCode(HttpStatus.OK)
  async getEventList(@Body() getAllEventDto: GetAllEventDto, @I18n() i18n: I18nContext, @GetUser() user: User) {
    try {
      const { skip, sort, limit, search } = getAllEventDto;
      if (user.role === ConstantRoles.PARENT) {
        const [{ totalRecords, data }] = await this._eventService.getEventListByParent(sort, search, limit, skip, user._id);
        return new ApiResponse({
          ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
        });
      } else {
        const [{ totalRecords, data }] = await this._eventService.getEventList(sort, search, limit, skip);
        return new ApiResponse({
          ...toListResponse([data, totalRecords?.[0]?.total ?? 0]),
        });
      }
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
      const { title, content, start, end, participants, allDay } = addEventDto;
      await validateFields({ title, start, end, participants }, `common.required_field`, i18n);
      const mappedParticipants = participants.map((item) => {
        return new Types.ObjectId(item);
      });
      const eventInstance = {
        title,
        content,
        start,
        end,
        participants: mappedParticipants,
        allDay,
      };

      const result = await this._eventService.create(eventInstance);
      const participantDetails = await this._userService.getUserListFromParticipants(participants);
      const mappedParticipantDetails = participantDetails.map((item) => {
        return item.email;
      });
      await this._mailService.sendUserEventNotification(mappedParticipantDetails, result);
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
      const { title, content, start, end, participants, allDay } = addEventDto;
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
        start,
        end,
        participants: mappedParticipants,
        allDay,
      };

      const result = await this._eventService.update(id, eventInstance);
      const participantDetails = await this._userService.getUserListFromParticipants(participants);
      const mappedParticipantDetails = participantDetails.map((item) => {
        return item.email;
      });
      await this._mailService.sendUserEventNotification(mappedParticipantDetails, result);
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
