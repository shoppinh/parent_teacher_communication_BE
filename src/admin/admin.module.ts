import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './service/admin.service';
import { ParentModule } from '../parent/parent.module';
import { ClassModule } from '../class/class.module';
import { StudentService } from '../student/student.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from '../student/schema/student.schema';
import { TeacherModule } from '../teacher/teacher.module';
import { SubjectService } from './service/subject.service';
import { Subject, SubjectSchema } from './schema/subject.schema';
import { TeacherAssignmentModule } from '../teacher-assignment/teacher-assignment.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    UserModule,
    StudentModule,
    ParentModule,
    ClassModule,
    TeacherModule,
    TeacherAssignmentModule,
    MongooseModule.forFeature([
      {
        name: Subject.name,
        schema: SubjectSchema,
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, SubjectService],
  exports: [AdminService, SubjectService],
})
export class AdminModule {}
