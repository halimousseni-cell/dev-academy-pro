# syntax=docker/dockerfile:1

# ---- Stage 1: build ----
FROM node:20-alpine AS builder
WORKDIR /app

# argon2 needs to compile native bindings on Alpine (musl)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# ---- Stage 2: runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache python3 make g++ \
    && addgroup -S app && adduser -S app -G app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev \
    && npx prisma generate \
    && apk del python3 make g++ \
    && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && chown -R app:app /app
USER app

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
