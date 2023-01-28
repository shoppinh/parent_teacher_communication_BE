import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { Teacher, TeacherSchema } from './schema/teacher.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
  imports: [MongooseModule.forFeature([{ name: Teacher.name, schema: TeacherSchema }])],
})
export class TeacherModule {}
