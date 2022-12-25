import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CRUDService } from '@/common/services/crud.service';

import { Role } from './entities/role.entity';

@Injectable()
export class RolesService extends CRUDService<Role, Repository<Role>> {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {
    super('Role', roleRepository);
  }
}
