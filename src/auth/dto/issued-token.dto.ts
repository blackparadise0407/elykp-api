import { User } from '@/users/user.entity';

export class IssuedTokensDto {
  accessToken: string;
  refreshToken: string;
  user: User;
}
