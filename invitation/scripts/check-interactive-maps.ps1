$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$violations = [System.Collections.Generic.List[string]]::new()

$componentPaths = @(
  "_shared/components/InteractiveMap.tsx",
  "themes/adat/kenangan/warm-narrative/src/components/shared/InteractiveMap.tsx",
  "themes/adat/kenangan/sacred-luxe/src/components/shared/InteractiveMap.tsx",
  "themes/adat/kisah/sinema-kisah/components/shared/InteractiveMap.tsx"
)

foreach ($relativePath in $componentPaths) {
  $path = Join-Path $root $relativePath
  if (-not (Test-Path -LiteralPath $path)) {
    $violations.Add("Missing interactive map component: $relativePath")
    continue
  }

  $content = Get-Content -Raw -LiteralPath $path
  foreach ($required in @(
    '"use client"',
    'data-map-activate',
    'data-prevent-snap',
    'pointerEvents: active ? "auto" : "none"',
    'setActive(true)',
    'setActive(false)'
  )) {
    if (-not $content.Contains($required)) {
      $violations.Add("Missing '$required' in $relativePath")
    }
  }
}

$eventPaths = @(
  "themes/adat/kenangan/warm-narrative/src/components/sections/EventSection.tsx",
  "themes/adat/kenangan/sacred-luxe/src/components/sections/EventSection.tsx",
  "themes/adat/kisah/sinema-kisah/components/slides/EventSlide.tsx"
)

foreach ($relativePath in $eventPaths) {
  $path = Join-Path $root $relativePath
  $content = Get-Content -Raw -LiteralPath $path

  if (-not $content.Contains("InteractiveMap")) {
    $violations.Add("Event view does not use InteractiveMap: $relativePath")
  }

  if ($content -match '<iframe\b') {
    $violations.Add("Direct iframe remains in event view: $relativePath")
  }
}

if ($violations.Count -gt 0) {
  Write-Host "Interactive map check failed:" -ForegroundColor Red
  $violations | Sort-Object -Unique | ForEach-Object {
    Write-Host " - $_" -ForegroundColor Red
  }
  exit 1
}

Write-Host "Interactive map check passed." -ForegroundColor Green
