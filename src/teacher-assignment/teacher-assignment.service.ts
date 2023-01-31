import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { TeacherAssignment, TeacherAssignmentDocument } from './schema/teacher-assignment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TeacherAssignmentService extends BaseService<TeacherAssignment> {
  constructor(@InjectModel(TeacherAssignment.name) private readonly teacherAssignmentModel: Model<TeacherAssignmentDocument>) {
    super();
    this.model = teacherAssignmentModel;
  }
}
