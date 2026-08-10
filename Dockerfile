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
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_SEO_INDEXABLE
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_BING_SITE_VERIFICATION
ARG NEXT_PUBLIC_YANDEX_VERIFICATION
ARG DEPLOYMENT_ID

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
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
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
