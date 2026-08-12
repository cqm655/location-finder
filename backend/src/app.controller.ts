import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppService } from './app.service';
import { InfoByCaseFolderId } from './use-case/logs-by-folder-id/get-logs-by-case-folder-id.use-case';
import { RequestByLocationDto } from './dto/request-by-location.dto';
import { InfoByLocationResponse } from './use-case/cases-by-location/get-cases-by-area.use-case';
import { CaseFolderMobilePosition } from './dto/response-mobileposition.dto';
import * as path from 'path';
import * as fs from 'node:fs';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';

@Controller({
  path: '',
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}
  @UseGuards(JwtAuthGuard)
  @Get('folderId/:id')
  async getInfoByCaseFolderId(@Param('id') id: string) {
    return await this.appService.getInfoByCaseFolderId(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/by-area')
  async getCasesByLocation(
    @Body() casesRequest: RequestByLocationDto,
  ): Promise<InfoByLocationResponse[]> {
    return this.appService.getCasesInformation(casesRequest);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/logs/:id')
  async getLogs(@Param('id') id: number): Promise<InfoByCaseFolderId[]> {
    return await this.appService.getLogsByCaseFolder(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/geometry/:id')
  async getGeometryByCaseFolderId(
    @Param('id') id: number,
  ): Promise<CaseFolderMobilePosition[]> {
    return await this.appService.getGeometryByCaseFolderId(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/audio/list/:id')
  async getAudioByCaseFolderId(@Param('id') id: number) {
    return await this.appService.getAudio(id);
  }
  @UseGuards(JwtAuthGuard)
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

    const item = audioFiles[fileIndex];
    const relativePath =
      item.FileName ||
      item.FileName ||
      (typeof item === 'string' ? item : null);
    const rootPaths = [
      process.env.AUDIO_ROOT_1,
      process.env.AUDIO_ROOT_2,
      process.env.AUDIO_ROOT_3,
      process.env.AUDIO_ROOT_4,
      process.env.AUDIO_ROOT_5,
    ];

    let absolutePath = '';
    let fileExists = false;

    for (const root of rootPaths) {
      const fullPath = path.join(root, String(relativePath));

      if (fs.existsSync(fullPath)) {
        absolutePath = fullPath;
        fileExists = true;
        break;
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
