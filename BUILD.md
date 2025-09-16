# Guide de Build YGestion

## Scripts de Build Disponibles

### 🚀 Build Global Complet

Compile frontend, backend ET application Electron :

```bash
node build.js
```

### ⚡ Build Rapide

Compile uniquement frontend + backend (sans Electron) :

```bash
node quick-build.js
```

### 🐧 Alternative Shell (Linux/macOS)
```bash
./build.sh
```

### 🎯 Builds Individuels

Si vous souhaitez compiler seulement une partie :

#### Frontend uniquement
```bash
npx vite build
```

#### Backend uniquement  
```bash
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

#### Electron uniquement
```bash
cd desktop && npm run build
```

## Structure de Sortie

Après compilation, le dossier `dist/` contiendra :

```
dist/
├── public/              # Frontend React compilé
│   ├── index.html      # Page principale
│   ├── assets/         # CSS, JS, images
│   └── ...
├── index.js            # Backend Express compilé
├── electron/           # Application Electron
│   ├── main.js        # Processus principal Electron
│   ├── splash.html    # Écran de démarrage
│   └── ...
└── version.json        # Informations de build
```

## Démarrage en Production

### Application Web
```bash
npm start
```
*Démarre le serveur Express en production*

### Application Desktop
```bash
cd desktop && npm start
```
*Lance l'application Electron*

## Développement

Pour le développement, utilisez :
```bash
npm run dev
```

## Prérequis

- Node.js 18+ 
- npm ou yarn
- Dépendances installées (`npm install`)

## Dépannage

### Erreur de permissions (Linux/macOS)
```bash
chmod +x build.sh
```

### Dossier dist non vide
Les scripts nettoient automatiquement le dossier avant compilation.

### Erreur Electron
Vérifiez que toutes les dépendances sont installées dans le dossier `desktop/` :
```bash
cd desktop && npm install
```