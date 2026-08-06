# FigureReady

## Objectif

Transformer un fichier Excel en figure scientifique publication-ready en quelques secondes.

## Utilisateurs cibles

- Doctorants
- Postdocs
- Chercheurs
- Ingénieurs R&D

## Vision

L'utilisateur charge un fichier Excel et obtient une figure propre, prête pour publication,
sans passer par des dizaines de paramètres Origin ou Prism.

## Stack

- Next.js (App Router, TypeScript)
- Recharts pour le rendu des graphiques
- SheetJS (`xlsx`) pour la lecture des fichiers Excel
- `html-to-image` pour l'export PNG
- Tailwind CSS
- Neon Postgres (`@neondatabase/serverless`) — entitlement uniquement
- `jose` — JWT pour les sessions HTTP-only
- Resend — emails magic link
- Polar — paiement et webhooks

## Architecture serveur (validée)

- **Authentification passwordless** : magic links par email uniquement (Resend)
- **Base de données** : Neon Postgres, schéma minimal (`users`, `subscriptions`, `magic_links`)
- **Sessions** : JWT signé dans un cookie HTTP-only, durée 30 jours
- **Entitlement** : vérifié côté serveur via `GET /api/auth/me`
- **Achat** : `POST /api/checkout/confirm` crée user + subscription `pending_confirmation` + cookie de session
- **Webhook Polar** : transition `pending_confirmation` → `active` ; synchronise annulations/révocations
- **Magic link** : flux de récupération si cookie expiré ou navigateur changé (`GET /auth/verify?token=xxx`)

## Règles de sécurité (non négociables)

- Ne jamais exposer les clés Polar au navigateur.
- `isProUser()` lit uniquement le cache serveur (`/api/auth/me`) — jamais localStorage.
- Ne jamais accorder Pro sans vérification serveur.
- Les cookies de session sont `HttpOnly; Secure; SameSite=Lax`.

## Fonctionnalités autorisées

- Upload Excel, graphiques, export PNG/SVG/PDF
- Authentification passwordless par magic link
- Abonnements Polar (mensuel / annuel)
- Base de données Neon (schéma minimal)
- Analytics GA4 (tracking funnel existant)

## Fonctionnalités interdites

- OAuth social (Google, GitHub, etc.)
- Mots de passe
- Dashboard administrateur
- IA conversationnelle
- Multi-tenancy / organisations
- ORM complexe (Prisma, Drizzle) — SQL brut uniquement

## Règles importantes

- **Priorité absolue : qualité visuelle des figures.** Tout choix de style, police,
  épaisseur ou couleur doit viser un rendu publication-ready (Nature, ACS, etc.).
- **Priorité secondaire : simplicité d'utilisation.** Le flux doit rester en 3 étapes
  (upload → configuration → export), sans paramètres superflus.
- Toujours proposer un plan avant toute modification importante et attendre la validation
  de l'utilisateur.
- Ne jamais ajouter de fonctionnalités complexes sans validation explicite.
