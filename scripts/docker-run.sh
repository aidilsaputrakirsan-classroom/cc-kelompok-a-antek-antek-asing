#!/bin/bash

# ============================================================
# Script untuk menjalankan semua container secara manual
# ============================================================

ACTION=${1:-start}

case $ACTION in
  start)
    echo "🚀 Starting all containers..."

    # Create network
    docker network create cloudnet 2>/dev/null || true

    # Database
    echo "📦 Starting database..."
    docker run -d \
      --name db \
      --network cloudnet \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres123 \
      -e POSTGRES_DB=cloudapp \
      -p 5433:5432 \
      -v pgdata:/var/lib/postgresql/data \
      postgres:16-alpine

    # Wait for database to be ready (Simulasi wait-for-db.sh)
    echo "⏳ Waiting for database..."
    sleep 5

    # Backend
    echo "🐍 Starting backend..."
    docker run -d \
      --name backend \
      --network cloudnet \
      -e DATABASE_URL="postgresql://postgres:postgres123@db:5432/cloudapp" \
      -e ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173" \
      -p 8000:8000 \
      notyourkisee/cloudapp-backend:v2

    # Frontend
    echo "⚛️ Starting frontend..."
    docker run -d \
      --name frontend \
      --network cloudnet \
      -p 3000:80 \
      notyourkisee/cloudapp-frontend:v1

    echo ""
    echo "✅ All containers started!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8000"
    echo "   Database: localhost:5433"
    ;;

  stop)
    echo "🛑 Stopping all containers..."
    docker stop frontend backend db 2>/dev/null
    docker rm frontend backend db 2>/dev/null
    echo "✅ All containers stopped and removed."
    ;;

  status)
    echo "📊 Container Status:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    ;;

  logs)
    CONTAINER=${2:-backend}
    echo "📋 Logs for $CONTAINER:"
    docker logs -f $CONTAINER
    ;;

  *)
    echo "Usage: ./scripts/docker-run.sh [start|stop|status|logs [container]]"
    ;;
esac