#!/bin/bash

# Script de build global pour YGestion
# Compile le frontend, backend et application Electron

echo "🚀 Début du build global YGestion..."

# Nettoyer le dossier dist
echo "🧹 Nettoyage du dossier dist..."
rm -rf dist
mkdir -p dist

# 1. Build du frontend (React + Vite)
echo "🎨 Build du frontend..."
npm run build:frontend() {
  vite build
}

# Vérifier si vite build existe dans package.json, sinon utiliser vite directement
if npm run | grep -q "build"; then
  # Utiliser le script existant
  vite build
else
  vite build
fi

if [ $? -eq 0 ]; then
  echo "✅ Frontend compilé avec succès"
else
  echo "❌ Erreur lors de la compilation du frontend"
  exit 1
fi

# 2. Build du backend (Express + TypeScript)
echo "🔧 Build du backend..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

if [ $? -eq 0 ]; then
  echo "✅ Backend compilé avec succès"
else
  echo "❌ Erreur lors de la compilation du backend"
  exit 1
fi

# 3. Build du processus Electron
echo "⚡ Build du processus Electron..."
cd desktop
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Processus Electron compilé avec succès"
  cd ..
else
  echo "❌ Erreur lors de la compilation du processus Electron"
  cd ..
  exit 1
fi

# 4. Copier les assets nécessaires
echo "📁 Copie des assets..."

# Copier le splash.html vers dist/electron pour Electron
cp desktop/splash.html dist/electron/ 2>/dev/null || echo "⚠️  splash.html non trouvé, ignoré"

# Créer un fichier de version
echo "{\"version\": \"1.0.0\", \"buildDate\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > dist/version.json

echo ""
echo "🎉 Build global terminé avec succès !"
echo ""
echo "📦 Structure de sortie :"
echo "  dist/"
echo "  ├── public/          # Frontend compilé (React)"
echo "  ├── index.js         # Backend compilé (Express)"
echo "  ├── electron/        # Processus Electron compilé"
echo "  └── version.json     # Informations de build"
echo ""
echo "🚀 Pour démarrer :"
echo "  • Production web: npm start"
echo "  • Application Electron: npm run start:electron"
echo ""