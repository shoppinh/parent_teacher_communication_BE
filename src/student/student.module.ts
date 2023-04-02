import { forwardRef, Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './schema/student.schema';
import { ClassModule } from '../class/class.module';
import { ParentModule } from '../parent/parent.module';
import { TeacherModule } from '../teacher/teacher.module';
import { TeacherAssignmentModule } from '../teacher-assignment/teacher-assignment.module';
import { ProgressTrackingModule } from '../progress-tracking/progress-tracking.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Student.name,
        schema: StudentSchema,
      },
    ]),
    forwardRef(() => ClassModule),
    forwardRef(() => ParentModule),
    forwardRef(() => TeacherModule),
    TeacherAssignmentModule,
    ProgressTrackingModule,
  ],
})
export class StudentModule {}
