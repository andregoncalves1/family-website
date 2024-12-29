# frontend/Dockerfile
# Step 1: Build Vue Application
FROM node:18-alpine as build

WORKDIR /app

# Copy only the package.json and package-lock.json for caching npm install
COPY package.json ./

# Install dependencies
RUN npm install

# Install specific dependencies
RUN npm install vue3-apexcharts --save && npm install vuetify@next

# Copy all files for the build
COPY . ./

# Build the Vue application
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Add custom Nginx configuration
COPY default.conf /etc/nginx/conf.d/

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
