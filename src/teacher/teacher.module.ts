import { forwardRef, Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { Teacher, TeacherSchema } from './schema/teacher.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { ClassModule } from '../class/class.module';
import { ProgressTrackingModule } from '../progress-tracking/progress-tracking.module';
import { StudentModule } from '../student/student.module';
import { TeacherAssignmentModule } from '../teacher-assignment/teacher-assignment.module';

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
    forwardRef(() => StudentModule),
    ClassModule,
    ProgressTrackingModule,
    TeacherAssignmentModule,
  ],
})
export class TeacherModule {}
