import { randomBytes } from 'crypto';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { catchError, lastValueFrom, map, of } from 'rxjs';

import { User } from '@/users/user.entity';

import { GeoIPResponse } from './interfaces/geo-ip-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  public generateAccessToken(user: User) {
    return this.jwtService.sign({ subject: user.id });
  }

  public getEmailVerificationCode() {
    return nanoid(6);
  }

  public randomBytes(size: number) {
    return randomBytes(size).toString('hex');
  }

  public getGeoLocationByIp(ip: string): Promise<any> {
    return lastValueFrom(
      this.http
        .get<GeoIPResponse>(this.config.get('geo.apiUrl')!, {
          params: {
            apiKey: this.config.get('geo.apiKey'),
            ip,
          },
        })
        .pipe(
          map((response) => response.data ?? response),
          catchError((_) => {
            return of({
              district: 'local',
              state_prov: 'local',
              country_name: 'Vietnam',
            } as GeoIPResponse);
          }),
        ),
    );
  }
}
