import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { Teacher, TeacherSchema } from './schema/teacher.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { ClassModule } from '../class/class.module';
import { ProgressTrackingModule } from '../progress-tracking/progress-tracking.module';
import { StudentModule } from '../student/student.module';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Teacher.name,
        schema: TeacherSchema,
      },
    ]),
    UserModule,
    StudentModule,
    ClassModule,
    ProgressTrackingModule,
  ],
})
export class TeacherModule {}
