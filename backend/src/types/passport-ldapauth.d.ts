// src/types/passport-ldapauth.d.ts
declare module 'passport-ldapauth' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface LdapConfig {
    server: {
      url: string;
      bindDN?: string;
      bindCredentials?: string;
      searchBase?: string;
      searchFilter?: string;
      searchAttributes?: string[];
      tlsOptions?: any;
    };
    usernameField?: string;
    passwordField?: string;
    passReqToCallback?: boolean;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: LdapConfig, verify?: (...args: any[]) => void);
    name: string;
  }
}
