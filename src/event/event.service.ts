import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Event, EventDocument } from './schema/event.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { isEmptyObject } from '../shared/utils';
import { EventSortOrder } from './dto/get-all-event.dto';

@Injectable()
export class EventService extends BaseService<Event> {
  constructor(
    @InjectModel(Event.name)
    readonly _eventDocumentModel: Model<EventDocument>,
  ) {
    super();
    this.model = _eventDocumentModel;
  }

  createEventParticipantRelationAggregation() {
    return this.model.aggregate();
    // .lookup({
    //   from: 'users',
    //   localField: 'participants',
    //   foreignField: '_id',
    //   as: 'participants',
    // })
    // .project({
    //   'participants.password': 0,
    // });
  }

  async getEventList(sort: Partial<EventSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.createEventParticipantRelationAggregation();
    const paginationStage = [];
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

  async getDetails(id: string) {
    const aggregation = this.model
      .aggregate()
      .match({ _id: new Types.ObjectId(id) })
      .lookup({
        from: 'users',
        localField: 'participants',
        foreignField: '_id',
        as: 'participants',
      })
      .project({
        'participants.password': 0,
      });
    return aggregation.exec();
  }

  async getEventListByParent(sort: Partial<EventSortOrder>, search: string, limit: number, skip: number, parentId: string) {
    const aggregation = this.createEventParticipantRelationAggregation();
    const paginationStage = [];
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
    aggregation.match({
      participants: new Types.ObjectId(parentId),
    });
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
