# Docker Commands Cheatsheet

Panduan lengkap Docker commands yang sering dipakai untuk proyek CC (Backend + Frontend + Database).

---

## 📋 Daftar Isi
1. [Build](#build)
2. [Run](#run)
3. [Process Status (ps)](#process-status-ps)
4. [Logs](#logs)
5. [Execute (exec)](#execute-exec)
6. [Stop](#stop)
7. [Remove (rm)](#remove-rm)
8. [Push](#push)
9. [Pull](#pull)
10. [Cleanup & Utilities](#cleanup--utilities)
11. [Quick Reference](#quick-reference)

---

## Build

Membangun Docker image dari Dockerfile.

### Syntax Umum
```bash
docker build -t <image-name>:<tag> <path-to-dockerfile>
```

### Contoh Proyek Ini

**Build Backend Image**
```bash
docker build -t notyourkisee/cloudapp-backend:v1 ./backend
```

**Build Frontend Image**
```bash
docker build -t notyourkisee/cloudapp-frontend:v1 ./frontend
```

**Build dengan Build Args**
```bash
docker build --build-arg NODE_ENV=production -t notyourkisee/cloudapp-frontend:v1 ./frontend
```

**Build tanpa Cache** (Force rebuild dari awal)
```bash
docker build --no-cache -t notyourkisee/cloudapp-backend:v1 ./backend
```

**Build Multiple Dockerfiles** (Untuk docker-compose)
```bash
# Build semua services yang ada di docker-compose.yml
docker-compose build

# Build service spesifik
docker-compose build backend
docker-compose build frontend

# Build dengan no-cache
docker-compose build --no-cache
```

---

## Run

Menjalankan container dari image.

### Syntax Umum
```bash
docker run [OPTIONS] <image-name>:<tag>
```

### Contoh Proyek Ini

**Run Backend Standalone** (Tanpa docker-compose)
```bash
docker run -d \
  --name api-backend \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://myuser:mypassword@db:5432/mydatabase \
  notyourkisee/cloudapp-backend:v1
```

**Run Frontend Standalone**
```bash
docker run -d \
  --name web-frontend \
  -p 3000:80 \
  notyourkisee/cloudapp-frontend:v1
```

**Run Database (PostgreSQL)**
```bash
docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15-alpine
```

**Run Semua Services Sekaligus** (Recommended)
```bash
docker-compose up
```

**Run di Background (Detached Mode)**
```bash
docker-compose up -d
```

**Run dengan Rebuild**
```bash
docker-compose up --build
```

**Run Service Spesifik**
```bash
docker-compose up backend
docker-compose up frontend
```

**Run dengan Scale** (Multiple Instances)
```bash
docker-compose up --scale backend=3
```

**Run Interactive Shell**
```bash
docker run -it notyourkisee/cloudapp-backend:v1 /bin/bash
```

---

## Process Status (ps)

Melihat container yang sedang berjalan atau statusnya.

### Syntax Umum
```bash
docker ps [OPTIONS]
```

### Contoh Proyek Ini

**Lihat Container yang Sedang Berjalan**
```bash
docker ps
```

**Output:**
```
CONTAINER ID   IMAGE                                      STATUS      PORTS
abc123def456   notyourkisee/cloudapp-backend:v1          Up 2 hours  0.0.0.0:8000->8000/tcp
xyz789uvw012   notyourkisee/cloudapp-frontend:v1         Up 2 hours  0.0.0.0:3000->80/tcp
pqr345stu678   postgres:15-alpine                         Up 2 hours  0.0.0.0:5432->5432/tcp
```

**Lihat Semua Container** (Termasuk yang Stopped)
```bash
docker ps -a
```

**Lihat Container dengan Filter**
```bash
# Backend container saja
docker ps --filter "name=api-backend"

# Container dengan status running
docker ps --filter "status=running"
```

**Lihat dengan Format Custom**
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Lihat Container dari docker-compose**
```bash
docker-compose ps
```

---

## Logs

Melihat output/error logs dari container.

### Syntax Umum
```bash
docker logs [OPTIONS] <container-name-or-id>
```

### Contoh Proyek Ini

**Lihat Logs Backend**
```bash
docker logs api-backend
```

**Lihat Logs Frontend**
```bash
docker logs web-frontend
```

**Lihat Logs Database**
```bash
docker logs postgres-db
```

**Lihat Real-time Logs** (Follow mode)
```bash
docker logs -f api-backend
docker logs -f web-frontend

# Kombinasi dengan tail
docker logs -f --tail 50 api-backend
```

**Lihat Logs dengan Timestamp**
```bash
docker logs -t api-backend
```

**Lihat Logs Container Terakhir**
```bash
docker logs $(docker ps -lq)
```

**Logs dari docker-compose**
```bash
docker-compose logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs --tail 100 backend
```

**Kombinasi Logs Multiple Services**
```bash
docker-compose logs -f backend frontend
```

---

## Execute (exec)

Menjalankan command di dalam container yang sedang berjalan.

### Syntax Umum
```bash
docker exec [OPTIONS] <container-name-or-id> <command>
```

### Contoh Proyek Ini

**Akses Terminal Backend**
```bash
docker exec -it api-backend /bin/bash
```

**Run Python Script di Backend**
```bash
docker exec api-backend python -c "print('Hello from container')"
```

**Check Database Connection dari Backend**
```bash
docker exec api-backend python -c "import sqlalchemy; print('DB OK')"
```

**Akses Database Langsung**
```bash
# Masuk ke PostgreSQL shell
docker exec -it postgres-db psql -U myuser -d mydatabase

# Jalankan query langsung
docker exec postgres-db psql -U myuser -d mydatabase -c "SELECT * FROM users;"
```

**Akses Frontend Container**
```bash
docker exec -it web-frontend /bin/sh

# Lihat file di dist (hasil build)
docker exec web-frontend ls -la /usr/share/nginx/html
```

**Check Health Status Backend**
```bash
docker exec api-backend curl -s http://localhost:8000/health
```

**Install Package di Container**
```bash
docker exec api-backend pip install requests
```

**Jalankan Command tanpa Interactive**
```bash
docker exec api-backend ls -la /app
```

**Jalankan dengan Environment Variable**
```bash
docker exec -e "MY_VAR=value" api-backend echo $MY_VAR
```

**Lihat Process Backend**
```bash
docker exec api-backend ps aux
```

---

## Stop

Menghentikan container yang sedang berjalan.

### Syntax Umum
```bash
docker stop [OPTIONS] <container-name-or-id>
```

### Contoh Proyek Ini

**Stop Backend**
```bash
docker stop api-backend
```

**Stop Frontend**
```bash
docker stop web-frontend
```

**Stop Database**
```bash
docker stop postgres-db
```

**Stop Semua Container**
```bash
docker stop $(docker ps -q)
```

**Stop Dengan Timeout** (Graceful shutdown)
```bash
docker stop -t 30 api-backend
```

**Stop Semua dari docker-compose**
```bash
docker-compose stop
```

**Stop Service Spesifik dari docker-compose**
```bash
docker-compose stop backend
docker-compose stop frontend
```

**Kombinasi: Stop Semua Service**
```bash
docker-compose stop backend frontend db
```

---

## Remove (rm)

Menghapus container yang sudah dihentikan atau image.

### Syntax Umum - Container
```bash
docker rm [OPTIONS] <container-name-or-id>
```

### Contoh Proyek Ini - Container

**Remove Backend Container**
```bash
docker rm api-backend
```

**Remove Frontend Container**
```bash
docker rm web-frontend
```

**Remove Database Container**
```bash
docker rm postgres-db
```

**Remove Semua Container yang Stopped**
```bash
docker rm $(docker ps -aq)
```

**Remove Container yang Sedang Berjalan** (Force)
```bash
docker rm -f api-backend
docker rm -f $(docker ps -q)
```

**Remove Container dan Volumes**
```bash
docker rm -v postgres-db
```

### Syntax Umum - Image
```bash
docker rmi [OPTIONS] <image-name>:<tag>
```

### Contoh Proyek Ini - Image

**Remove Backend Image**
```bash
docker rmi notyourkisee/cloudapp-backend:v1
```

**Remove Frontend Image**
```bash
docker rmi notyourkisee/cloudapp-frontend:v1
```

**Remove Semua Image yang Tidak Dipakai** (Dangling)
```bash
docker image prune -a
```

**Remove Image Force** (Meski sedang digunakan)
```bash
docker rmi -f notyourkisee/cloudapp-backend:v1
```

### docker-compose Remove

**Remove Semua Container dari Compose**
```bash
docker-compose down
```

**Remove Container dan Volumes**
```bash
docker-compose down -v
```

**Remove Container, Volumes, dan Images**
```bash
docker-compose down -v --rmi all
```

---

## Push

Upload image ke Docker Registry (Docker Hub, ECR, GCR, dll).

### Syntax Umum
```bash
docker push <registry>/<image-name>:<tag>
```

### Contoh Proyek Ini

**Login ke Docker Hub** (Pertama kali)
```bash
docker login
# Atau dengan username spesifik
docker login -u notyourkisee
```

**Push Backend Image**
```bash
docker push notyourkisee/cloudapp-backend:v1
```

**Push Frontend Image**
```bash
docker push notyourkisee/cloudapp-frontend:v1
```

**Push dengan Multiple Tags**
```bash
# Tag sebagai latest juga
docker tag notyourkisee/cloudapp-backend:v1 notyourkisee/cloudapp-backend:latest
docker push notyourkisee/cloudapp-backend:latest
```

**Push Semua Images**
```bash
docker push notyourkisee/cloudapp-backend:v1 && docker push notyourkisee/cloudapp-frontend:v1
```

**Push ke Registry Lain** (AWS ECR, GCP, dll)
```bash
# AWS ECR
docker tag notyourkisee/cloudapp-backend:v1 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/cloudapp-backend:v1
docker push 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/cloudapp-backend:v1

# Google Container Registry
docker tag notyourkisee/cloudapp-backend:v1 gcr.io/my-project/cloudapp-backend:v1
docker push gcr.io/my-project/cloudapp-backend:v1
```

**Logout dari Docker Hub**
```bash
docker logout
```

---

## Pull

Download image dari Docker Registry.

### Syntax Umum
```bash
docker pull <registry>/<image-name>:<tag>
```

### Contoh Proyek Ini

**Pull Backend Image**
```bash
docker pull notyourkisee/cloudapp-backend:v1
```

**Pull Frontend Image**
```bash
docker pull notyourkisee/cloudapp-frontend:v1
```

**Pull Database Image**
```bash
docker pull postgres:15-alpine
```

**Pull dengan Latest Tag**
```bash
docker pull notyourkisee/cloudapp-backend:latest
```

**Pull dari Registry Lain**
```bash
# AWS ECR
docker pull 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/cloudapp-backend:v1

# Google Container Registry
docker pull gcr.io/my-project/cloudapp-backend:v1
```

**Pull dan Run Langsung**
```bash
docker run -d \
  --name api-backend \
  -p 8000:8000 \
  notyourkisee/cloudapp-backend:v1
```

---

## Cleanup & Utilities

Membersihkan dan mengelola Docker resources.

### Prune (Hapus yang Tidak Terpakai)

**Hapus Semua Unused Images, Containers, Networks**
```bash
docker system prune
```

**Prune dengan Volume**
```bash
docker system prune -a --volumes
```

**Hapus Dangling Volumes**
```bash
docker volume prune
```

**Hapus Unused Networks**
```bash
docker network prune
```

### Inspect & Info

**Lihat Detail Container**
```bash
docker inspect api-backend
docker inspect api-backend | grep -i "Error"
```

**Lihat Detail Image**
```bash
docker inspect notyourkisee/cloudapp-backend:v1
```

**Lihat Docker Disk Usage**
```bash
docker system df
```

**Lihat Network Container**
```bash
docker network ls
docker network inspect bridge
```

### Copy File

**Copy File dari Container ke Host**
```bash
docker cp api-backend:/app/logs.txt ./logs.txt
```

**Copy File dari Host ke Container**
```bash
docker cp ./config.py api-backend:/app/config.py
```

### Rename

**Rename Container**
```bash
docker rename api-backend api-backend-old
```

### Stats & Monitoring

**Lihat Resource Usage Real-time**
```bash
docker stats

# Spesifik container
docker stats api-backend web-frontend

# Tanpa streaming (snapshots)
docker stats --no-stream
```

**Lihat Event (Log Aktivitas Docker)**
```bash
docker events
docker events --filter "container=api-backend"
```

---

## Quick Reference

### Workflow Komplit untuk Proyek Ini

**1. Development: Build & Run**
```bash
# Build dan jalankan semua services
docker-compose up --build

# Atau dengan detached mode
docker-compose up -d --build
```

**2. Development: Lihat Logs**
```bash
# Real-time logs semua services
docker-compose logs -f

# Logs backend saja
docker-compose logs -f backend
```

**3. Development: Debug**
```bash
# Akses backend shell
docker exec -it api-backend /bin/bash

# Lihat database
docker exec -it postgres-db psql -U myuser -d mydatabase

# Check health
docker exec api-backend curl -s http://localhost:8000/health
```

**4. Deployment: Build Final Images**
```bash
docker build -t notyourkisee/cloudapp-backend:v1 ./backend
docker build -t notyourkisee/cloudapp-frontend:v1 ./frontend
```

**5. Deployment: Push ke Registry**
```bash
docker push notyourkisee/cloudapp-backend:v1
docker push notyourkisee/cloudapp-frontend:v1
```

**6. Production: Pull & Run**
```bash
docker-compose up -d
```

**7. Maintenance: Stop & Clean**
```bash
# Stop semua
docker-compose down

# Clean semuanya termasuk volumes
docker-compose down -v

# System prune
docker system prune -a --volumes
```

### Troubleshooting Commands

```bash
# Container dalam kondisi tidak baik
docker restart api-backend

# Remove dan jalankan ulang
docker rm -f api-backend
docker run -d --name api-backend ... notyourkisee/cloudapp-backend:v1

# Lihat error detail
docker logs api-backend | grep -i "error"

# Check port sudah dipakai
lsof -i :8000
lsof -i :3000
lsof -i :5432

# Remove dangling images
docker image prune -a -f
```

### Environment Setup Singkat

```bash
# Clone dan setup
git clone <repo>
cd <repo>

# Build all
docker-compose build

# Run all
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs

# Development
docker-compose logs -f

# Stop
docker-compose down
```

---

## 💡 Tips & Tricks

1. **Alias for Shorter Commands:**
   ```bash
   alias dc='docker-compose'
   alias dps='docker ps'
   alias dlogs='docker logs -f'
   ```

2. **Check Container Startup Time:**
   ```bash
   docker stats api-backend --no-stream
   ```

3. **Export Container as Image:**
   ```bash
   docker commit api-backend notyourkisee/cloudapp-backend:v1
   ```

4. **Port Forwarding from Remote Server:**
   ```bash
   docker run -p 0.0.0.0:8000:8000 notyourkisee/cloudapp-backend:v1
   ```

5. **Run Multiple Versions:**
   ```bash
   docker run -d -p 8001:8000 --name api-v1 notyourkisee/cloudapp-backend:v1
   docker run -d -p 8002:8000 --name api-v2 notyourkisee/cloudapp-backend:v2
   ```

---

## 📚 Referensi Resmi
- [Docker Official Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file)
- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli)
