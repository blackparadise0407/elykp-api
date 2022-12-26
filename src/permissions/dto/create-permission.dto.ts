import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { Permission } from '../permission.entity';

type ICreatePermissionDto = Pick<Permission, 'name' | 'description'>;

export class CreatePermissionDto implements ICreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(Permission.NAME_MAX_LENGTH)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(Permission.DESC_MAX_LENGTH)
  description: string;
}
