import * as bcryptjs from 'bcryptjs';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Token } from '@/auth/entities/token.entity';

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

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  }
}
