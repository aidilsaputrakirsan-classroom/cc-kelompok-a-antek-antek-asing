# Stage 1: Build aplikasi React/Vite
FROM node:20-bookworm-slim AS build-stage
WORKDIR /app

ARG VITE_API_URL
ARG VITE_SPLINE_SCENE_URL
ARG VITE_SPLINE_SCENE_URL_REGISTER
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SPLINE_SCENE_URL=$VITE_SPLINE_SCENE_URL
ENV VITE_SPLINE_SCENE_URL_REGISTER=$VITE_SPLINE_SCENE_URL_REGISTER

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serving dengan Nginx
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html


# --- TAMBAHKAN 1 BARIS INI BOSS! ---
# Timpa konfigurasi bawaan Nginx dengan konfigurasi cerdas buatan kita
COPY nginx.conf /etc/nginx/conf.d/default.conf
# -----------------------------------

    
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]