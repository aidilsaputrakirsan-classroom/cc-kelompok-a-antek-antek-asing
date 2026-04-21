# Stage 1: Build aplikasi React/Vite
FROM node:20-bookworm-slim AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serving dengan Nginx
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/public/avatars /usr/share/nginx/html/avatars

# --- TAMBAHKAN 1 BARIS INI BOSS! ---
# Timpa konfigurasi bawaan Nginx dengan konfigurasi cerdas buatan kita
COPY nginx.conf /etc/nginx/conf.d/default.conf
# -----------------------------------

    
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]