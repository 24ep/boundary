#!/bin/bash

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
ok() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err() { echo -e "${RED}❌ $1${NC}"; }

ensure_root_dir() {
  if [ ! -f "docker-compose.yml" ]; then
    err "Run from the repository root (docker-compose.yml not found)."
    exit 1
  fi
}

load_root_env() {
  if [ -f ".env" ]; then
    set -o allexport
    # shellcheck disable=SC1091
    . ./.env
    set +o allexport
  fi
}

cmd_start() {
  ensure_root_dir
  load_root_env
  info "Starting Supabase + Redis via Docker Compose..."
  docker-compose up -d supabase redis
  ok "Core services started."

  info "Starting backend (npm run dev)"
  ( cd backend && npm run dev & )

  info "Starting admin (npm run dev)"
  ( cd admin && npm run dev & )

  info "Starting mobile (npm start)"
  ( cd mobile && npm start & )

  ok "Dev environment starting. Use your terminals to view logs."
}

cmd_stop() {
  ensure_root_dir
  info "Stopping Docker services (Supabase, Redis)..."
  docker-compose down --remove-orphans
  ok "Docker services stopped. Stop any dev terminals for backend/admin/mobile manually."
}

cmd_db_setup() {
  ensure_root_dir
  load_root_env
  info "Applying schema/seed to Supabase (if present)..."
  if [ -f "supabase/schema.sql" ]; then
    docker-compose exec -T supabase psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/schema.sql || warn "Schema apply returned non-zero."
  else
    warn "supabase/schema.sql not found; skipping schema."
  fi
  if [ -f "supabase/seed.sql" ]; then
    docker-compose exec -T supabase psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/seed.sql || warn "Seed apply returned non-zero."
  else
    warn "supabase/seed.sql not found; skipping seed."
  fi
  ok "Database setup step completed."
}

cmd_deploy() {
  ensure_root_dir
  info "Minimal deploy: bringing up Supabase + Redis in detached mode..."
  docker-compose up -d supabase redis
  ok "Services up. Verify health: Supabase Studio http://localhost:54321"
}

usage() {
  cat <<EOF
Usage: ./scripts/bondarys.sh <command>

Commands:
  start        Start dev stack (Supabase+Redis, backend, admin, mobile)
  stop         Stop Docker services (Supabase, Redis)
  db:setup     Apply Supabase schema/seed if present
  deploy       Minimal deploy for Supabase + Redis
  help         Show this help
EOF
}

case "${1:-help}" in
  start) shift; cmd_start "$@" ;;
  stop) shift; cmd_stop "$@" ;;
  db:setup) shift; cmd_db_setup "$@" ;;
  deploy) shift; cmd_deploy "$@" ;;
  help|*) usage ;;
esac


