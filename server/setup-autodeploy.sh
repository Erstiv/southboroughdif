#!/bin/bash
# Setup auto-deploy cron job for southboroughdif
# Run on Filou as root: bash /var/www/southboroughdif/server/setup-autodeploy.sh

set -e

DEPLOY_SCRIPT="/var/www/southboroughdif/server/deploy.sh"

# Make deploy script executable
chmod +x "$DEPLOY_SCRIPT"

# Add cron job (every 2 minutes) if not already present
CRON_LINE="*/2 * * * * $DEPLOY_SCRIPT >> /var/log/dif-deploy.log 2>&1"

if crontab -l 2>/dev/null | grep -q "dif-deploy"; then
    echo "⚠️  Cron job already exists — skipping"
else
    (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
    echo "✅ Cron job added — checks GitHub every 2 minutes"
fi

# Create log file
touch /var/log/dif-deploy.log
echo "✅ Log file: /var/log/dif-deploy.log"
echo ""
echo "To test manually: bash $DEPLOY_SCRIPT"
echo "To view logs: tail -f /var/log/dif-deploy.log"
echo "To remove: crontab -e (delete the dif-deploy line)"
