# ─── Build Stage ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Önce bağımlılıkları kopyala (Docker cache optimizasyonu)
COPY package*.json ./
RUN npm ci --only=production=false

# Kaynak kodları kopyala ve build et
COPY . .

# API URL'i build-time'da inject et
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ─── Production Stage ──────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# React build çıktısını Nginx'e kopyala
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx konfigürasyonu (React Router için 404 → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
