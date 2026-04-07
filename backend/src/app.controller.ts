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

interface AudioRecord {
  FilePath: string;
  OperatorName?: string;
  // adaugă și alte coloane dacă ai (ex: CreatedDate)
}

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
    @Param('fileIndex') fileIndex: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const audioFiles: any[] = await this.appService.getAudio(caseFolderId);

    if (!audioFiles || !audioFiles[fileIndex]) {
      return res.status(404).send('Înregistrarea nu există.');
    }

    // 2. Extragem calea indiferent dacă e obiect sau string
    const item = audioFiles[fileIndex];
    const relativePath =
      item.FileName ||
      item.FileName ||
      (typeof item === 'string' ? item : null);
    // 3. Preluăm căile din ENV
    const rootPaths = [process.env.AUDIO_ROOT_1, process.env.AUDIO_ROOT_2];

    let absolutePath = '';
    let fileExists = false;

    // 3. Logica de căutare "Fallback"
    for (const root of rootPaths) {
      const fullPath = path.join(root, String(relativePath));

      if (fs.existsSync(fullPath)) {
        absolutePath = fullPath;
        fileExists = true;
        break; // Am găsit fișierul, nu mai căutăm în restul locațiilor
      }
    }

    if (!fileExists) {
      console.error(
        `Fișierul nu a fost găsit pe niciun server: ${relativePath}`,
      );
      return res.status(404).send('Fișierul audio nu a fost găsit.');
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
