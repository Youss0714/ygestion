#!/usr/bin/env node

// Script de build rapide pour YGestion
// Build uniquement frontend + backend (sans Electron)

import { execSync } from 'child_process';
import { rmSync, mkdirSync, existsSync } from 'fs';

console.log('⚡ Build rapide YGestion (frontend + backend)...\n');

function runCommand(command, description) {
  try {
    console.log(`🔧 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} terminé\n`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur: ${description.toLowerCase()}`);
    return false;
  }
}

try {
  // Nettoyer uniquement les dossiers web
  console.log('🧹 Nettoyage...');
  if (existsSync('dist/public')) {
    rmSync('dist/public', { recursive: true, force: true });
  }
  if (existsSync('dist/index.js')) {
    rmSync('dist/index.js', { force: true });
  }
  console.log('✅ Nettoyage terminé\n');

  // Build frontend et backend
  if (!runCommand('npx vite build', 'Build frontend')) process.exit(1);
  if (!runCommand('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', 'Build backend')) process.exit(1);

  console.log('🎉 Build rapide terminé !\n');
  console.log('🚀 Démarrer: npm start');

} catch (error) {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
}