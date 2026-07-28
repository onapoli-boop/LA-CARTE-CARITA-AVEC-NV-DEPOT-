# Guide de déploiement — Carte de fidélité en marque blanche

Ce guide couvre deux choses :
- **Partie A** — préparer le template une seule fois (à faire une fois pour toutes)
- **Partie B** — la procédure à répéter pour **chaque nouveau commerçant**

---

## PARTIE A — Préparer le template (une seule fois)

### A.1 — Structure du projet Next.js

Crée le projet une fois, colle-y tous les fichiers générés, puis pousse-le sur un dépôt Git qui servira de **template**.

```bash
npx create-next-app@latest carte-fidelite --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd carte-fidelite
npm install @supabase/ssr @supabase/supabase-js
```

Copie ensuite dans le projet, en respectant l'arborescence :

```
app/            (toutes les pages : /, /login, /signup, /scan, /catalogue,
                 /gains, /activity, /profile, /admin/*, /auth/callback,
                 manifest.ts, layout.tsx, globals.css)
components/     (client/, admin/, auth/, providers/)
lib/            (supabase/, settings/, admin/, client/)
types/          (settings.ts)
middleware.ts
tailwind.config.ts
```

### A.2 — Fichier `netlify.toml` à la racine

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

> Netlify détecte automatiquement Next.js et installe ce plugin, mais l'expliciter évite les surprises.

### A.3 — `.gitignore` (vérifier que `.env.local` y est)

```
.env.local
.env*.local
node_modules
.next
```

**Ne jamais committer les clés Supabase.** Elles vont dans les variables d'environnement de Netlify, jamais dans Git.

### A.4 — Pousser le template sur Git

```bash
git init
git add .
git commit -m "Template carte de fidélité marque blanche"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/carte-fidelite-template.git
git push -u origin main
```

Ce dépôt est ton **modèle de référence**. Tu ne le déploies pas tel quel : tu le dupliques pour chaque client (voir Partie B).

---

## PARTIE B — Créer un nouveau commerçant (à répéter)

Exemple : « La Marée de Trouville ».

### B.1 — Dupliquer le template sur Git

Deux options :

**Option 1 — un dépôt par client (recommandé pour la vente)**
Sur GitHub, ouvre le dépôt template → bouton **« Use this template »** → crée `carte-fidelite-maree-trouville`.

**Option 2 — cloner en local**
```bash
git clone https://github.com/TON-COMPTE/carte-fidelite-template.git maree-trouville
cd maree-trouville
rm -rf .git && git init && git add . && git commit -m "init maree trouville"
# puis crée un nouveau repo GitHub et pousse dessus
```

### B.2 — Créer le projet Supabase du client

1. Sur [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Nom : `maree-trouville`, région **eu-west-3 (Paris)**, mot de passe DB fort (note-le)
3. Attends que le projet soit « Active healthy » (~2 min)

### B.3 — Appliquer le schéma

Dans le projet Supabase → **SQL Editor** → colle **tout** le contenu de `schema.sql` → **Run**.

Cela crée : toutes les tables, RLS, triggers, fonctions (roue, scan), et le bucket `avatars`.

### B.4 — Personnaliser puis exécuter le seed

Ouvre `seed.sql`, remplace les valeurs de la **section 1** par celles du client :

```sql
insert into public.business_settings (
  name, brand_word, brand_subword,
  primary_color, secondary_color, background_color, text_color,
  font_heading, font_body, points_label,
  welcome_bonus_points, scan_cooldown_minutes
) values (
  'La Marée de Trouville', 'LA MARÉE', 'DE TROUVILLE',
  '#2f6fb5', '#7fb0e0', '#0a1420', '#ffffff',
  'Cormorant Garamond', 'Inter', 'points',
  50, 60
);
```

Adapte aussi les paliers, le catalogue et les segments de roue plus bas dans le fichier.
Puis **SQL Editor → colle le seed → Run**.

### B.5 — Désactiver la confirmation email (optionnel mais pratique)

Supabase → **Authentication → Providers → Email** → décoche *« Confirm email »* si tu veux que le 1ᵉʳ compte (le gérant) soit actif immédiatement. Sinon, il devra valider par email.

### B.6 — Récupérer les clés pour Netlify

Supabase → **Project Settings → API** :
- **Project URL** → `https://xxxx.supabase.co`
- **Publishable / anon key** → `sb_publishable_...`

### B.7 — Déployer sur Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Choisis le dépôt GitHub du client (`carte-fidelite-maree-trouville`)
3. Build command et publish sont auto-détectés (grâce à `netlify.toml`)
4. **Avant le premier déploiement** → **Site configuration → Environment variables** → ajoute :

| Clé | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | l'URL Supabase du client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé publishable |
| `NEXT_PUBLIC_SITE_URL` | l'URL finale (ex : `https://maree-trouville.netlify.app` ou le domaine perso) |

5. **Deploy site** (2 à 4 min pour le premier build).

> ⚠️ Les variables `NEXT_PUBLIC_` sont injectées **au moment du build**. Si tu les changes après, il faut **redéployer** (Deploys → Trigger deploy).

### B.8 — Domaine personnalisé (si le client en a un)

Netlify → **Domain management → Add a domain** → suis les instructions :
- soit un **CNAME** `www` → `ton-site.netlify.app`
- soit un **A record** `@` → `75.2.60.5` (IP Netlify)

Netlify génère le certificat SSL (HTTps) automatiquement via Let's Encrypt.

Une fois le domaine actif, **mets à jour `NEXT_PUBLIC_SITE_URL`** dans les variables Netlify avec le domaine final, et redéploie.

Pense aussi à ajouter ce domaine dans Supabase → **Authentication → URL Configuration → Redirect URLs** (ex : `https://maree-trouville.fr/auth/callback`).

### B.9 — Créer le compte admin du gérant

Le **premier compte inscrit devient automatiquement admin** (trigger `handle_new_user`).

Demande au gérant d'aller sur `https://<domaine>/signup` et de créer son compte **en premier**. Il arrivera directement sur `/admin`.

> Toutes les inscriptions suivantes seront des comptes « client ».

### B.10 — Générer le QR imprimé (ta vente additionnelle)

C'est **toi** qui produis le support. Récupère le token du client :

Supabase → **SQL Editor** :
```sql
select scan_token from public.business_settings;
```

Le QR code doit pointer vers :
```
https://<domaine-du-client>/scan?token=<scan_token>
```

Génère le QR (n'importe quel générateur), imprime-le sur ton support (chevalet, autocollant…) et livre-le au client. Le gérant ne voit jamais ce token dans son interface.

---

## Récapitulatif express (nouveau client)

1. « Use this template » sur GitHub → nouveau repo
2. Nouveau projet Supabase (eu-west-3)
3. `schema.sql` → Run
4. Personnaliser `seed.sql` → Run
5. Netlify → importer le repo + 3 variables d'env → Deploy
6. Domaine perso + SSL + redirect URL Supabase
7. Le gérant s'inscrit en premier (= admin)
8. Tu génères le QR depuis `scan_token` et livres le support imprimé

Temps estimé : **15–20 min** par client une fois le coup de main pris.

---

## Mettre à jour tous les clients quand tu améliores le template

Quand tu corriges un bug ou ajoutes une fonctionnalité au template :

```bash
# dans le dépôt d'un client
git remote add template https://github.com/TON-COMPTE/carte-fidelite-template.git
git fetch template
git merge template/main --allow-unrelated-histories
git push
```

Netlify redéploie automatiquement à chaque `push`. Les migrations SQL éventuelles sont à repasser manuellement dans chaque projet Supabase (garde un dossier `migrations/` daté pour t'y retrouver).
