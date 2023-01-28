import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Teacher, TeacherDocument } from './schema/teacher.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TeacherService extends BaseService<Teacher> {
  constructor(@InjectModel(Teacher.name) private readonly _teacherModelDocument: Model<TeacherDocument>) {
    super();
    this.model = _teacherModelDocument;
  }
}
