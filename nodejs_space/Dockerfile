# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for Yarn Berry
RUN corepack enable

# Copy Yarn config and lockfile first for layer caching
COPY package.json yarn.lock ./

# Create a Docker-friendly .yarnrc.yml (override the platform-specific one)
RUN echo 'nodeLinker: node-modules' > .yarnrc.yml

# Install dependencies
RUN yarn install --immutable || yarn install

# Generate Prisma client
COPY prisma ./prisma
RUN yarn prisma generate

# Build the app
COPY . .
RUN yarn build

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built output and dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

EXPOSE 3000

# Entrypoint script: run migrations then start
COPY src/deploy/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]
