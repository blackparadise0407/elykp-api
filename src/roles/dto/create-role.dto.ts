import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { Role } from '../role.entity';

type ICreateRoleDto = Pick<Role, 'name' | 'description'>;

export class CreateRoleDto implements ICreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(512)
  description: string;
}
