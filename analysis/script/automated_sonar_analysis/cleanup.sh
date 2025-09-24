#!/bin/bash

# Cleanup function: Stop and remove containers and network
cleanup() {
    echo "🧹 Cleaning up..."
    docker stop $SONAR_CONTAINER_NAME 2>/dev/null
    docker rm $SONAR_CONTAINER_NAME 2>/dev/null
    docker network rm $NETWORK_NAME 2>/dev/null
    echo "🧹 Cleanup complete."
}
