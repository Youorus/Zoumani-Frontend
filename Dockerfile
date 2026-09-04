# syntax=docker/dockerfile:1.7

# ---------------------------------------------------------------------------
# Build multi-etapes : les dependances de build et les sources ne se retrouvent
# jamais dans l'image finale, qui ne contient que la sortie standalone de Next.
# ---------------------------------------------------------------------------
ARG NODE_VERSION=22-alpine

# --- Etape 1 : dependances -------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

# Installation reproductible a partir du lockfile uniquement : cette couche est
# reutilisee tant que package.json et package-lock.json ne changent pas.
COPY package.json package-lock.json ./
RUN npm ci

# --- Etape 2 : build -------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Les variables NEXT_PUBLIC_* sont figees dans le bundle JavaScript au build :
# elles doivent donc etre presentes ici, et pas seulement a l'execution.
ARG NEXT_PUBLIC_APP_URL
# Racine versionnee de l'API : c'est elle qui recoit les preinscriptions.
# Absente, le tunnel refuse d'envoyer plutot que de faire croire a un
# enregistrement — la vitrine, elle, reste entierement statique.
ARG NEXT_PUBLIC_API_URL
# Conteneur Google Tag Manager. Absent, aucun script tiers n'est
# charge et le bandeau de consentement ne s'affiche pas : demander
# l'autorisation de ne rien mesurer serait absurde.
ARG NEXT_PUBLIC_GTM_ID
# Identifiant de mesure GA4. Il ne sert QUE si NEXT_PUBLIC_GTM_ID est
# absent : charger GA4 par les deux chemins compterait chaque visite
# deux fois. Voir src/components/analytics/google-analytics.tsx.
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
# Projet Microsoft Clarity. Il n'implemente pas le Consent Mode : le
# script n'est demande qu'apres acceptation de la mesure d'audience.
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
# Pixel Meta. Il n'implemente pas le Consent Mode de Google : le script
# n'est demande qu'apres acceptation de la PUBLICITE — une categorie
# distincte de la mesure d'audience.
ARG NEXT_PUBLIC_META_PIXEL_ID
# Cle IndexNow. NON prefixee NEXT_PUBLIC_ : elle ne doit jamais entrer
# dans le paquet servi. Elle est lue ici pour ecrire public/{cle}.txt
# avant la construction, et au demarrage pour signer les envois.
ARG INDEXNOW_KEY
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_SEO_INDEXABLE
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_BING_SITE_VERIFICATION
ARG NEXT_PUBLIC_YANDEX_VERIFICATION
ARG DEPLOYMENT_ID

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_GTM_ID=${NEXT_PUBLIC_GTM_ID} \
    NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID} \
    NEXT_PUBLIC_CLARITY_PROJECT_ID=${NEXT_PUBLIC_CLARITY_PROJECT_ID} \
    NEXT_PUBLIC_META_PIXEL_ID=${NEXT_PUBLIC_META_PIXEL_ID} \
    INDEXNOW_KEY=${INDEXNOW_KEY} \
    NEXT_PUBLIC_WHATSAPP_NUMBER=${NEXT_PUBLIC_WHATSAPP_NUMBER} \
    NEXT_PUBLIC_SEO_INDEXABLE=${NEXT_PUBLIC_SEO_INDEXABLE} \
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=${NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} \
    NEXT_PUBLIC_BING_SITE_VERIFICATION=${NEXT_PUBLIC_BING_SITE_VERIFICATION} \
    NEXT_PUBLIC_YANDEX_VERIFICATION=${NEXT_PUBLIC_YANDEX_VERIFICATION} \
    DEPLOYMENT_ID=${DEPLOYMENT_ID} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build

# --- Etape 3 : execution ---------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

# ─────────────────────────────────────────────────────────────────────
# Aucune variable d'exécution, et c'est le point de cette image.
#
# Elle attendait autrefois `API_URL`, lue à chaque requête pour relayer
# les appels authentifiés. La vitrine ne parle plus au serveur : toutes
# ses pages sont pré-calculées à la construction, et le conteneur ne fait
# plus que les servir.
#
# Conséquence utile : ce site ne tombe pas quand l'API tombe, et il n'a
# aucun secret à recevoir. Il pourrait même être servi par un
# hébergement statique — l'image reste là pour rester déployable comme le
# reste de la plateforme.
# ─────────────────────────────────────────────────────────────────────
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Execution sans privileges : l'utilisateur node existe deja dans l'image.
RUN apk add --no-cache curl

# La sortie standalone embarque son propre serveur et le strict necessaire de
# node_modules. public/ et .next/static ne sont pas copies automatiquement.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3000

# Verifie que le serveur repond reellement, pas seulement que le process tourne.
# ─────────────────────────────────────────────────────────────────────
# La sonde interroge la page d'accueil, et non plus `/api/health`.
#
# Cette route est partie avec le reste du BFF quand la vitrine est devenue
# statique. Le conteneur démarrait correctement, la sonde tombait sur un
# 404, Swarm le déclarait « unhealthy » et **revenait à la version
# précédente** — un déploiement qui se disait réussi remettait en ligne
# l'ancien site, sans une ligne d'erreur ailleurs que dans `service ps`.
#
# `/` est le bon test ici : c'est la seule page du site, et si elle répond
# 200 il n'y a rien d'autre à vérifier.
# ─────────────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
