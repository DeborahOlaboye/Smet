# Smet Card Components - Multi-stage Docker Build

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the library (if build script exists)
RUN npm run build 2>/dev/null || echo "No build script found, skipping build"

# Development stage
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Install git and development tools
RUN apk add --no-cache git python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 smetuser

# Change ownership
RUN chown -R smetuser:nodejs /app
USER smetuser

EXPOSE 3000
EXPOSE 6006

# Default command for development
CMD ["npm", "run", "dev"]