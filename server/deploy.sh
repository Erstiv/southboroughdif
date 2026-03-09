#!/bin/bash
# Auto-deploy script for southboroughdif
# Checks if GitHub has new commits, pulls and rebuilds if so.
# Run via cron every 2 minutes:
#   */2 * * * * /var/www/southboroughdif/server/deploy.sh >> /var/log/dif-deploy.log 2>&1

set -e

REPO_DIR="/var/www/southboroughdif"
LOCK_FILE="/tmp/dif-deploy.lock"

# Prevent overlapping runs
if [ -f "$LOCK_FILE" ]; then
    # Check if lock is stale (older than 10 minutes)
    if [ $(find "$LOCK_FILE" -mmin +10 | wc -l) -gt 0 ]; then
        rm -f "$LOCK_FILE"
    else
        exit 0
    fi
fi

cd "$REPO_DIR"

# Fetch latest from remote
git fetch origin main --quiet

# Check if local is behind remote
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    exit 0  # Already up to date
fi

# New commits found — deploy
touch "$LOCK_FILE"
echo "[$(date)] Deploying: $LOCAL -> $REMOTE"

git pull origin main --quiet
npm install --quiet
npm run build

echo "[$(date)] Deploy complete"
rm -f "$LOCK_FILE"
