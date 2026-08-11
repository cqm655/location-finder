import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as CustomStrategy } from 'passport-custom';
import * as ldap from 'ldapjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LdapStrategy extends PassportStrategy(CustomStrategy, 'ldap') {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(req: any): Promise<any> {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new UnauthorizedException('Username și parolă necesare');
    }

    const ldapUrl = this.configService.get<string>('LDAP_URL');
    const domain = this.configService.get<string>('LDAP_DOMAIN');

    const userPrincipalName = `${username}@${domain}`;

    const client = ldap.createClient({ url: ldapUrl });

    return new Promise((resolve, reject) => {
      client.bind(userPrincipalName, password, (err) => {
        client.unbind();
        if (err) {
          reject(new UnauthorizedException('Username sau parolă incorectă'));
          return;
        }
        resolve({ username, upn: userPrincipalName });
      });
    });
  }
}
