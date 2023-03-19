import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { ClassModule } from '../class/class.module';
import { UserModule } from '../user/user.module';

@Module({
  providers: [SettingsService],
  controllers: [SettingsController],
  imports: [ClassModule, UserModule],
})
export class SettingsModule {}
