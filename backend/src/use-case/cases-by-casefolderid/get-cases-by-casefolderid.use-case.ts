import { Injectable } from '@nestjs/common';
import { ResponseCaseFolderIdDto } from '../../dto/response-case-folder-id.dto';
import Database from '../../db/source.database';
import { getInfoCasesById } from '../../db/scripts/get-info-cases';
import { TYPES } from 'tedious';

@Injectable()
export class GetCasesByCaseFolderId {
  public async casesByCaseFolderId(
    caseFolderId: number,
  ): Promise<ResponseCaseFolderIdDto[]> {
    const infoCaseByCaseFolderId: ResponseCaseFolderIdDto[] = [];

    if (!caseFolderId) {
      return [];
    }

    const db = new Database();

    const baseQuery = getInfoCasesById;

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
        infoCaseByCaseFolderId.push(result);
      }

      return infoCaseByCaseFolderId;
    } catch (error) {
      console.log(error.message);
    } finally {
      db.close();
    }
  }
}
