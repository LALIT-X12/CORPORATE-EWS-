# Production Dockerfile for Corporate Early-Warning System (EWS) Web Application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies for sqlite3 if needed
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies in production mode
RUN npm ci --only=production

# Copy application source code
COPY server/ ./server/
COPY client/ ./client/
COPY data/ ./data/

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose server port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start web application
CMD ["npm", "start"]
