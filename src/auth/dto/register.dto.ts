import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { User } from '@/users/user.entity';

type IRegisterDto = Pick<User, 'email' | 'username' | 'password'>;

export class RegisterDto implements IRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
