import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Class, ClassSchema } from './schema/class.schema';

@Module({
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
  imports: [MongooseModule.forFeature([{ name: Class.name, schema: ClassSchema }])],
})
export class ClassModule {}
