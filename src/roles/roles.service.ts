import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CRUDService } from '@/common/services/crud.service';

import { Role } from './role.entity';

@Injectable()
export class RolesService extends CRUDService<Role, Repository<Role>> {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {
    super('Role', roleRepository);
  }

  public getDetail(roleId: number) {
    return this.repository
      .createQueryBuilder('role')
      .where('role.id = :roleId', { roleId })
      .leftJoinAndSelect('role.permissions', 'permissions')
      .getOne();
  }
}
