# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Use npm for Docker builds (avoids Yarn Berry compatibility issues)
COPY package.json ./
RUN npm install --legacy-peer-deps

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npx nest build && ls -la dist/ && test -f dist/main.js

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package.json and install production deps only
COPY package.json ./
RUN npm install --legacy-peer-deps --omit=dev

# Copy built output, prisma, and entrypoint
COPY --from=builder /app/dist ./dist
RUN echo "=== Production stage: verifying dist ===" && ls -la /app/dist/ && test -f /app/dist/main.js && echo "=== dist/main.js confirmed ==="
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY src/deploy/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["./entrypoint.sh"]
