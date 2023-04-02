import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { UserToken, UserTokenSchema } from './schema/user-token.schema';
import { UserService } from './service/user.service';
import { UserController } from './user.controller';
import { UserTokenService } from './service/user-token.service';
import { UserDeviceService } from './service/user-device.service';
import { UserDevice, UserDeviceSchema } from './schema/user-device.schema';
import { RoleService } from './service/role.service';
import { Role, RoleSchema } from './schema/role.schema';
import { MailsModule } from 'src/mails/mails.module';
import { TeacherModule } from '../teacher/teacher.module';
import { ParentModule } from '../parent/parent.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserToken.name,
        schema: UserTokenSchema,
      },
      {
        name: UserDevice.name,
        schema: UserDeviceSchema,
      },
      {
        name: Role.name,
        schema: RoleSchema,
      },
    ]),
    MailsModule,
    forwardRef(() => TeacherModule),
    forwardRef(() => ParentModule),
  ],
  controllers: [UserController],
  exports: [UserService, UserTokenService, UserDeviceService, RoleService],
  providers: [UserService, UserTokenService, UserDeviceService, RoleService],
})
export class UserModule {}
