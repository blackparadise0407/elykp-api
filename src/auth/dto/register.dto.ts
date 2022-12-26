import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { User } from '@/users/user.entity';

type IRegisterDto = Pick<User, 'email' | 'username' | 'password'>;

export class RegisterDto implements IRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(User.EMAIL_MAX_LENGTH)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(User.NAME_MAX_LENGTH)
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
