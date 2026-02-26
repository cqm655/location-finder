import { IsString } from 'class-validator';

export class ResponseCaseFolderIdDto {
  @IsString()
  caseFolderId: string;
  @IsString()
  caller: string;
  @IsString()
  municipality: string;
  @IsString()
  locality: string;
  @IsString()
  street: string;
  @IsString()
  streetNumber: string;
  @IsString()
  phoneNumber: string;
  @IsString()
  createdAt: string;
  @IsString()
  createdBy: string;
  @IsString()
  caseIndexComment: string;
  @IsString()
  provider: string;
  @IsString()
  status: string;
  @IsString()
  caseTypeName: string;

  geometry: any;
}
