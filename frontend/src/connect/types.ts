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
    CaseFolderId?: number;
    caseId?: number;
    caseIndexComment?: string;
    caseFolderIndexComment?: string;
    createdAt?: string;
    createdBy?: string;
    geometry?: PolygonGeometry;
    locality?: string;
    address?: number;
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
    orderer?: string;
}


export interface ApiPolygoneResponse {
    type: string;
    geometry: Geometry,
    startDate: string;
    endDate: string;
    caseFolderId?: number;
    caseId?: number;
    caseIndex1Name: string;
    caseIndex2Name?: string;
    caseTypeId?: number;
    caseTypeName?: string;
    createdDate?: Date;
    xCoordinate: number;
    yCoordinate: number;
    address?: number;
    caller: string;
    caseIndexComment: string;
    caseFolderIndexComment?: string;
    createdAt: string;
    createdBy: string;
    locality: string;
    phoneNumber: string;
    provider: string;
    status: string;
    street: string;
    streetNumber: string;
    orderer?: string;
}

export interface ApiLogsByCaseFolderIdResponse {
    created: Date;
    creator: string;
    logText: string;
}

export interface ResponseGeomByCaseFolderId {
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

