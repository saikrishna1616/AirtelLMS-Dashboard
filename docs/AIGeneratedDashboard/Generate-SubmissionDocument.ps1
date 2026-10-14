$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$documentPath = Join-Path $PSScriptRoot 'AirtelLMS_Dashboard_Submission.docx'
$repositoryUrl = 'https://github.com/saikrishna1616/AirtelLMS-Dashboard/tree/feature/ai-generated-dashboard'
$sessionUrl = 'https://github.com/saikrishna1616/AirtelLMS-Dashboard/blob/feature/ai-generated-dashboard/docs/AIGeneratedDashboard/session%20chats.md'
$nativeSessionUrl = 'https://github.com/saikrishna1616/AirtelLMS-Dashboard/blob/feature/ai-generated-dashboard/docs/AIGeneratedDashboard/native-session.md'
function Escape-Xml([string]$Text) { return [System.Security.SecurityElement]::Escape($Text) }
function Paragraph([string]$Text, [string]$Style = 'Normal') {
    return '<w:p><w:pPr><w:pStyle w:val="' + $Style + '"/></w:pPr><w:r><w:t xml:space="preserve">' + (Escape-Xml $Text) + '</w:t></w:r></w:p>'
}
function Linked-Paragraph([string]$Text, [string]$Relationship) {
    return '<w:p><w:hyperlink r:id="' + $Relationship + '"><w:r><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr><w:t>' + (Escape-Xml $Text) + '</w:t></w:r></w:hyperlink></w:p>'
}
function Table-Row([string]$Label, [string]$ValueXml) {
    return '<w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:w="2450" w:type="dxa"/><w:shd w:fill="E3ECF7"/></w:tcPr>' + (Paragraph $Label 'TableLabel') + '</w:tc><w:tc><w:tcPr><w:tcW w:w="7550" w:type="dxa"/></w:tcPr>' + $ValueXml + '</w:tc></w:tr>'
}
$tableStart = '<w:tbl><w:tblPr><w:tblW w:w="10000" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="C3CBD7"/><w:left w:val="single" w:sz="4" w:color="C3CBD7"/><w:bottom w:val="single" w:sz="4" w:color="C3CBD7"/><w:right w:val="single" w:sz="4" w:color="C3CBD7"/><w:insideH w:val="single" w:sz="4" w:color="C3CBD7"/><w:insideV w:val="single" w:sz="4" w:color="C3CBD7"/></w:tblBorders><w:tblCellMar><w:top w:w="100" w:type="dxa"/><w:left w:w="130" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:right w:w="130" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="2450"/><w:gridCol w:w="7550"/></w:tblGrid>'
$tableHeader = '<w:tr><w:trPr><w:tblHeader/></w:trPr><w:tc><w:tcPr><w:shd w:fill="203B63"/></w:tcPr>' + (Paragraph 'Field' 'TableHeader') + '</w:tc><w:tc><w:tcPr><w:shd w:fill="203B63"/></w:tcPr>' + (Paragraph 'Your entry' 'TableHeader') + '</w:tc></w:tr>'
$body = New-Object System.Text.StringBuilder
[void]$body.Append((Paragraph 'AI-Assisted SDLC Assignment' 'Title'))
[void]$body.Append((Paragraph 'AirtelLMS dashboard submission' 'Subtitle'))
[void]$body.Append((Paragraph 'Submission deadline: 15 October 2026 | Prepared: 14 October 2026'))
[void]$body.Append((Paragraph 'Recipient: Srinivas.adepu@schoolnetindia.com'))
[void]$body.Append((Paragraph 'Final submission checklist' 'Heading1'))
[void]$body.Append($tableStart + $tableHeader)
[void]$body.Append((Table-Row 'Name' (Paragraph 'Saikrishna Gajjela')))
[void]$body.Append((Table-Row 'Project name' (Paragraph 'AirtelLMS')))
[void]$body.Append((Table-Row 'Dashboard name' (Paragraph 'AIGeneratedDashboard - Learning Operations')))
[void]$body.Append((Table-Row 'Final dashboard requirements' (Paragraph 'Synthetic training data; learner, completion, assessment pass and overdue KPIs; reporting-period, circle and program filters; enrollment-cohort trends and learning outcomes; program/circle comparisons; searchable paginated batch and learner tables; batch drilldowns; rule-based risk insights; filtered CSV exports; responsive layout and keyboard controls.')))
[void]$body.Append((Table-Row 'Repository link' ((Linked-Paragraph $repositoryUrl 'rIdRepository') + (Paragraph 'Branch: feature/ai-generated-dashboard. Contains the dashboard and assignment evidence only.'))))
[void]$body.Append((Table-Row 'Session chats.md link' ((Linked-Paragraph $sessionUrl 'rIdSession') + (Linked-Paragraph 'Actual native visible-message export' 'rIdNative'))))
[void]$body.Append((Table-Row 'Estimated time without AI' (Paragraph '8 hours (480 minutes). Planning estimate: requirements 1h, design 1h, implementation 3h, testing/review 2h, documentation 1h.')))
[void]$body.Append((Table-Row 'Actual time taken with AI' (Paragraph '20.8 minutes through completed dashboard validation, measured from the Codex session. Final handoff, GitHub publishing and later submission-document preparation are excluded.')))
[void]$body.Append((Table-Row 'Time saved' (Paragraph 'Estimated 459.2 minutes (7 hours 39.2 minutes): 480 estimated minutes minus 20.8 measured minutes. This is an estimate, not a controlled benchmark.')))
[void]$body.Append('</w:tbl>')
[void]$body.Append((Paragraph 'Prepared for submission. No email has been sent.'))
[void]$body.Append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')
[void]$body.Append((Paragraph 'Repository contents verification' 'Heading1'))
[void]$body.Append((Paragraph 'All six items in the assignment screenshot are available in the GitHub dashboard branch.'))
$evidence = @(
    @('Complete .codex folder', 'Entire project-local .codex/ directory, containing AIGeneratedDashboard.md.'),
    @('Codex chat sessions', 'docs/AIGeneratedDashboard/session chats.md and native-session.md. Actual visible user/assistant messages exported through submission preparation.'),
    @('PRD document', 'docs/AIGeneratedDashboard/PRD.md'),
    @('Work items generated', 'docs/AIGeneratedDashboard/WORK_ITEMS.md'),
    @('Source code', 'LearnetLinq.WebUI/AIGeneratedDashboard/ and its required Airtel logo.'),
    @('Test cases', 'tests.html, TEST_CASES.md, Validate-Dashboard.ps1, and artifacts/test-results.json. Google Chrome: 32 passed, 0 failed.')
)
[void]$body.Append($tableStart + $tableHeader)
foreach ($item in $evidence) { [void]$body.Append((Table-Row $item[0] (Paragraph $item[1]))) }
[void]$body.Append('</w:tbl>')
[void]$body.Append((Paragraph 'The .codex folder is the complete project-local folder. User-profile credentials, private internal data, unrelated sessions, and the legacy AirtelLMS repository history are excluded.'))
[void]$body.Append((Paragraph 'Run the dashboard' 'Heading1'))
[void]$body.Append((Paragraph 'Clone the GitHub branch and open LearnetLinq.WebUI/AIGeneratedDashboard/index.html in Google Chrome. No package installation, database, login, or web server is required.'))
[void]$body.Append((Paragraph 'AI usage covered requirements, KPI selection, design, code understanding, implementation, test creation, review, documentation and time analysis. Dashboard recommendations use transparent rules on synthetic data.'))
$documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' + $body.ToString() + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="900" w:bottom="850" w:left="900" w:header="400" w:footer="400"/></w:sectPr></w:body></w:document>'
$stylesXml = '<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="20"/><w:color w:val="263242"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="90" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="38"/><w:color w:val="203B63"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:rPr><w:sz w:val="25"/><w:color w:val="5C6778"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:keepNext/><w:spacing w:before="150" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="25"/><w:color w:val="203B63"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="TableLabel"><w:name w:val="Table label"/><w:rPr><w:b/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="TableHeader"><w:name w:val="Table header"/><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr></w:style></w:styles>'
$relationshipsXml = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdRepository" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + (Escape-Xml $repositoryUrl) + '" TargetMode="External"/><Relationship Id="rIdSession" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + (Escape-Xml $sessionUrl) + '" TargetMode="External"/><Relationship Id="rIdNative" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + (Escape-Xml $nativeSessionUrl) + '" TargetMode="External"/></Relationships>'
$parts = @{
    '[Content_Types].xml' = '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
    '_rels/.rels' = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdDocument" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
    'word/document.xml' = $documentXml
    'word/styles.xml' = $stylesXml
    'word/_rels/document.xml.rels' = $relationshipsXml
}
$zipStream = [System.IO.File]::Open($documentPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::ReadWrite)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
try {
    foreach ($part in $parts.GetEnumerator()) {
        [xml]$validatedXml = $part.Value
        $entry = $archive.CreateEntry($part.Key)
        $writer = New-Object System.IO.StreamWriter($entry.Open(), (New-Object System.Text.UTF8Encoding($false)))
        try { $writer.Write($part.Value) } finally { $writer.Dispose() }
    }
} finally { $archive.Dispose(); $zipStream.Dispose() }
Write-Output ('Created submission document: ' + $documentPath)
