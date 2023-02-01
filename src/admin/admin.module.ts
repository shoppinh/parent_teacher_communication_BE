import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './service/admin.service';
import { ParentModule } from '../parent/parent.module';
import { ClassModule } from '../class/class.module';
import { StudentService } from './service/student.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from '../parent/schema/student.schema';
import { TeacherModule } from '../teacher/teacher.module';
import { SubjectService } from './service/subject.service';
import { Subject, SubjectSchema } from './schema/subject.schema';
import { TeacherAssignmentModule } from '../teacher-assignment/teacher-assignment.module';

@Module({
  imports: [
    UserModule,
    ParentModule,
    ClassModule,
    TeacherModule,
    TeacherAssignmentModule,
    MongooseModule.forFeature([
      {
        name: Student.name,
        schema: StudentSchema,
      },
      {
        name: Subject.name,
        schema: SubjectSchema,
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, StudentService, SubjectService],
  exports: [AdminService, StudentService, SubjectService],
})
export class AdminModule {}
