import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'permission_entity' })
export class Permission extends BaseEntity {
  public static DESC_MAX_LENGTH = 512;
  public static NAME_MAX_LENGTH = 100;

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ length: Permission.NAME_MAX_LENGTH })
  name: string;

  @Column({
    length: Permission.DESC_MAX_LENGTH,
    default: '',
  })
  description: string;
}
