# Assets pour YGestion Desktop

## Icônes Requises

Pour une génération .exe optimale, placez les fichiers suivants dans ce dossier :

### Windows
- `icon.ico` - Icône principale (256x256 pixels recommandés)
- `installer.ico` - Icône pour l'installeur (optionnel)

### macOS
- `icon.icns` - Icône macOS (512x512 pixels)

### Linux
- `icon.png` - Icône Linux (512x512 pixels)

## Génération des Icônes

### À partir d'une image PNG :
```bash
# Installer imagemagick
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt install imagemagick

# Générer .ico
convert icon-source.png -resize 256x256 icon.ico

# Générer .icns (macOS uniquement)
iconutil -c icns icon.iconset/
```

### Outils en ligne recommandés :
- https://convertio.co/png-ico/
- https://cloudconvert.com/png-to-ico
- https://favicon.io/favicon-converter/

## Structure Recommandée
```
assets/
├── icon.ico          # Windows (256x256)
├── icon.icns         # macOS (512x512)
├── icon.png          # Linux (512x512)
├── installer.ico     # Windows installer (optionnel)
└── README.md         # Ce fichier
```

## Notes
- Les icônes améliorent l'apparence professionnelle de l'application
- Utilisez des formats optimisés pour chaque plateforme
- Testez l'apparence sur différentes résolutions d'écran