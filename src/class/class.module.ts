import { forwardRef, Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Class, ClassSchema } from './schema/class.schema';
import { TeacherAssignmentModule } from '../teacher-assignment/teacher-assignment.module';
import { TeacherModule } from '../teacher/teacher.module';
import { ParentModule } from '../parent/parent.module';

@Module({
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Class.name,
        schema: ClassSchema,
      },
    ]),
    TeacherAssignmentModule,
    TeacherModule,
    forwardRef(() => ParentModule),
  ],
})
export class ClassModule {}
