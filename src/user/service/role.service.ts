import { Role, RoleDocument } from '../schema/role.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/shared/service/base.service';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectModel(Role.name)
    readonly _roleDocumentModel: Model<RoleDocument>,
  ) {
    super();
    this.model = _roleDocumentModel;
  }

  async getAllRole() {
    try {
      const result = await this.findAll({});
      return result;
    } catch (error) {
      console.log('🚀 ~ file: role.service.ts:22 ~ RoleService ~ getAllRole ~ error', error);
    }
  }
}
