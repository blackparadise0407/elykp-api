import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  usernameOrEmail: string;

  @IsNotEmpty()
  password: string;
}
