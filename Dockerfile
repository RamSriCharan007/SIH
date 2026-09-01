# ==============================================================================
# Dockerfile for Gramin Aarogya Sathi (Full-Stack Production Deployment)
# Suitable for: Google Cloud Run, Render, Railway, AWS ECS, DigitalOcean
# ==============================================================================

# STAGE 1: Build Frontend Assets
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# STAGE 2: Production Server Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend dist and public assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copy standalone portals
COPY --from=builder /app/developer-portal ./developer-portal
COPY --from=builder /app/hospital-portal ./hospital-portal

# Copy backend server code and database fixtures
COPY --from=builder /app/server ./server
COPY --from=builder /app/index.html ./index.html

# Expose default application port
EXPOSE 5000

# Start Express/Node backend server
CMD ["node", "server/server.js"]
