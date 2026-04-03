#!/bin/bash

set -e

ACTION=${1:-help}
BACKEND_IMAGE="notyourkisee/cloudapp-backend:v1"
FRONTEND_IMAGE="notyourkisee/cloudapp-frontend:v1"

case "$ACTION" in
  build)
    echo "[docker.sh] Building backend image..."
    docker build -t "$BACKEND_IMAGE" ./backend

    echo "[docker.sh] Building frontend image..."
    docker build -t "$FRONTEND_IMAGE" ./frontend
    ;;

  run)
    echo "[docker.sh] Running backend container..."
    docker rm -f backend >/dev/null 2>&1 || true
    docker run -d --name backend -p 8000:8000 --env-file backend/.env "$BACKEND_IMAGE"

    echo "[docker.sh] Running frontend container..."
    docker rm -f frontend >/dev/null 2>&1 || true
    docker run -d --name frontend -p 3000:80 "$FRONTEND_IMAGE"
    ;;

  push)
    echo "[docker.sh] Pushing backend image..."
    docker push "$BACKEND_IMAGE"

    echo "[docker.sh] Pushing frontend image..."
    docker push "$FRONTEND_IMAGE"
    ;;

  clean)
    echo "[docker.sh] Stopping and removing containers..."
    docker rm -f frontend backend frontend-test backend-health-test >/dev/null 2>&1 || true

    echo "[docker.sh] Removing dangling images..."
    docker image prune -f
    ;;

  help|*)
    echo "Usage: ./scripts/docker.sh [build|run|push|clean]"
    ;;
esac
