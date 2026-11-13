[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)][string[]]$Query,
    [ValidateSet('all','cloud','selfhosted','domains')][string]$Catalog='all',
    [ValidateRange(1,200)][int]$Limit=15,
    [switch]$AsJson
)
$ErrorActionPreference = 'Stop'
$paths = @()
if ($Catalog -in @('all','cloud')) { $paths += Join-Path $PSScriptRoot 'free-for-dev/README.md' }
if ($Catalog -in @('all','selfhosted')) { $paths += Join-Path $PSScriptRoot 'awesome-selfhosted/README.md' }
if ($Catalog -in @('all','domains')) {
    $paths += Join-Path $PSScriptRoot 'FreeDomain/README.md'
    $paths += (Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'FreeDomain/documents') -Recurse -Filter '*.md').FullName
}
$terms = @($Query | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
if ($terms.Count -eq 0) { throw 'Provide at least one non-empty query.' }
$results = @(
    foreach ($path in $paths) {
        $heading = ''
        $lineNumber = 0
        foreach ($line in [IO.File]::ReadLines($path, [Text.Encoding]::UTF8)) {
            $lineNumber++
            if ($line -match '^#{1,6}\s+(.+)$') { $heading = $Matches[1] }
            $matched = $false
            foreach ($term in $terms) {
                if ($line.IndexOf($term, [StringComparison]::OrdinalIgnoreCase) -ge 0) { $matched = $true; break }
            }
            if ($matched) {
                [pscustomobject]@{ Catalog=[IO.Path]::GetRelativePath($PSScriptRoot,$path).Split([IO.Path]::DirectorySeparatorChar)[0]; File=$path; Line=$lineNumber; Section=$heading; Text=$line.Trim() }
            }
        }
    }
)
$selected = @($results | Select-Object -First $Limit)
if ($AsJson) { ConvertTo-Json -InputObject $selected -Depth 4 }
elseif ($selected.Count -eq 0) { Write-Output 'No matches. Try English terms or another catalog.' }
else { $selected | Format-List Catalog,Section,File,Line,Text }
