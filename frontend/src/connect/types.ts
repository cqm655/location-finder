export interface ApiCaseFolderIdResponse {
    caller: string;
    caseFolderId: number;
    caseIndexComment: string;
    createdAt?: string;
    createdBy?: string;
    geometry?: Geometry;
    locality?: string;
    phoneNumber?: string;
    provider?: string;
    status?: string;
    street?: string;
    streetNumber?: string;
    startDate?: string;
    endDate?: string;
    caseIndex1Name: string;
    caseIndex2Name: string;
    caseTypeId?: number;
    created?: Date;
    XCoordinate: number;
    YCoordinate: number;
    creator: string;
}

interface Geometry {
    mlp: [],
    aml: []
}

export interface ApiPolygoneResponse {
    type: string;
    geometry: {
        latitude: number[],
        longitude: number[],
    },
    startDate: string;
    endDate: string;
    caseFolderId?: number;
    caseIndex1Name: string;
    caseIndex2Name?: string;
    caseTypeId?: number;
    createdDate?: Date;
    XCoordinate: number;
    YCoordinate: number;
    caller: string;
    caseIndexComment: string;
    createdAt: string;
    createdBy: string;
    locality: string;
    phoneNumber: string;
    provider: string;
    status: string;
    street: string;
    streetNumber: string;
}

interface Geometry {
    coordinates: number[];
}


export interface ShapeResponse {
    accuracyPosition: string;
    formatPosition: string;
    geometry: Geometry[];
    levelConfidence: string;
    msid: number;
    positionId: number;
    provider: string;
    timePosition: string;
    imei?: string;
    imsi?: string;
    positionMethod?: string;
    radiusPosition?: string;
}

export interface ResponseGeomByCaseFolderId {
    Caller: string;
    CaseFolderId: number;
    CaseIndexComment: string;
    Created: Date;
    Creator: string;
    Locality: string;
    Municipality: string;
    PhoneNumber: string;
    Status: string;
    Street: string;
    StreetNo: string;
    geometry: string;
}

