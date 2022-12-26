import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CRUDService } from '@/common/services/crud.service';

import { Permission } from './permission.entity';

@Injectable()
export class PermissionsService extends CRUDService<
  Permission,
  Repository<Permission>
> {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {
    super('Permission', permissionRepository);
  }
}
