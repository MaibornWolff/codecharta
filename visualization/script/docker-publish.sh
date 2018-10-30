#!/usr/bin/env bash

cd visualization

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push maibornwolff/codecharta-visualization