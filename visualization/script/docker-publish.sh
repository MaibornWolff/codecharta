#!/usr/bin/env bash

cd visualization

# update docker hub repo name after verification
DOCKER_HUB_REPO=maibornwolff/codecharta-visualization
RELEASE_TAG=$DOCKER_HUB_REPO:$TRAVIS_TAG
LATEST_TAG=$DOCKER_HUB_REPO:latest

echo "Tagging docker release"
docker tag $DOCKER_HUB_REPO $RELEASE_TAG
docker tag $DOCKER_HUB_REPO $LATEST_TAG

echo "Publish at Docker Hub"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push $RELEASE_TAG
docker push $LATEST_TAG

