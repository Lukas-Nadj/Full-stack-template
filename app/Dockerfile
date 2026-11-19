# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency files first for layer caching
COPY package*.json ./
RUN npm install

# Copy application code and build static assets
COPY . .
RUN npm run build

# Production stage using Nginx
FROM nginx:alpine

# Copy built files from build stage to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing & API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
