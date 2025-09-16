# Scripts de Build YGestion

## ✅ Configuration Terminée

Votre projet YGestion dispose maintenant d'un système de build complet :

### 📦 Scripts Disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| **Build Global** | `node build.js` | Compile tout : frontend + backend + Electron |
| **Build Rapide** | `node quick-build.js` | Compile seulement web (frontend + backend) |
| **Build Shell** | `./build.sh` | Alternative Linux/macOS du build global |

### 🎯 Structure de Sortie

```
dist/
├── public/              # Frontend React compilé
│   ├── index.html      # Page principale
│   ├── assets/         # CSS, JS minifiés
│   └── ...
├── index.js            # Backend Express compilé (145kb)
├── electron/           # Application Electron
│   ├── main.js        # Processus principal
│   ├── splash.html    # Écran de démarrage
│   └── ...
└── version.json        # Informations de build
```

### 🚀 Déploiement

- **Web Production** : `npm start` (démarre dist/index.js)
- **Application Desktop** : `cd desktop && npm start`
- **Développement** : `npm run dev` (mode live reload)

### ⚙️ Détails Techniques

- **Frontend** : Vite + React → `/dist/public/`
- **Backend** : esbuild + TypeScript → `/dist/index.js`
- **Desktop** : TypeScript → `/dist/electron/main.js`
- **Assets** : Copiés automatiquement
- **Version** : Générée avec horodatage

### 🔧 Personnalisation

Les scripts peuvent être modifiés dans :
- `build.js` - Build global Node.js
- `quick-build.js` - Build rapide
- `build.sh` - Version shell
- `BUILD.md` - Documentation complète

Votre système de build est maintenant prêt pour la production ! 🎉