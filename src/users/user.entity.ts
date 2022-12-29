import * as bcryptjs from 'bcryptjs';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Token } from '@/auth/entities/token.entity';
import { Role } from '@/roles/role.entity';

@Entity({ name: 'user_entity' })
export class User extends BaseEntity {
  public static NAME_MAX_LENGTH = 255;
  public static EMAIL_MAX_LENGTH = 255;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, length: User.NAME_MAX_LENGTH })
  username: string;

  @Index()
  @Column({ unique: true, length: User.EMAIL_MAX_LENGTH })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    default: false,
    name: 'email_verified',
  })
  emailVerified: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  }

  compareHashPassword(raw: string) {
    return bcryptjs.compare(raw, this.password);
  }
}
