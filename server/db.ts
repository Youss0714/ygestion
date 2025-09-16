// server/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import dotenv from 'dotenv';

// Charge le bon fichier .env selon l'environnement
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? './.env.production' : './.env',
});

// Vérification stricte
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  throw new Error('❌ DATABASE_URL must be set. Did you forget to configure .env?');
}

// Connexion PostgreSQL
const client = postgres(DATABASE_URL, { ssl: 'require' }); // utile pour Supabase
export const db = drizzle(client, { schema });
