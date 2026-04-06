// get-audio.ts
import { Injectable } from '@nestjs/common';
import Database from '../../db/source.database';
import { getAudioPath } from '../../db/scripts/get-info-cases';
import { TYPES } from 'tedious';

@Injectable()
export class GetAudio {
  async getRelativePath(caseFolderId: number): Promise<string[]> {
    if (!caseFolderId) {
      return [];
    }

    const audioListStream = [];

    const db = new Database();

    const baseQuery = getAudioPath;

    try {
      await db.connect();

      const results = await db.executeQuery(baseQuery, [
        {
          name: 'caseFolderId',
          type: TYPES.Int,
          value: caseFolderId,
        },
      ]);

      for (const result of results) {
        audioListStream.push(result);
      }

      return audioListStream;
    } catch (error) {
      console.log(error.message);
    } finally {
      db.close();
    }
  }
}
