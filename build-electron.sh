#!/bin/bash

echo "🚀 Construction de l'application Electron pour Windows..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📦 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Clean previous builds
print_status "Nettoyage des builds précédents..."
rm -rf dist/
rm -rf desktop/dist/
rm -rf desktop/build/
mkdir -p dist/

# Step 2: Build the web application and server
print_status "Construction de l'application web et serveur..."
if ! npm run build; then
    print_error "Échec de la construction de l'application web et serveur"
    exit 1
fi
print_success "Application web et serveur construits avec succès"

# Step 3: Install desktop dependencies if needed
print_status "Vérification des dépendances Electron..."
cd desktop
if [ ! -d "node_modules" ]; then
    print_status "Installation des dépendances Electron..."
    if ! npm install; then
        print_error "Échec de l'installation des dépendances Electron"
        exit 1
    fi
fi

# Step 4: Build the Electron app
print_status "Construction de l'application Electron..."
if ! npm run build; then
    print_error "Échec de la construction de l'application Electron"
    exit 1
fi
print_success "Application Electron construite avec succès"

# Step 5: Create the Windows executable
print_status "Création de l'exécutable Windows (.exe)..."
if ! npm run dist:windows; then
    print_error "Échec de la création de l'exécutable Windows"
    exit 1
fi

cd ..
print_success "🎉 Exécutable Windows créé avec succès!"
print_success "📁 Fichiers disponibles dans: desktop/build/"

# List created files
if [ -d "desktop/build" ]; then
    print_status "Fichiers créés:"
    ls -la desktop/build/ | grep -E '\.(exe|AppImage|dmg)$' || echo "Aucun fichier exécutable trouvé"
fi

echo ""
print_success "✨ Build terminé! Vous pouvez maintenant distribuer votre application."