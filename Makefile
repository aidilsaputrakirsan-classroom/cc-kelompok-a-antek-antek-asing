.PHONY: up build down clean restart logs logs-auth logs-item logs-gateway logs-frontend \
        ps health shell-auth shell-item shell-auth-db shell-item-db dev dev-down prod status

# ==================== START / STOP ====================

# Start semua services (tanpa rebuild)
up:
	docker compose up -d

# Development mode: hot-reload backend + port debug terekspos (tanpa cloudflared)
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Stop development mode
dev-down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Production mode eksplisit (base + env production yang ditegaskan)
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Build ulang semua images + start
build:
	docker compose up --build -d

# Stop & remove containers (volumes tetap)
down:
	docker compose down

# Stop, remove containers, DAN hapus volumes (⚠️ semua data hilang!)
clean:
	docker compose down -v
	docker system prune -f

# Restart semua services
restart:
	docker compose restart

# ==================== LOGS ====================

# Logs semua services (follow)
logs:
	docker compose logs -f

# Logs Auth Service saja
logs-auth:
	docker compose logs -f auth-service

# Logs Item Service saja
logs-item:
	docker compose logs -f item-service

# Logs API Gateway saja
logs-gateway:
	docker compose logs -f gateway

# Logs Frontend saja
logs-frontend:
	docker compose logs -f frontend

# ==================== STATUS ====================

# Status semua containers
ps:
	docker compose ps

# Test gateway health endpoint
health:
	curl -s http://localhost/health | python -m json.tool

# Ringkasan status: container + health semua service via gateway
status:
	docker compose ps
	@echo "--- gateway ---"
	@curl -s http://localhost/health || echo "gateway unreachable"
	@echo ""
	@echo "--- auth-service ---"
	@curl -s http://localhost/auth/health || echo "auth-service unreachable"
	@echo ""
	@echo "--- item-service ---"
	@curl -s http://localhost/items/health || echo "item-service unreachable"
	@echo ""

# ==================== SHELL ACCESS ====================

# Shell ke dalam auth-service
shell-auth:
	docker compose exec auth-service bash

# Shell ke dalam item-service
shell-item:
	docker compose exec item-service bash

# Akses auth database (psql)
shell-auth-db:
	docker compose exec auth-db psql -U postgres -d auth_db

# Akses item database (psql)
shell-item-db:
	docker compose exec item-db psql -U postgres -d item_db
