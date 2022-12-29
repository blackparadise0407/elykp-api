import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Permission } from '@/permissions/permission.entity';

@Entity({ name: 'role_entity' })
export class Role extends BaseEntity {
  public static DESC_MAX_LENGTH = 255;
  public static NAME_MAX_LENGTH = 100;

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index({ unique: true })
  @Column({ length: Role.NAME_MAX_LENGTH })
  name: string;

  @Column({ length: Role.DESC_MAX_LENGTH, default: '' })
  description: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'roles_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}
