import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailsModule } from 'src/mails/mails.module';
import { UserModule } from 'src/user/user.module';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from './schema/event.schema';

@Module({
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]), MailsModule, forwardRef(() => UserModule)],
})
export class EventModule {}
