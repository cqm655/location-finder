interface Geometry {
    mlp?: [],
    aml?: [],
    coordinates?: number[];
}

interface PolygonGeometry {
    latitude: number[];
    longitude: number[];
}

export interface ApiCaseFolderIdResponse {
    caller?: string;
    caseFolderId?: number;
    caseIndexComment?: string;
    createdAt?: string;
    createdBy?: string;
    geometry?: PolygonGeometry;
    locality?: string;
    phoneNumber?: string;
    provider?: string;
    status?: string;
    street?: string;
    streetNumber?: string;
    startDate?: string;
    endDate?: string;
    caseIndex1Name?: string;
    caseIndex2Name?: string;
    caseTypeId?: number;
    caseTypeName?: string;
    created?: Date;
    XCoordinate?: number;
    YCoordinate?: number;
    creator?: string;
}


export interface ApiPolygoneResponse {
    type: string;
    geometry: Geometry,
    startDate: string;
    endDate: string;
    caseFolderId?: number;
    caseIndex1Name: string;
    caseIndex2Name?: string;
    caseTypeId?: number;
    caseTypeName?: string;
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

export interface ApiLogsByCaseFolderIdResponse {
    created: Date;
    creator: string;
    logText: string;
}

export interface ResponseGeomByCaseFolderId {
    Caller: string;
    CaseFolderId: number;
    CaseIndexComment: string;
    CaseTypeName: string;
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

// Aceasta reprezintă structura GeoJSON pe care o așteaptă store-ul tău
interface GeoJsonFeatureCollection {
    type: "FeatureCollection";
    features: any[]; // Poți detalia aici dacă ai un tip specific pentru GeoJSON
}

export interface GeometryWithDate {
    geometry: {
        type: 'AML' | 'MLP';
        feature: GeoJsonFeatureCollection;
    };
    created: Date | string;
}

