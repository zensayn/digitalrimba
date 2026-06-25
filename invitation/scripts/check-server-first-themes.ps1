$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$violations = [System.Collections.Generic.List[string]]::new()

$themePages = @(
  "themes/adat/kenangan/warm-narrative/src/app/page.tsx",
  "themes/adat/kenangan/sacred-luxe/src/app/page.tsx",
  "themes/adat/kisah/sinema-kisah/app/page.tsx",
  "_boilerplate/src/app/page.tsx"
)

foreach ($relativePath in $themePages) {
  $path = Join-Path $root $relativePath
  if (-not (Test-Path -LiteralPath $path)) {
    $violations.Add("Missing expected page: $relativePath")
    continue
  }

  $firstMeaningfulLine = Get-Content -LiteralPath $path |
    Where-Object { $_.Trim().Length -gt 0 } |
    Select-Object -First 1

  if ($firstMeaningfulLine -match '^[\"'']use client[\"''];?$') {
    $violations.Add("Client page boundary: $relativePath")
  }
}

$scanRoots = @(
  "themes/adat/kenangan/warm-narrative/src",
  "themes/adat/kenangan/sacred-luxe/src",
  "themes/adat/kisah/sinema-kisah/app",
  "themes/adat/kisah/sinema-kisah/components",
  "_shared",
  "_boilerplate/src",
  "scripts/sync-shared.ts"
)

$forbiddenPatterns = [ordered]@{
  "RimbaConfigProvider" = "Production config provider"
  "useInvitationConfig" = "Client config hook"
  "RIMBA_CONFIG_UPDATE" = "Studio config message"
  "RIMBA_TEMPLATE_READY" = "Studio ready message"
  "preview=1" = "Studio gallery preview"
}

foreach ($scanRoot in $scanRoots) {
  $path = Join-Path $root $scanRoot
  if (-not (Test-Path -LiteralPath $path)) {
    continue
  }

  $files = if ((Get-Item -LiteralPath $path).PSIsContainer) {
    Get-ChildItem -LiteralPath $path -Recurse -File |
      Where-Object { $_.Extension -in @(".ts", ".tsx", ".md") }
  } else {
    Get-Item -LiteralPath $path
  }

  foreach ($file in $files) {
    $content = Get-Content -Raw -LiteralPath $file.FullName
    $relativePath = $file.FullName.Substring($root.Length).TrimStart("\", "/")

    foreach ($entry in $forbiddenPatterns.GetEnumerator()) {
      if ($content.Contains($entry.Key)) {
        $violations.Add("$($entry.Value): $relativePath")
      }
    }
  }
}

$staticRevealSections = @(
  "themes/adat/kenangan/warm-narrative/src/components/sections/GreetingSection.tsx",
  "themes/adat/kenangan/warm-narrative/src/components/sections/CoupleSection.tsx",
  "themes/adat/kenangan/warm-narrative/src/components/sections/DressCodeSection.tsx",
  "themes/adat/kenangan/warm-narrative/src/components/sections/ClosingSection.tsx",
  "themes/adat/kenangan/sacred-luxe/src/components/sections/GreetingSection.tsx",
  "themes/adat/kenangan/sacred-luxe/src/components/sections/CoupleSection.tsx",
  "themes/adat/kenangan/sacred-luxe/src/components/sections/DressCodeSection.tsx",
  "themes/adat/kenangan/sacred-luxe/src/components/sections/ClosingSection.tsx"
)

foreach ($relativePath in $staticRevealSections) {
  $path = Join-Path $root $relativePath
  if (-not (Test-Path -LiteralPath $path)) {
    continue
  }

  $content = Get-Content -Raw -LiteralPath $path
  if ($content -match '\buseInView\b') {
    $violations.Add("Static reveal section uses useInView: $relativePath")
  }
}

if ($violations.Count -gt 0) {
  Write-Host "Server-first architecture check failed:" -ForegroundColor Red
  $violations | Sort-Object -Unique | ForEach-Object {
    Write-Host " - $_" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Server-first architecture check passed." -ForegroundColor Green
