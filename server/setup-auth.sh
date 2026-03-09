#!/bin/bash
# Setup basic auth for googloid.com DIF app
# Run on Filou as root: bash /var/www/southboroughdif/server/setup-auth.sh

set -e

# Prompt for password
read -sp "Enter password for DIF app (username will be 'dif'): " PASSWORD
echo

# Install htpasswd if needed
if ! command -v htpasswd &> /dev/null; then
    apt-get update && apt-get install -y apache2-utils
fi

# Create .htpasswd file
htpasswd -cb /etc/nginx/.htpasswd_dif dif "$PASSWORD"
echo "✅ Created /etc/nginx/.htpasswd_dif with user 'dif'"

# Backup current Nginx config
cp /etc/nginx/sites-available/googloid.com /etc/nginx/sites-available/googloid.com.bak
echo "✅ Backed up Nginx config"

# Check if auth_basic is already in the config
if grep -q "auth_basic" /etc/nginx/sites-available/googloid.com; then
    echo "⚠️  auth_basic already present in config — skipping insertion"
else
    # Add auth_basic inside the location / block
    sed -i '/location \/ {/a\        auth_basic "DIF Proposal - Restricted";\n        auth_basic_user_file /etc/nginx/.htpasswd_dif;' /etc/nginx/sites-available/googloid.com
    echo "✅ Added auth_basic to Nginx config"
fi

# Test and reload
nginx -t && systemctl reload nginx
echo "✅ Nginx reloaded — googloid.com now requires login (user: dif)"
echo ""
echo "To remove password protection later:"
echo "  sed -i '/auth_basic/d' /etc/nginx/sites-available/googloid.com"
echo "  nginx -t && systemctl reload nginx"
