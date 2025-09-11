import { Injectable } from '@nestjs/common';
import Database from '../../db/source.database';
import { TYPES } from 'tedious';

@Injectable()
export class GetGeometryByCaseFolderId {
  constructor() {}

  public async getCaseGeom(CaseFolderId: number) {
    const db = new Database();

    try {
      await db.connect();

      return await db.executeProcedure('app_GetGeometryByFolder', [
        { name: 'CaseFolderId', type: TYPES.Int, value: CaseFolderId },
      ]);
    } catch (e) {
      throw e;
    } finally {
      db.close();
    }
  }
}
