export interface JwtPayload {
  subject?: string;
  permissions?: string[];
  iat: number;
  exp: number;
}
