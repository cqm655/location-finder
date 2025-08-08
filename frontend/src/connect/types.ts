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

