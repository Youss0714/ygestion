#!/bin/bash

echo "🧹 Nettoyage du dépôt..."

rm -f cookies.txt
rm -f replit.md
rm -f components.json
rm -rf attached_assets

echo "✅ Fichiers supprimés."

echo -e "\n# Nettoyage Replit\ncookies.txt\nreplit.md\ncomponents.json\nattached_assets/" >> .gitignore

echo "✅ .gitignore mis à jour."
