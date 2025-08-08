import {IsNumber, IsString} from "class-validator";
import {DateTime} from "luxon";

export class ResponseCaseFolderIdDto {
    @IsString()
    caseFolderId: string;
    @IsString()
    caller: string;
    @IsString()
    municipality: string;
    @IsString()
    locality: string;
    @IsString()
    street: string;
    @IsString()
    streetNumber: string;
    @IsString()
    phoneNumber: string;
    @IsString()
    createdAt: string;
    @IsString()
    createdBy: string;
    @IsString()
    caseIndexComment: string
    @IsString()
    provider: string;
    @IsString()
    status: string;

    geometry: any;
}