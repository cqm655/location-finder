export const getInfoCasesById = `
  SELECT caseFolderId,
         caseTypeId,
         caseTypeName,
         created,
         creator,
         XCoordinate,
         YCoordinate
  FROM cse_Case_tab c WITH(NOLOCK)
  WHERE
     c.CaseTypeId <> 100 AND 
     c.XCoordinate IS NOT NULL
    AND c.YCoordinate IS NOT NULL
    AND c.CaseFolderId = @caseFolderId
  UNION
  SELECT caseFolderId,
         caseTypeId,
         caseTypeName,
         created,
         creator,
         XCoordinate,
         YCoordinate
  FROM cse_CaseFinished_tab cf WITH(NOLOCK)
  WHERE
     cf.CaseTypeId <> 100 AND 
     cf.XCoordinate IS NOT NULL
    AND cf.YCoordinate IS NOT NULL
    AND cf.CaseFolderId = @caseFolderId
`;

export const getInfoCasesByArea = `
  SELECT c.caseFolderId,
    c.caseTypeId,
         case
           when c.CaseTypeId = 102 then 'Politie'
           when c.CaseTypeId = 104 then 'Pompieri'
           when c.CaseTypeId = 105 then 'Ambulanta'
           end as caseTypeName,
    c.created,
    CONCAT(rtrim(ltrim(c.PhoneNumberAreaCode)),rtrim(ltrim(c.PhoneNumber))) as phoneNumber,
    c.creator,
    c.XCoordinate,
    c.YCoordinate,
    c.caseIndex1Name,
    c.caseIndex2Name,
    c.caseIndexComment
  FROM cse_Case_tab c WITH(NOLOCK)
  WHERE
     c.CaseTypeId <> 100 AND 
     c.XCoordinate IS NOT NULL
    AND c.YCoordinate IS NOT NULL
    AND c.XCoordinate <= @X_max
    AND c.XCoordinate >= @X_min
    AND c.YCoordinate <= @Y_max
    AND c.YCoordinate >= @Y_min
    AND c.Created BETWEEN @startDate
    AND @endDate
  UNION
  SELECT caseFolderId,
         caseTypeId,
         caseTypeName,
         created,
         creator,
         CONCAT(rtrim(ltrim(PhoneNumberAreaCode)),rtrim(ltrim(PhoneNumber))) as phoneNumber,
         XCoordinate,
         YCoordinate,
         caseIndex1Name,
         caseIndex2Name,
         caseIndexComment
  FROM cse_CaseFinished_tab cf WITH(NOLOCK)
  WHERE
     cf.CaseTypeId <> 100 AND 
     cf.XCoordinate IS NOT NULL
    AND cf.YCoordinate IS NOT NULL
    AND cf.XCoordinate <= @X_max
    AND cf.XCoordinate >= @X_min
    AND cf.YCoordinate <= @Y_max
    AND cf.YCoordinate >= @Y_min
    AND cf.Created BETWEEN @startDate
    AND @endDate
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
  app_GetGeometryByFolder
`;
