#!/usr/bin/env bash
# Build book_shelf for same-origin and publish it on the Oracle VM (port 8003),
# proxying /api to the live book_core on port 8002.
#
# Requires: ORACLE_HOST, ORACLE_USER, and an SSH key (ORACLE_SSH_KEY or
# ~/.ssh/oracle_key). Run from the repo root after `pnpm install`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${ORACLE_HOST:?ORACLE_HOST is required}"
: "${ORACLE_USER:?ORACLE_USER is required}"

SSH_KEY="${ORACLE_SSH_KEY_FILE:-$HOME/.ssh/oracle_key}"
SSH=(ssh -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -i "$SSH_KEY")
SCP=(scp -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -i "$SSH_KEY")

echo "==> Building SPA (same-origin API)"
VITE_BOOK_CORE_API_BASE=same-origin pnpm build

echo "==> Syncing dist + nginx config to ${ORACLE_USER}@${ORACLE_HOST}"
"${SSH[@]}" "${ORACLE_USER}@${ORACLE_HOST}" 'mkdir -p ~/book_shelf/dist ~/book_shelf/deploy'
"${SCP[@]}" -r dist/. "${ORACLE_USER}@${ORACLE_HOST}:~/book_shelf/dist/"
"${SCP[@]}" deploy/nginx-shelf.conf "${ORACLE_USER}@${ORACLE_HOST}:~/book_shelf/deploy/nginx-shelf.conf"
"${SCP[@]}" deploy/docker-compose.shelf.yml "${ORACLE_USER}@${ORACLE_HOST}:~/book_shelf/docker-compose.yml"

echo "==> Bringing up shelf proxy on :8003"
"${SSH[@]}" "${ORACLE_USER}@${ORACLE_HOST}" 'bash -s' <<'REMOTE'
set -euo pipefail
cd ~/book_shelf
# host.docker.internal is not always present on Linux — add it via extra_hosts
# (compose file) and also ensure iptables allows 8003.
if command -v iptables >/dev/null; then
  sudo iptables -C INPUT -p tcp --dport 8003 -j ACCEPT 2>/dev/null \
    || sudo iptables -I INPUT -p tcp --dport 8003 -j ACCEPT
fi
docker compose up -d --force-recreate
docker compose ps
curl -fsS -m 5 http://127.0.0.1:8003/health
echo
curl -fsS -m 5 'http://127.0.0.1:8003/api/v1/projections/meta' | head -c 200
echo
REMOTE

echo "==> Live shelf: http://${ORACLE_HOST}:8003/"
