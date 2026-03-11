#!/bin/bash
# One-time setup: switch from static nginx to Express + nginx proxy
# Run on Hetzner as root:
#   bash /var/www/southboroughdif/server/setup-express.sh

set -e

echo "=== Setting up Southborough DIF Express server ==="

REPO_DIR="/var/www/southboroughdif"
cd "$REPO_DIR"

# 1. Install dependencies and build
echo ""
echo "1. Installing dependencies..."
npm install --quiet

echo "2. Building app..."
npm run build

# 2. Create data directory for boundary storage
echo "3. Creating data directory..."
mkdir -p "$REPO_DIR/data"

# 3. Install systemd service
echo "4. Installing systemd service..."
cp "$REPO_DIR/server/southboroughdif.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable southboroughdif
systemctl start southboroughdif

echo "   Express server started on port 3000"

# 4. Update nginx config
echo "5. Updating nginx config..."
cp "$REPO_DIR/server/nginx-southboroughdif.conf" /etc/nginx/sites-available/southboroughdif

# Enable the site
ln -sf /etc/nginx/sites-available/southboroughdif /etc/nginx/sites-enabled/southboroughdif

# Remove default nginx config if it's serving static files for this domain
# (keeping a backup just in case)
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "   Backing up default nginx config..."
    cp /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default.bak
fi

# Test nginx config
if nginx -t 2>/dev/null; then
    systemctl reload nginx
    echo "   Nginx reloaded with proxy config"
else
    echo "   WARNING: nginx config test failed!"
    echo "   Check: nginx -t"
    echo "   You may need to edit /etc/nginx/sites-available/southboroughdif"
    echo "   or remove conflicting server blocks."
fi

# 5. Verify
echo ""
echo "=== Setup Complete ==="
echo ""
echo "Checking status..."
echo "  Express: $(systemctl is-active southboroughdif)"
echo "  Nginx:   $(systemctl is-active nginx)"
echo ""
echo "Commands:"
echo "  View logs:     journalctl -u southboroughdif -f"
echo "  Restart:       systemctl restart southboroughdif"
echo "  Stop:          systemctl stop southboroughdif"
echo "  Deploy logs:   tail -f /var/log/dif-deploy.log"
echo ""
echo "The app should now be live at http://googloid.com"
