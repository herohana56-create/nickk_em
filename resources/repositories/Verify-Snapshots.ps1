$ErrorActionPreference = 'Stop'
$checked = 0
$totalBytes = [long]0
foreach ($manifestPath in Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.manifest.json') {
    $manifest = Get-Content -LiteralPath $manifestPath.FullName -Raw -Encoding utf8 | ConvertFrom-Json
    $repoPath = Join-Path $PSScriptRoot $manifest.repository.Split('/')[-1]
    if (@(Get-ChildItem -LiteralPath $repoPath -File -Recurse -Force).Count -ne $manifest.verified_files) { throw ('File count mismatch: ' + $manifest.repository) }
    foreach ($file in $manifest.files) {
        $bytes = [IO.File]::ReadAllBytes((Join-Path $repoPath $file.path))
        $header = [Text.Encoding]::UTF8.GetBytes(('blob ' + $bytes.Length + [char]0))
        $hash = [Security.Cryptography.SHA1]::Create()
        try { $actual = [Convert]::ToHexString($hash.ComputeHash([byte[]]($header + $bytes))).ToLowerInvariant() } finally { $hash.Dispose() }
        if ($actual -ne $file.git_blob_sha1 -or $bytes.Length -ne $file.bytes) { throw ('Verification failed: ' + $file.path) }
        $checked++
        $totalBytes += $bytes.Length
    }
}
if ($checked -eq 0) { throw 'No snapshot files verified.' }
[pscustomobject]@{ VerifiedFiles=$checked; TotalBytes=$totalBytes; Status='PASS' }
