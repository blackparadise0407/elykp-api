import * as bcryptjs from 'bcryptjs';
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, length: 255 })
  username: string;

  @Index()
  @Column({ unique: true, length: 255 })
  email: string;

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
  @JoinTable()
  roles: Role[];

  @BeforeInsert()
  async beforeInsert() {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  }

  compareHashPassword(raw: string) {
    return bcryptjs.compare(raw, this.password);
  }
}
