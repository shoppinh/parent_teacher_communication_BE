import { Controller } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { User } from './schema/user.schema';
import { UserService } from './service/user.service';

@ApiTags('User')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/user')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  //TODO: Invite student, parent, teacher
}
