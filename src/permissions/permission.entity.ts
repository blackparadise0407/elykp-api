import { BaseEntity, Entity } from 'typeorm';

@Entity({ name: 'permission_entity' })
export class Permission extends BaseEntity {}
