param(
  [Parameter(Position=0)] [string]$Command = "start"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Load-RootEnv {
  $envFile = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath '.env'
  if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
      if ($_ -and -not $_.StartsWith('#') -and $_.Contains('=')) {
        $parts = $_.Split('=',2)
        $key = $parts[0].Trim()
        $val = $parts[1]
        if ($key) { [System.Environment]::SetEnvironmentVariable($key,$val,[System.EnvironmentVariableTarget]::Process) }
      }
    }
  }
}

function Start-Stack {
  Load-RootEnv
  Write-Host "Starting Supabase + Redis..."
  docker-compose up -d supabase redis | Out-Null

  Write-Host "Starting backend (npm run dev) in new window..."
  Start-Process cmd -ArgumentList "/c","cd backend && npm run dev" -WindowStyle Normal

  Write-Host "Starting admin (npm run dev) in new window..."
  Start-Process cmd -ArgumentList "/c","cd admin && npm run dev" -WindowStyle Normal

  Write-Host "Starting mobile (npm start) in new window..."
  Start-Process cmd -ArgumentList "/c","cd mobile && npm start" -WindowStyle Normal

  Write-Host "✅ Stack starting. Check the opened terminals for logs."
}

function Stop-Stack {
  Write-Host "Stopping Docker services..."
  docker-compose down --remove-orphans | Out-Null
  Write-Host "✅ Docker services stopped. Close any dev terminals manually if needed."
}

function Db-Setup {
  Load-RootEnv
  Write-Host "Applying schema/seed if present..."
  $cid = (docker ps --filter "name=bondarys-supabase" --format "{{.ID}}")
  if (-not $cid) { Write-Host "Supabase is not running; starting it..."; docker-compose up -d supabase | Out-Null; Start-Sleep -Seconds 3; $cid = (docker ps --filter "name=bondarys-supabase" --format "{{.ID}}") }
  if ($cid) {
    Write-Host "Using temp postgres client to run /supabase/schema.sql and /supabase/seed.sql"
    docker run --rm --network bondarys_bondarys-network -v "$(Resolve-Path (Join-Path $PSScriptRoot '..' 'supabase'))":/supabase -e PGPASSWORD=$env:SUPABASE_DB_PASSWORD postgres:15-alpine sh -lc "apk add --no-cache postgresql-client >/dev/null; if [ -f /supabase/schema.sql ]; then psql -h bondarys-supabase -U postgres -d postgres -v ON_ERROR_STOP=1 -f /supabase/schema.sql; fi; if [ -f /supabase/seed.sql ]; then psql -h bondarys-supabase -U postgres -d postgres -v ON_ERROR_STOP=1 -f /supabase/seed.sql; fi" | Out-Null
    Write-Host "✅ Database setup completed"
  } else {
    Write-Host "❌ Could not find Supabase container"
  }
}

switch ($Command) {
  'start' { Start-Stack }
  'stop' { Stop-Stack }
  'db:setup' { Db-Setup }
  'deploy' { Load-RootEnv; docker-compose up -d supabase redis }
  default { Write-Host "Usage: powershell -File scripts/bondarys.ps1 [start|stop|db:setup|deploy]" }
}


