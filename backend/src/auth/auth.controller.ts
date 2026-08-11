import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LdapAuthGuard } from './ldap/ldap-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LdapAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }
}
