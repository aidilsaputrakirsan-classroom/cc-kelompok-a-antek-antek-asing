# Docker Commands Cheat Sheet

Panduan cepat perintah Docker yang sering dipakai untuk proyek ini.

## Build

- Build backend image:
	`docker build -t notyourkisee/cloudapp-backend:v1 ./backend`
- Build frontend image:
	`docker build -t notyourkisee/cloudapp-frontend:v1 ./frontend`

## Run

- Run backend (detached):
	`docker run -d --name backend -p 8000:8000 --env-file backend/.env notyourkisee/cloudapp-backend:v1`
- Run frontend (detached):
	`docker run -d --name frontend -p 3000:80 notyourkisee/cloudapp-frontend:v1`

## Observe

- Lihat container aktif: `docker ps`
- Lihat semua container: `docker ps -a`
- Lihat logs backend: `docker logs backend`
- Follow logs backend: `docker logs -f backend`
- Masuk ke container backend: `docker exec -it backend sh`
- Cek status health backend: `docker inspect --format='{{.State.Health.Status}}' backend`

## Stop dan Remove

- Stop container: `docker stop backend frontend`
- Remove container: `docker rm backend frontend`

## Docker Hub

- Login: `docker login`
- Push backend image: `docker push notyourkisee/cloudapp-backend:v1`
- Push frontend image: `docker push notyourkisee/cloudapp-frontend:v1`
- Pull backend image: `docker pull notyourkisee/cloudapp-backend:v1`
- Pull frontend image: `docker pull notyourkisee/cloudapp-frontend:v1`