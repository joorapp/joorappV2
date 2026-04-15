# Stage 1 — build Vite app
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Public URL the browser uses to call the API (must match nginx /api/ proxy + TLS host)
ARG VITE_API_BASE_URL
ARG VITE_API_TIMEOUT=10000

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT}

RUN npm run build

# Stage 2 — static assets + SPA fallback
FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
