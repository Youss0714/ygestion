@echo off
echo 🧹 Script de nettoyage d'urgence pour récursion infinie...
echo.

REM Force deletion using robocopy (plus efficace pour les chemins longs)
echo 📁 Nettoyage du dossier dist/setup (récursion potentielle)...
if exist dist\setup (
    echo Suppression forcée avec robocopy...
    mkdir empty_temp_folder 2>nul
    robocopy empty_temp_folder dist\setup /mir /r:0 /w:0 >nul 2>&1
    rmdir empty_temp_folder 2>nul
    rmdir /s /q dist\setup 2>nul
    echo ✅ Dossier dist/setup supprimé
) else (
    echo ✅ Aucun dossier dist/setup trouvé
)

echo 📁 Nettoyage du nouveau dossier de build...
if exist desktop\build (
    rmdir /s /q desktop\build 2>nul
    echo ✅ Dossier desktop/build supprimé
) else (
    echo ✅ Aucun dossier desktop/build trouvé
)

echo 📁 Nettoyage des dossiers temporaires...
if exist dist (
    rmdir /s /q dist 2>nul
    echo ✅ Dossier dist supprimé
)

if exist desktop\dist (
    rmdir /s /q desktop\dist 2>nul
    echo ✅ Dossier desktop/dist supprimé
)

echo.
echo ✅ 🎉 Nettoyage terminé ! Vous pouvez maintenant reconstruire en sécurité.
echo.
echo 📝 Note: La configuration a été corrigée pour éviter la récursion future.
pause