import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Post, PostDocument } from '../schema/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { GetAllPostDto, PostSortOrder } from '../dto/get-all-post.dto';
import { isEmptyObject } from '../../shared/utils';
import { User } from '../../user/schema/user.schema';
import { I18nContext } from 'nestjs-i18n';
import { ConstantPostType } from '../../shared/utils/constant/post';

@Injectable()
export class PostService extends BaseService<Post> {
  constructor(@InjectModel(Post.name) private readonly postModel: Model<PostDocument>) {
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

  // Only for the parent and teacher
  async getAllPostByClass(user: User, getAllPostDto: GetAllPostDto, id: string) {
    const { sort, search, limit, skip } = getAllPostDto;

    const paginationStage: PipelineStage.FacetPipelineStage[] = [];
    const aggregation = this.model
      .aggregate()
      .match({
        classId: new Types.ObjectId(id),
      })
      .lookup({
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author',
      })
      .unwind('author')
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
        authorId: 0,
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
}
