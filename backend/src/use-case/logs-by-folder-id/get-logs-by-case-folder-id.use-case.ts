import { Injectable } from '@nestjs/common';
import Database from '../../db/source.database';
import { TYPES } from 'tedious';
import { getLogsByCaseFolderId } from '../../db/scripts/get-info-cases';
import { FindByCaseFolderId } from '../location-by-case-folder-id/location-by-case-folder.use-case';
import { getDateTimeFormated } from '../help';

export interface InfoByCaseFolderId {
  Created: string;
  Creator: string;
  LogText: string;
}

@Injectable()
export class GetLogsInformationByCaseFolderId {
  constructor(private readonly findByCaseFolderId: FindByCaseFolderId) {}

  public async informationByCaseFolderId(
    caseFolderId: number,
  ): Promise<InfoByCaseFolderId[]> {
    const logs: InfoByCaseFolderId[] = [];

    if (!caseFolderId) {
      return [];
    }

    const db = new Database();

    const baseQuery = getLogsByCaseFolderId;

    try {
      await db.connect();

      const results = await db.executeQuery(
        baseQuery,
        [
          {
            name: 'caseFolderId',
            type: TYPES.Int,
            value: caseFolderId,
          },
        ],
        false,
      );

      for (const result of results) {
        logs.push({
          Created: getDateTimeFormated(result.Created),
          Creator: result.Creator,
          LogText: result.LogText,
        });
      }

      return logs;
    } catch (err) {
      throw err;
    } finally {
      db.close();
    }
  }
}
