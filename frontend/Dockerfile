# Stage 1: Melakukan build aplikasi React di mesin lokal / non-docker (untuk menghindari OOM)
# Aplikasi harus di-build dengan: `cd frontend && npm run build` sebelum `docker compose up`

FROM nginx:stable-alpine
# Copy hasil build lokal ke dalam container nginx
COPY dist /usr/share/nginx/html
COPY public/avatars /usr/share/nginx/html/avatars

# Timpa konfigurasi bawaan Nginx dengan konfigurasi cerdas buatan kita
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]