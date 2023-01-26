import { InternalServerErrorException } from '@nestjs/common';
import { FilterQuery, Model, Document } from 'mongoose';
import { BaseSchema } from '../schema/base.schema';
import { BaseDto } from '../dto/base.dto';

/**
 * Abstract base service that other services can extend to provide base CRUD
 * functionality such as to create, find, update and delete data.
 */
export abstract class BaseService<T extends BaseSchema> {
  protected model: Model<T & Document>;

  /**
   * Find one entry and return the result.
   *
   * @throws InternalServerErrorException
   */
  async findOne(conditions: Partial<Record<keyof T, unknown>>, projection: string | Record<string, unknown> = {}, options: Record<string, unknown> = {}): Promise<T> {
    try {
      return await this.model.findOne(conditions as FilterQuery<T>, projection, options);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async findAll(conditions: Partial<Record<keyof T, unknown>>, projection: string | Record<string, unknown> = {}, options: Record<string, unknown> = {}): Promise<T[]> {
    return await this.model.find(conditions as FilterQuery<T>, projection, options).exec();
  }

  async findById(id: string): Promise<T> {
    return await this.model.findById(id).exec();
  }

  async create(createDto: T | BaseDto): Promise<T> {
    return await new this.model({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).save();
  }

  async update(id: string, updateDto: T | BaseDto, populate = ''): Promise<T> {
    const updated = this.model.findByIdAndUpdate(id, { ...updateDto, updatedAt: new Date() }, { new: true });
    if (populate?.trim()) {
      updated.populate(populate.trim());
    }
    return updated;
  }

  async delete(id: string): Promise<T> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async deleteByCondition(filter: Record<string, any>) {
    return this.model.deleteMany(filter).exec();
  }
}
