import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { Role } from '../role.entity';

type ICreateRoleDto = Pick<Role, 'name' | 'description'>;

export class CreateRoleDto implements ICreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Role.NAME_MAX_LENGTH)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(Role.DESC_MAX_LENGTH)
  description: string;
}
