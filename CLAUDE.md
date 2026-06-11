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

## MVP actuel

- Upload d'un fichier `.xlsx`
- Sélection des colonnes X et Y
- Génération de graphiques : line, scatter, bar
- Styles : Nature, ACS, Clean (définis dans `lib/chartStyles.ts`)
- Export PNG (haute résolution) et SVG
- Une seule page, sans authentification, sans base de données

## Règles importantes

- **Priorité absolue : qualité visuelle des figures.** Tout choix de style, police,
  épaisseur ou couleur doit viser un rendu publication-ready (Nature, ACS, etc.).
- **Priorité secondaire : simplicité d'utilisation.** Le flux doit rester en 3 étapes
  (upload → configuration → export), sans paramètres superflus.
- Toujours proposer un plan avant toute modification importante et attendre la validation
  de l'utilisateur.
- Ne jamais ajouter de fonctionnalités complexes sans validation explicite.

## Fonctionnalités interdites pour le moment

- Authentification
- Paiement
- Base de données
- Backend complexe
- IA conversationnelle
- Multi-utilisateurs
- Dashboard administrateur

Le projet doit rester un MVP extrêmement simple : une page, zéro dépendance serveur,
zéro compte utilisateur.
