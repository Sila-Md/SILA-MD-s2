FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p sessions logs temp status_saver

# Install additional system dependencies if needed
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

# Expose port
EXPOSE 25680

# Set environment variables
ENV NODE_ENV=production
ENV PORT=25680

# Start the application
CMD ["npm", "start"]
