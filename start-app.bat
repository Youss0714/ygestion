@echo off
echo 🚀 Démarrage automatique de YGestion...

REM Vérifier si le dossier dist existe, sinon construire l'application
if not exist dist (
    echo 📦 Construction de l'application...
    call npm run build
    if %ERRORLEVEL% neq 0 (
        echo ❌ Échec de la construction
        pause
        exit /b 1
    )
)

REM Construire l'application Electron
echo 📦 Compilation de l'application Electron...
cd desktop
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Échec de la compilation Electron
    pause
    exit /b 1
)

REM Démarrer l'application
echo 🎉 Lancement de l'application...
call npm run dev

pause