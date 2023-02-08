import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Post, PostDocument } from '../schema/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { GetAllPostDto, PostSortOrder } from '../dto/get-all-post.dto';
import { isEmptyObject, validateFields } from '../../shared/utils';
import { User } from '../../user/schema/user.schema';
import { ParentService } from '../../parent/parent.service';
import { TeacherAssignmentService } from '../../teacher-assignment/teacher-assignment.service';
import { I18nContext } from 'nestjs-i18n';
import { ClassService } from '../../class/class.service';
import { ConstantPostType } from '../../shared/utils/constant/post';
import { AddPostDto } from '../dto/add-post.dto';
import { ApiResponse } from '../../shared/response/api-response';
import { CommentService } from '../../comment/service/comment.service';
import { PostReactionService } from './post-reaction.service';

@Injectable()
export class PostService extends BaseService<Post> {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly _parentService: ParentService,
    private readonly _classService: ClassService,
    private readonly _teacherAssignmentService: TeacherAssignmentService,
    private readonly _commentService: CommentService,
    private readonly _postReactionService: PostReactionService,
  ) {
    super();
    this.model = postModel;
  }

  async getAllPost(sort: Partial<PostSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model
      .aggregate()
      .lookup({
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments',
      })
      .lookup({
        from: 'postreactions',
        localField: '_id',
        foreignField: 'postId',
        as: 'reactions',
      })
      .project({
        __v: 0,
        comments: {
          _id: 0,
          __v: 0,
          postId: 0,
        },
        reactions: {
          _id: 0,
          __v: 0,
          postId: 0,
        },
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

  // Only for the teacher, superuser

  async getAllPrivatePost(sort: Partial<PostSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model
      .aggregate()
      .match({
        type: ConstantPostType.PRIVATE,
      })
      .lookup({
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments',
      })
      .lookup({
        from: 'postreactions',
        localField: '_id',
        foreignField: 'postId',
        as: 'postReactions',
      })
      .project({
        __v: 0,
        comments: {
          _id: 0,
          __v: 0,
          postId: 0,
        },
        reactions: {
          _id: 0,
          __v: 0,
          postId: 0,
        },
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
        localField: '_id',
        foreignField: 'parentId',
        as: 'children',
      })
      .unwind('children')
      .match({
        'children.classId': new Types.ObjectId(id),
      })
      .exec();
    if (!childrenList.length) {
      throw new HttpException(i18n.translate('message.parent_has_no_right_to_access_class'), HttpStatus.FORBIDDEN);
    }

    const paginationStage: PipelineStage.FacetPipelineStage[] = [];
    const aggregation = this.model
      .aggregate()
      .match({
        classId: new Types.ObjectId(id),
      })
      .lookup({
        from: 'comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comments',
      })
      .lookup({
        from: 'postreactions',
        localField: '_id',
        foreignField: 'postId',
        as: 'reactions',
      })
      .project({
        __v: 0,
        comments: {
          _id: 0,
          __v: 0,
          postId: 0,
        },
        reactions: {
          _id: 0,
          __v: 0,
          postId: 0,
        },
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

  async getPostDetail(id: string, user: User, i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedPost = await this.findById(id);
      if (!existedPost) throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.BAD_REQUEST);
      if (existedPost.authorId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);

      return this.model
        .aggregate()
        .match({ _id: new Types.ObjectId(id) })
        .lookup({
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments',
        })
        .lookup({
          from: 'postreactions',
          localField: '_id',
          foreignField: 'postId',
          as: 'reactions',
        })
        .project({
          __v: 0,
          comments: {
            _id: 0,
            __v: 0,
            postId: 0,
          },
          reactions: {
            _id: 0,
            __v: 0,
            postId: 0,
          },
        })
        .exec();
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async addPost(addPostDto: AddPostDto, user: User, i18n: I18nContext) {
    try {
      const { classId, title, description, type, content, coverImg } = addPostDto;
      await validateFields({ classId, title }, `common.required_field`, i18n);
      const classExisted = await this._classService.findById(classId);
      if (!classExisted) throw new HttpException(await i18n.translate(`message.nonexistent_class`), HttpStatus.BAD_REQUEST);
      const postInstance: any = {
        title,
        description,
        type,
        content,
        coverImg,
        authorId: user._id,
        classId: new Types.ObjectId(classId),
      };
      const result = await this.create(postInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async updatePost(updatePostDto: Partial<AddPostDto>, id: string, user: User, i18n: I18nContext) {
    try {
      const { classId, title, type, description, content, coverImg } = updatePostDto;
      await validateFields({ id }, `common.required_field`, i18n);
      const existedPost = await this.findById(id);
      if (!existedPost) throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.BAD_REQUEST);
      if (existedPost.authorId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);

      if (classId) {
        const classExisted = await this._classService.findById(classId);
        if (!classExisted) throw new HttpException(await i18n.translate(`message.nonexistent_class`), HttpStatus.BAD_REQUEST);
      }

      const updatePostInstance: any = {
        title,
        type,
        description,
        content,
        coverImg,
        authorId: user._id,
        classId: new Types.ObjectId(classId),
      };
      const result = await this.update(id, updatePostInstance);
      return new ApiResponse(result);
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }

  async deletePost(id: string, user: User, i18n: I18nContext) {
    try {
      await validateFields({ id }, `common.required_field`, i18n);
      const existedPost = await this.findById(id);
      if (!existedPost) throw new HttpException(await i18n.translate(`message.nonexistent_post`), HttpStatus.BAD_REQUEST);
      if (existedPost.authorId.toString() !== user._id.toString()) throw new HttpException(await i18n.translate(`message.not_author`), HttpStatus.BAD_REQUEST);

      await this.delete(id);
      await this._commentService.deleteByCondition({ postId: id });
      await this._postReactionService.deleteByCondition({ postId: id });
      return new ApiResponse({
        status: true,
      });
    } catch (error) {
      throw new HttpException(error?.response ?? (await i18n.translate(`message.internal_server_error`)), error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR, {
        cause: error,
      });
    }
  }
}
