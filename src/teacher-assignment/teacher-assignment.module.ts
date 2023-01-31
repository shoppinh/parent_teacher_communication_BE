import { Module } from '@nestjs/common';
import { TeacherAssignmentController } from './teacher-assignment.controller';
import { TeacherAssignmentService } from './teacher-assignment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherAssignment, TeacherAssignmentSchema } from './schema/teacher-assignment.schema';

@Module({
  controllers: [TeacherAssignmentController],
  providers: [TeacherAssignmentService],
  imports: [
    MongooseModule.forFeature([
      {
        name: TeacherAssignment.name,
        schema: TeacherAssignmentSchema,
      },
    ]),
  ],
  exports: [TeacherAssignmentService],
})
export class TeacherAssignmentModule {}
