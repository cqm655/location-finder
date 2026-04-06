import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppService } from './app.service';
import { InfoByCaseFolderId } from './use-case/logs-by-folder-id/get-logs-by-case-folder-id.use-case';
import { RequestByLocationDto } from './dto/request-by-location.dto';
import { InfoByLocationResponse } from './use-case/cases-by-location/get-cases-by-area.use-case';
import { CaseFolderMobilePosition } from './dto/response-mobileposition.dto';
import * as path from 'path';
import * as fs from 'node:fs';

@Controller({
  path: '',
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('folderId/:id')
  async getInfoByCaseFolderId(@Param('id') id: string) {
    return await this.appService.getInfoByCaseFolderId(id);
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

  @Get('/geometry/:id')
  async getGeometryByCaseFolderId(
    @Param('id') id: number,
  ): Promise<CaseFolderMobilePosition[]> {
    return await this.appService.getGeometryByCaseFolderId(id);
  }

  @Get('/audio/list/:id')
  async getAudioByCaseFolderId(@Param('id') id: number) {
    return await this.appService.getAudio(id);
  }

  @Get('/audio/stream/:caseFolderId/:fileIndex')
  async streamAudio(
    @Param('caseFolderId') caseFolderId: number,
    @Param('fileIndex') fileIndex: number, // Indexul vine din URL (0, 1, 2...)
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // 1. Luăm lista
    const audioFiles = await this.appService.getAudio(caseFolderId);

    // 2. Verificăm indexul
    if (!audioFiles || !audioFiles[fileIndex]) {
      return res.status(404).send('Index invalid');
    }

    // 3. EXTRAGEM STRING-UL (Aici era greșeala)
    // Verifică dacă în consolă vezi ce proprietăți are obiectul
    console.log('Obiectul de la index:', audioFiles[fileIndex]);

    // Dacă obiectul tău are cheia "FilePath":
    // @ts-ignore
    const relativePath = audioFiles[fileIndex].FileName;

    const normalizedRelative = relativePath.replace(/\//g, '\\');

    // Dacă nu ești sigur de numele cheii, poți încerca să vezi prima valoare:
    // const relativePath = Object.values(audioFiles[fileIndex])[0];

    const rootPath = '\\\\10.2.20.155\\RecordedSoundFiles';
    const absolutePath = path.join(rootPath, normalizedRelative);

    console.log('Calea finală construită:', absolutePath);

    // 5. Verificăm dacă fișierul există fizic pe disc
    if (!fs.existsSync(absolutePath)) {
      console.error(`Fisier negasit la: ${absolutePath}`);
      return res
        .status(HttpStatus.NOT_FOUND)
        .send('Fișierul nu a fost găsit pe serverul de stocare.');
    }

    // --- Logica de Streaming ---
    const stat = fs.statSync(absolutePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(absolutePath, { start, end });

      res.writeHead(HttpStatus.PARTIAL_CONTENT, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg',
      });

      file.pipe(res);
    } else {
      res.writeHead(HttpStatus.OK, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      });
      fs.createReadStream(absolutePath).pipe(res);
    }
  }
}
