import { Injectable } from '@nestjs/common';
import {
  GetLogsInformationByCaseFolderId,
  InfoByCaseFolderId,
} from './use-case/logs-by-folder-id/get-logs-by-case-folder-id.use-case';
import { RequestByLocationDto } from './dto/request-by-location.dto';
import { FindByCaseFolderId } from './use-case/location-by-case-folder-id/location-by-case-folder.use-case';
import { ResponseCaseFolderIdDto } from './dto/response-case-folder-id.dto';
import { GetCasesByArea } from './use-case/cases-by-location/get-cases-by-area.use-case';
import { GetGeometryByCaseFolderId } from './use-case/get-geometry-by-folder-id/GetGeometryByCaseFolderId';
import { GetCasesByCaseFolderId } from './use-case/cases-by-casefolderid/get-cases-by-casefolderid.use-case';
import { CaseFolderMobilePosition } from './dto/response-mobileposition.dto';
import { GetAudio } from './use-case/audio/get-audio';

@Injectable()
export class AppService {
  constructor(
    private readonly getLogsInformationByCaseFolderId: GetLogsInformationByCaseFolderId,
    private readonly getCasesByArea: GetCasesByArea,
    private readonly findByCaseFolderId: FindByCaseFolderId,
    private readonly getGeomByCaseFolderId: GetGeometryByCaseFolderId,
    private readonly getCasesByCaseFolderId: GetCasesByCaseFolderId,
    private readonly audio: GetAudio,
  ) {}

  public async getInfoByCaseFolderId(
    caseFolderId: string,
  ): Promise<ResponseCaseFolderIdDto[]> {
    return await this.getCasesByCaseFolderId.casesByCaseFolderId(
      parseInt(caseFolderId),
    );
  }

  public async getLogsByCaseFolder(
    caseFolderId: number,
  ): Promise<InfoByCaseFolderId[]> {
    return await this.getLogsInformationByCaseFolderId.informationByCaseFolderId(
      caseFolderId,
    );
  }

  public async getCasesInformation(casesRequest: RequestByLocationDto) {
    return await this.getCasesByArea.getCasesInformation(casesRequest);
  }

  public async getGeometryByCaseFolderId(
    id: number,
  ): Promise<CaseFolderMobilePosition[]> {
    return await this.getGeomByCaseFolderId.getCaseGeom(id);
  }

  public async getAudio(id: number) {
    return await this.audio.getRelativePath(id);
  }

  // public async getLocationByCaseFolderId(
  //   caseFolderId: number,
  // ): Promise<ResponseCaseFolderIdDto> {
  //   return await this.findByCaseFolderId.getLocationByCaseFolderId(
  //     caseFolderId,
  //   );
  // }
}
