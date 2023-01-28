import { Module } from '@nestjs/common';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Parent, ParentSchema } from './schema/parent.schema';

@Module({
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Parent.name,
        schema: ParentSchema,
      },
    ]),
  ],
})
export class ParentModule {}
