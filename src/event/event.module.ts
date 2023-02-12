import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schema/event.schema';

@Module({
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])],
})
export class EventModule {}
