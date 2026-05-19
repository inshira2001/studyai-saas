# Stage 1: Install ALL dependencies (needed for Next.js build)
FROM node:18-alpine AS deps
WORKDIR /app
COPY app/package.json ./
RUN npm install

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .
RUN npm run build

# Stage 3: Production runtime image (uses Next.js standalone output)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
