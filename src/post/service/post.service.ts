import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Post, PostDocument } from '../schema/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { GetAllPostDto, PostSortOrder } from '../dto/get-all-post.dto';
import { isEmptyObject, validateFields } from '../../shared/utils';
import { User } from '../../user/schema/user.schema';
import { ParentService } from '../../parent/parent.service';
import { TeacherAssignmentService } from '../../teacher-assignment/teacher-assignment.service';
import { I18nContext } from 'nestjs-i18n';
import { ClassService } from '../../class/class.service';

@Injectable()
export class PostService extends BaseService<Post> {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @Inject(forwardRef(() => ParentService)) private readonly _parentService: ParentService,
    @Inject(forwardRef(() => ClassService)) private readonly _classService: ClassService,
    @Inject(forwardRef(() => TeacherAssignmentService)) private readonly _teacherAssignmentService: TeacherAssignmentService,
  ) {
    super();
    this.model = postModel;
  }

  async getAllPost(sort: Partial<PostSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model.aggregate().lookup({
      from: 'comments',
      localField: '_id',
      foreignField: 'postId',
      as: 'comments',
    });
    const paginationStage: PipelineStage.FacetPipelineStage[] = [];
    if (search) {
      aggregation.match({
        $or: [
          {
            title: { $eq: search },
          },
        ],
      });
    }
    if (skip) {
      paginationStage.push({
        $skip: skip,
      });
    }
    if (limit) {
      paginationStage.push({
        $limit: limit,
      });
    }
    if (sort && !isEmptyObject(sort)) {
      aggregation.sort(sort).collation({ locale: 'en' });
    }
    return aggregation
      .facet({
        totalRecords: [
          {
            $count: 'total',
          },
        ],
        data: paginationStage,
      })
      .exec();
  }

  // Only for the parent
  async getAllPostByClass(user: User, getAllPostDto: GetAllPostDto, id: string, i18n: I18nContext) {
    const { sort, search, limit, skip } = getAllPostDto;
    await validateFields({ id }, `common.required_field`, i18n);
    // Check if class existed
    const classExisted = await this._classService.findById(id);
    if (!classExisted) {
      throw new HttpException(i18n.translate('message.nonexistent_class'), HttpStatus.NOT_FOUND);
    }

    // Find if user(parent) has right to access the class
    const childrenList = await this._parentService
      .createParentUserRelationAggregation()
      .lookup({
        from: 'students',
        localField: 'childrenId',
        foreignField: '_id',
        as: 'children',
      })
      .unwind('children')
      .match({
        'children.classId': id,
      })
      .exec();
    if (!childrenList.length) {
      throw new HttpException(i18n.translate('message.parent_has_no_right_to_access_class'), HttpStatus.FORBIDDEN);
    }

    const paginationStage: PipelineStage.FacetPipelineStage[] = [];
    const aggregation = this.model.aggregate().match({
      classId: id,
    });
    if (search) {
      aggregation.match({
        $or: [
          {
            title: { $eq: search },
          },
        ],
      });
    }
    if (skip) {
      paginationStage.push({
        $skip: skip,
      });
    }
    if (limit) {
      paginationStage.push({
        $limit: limit,
      });
    }
    if (sort && !isEmptyObject(sort)) {
      aggregation.sort(sort).collation({ locale: 'en' });
    }
    return aggregation
      .facet({
        totalRecords: [
          {
            $count: 'total',
          },
        ],
        data: paginationStage,
      })
      .exec();
  }
}
