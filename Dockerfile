# Use lightweight Node.js image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose the port Cloud Run will use
EXPOSE 8080

# Run the server
CMD ["node", "server.js"]
