export const getInfoCasesById = `
SELECT 
CaseFolderId, CaseTypeId, Created, XCoordinate, YCoordinate 
FROM 
cse_Case_tab c WITH(NOLOCK)
WHERE
c.CaseTypeId <> 100
AND c.XCoordinate IS NOT NULL
AND c.YCoordinate IS NOT NULL
AND c.CaseFolderId = @caseFolderId
UNION 
SELECT 
CaseFolderId, CaseTypeId, Created, XCoordinate, YCoordinate 
FROM 
cse_CaseFinished_tab cf WITH(NOLOCK)
WHERE
cf.CaseTypeId <> 100
AND cf.XCoordinate IS NOT NULL
AND cf.YCoordinate IS NOT NULL
AND cf.CaseFolderId = @caseFolderId
`;

export const getInfoCasesByArea = `
SELECT 
CaseFolderId, CaseTypeId, Created, XCoordinate, YCoordinate, CaseIndex1Name, CaseIndex2Name 
FROM 
cse_Case_tab c WITH(NOLOCK)
WHERE
c.CaseTypeId <> 100
AND c.XCoordinate IS NOT NULL
AND c.YCoordinate IS NOT NULL
AND c.XCoordinate <= @X_max
AND c.XCoordinate >= @X_min
AND c.YCoordinate <= @Y_max
AND c.YCoordinate >= @Y_min
AND c.Created BETWEEN @startDate AND @endDate
UNION 
SELECT 
CaseFolderId, CaseTypeId, Created, XCoordinate, YCoordinate, CaseIndex1Name, CaseIndex2Name  
FROM 
cse_CaseFinished_tab cf WITH(NOLOCK)
WHERE
cf.CaseTypeId <> 100
AND cf.XCoordinate IS NOT NULL
AND cf.YCoordinate IS NOT NULL
AND cf.XCoordinate <= @X_max
AND cf.XCoordinate >= @X_min
AND cf.YCoordinate <= @Y_max
AND cf.YCoordinate >= @Y_min
AND cf.Created BETWEEN @startDate AND @endDate
`;

export const getLogsByCaseFolderId = `
WITH ALL_LOGS AS(
SELECT 
cfl.Created, cfl.Creator, cfl.LogText 
FROM 
cse_CaseFolderLog_tab cfl WITH(NOLOCK) 
WHERE 
cfl.CaseFolderId = @caseFolderId
UNION
SELECT 
cflf.Created, cflf.Creator, cflf.LogText  
FROM 
cse_CaseFolderLogFinished_tab cflf WITH(NOLOCK) 
WHERE 
cflf.CaseFolderId = @caseFolderId
UNION
SELECT 
cflr.Created, cflr.Creator, cflr.LogText  
FROM 
cse_CaseFolderLogRejected_tab cflr WITH(NOLOCK) 
WHERE 
cflr.CaseFolderId = @caseFolderId
)SELECT 
Created, Creator, LogText 
FROM 
ALL_LOGS al 
ORDER BY 
al.Created`