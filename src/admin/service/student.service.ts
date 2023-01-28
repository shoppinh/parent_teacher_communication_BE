import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Student, StudentDocument } from '../../parent/schema/student.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StudentService extends BaseService<Student> {
  constructor(@InjectModel(Student.name) readonly _studentDocumentModel: Model<StudentDocument>) {
    super();
    this.model = _studentDocumentModel;
  }
}
