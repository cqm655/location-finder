import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { InfoByCaseFolderId } from './use-case/logs-by-folder-id/get-logs-by-case-folder-id.use-case';

import { RequestByLocationDto } from './dto/request-by-location.dto';
import { ResponseCaseFolderIdDto } from './dto/response-case-folder-id.dto';
import { InfoByLocationResponse } from './use-case/cases-by-location/get-cases-by-area.use-case';

@Controller({
  path: '/by-location',
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('folderId/:id')
  async getInfoByCaseFolderId(
    @Param('id') id: string,
  ): Promise<ResponseCaseFolderIdDto> {
    const data = await this.appService.getLocationByCaseFolderId(parseInt(id));
    return data;
  }

  @Post('/by-area')
  async getCasesByLocation(
    @Body() casesRequest: RequestByLocationDto,
  ): Promise<InfoByLocationResponse[]> {
    return this.appService.getCasesInformation(casesRequest);
  }

  @Get('/logs/:id')
  async getLogs(@Param('id') id: number): Promise<InfoByCaseFolderId[]> {
    return await this.appService.getLogsByCaseFolder(id);
  }
}
