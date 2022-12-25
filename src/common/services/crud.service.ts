import { InternalServerErrorException, Logger } from '@nestjs/common';
import {
  BaseEntity,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectID,
  Repository,
} from 'typeorm';

export abstract class CRUDService<
  E extends BaseEntity & { id?: any },
  R extends Repository<E>,
> {
  private logger: Logger;
  private repo: R;
  constructor(ctx: string, repo: R) {
    this.repo = repo;
    this.logger = new Logger(ctx);
  }

  public get repository(): R {
    return this.repo;
  }

  public save(entity: DeepPartial<E>) {
    try {
      return this.repo.save(entity);
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }

  public get(options: FindOneOptions<E>) {
    try {
      return this.repo.findOne(options);
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }

  public getBy(options: FindOptionsWhere<E> | FindOptionsWhere<E>[]) {
    try {
      return this.repo.findOneBy(options);
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }

  public getMany(options?: FindManyOptions<E>) {
    try {
      return this.repo.find(options);
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }

  public getById(id: any) {
    try {
      return this.repo.findOneBy({ id });
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }

  public async delete(
    crit:
      | string
      | number
      | FindOptionsWhere<E>
      | Date
      | ObjectID
      | string[]
      | number[]
      | Date[]
      | ObjectID[],
  ) {
    try {
      const { affected } = await this.repo.delete(crit);
      return affected && affected > 0;
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException();
    }
  }
}
