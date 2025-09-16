@echo off
echo 🚀 Construction de l'application YGestion Desktop pour Windows...

:: Configuration des couleurs
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:: Fonction pour afficher les messages colorés
echo %BLUE%📦 Nettoyage des builds précédents...%NC%
rmdir /s /q dist 2>nul
rmdir /s /q desktop\dist 2>nul
rmdir /s /q desktop\build 2>nul
mkdir dist 2>nul

echo %BLUE%📦 Construction de l'application web et serveur...%NC%
call npm run build
if %ERRORLEVEL% neq 0 (
    echo %RED%❌ Échec de la construction de l'application web%NC%
    pause
    exit /b 1
)
echo %GREEN%✅ Application web construite avec succès%NC%

echo %BLUE%🔧 Préparation des dépendances Electron...%NC%
cd desktop
call npm install
if %ERRORLEVEL% neq 0 (
    echo %RED%❌ Échec de l'installation des dépendances Electron%NC%
    pause
    exit /b 1
)

echo %BLUE%🔨 Construction de l'application Electron...%NC%
call npm run build
if %ERRORLEVEL% neq 0 (
    echo %RED%❌ Échec de la construction Electron%NC%
    pause
    exit /b 1
)

echo %BLUE%💻 Génération de l'exécutable Windows...%NC%
call npm run dist:windows
if %ERRORLEVEL% neq 0 (
    echo %RED%❌ Échec de la génération de l'exécutable%NC%
    pause
    exit /b 1
)

cd ..
echo %GREEN%🎉 Exécutable Windows créé avec succès!%NC%
echo %GREEN%📁 Fichiers disponibles dans: desktop\build\%NC%

echo %BLUE%📋 Fichiers générés:%NC%
if exist "desktop\build" (
    dir /b desktop\build\*.exe 2>nul
    if %ERRORLEVEL% neq 0 (
        echo %YELLOW%⚠️ Aucun fichier .exe trouvé%NC%
    )
) else (
    echo %YELLOW%⚠️ Dossier build non trouvé%NC%
)

echo.
echo %GREEN%✨ Build terminé! Vous pouvez maintenant distribuer votre application.%NC%
pause