FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy ONLY backend package files first for better caching
COPY backend/package*.json ./

# Install backend dependencies robustly
RUN npm install

# Copy all the rest of the backend files inside the container
COPY backend/ ./

# Expose the correct application port globally for Render
EXPOSE 3000

# Command to run the application (from package.json scripts)
CMD ["npm", "start"]
