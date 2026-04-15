# JoorApp V2 — production API image
FROM node:22-alpine AS production

RUN apk add --no-cache tini

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Application source
COPY server.js ./
COPY src ./src
COPY scripts ./scripts

RUN mkdir -p /app/logs && chown node:node /app/logs

# Non-root user (node user exists in official Node images)
USER node

EXPOSE 3030

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
