import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CRUDService } from '@/common/services/crud.service';

import { User } from './user.entity';

@Injectable()
export class UsersService extends CRUDService<User, Repository<User>> {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {
    super('User', usersRepository);
  }

  existByEmailOrUsername(usernameOrEmail: string) {
    return this.usersRepository.findOne({
      where: [
        {
          username: usernameOrEmail,
        },
        {
          email: usernameOrEmail,
        },
      ],
      relations: {
        roles: {
          permissions: true,
        },
      },
    });
  }
}
