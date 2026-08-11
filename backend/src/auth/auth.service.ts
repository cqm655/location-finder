import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = {
      sub: user.username,
      username: user.username,
      upn: user.upn,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
