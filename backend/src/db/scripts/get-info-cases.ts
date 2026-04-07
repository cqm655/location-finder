export const getInfoCasesById = `
    WITH CombinedCases AS (
        SELECT
            C.caseFolderId,
            C.caseTypeId,
            C.created,
            C.creator,
            C.phoneNumberAreaCode,
            C.phoneNumber,
            C.xCoordinate,
            C.yCoordinate,
            C.caseIndex1Name,
            C.caseIndex2Name,
            C.caseIndexComment,
            B.caseFolderIndexComment,
            C.caseId,
            C.Street,
            C.MunicipalityName,
            C.Locality,
            C.Orderer
        FROM cse_Case_tab C WITH(NOLOCK)
        INNER JOIN cse_CaseFolder_tab B WITH(NOLOCK) ON C.CaseFolderId = B.CaseFolderId
    WHERE C.CaseFolderId = @caseFolderId AND C.CaseTypeId IN (102, 104, 105)

    UNION ALL

    SELECT
        CF.caseFolderId,
        CF.caseTypeId,
        CF.created,
        CF.creator,
        CF.phoneNumberAreaCode,
        CF.phoneNumber,
        CF.xCoordinate,
        CF.yCoordinate,
        CF.caseIndex1Name,
        CF.caseIndex2Name,
        CF.caseIndexComment,
        D.caseFolderIndexComment,
        CF.caseId,
        CF.Street,
        CF.MunicipalityName,
        CF.Locality,
        CF.Orderer
    FROM cse_CaseFinished_tab CF WITH(NOLOCK)
    INNER JOIN cse_CaseFolderFinished_tab D WITH(NOLOCK) ON CF.CaseFolderId = D.CaseFolderId
    WHERE CF.CaseFolderId = @caseFolderId AND CF.CaseTypeId IN (102, 104, 105)
        )
    SELECT
        caseFolderId,
        caseId,
        caseTypeId,
        CASE caseTypeId
            WHEN 102 THEN 'Politie'
            WHEN 104 THEN 'Pompieri'
            WHEN 105 THEN 'Ambulanta'
            END AS caseTypeName,
        created,
        CONCAT(MunicipalityName, ' - ', Locality, ' - ', Street) AS address,
        CONCAT(RTRIM(LTRIM(PhoneNumberAreaCode)), RTRIM(LTRIM(PhoneNumber))) AS phoneNumber,
        orderer,
        creator,
        xCoordinate,
        yCoordinate,
        caseIndex1Name,
        caseIndex2Name,
        caseIndexComment,
        caseFolderIndexComment
    FROM CombinedCases;
`;

export const getInfoCasesByArea = `
WITH CombinedCases AS (
    SELECT 
        C.CaseFolderId, C.CaseTypeId, C.Created, C.Creator,
        C.XCoordinate, C.YCoordinate, C.PhoneNumberAreaCode, C.PhoneNumber,
        C.CaseIndex1Name, C.CaseIndex2Name, C.CaseIndexComment,
        B.CaseFolderIndexComment
    FROM cse_Case_tab C WITH(NOLOCK)
    INNER JOIN cse_CaseFolder_tab B WITH(NOLOCK) ON C.CaseFolderId = B.CaseFolderId
    WHERE C.CaseTypeId <> 100

    UNION ALL

    SELECT 
        CF.CaseFolderId, CF.CaseTypeId, CF.Created, CF.Creator,
        CF.XCoordinate, CF.YCoordinate, CF.PhoneNumberAreaCode, CF.PhoneNumber,
        CF.CaseIndex1Name, CF.CaseIndex2Name, CF.CaseIndexComment,
        D.CaseFolderIndexComment
    FROM cse_CaseFinished_tab CF WITH(NOLOCK)
    INNER JOIN cse_CaseFolderFinished_tab D WITH(NOLOCK) ON CF.CaseFolderId = D.CaseFolderId
    WHERE CF.CaseTypeId <> 100
)
SELECT 
    CaseFolderId,
    caseTypeId,
    CASE 
        WHEN CaseTypeId = 102 THEN 'Poliție'
        WHEN CaseTypeId = 104 THEN 'Pompieri'
        WHEN CaseTypeId = 105 THEN 'Ambulanță'
        ELSE 'Altul'
    END AS caseTypeName,
    created,
    CONCAT(TRIM(PhoneNumberAreaCode), TRIM(PhoneNumber)) AS phoneNumber,
    creator,
    XCoordinate,
    YCoordinate,
    caseIndex1Name,
    caseIndex2Name,
    caseIndexComment,
    caseFolderIndexComment
FROM CombinedCases
WHERE 
    xCoordinate BETWEEN @X_min AND @X_max
    AND yCoordinate BETWEEN @Y_min AND @Y_max
    AND created BETWEEN @startDate AND @endDate
ORDER BY created DESC;
`;

export const getLogsByCaseFolderId = `
    SELECT  cfl.Created AS Created,
            cfl.Creator AS Creator,
            cfl.LogText AS LogText
    FROM cse_CaseFolderLog_tab cfl WITH (NOLOCK)
    WHERE cfl.CaseFolderId = @caseFolderId
    UNION
    SELECT cflf.Created AS Created,
           cflf.Creator AS Creator,
           cflf.LogText AS LogText
    FROM cse_CaseFolderLogFinished_tab cflf WITH(NOLOCK)
    WHERE
        cflf.CaseFolderId = @caseFolderId
    UNION
    SELECT cflr.Created AS Created,
           cflr.Creator AS Creator,
           cflr.LogText AS LogText
    FROM cse_CaseFolderLogRejected_tab cflr WITH(NOLOCK)
    WHERE
        cflr.CaseFolderId = @caseFolderId`;

export const getLocationByCaseFolderId = ` 
  SELECT MobilePosition FROM cse_CaseFolderMobilePosition_tab WHERE CASEFOLDERID = @caseFolderId
      union all
  SELECT MobilePosition FROM  cse_CaseFolderMobilePositionRejected_tab WHERE CASEFOLDERID = @caseFolderId
      union all
  SELECT MobilePosition FROM cse_CaseFolderMobilePositionFinished_tab WHERE CASEFOLDERID = @caseFolderId
`;

export const getAudioPath = `
        select FileName, 
               CaseFolderId
      from mfm_OperatorSoundFiles_tab with(nolock)
      where CaseFolderId = @caseFolderId
      union
      select FileName, 
             CaseFolderId
      from mfm_OperatorSoundFilesFinished_tab with(nolock)
      where CaseFolderId = @caseFolderId
`;
