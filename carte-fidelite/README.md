# Carte de fidélité digitale — Template marque blanche

Application PWA de fidélité pour commerçants (salons, restaurants, instituts…),
en **marque blanche** : un déploiement = un commerçant = une base Supabase.

Stack : **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Supabase**.

## Démarrage rapide (développement local)

```bash
npm install
cp .env.local.example .env.local   # puis renseigne tes clés Supabase
npm run dev
```

Ouvre http://localhost:3000

## Configuration Supabase (nouvelle base)

1. Crée un projet sur supabase.com
2. SQL Editor → exécute `schema.sql` (tables, RLS, triggers, fonctions, bucket avatars)
3. Personnalise puis exécute `seed.sql` (identité + couleurs + catalogue + roue du commerçant)
4. Renseigne l'URL et la clé publishable dans `.env.local`

## Variables d'environnement

| Clé | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publishable (anon) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (pour les liens de confirmation email) |

## Structure

```
app/                Pages (App Router)
  (client)          Ma carte, catalogue, gains, activité, profil, scan
  admin/            Back-office (branding, dashboard, catalogue, roue, tirages)
  auth/callback     Confirmation email
components/          Composants React (client / admin / auth / providers)
lib/                Accès données + Server Actions + clients Supabase
types/              Types partagés
schema.sql          Schéma complet à appliquer sur une nouvelle base
seed.sql            Données de démarrage à personnaliser par commerçant
```

## Points clés

- **Premier compte inscrit = admin** automatiquement.
- **Branding 100% dynamique** : couleurs, polices, nom → table `business_settings`,
  modifiables depuis l'admin sans toucher au code.
- **Roue anti-triche** : tirage calculé côté serveur (fonctions Postgres SECURITY DEFINER).
- **Scan salon** : QR imprimé pointant vers `/scan?token=<scan_token>`, cooldown réglable.

## Déploiement

Voir `GUIDE-DEPLOIEMENT.md` pour la procédure complète Git + Supabase + Netlify.
