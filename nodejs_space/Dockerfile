# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY prisma ./prisma
RUN yarn prisma generate

COPY . .
RUN yarn build

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/main.js"]
