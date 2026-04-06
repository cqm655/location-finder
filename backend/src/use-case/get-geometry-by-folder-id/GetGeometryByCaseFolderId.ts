import { Injectable } from '@nestjs/common';
import Database from '../../db/source.database';
import { TYPES } from 'tedious';
import { getLocationByCaseFolderId } from '../../db/scripts/get-info-cases';
import { CaseFolderMobilePosition } from '../../dto/response-mobileposition.dto';

@Injectable()
export class GetGeometryByCaseFolderId {
  constructor() {}

  public async getCaseGeom(
    caseFolderId: number,
  ): Promise<CaseFolderMobilePosition[]> {
    const caseFolderMobilePosition: CaseFolderMobilePosition[] = [];

    if (!caseFolderId) {
      return [];
    }

    const db = new Database();

    const baseQuery = getLocationByCaseFolderId;

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
        caseFolderMobilePosition.push(result);
      }

      return caseFolderMobilePosition;
    } catch (e) {
      throw e;
    } finally {
      db.close();
    }
  }
}
