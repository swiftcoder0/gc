# Production Dockerfile for Gotham Collage Member Portal
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build client bundle
COPY . .
RUN npm run build

# Expose port (defaults to 5000 or process.env.PORT)
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server/index.js"]
