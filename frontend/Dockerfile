# syntax=docker/dockerfile:1

# ---- Stage 1: build ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Le frontend appelle l'API via le même domaine (proxiée par nginx sous /api)
ENV VITE_API_URL=/api
RUN npm run build

# ---- Stage 2: runtime ----
FROM nginx:alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1
