import {Injectable} from "@nestjs/common";
import Database from "../../db/source.database";
import {ResponseCaseFolderIdDto} from "../../dto/response-case-folder-id.dto";
import {DateTime} from "luxon";
import {parseXmlGeo} from "./parse-xml.use-case";
import Date from "tedious/lib/data-types/date";
import {getDateTimeFormated} from "../help";


@Injectable()
export class FindByCaseFolderId {
    constructor() {}

    public async getLocationByCaseFolderId(caseFolderId: number):Promise<ResponseCaseFolderIdDto> {
        if (!caseFolderId) {
            return null
        }

        let response: ResponseCaseFolderIdDto = null;

        const db = new Database();
        try {
            await db.connect();

            const results = await db.executeQuery(
                `dbo.app_GetGeometryByFolder @CaseFolderId = ${caseFolderId}` , [], true
            );

            if (results.length === 0) {return null}

            const geometry = await Promise.all(
                results.map((el) => parseXmlGeo(el.geometry))
            );
            const aml = geometry?.filter((el) => el?.aml).map(({aml}) => aml);
            const mlp = geometry?.filter((el) => el?.mlp).map(({mlp}) => mlp);

            response = {
                caseFolderId: results[0].CaseFolderId,
                caller: results[0].Caller || results[1].Caller,
                locality: results[0].Locality,
                municipality: results[0].Municipality,
                street: results[0].Street,
                streetNumber: results[0].StreetNo,
                caseIndexComment: results[0].CaseIndexComment,
                phoneNumber: results[0].PhoneNumber,
                createdAt: getDateTimeFormated(results[0].Created),
                createdBy: results[0].Creator,
                status: results[0].Status,
                provider: results[0].Provider,
                geometry: {mlp, aml},
            }

            return response;

        }catch (err){
            throw err;
        }finally {
            db.close();
        }
    }
};

