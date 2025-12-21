# Fix line endings for shell scripts
# Converts CRLF to LF for bash scripts

$scripts = @(
    "init-keycloak-db.sh",
    "init-test-db.sh"
)

foreach ($script in $scripts) {
    $path = Join-Path $PSScriptRoot $script
    if (Test-Path $path) {
        Write-Host "Fixing line endings for: $script"
        $content = Get-Content $path -Raw
        $content = $content -replace "`r`n", "`n"
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "✅ Fixed: $script"
    } else {
        Write-Host "⚠️  File not found: $script"
    }
}

Write-Host "`n✅ All scripts fixed. Line endings converted to LF (Unix format)."
