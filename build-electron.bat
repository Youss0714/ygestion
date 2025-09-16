@echo off
echo 🚀 Construction de l'application Electron pour Windows...

REM Step 1: Clean previous builds
echo 📦 Nettoyage des builds précédents...
if exist dist rmdir /s /q dist
if exist desktop\dist rmdir /s /q desktop\dist
if exist desktop\build rmdir /s /q desktop\build
mkdir dist

REM Step 2: Build the web application and server
echo 📦 Construction de l'application web et serveur...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Échec de la construction de l'application web
    exit /b 1
)
echo ✅ Application web construite avec succès

REM Step 3: Install desktop dependencies if needed
echo 📦 Vérification des dépendances Electron...
cd desktop
if not exist node_modules (
    echo 📦 Installation des dépendances Electron...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Échec de l'installation des dépendances Electron
        exit /b 1
    )
)

REM Step 4: Build the Electron app
echo 📦 Construction de l'application Electron...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Échec de la construction de l'application Electron
    exit /b 1
)
echo ✅ Application Electron construite avec succès

REM Step 5: Create the Windows executable
echo 📦 Création de l'exécutable Windows (.exe)...
call npm run dist:windows
if %ERRORLEVEL% neq 0 (
    echo ❌ Échec de la création de l'exécutable Windows
    exit /b 1
)

cd ..
echo ✅ 🎉 Exécutable Windows créé avec succès!
echo ✅ 📁 Fichiers disponibles dans: desktop/build/

REM List created files
if exist desktop\build (
    echo 📦 Fichiers créés:
    dir desktop\build\*.exe /b 2>nul
    dir desktop\build\*.AppImage /b 2>nul
    dir desktop\build\*.dmg /b 2>nul
)

echo.
echo ✅ ✨ Build terminé! Vous pouvez maintenant distribuer votre application.
pause