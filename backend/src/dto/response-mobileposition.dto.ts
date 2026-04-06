import { IsString } from 'class-validator';

export class CaseFolderMobilePosition {
  @IsString()
  MobilePosition: string;
}
