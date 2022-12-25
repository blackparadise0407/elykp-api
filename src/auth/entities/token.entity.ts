import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@/users/user.entity';

import { TokenType } from '../enums/token.enum';

@Entity({ name: 'token_entity' })
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type: TokenType;

  @Index()
  @Column()
  value: string;

  @Column({ name: 'expires_in_ms' })
  expiresInMs: number;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
