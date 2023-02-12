import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './schema/student.schema';
import { ClassModule } from '../class/class.module';
import { ParentModule } from '../parent/parent.module';

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
    ClassModule,
    ParentModule,
  ],
})
export class StudentModule {}
