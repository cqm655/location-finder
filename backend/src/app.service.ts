import { Injectable } from '@nestjs/common';
import {
  GetLogsInformationByCaseFolderId,
  InfoByCaseFolderId,
} from './use-case/logs-by-folder-id/get-logs-by-case-folder-id.use-case';
import { RequestByLocationDto } from './dto/request-by-location.dto';
import { FindByCaseFolderId } from './use-case/location-by-case-folder-id/location-by-case-folder.use-case';
import { ResponseCaseFolderIdDto } from './dto/response-case-folder-id.dto';
import { GetCasesByArea } from './use-case/cases-by-location/get-cases-by-area.use-case';

@Injectable()
export class AppService {
  constructor(
    private readonly getLogsInformationByCaseFolderId: GetLogsInformationByCaseFolderId,
    private readonly getCasesByArea: GetCasesByArea,
    private readonly findByCaseFolderId: FindByCaseFolderId,
  ) {}

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

  public async getLocationByCaseFolderId(
    caseFolderId: number,
  ): Promise<ResponseCaseFolderIdDto> {
    return await this.findByCaseFolderId.getLocationByCaseFolderId(
      caseFolderId,
    );
  }
}
