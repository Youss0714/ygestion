# YGestion

**SaaS de gestion commerciale et comptable multilingue pour l’Afrique de l’Ouest.**  
Built with Supabase, Drizzle ORM, and TypeScript.

---

## 📦 Fonctionnalités clés / Key Features

- 🧾 Facturation multilingue (Français, Anglais)
- 📊 Suivi des ventes, achats et stocks
- 💼 Gestion comptable conforme OHADA
- 🌍 Multi-devise et multi-entreprise
- 🔐 Architecture multi-tenant sécurisée
- 🧠 Génération automatique du schéma SQL avec Drizzle ORM
- 🚀 Déploiement cloud optimisé pour l’Afrique de l’Ouest (Paris region)

---

## ⚙️ Stack technique / Tech Stack

| Technologie     | Usage                                      |
|----------------|---------------------------------------------|
| Supabase        | Base de données PostgreSQL + Auth + Edge Functions |
| Drizzle ORM     | Génération et migration du schéma SQL      |
| TypeScript      | Typage strict et logique métier            |
| React + Vite    | Interface utilisateur rapide et moderne    |
| Tailwind CSS    | Design responsive et professionnel         |

---

## 🚀 Installation locale / Local Setup

```bash
# Cloner le dépôt
git clone https://github.com/Youss0714/fils
cd fils

# Installer les dépendances
npm install

# Lier le projet Supabase
supabase link --project-ref pciuxfjqtxbrpjyhbcxe

# Pousser le schéma vers Supabase
supabase db push

# Lancer l'application
npm run dev
🧩 Structure du projet / Project Structure


fils/
├── client/              # Interface utilisateur
├── server/              # API et logique métier
├── shared/              # Types et schéma Drizzle
├── supabase_schema.sql  # Schéma SQL complet
├── drizzle.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── package.json
└── README.md

Licence

Ce projet est sous licence MIT. This project is licensed under the MIT License.

✨ Auteur / Author
Développé par Youssouphafils – Fondateur de YGestion GitHub: Youss0714

