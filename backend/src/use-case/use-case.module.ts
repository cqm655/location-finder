import { Module} from "@nestjs/common";
import {GetLogsInformationByCaseFolderId} from "./logs-by-folder-id/get-logs-by-case-folder-id.use-case";
import {FindByCaseFolderId} from "./location-by-case-folder-id/location-by-case-folder.use-case";
import {GetCasesByArea} from "./cases-by-location/get-cases-by-area.use-case";


@Module({
    providers: [
        GetLogsInformationByCaseFolderId,
        FindByCaseFolderId,
        GetCasesByArea
    ],
    exports: [
        GetLogsInformationByCaseFolderId,
        FindByCaseFolderId,
        GetCasesByArea
    ],
})
export class UseCaseModule {}