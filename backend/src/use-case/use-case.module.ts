import { Module } from '@nestjs/common';
import { GetLogsInformationByCaseFolderId } from './logs-by-folder-id/get-logs-by-case-folder-id.use-case';
import { FindByCaseFolderId } from './location-by-case-folder-id/location-by-case-folder.use-case';
import { GetCasesByArea } from './cases-by-location/get-cases-by-area.use-case';
import { GetGeometryByCaseFolderId } from './get-geometry-by-folder-id/GetGeometryByCaseFolderId';
import { GetCasesByCaseFolderId } from './cases-by-casefolderid/get-cases-by-casefolderid.use-case';
import { GetAudio } from './audio/get-audio';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    GetLogsInformationByCaseFolderId,
    FindByCaseFolderId,
    GetCasesByArea,
    GetGeometryByCaseFolderId,
    GetCasesByCaseFolderId,
    GetAudio,
    ConfigService,
  ],
  exports: [
    GetLogsInformationByCaseFolderId,
    FindByCaseFolderId,
    GetCasesByArea,
    GetGeometryByCaseFolderId,
    GetCasesByCaseFolderId,
    GetAudio,
    ConfigService,
  ],
})
export class UseCaseModule {}
