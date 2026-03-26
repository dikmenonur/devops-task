# ─── Dependencies Stage ────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ─── Production Stage ──────────────────────────────────────────
FROM node:20-alpine AS production

# Güvenlik: root olmayan kullanıcı
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Bağımlılıkları ve kaynak kodu kopyala
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package*.json ./

USER nodeuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/index.js"]
