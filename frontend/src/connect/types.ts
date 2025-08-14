export interface ApiCaseFolderIdResponse {
    caller: string;
    caseFolderId: number;
    caseIndexComment: string;
    createdAt: string;
    createdBy: string;
    geometry: Geometry;
    locality: string;
    phoneNumber: string;
    provider: string;
    status: string;
    street: string;
    streetNumber: string;
}

interface Geometry {
    mlp: [],
    aml: []
}

export interface ApiPolygoneRequest {
    type: string;
    geometry: {
        latitude: number[],
        longitude: number[],
    },
    startDate: string;
    endDate: string;
    CasefolderId?: string;
    CaseIndex1Name?: string;
    CaseIndex2Name?: string;
    CaseTypeId?: number;
    CreatedDate?: Date;
    XCoordinate?: number;
    YCoordinate?: number;
}

export interface ApiPolygoneResponse {
    CasefolderId: string;
    CaseIndex1Name: string;
    CaseIndex2Name: string;
    CaseTypeId: number;
    CreatedDate: Date;
    XCoordinate: number;
    YCoordinate: number;
}

