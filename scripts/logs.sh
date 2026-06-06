#!/bin/bash
COMMAND=$1
ARG=$2

if [ -z "$COMMAND" ]; then
    echo "Usage: ./scripts/logs.sh [all|errors|trace <id>|metrics]"
    exit 1
fi

case $COMMAND in
    all) docker compose logs -f auth-service item-service ;;
    errors) docker compose logs -f auth-service item-service | grep -E '"level":"ERROR"|"level":"CRITICAL"' ;;
    trace) docker compose logs -f auth-service item-service | grep "$ARG" ;;
    metrics)
        echo "=== AUTH SERVICE METRICS ==="
        curl -s http://localhost/auth/metrics | jq .
        echo -e "\n=== ITEM SERVICE METRICS ==="
        curl -s http://localhost/items/metrics | jq .
        ;;
    *) echo "Unknown command" ;;
esac
