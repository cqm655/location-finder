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
    SELECT
        C.caseFolderId,
        C.caseTypeId,
        CASE
            WHEN C.CaseTypeId = 102 THEN 'Politie'
            WHEN C.CaseTypeId = 104 THEN 'Pompieri'
            WHEN C.CaseTypeId = 105 THEN 'Ambulanta'
            END AS caseTypeName,
        C.created,
        CONCAT(RTRIM(LTRIM(C.PhoneNumberAreaCode)), RTRIM(LTRIM(C.PhoneNumber))) AS phoneNumber,
        C.creator,
        C.xCoordinate,
        C.yCoordinate,
        C.caseIndex1Name,
        C.caseIndex2Name,
        C.caseIndexComment,
        B.caseFolderIndexComment -- Conexiunea din tabelul Folder activ
    FROM cse_Case_tab C WITH(NOLOCK)
INNER JOIN cse_CaseFolder_tab B WITH(NOLOCK) ON C.CaseFolderId = B.CaseFolderId
    WHERE
        C.CaseTypeId <> 100
      AND C.xCoordinate BETWEEN @X_min AND @X_max
      AND C.yCoordinate BETWEEN @Y_min AND @Y_max
      AND C.created BETWEEN @startDate AND @endDate

    UNION ALL -- Folosim UNION ALL pentru viteză (nu face sortare pentru duplicate)

    SELECT
        CF.caseFolderId,
        CF.caseTypeId,
        -- Repetăm logica CASE sau folosim un subquery dacă sunt multe categorii
        CASE
            WHEN CF.CaseTypeId = 102 THEN 'Politie'
            WHEN CF.CaseTypeId = 104 THEN 'Pompieri'
            WHEN CF.CaseTypeId = 105 THEN 'Ambulanta'
            END AS caseTypeName,
        CF.created,
        CONCAT(RTRIM(LTRIM(CF.PhoneNumberAreaCode)), RTRIM(LTRIM(CF.PhoneNumber))) AS phoneNumber,
        CF.creator,
        CF.xCoordinate,
        CF.yCoordinate,
        CF.caseIndex1Name,
        CF.caseIndex2Name,
        CF.caseIndexComment,
        D.caseFolderIndexComment -- Conexiunea din tabelul Folder finalizat
    FROM cse_CaseFinished_tab CF WITH(NOLOCK)
INNER JOIN cse_CaseFolderFinished_tab D WITH(NOLOCK) ON CF.CaseFolderId = D.CaseFolderId
    WHERE
        CF.CaseTypeId <> 100
      AND CF.XCoordinate BETWEEN @X_min AND @X_max
      AND CF.YCoordinate BETWEEN @Y_min AND @Y_max
      AND CF.Created BETWEEN @startDate AND @endDate
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
