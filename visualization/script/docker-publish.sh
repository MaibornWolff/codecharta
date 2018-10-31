#!/usr/bin/env bash

cd visualization

QNAME=maibornwolff/codecharta-visualization

GIT_TAG=$QNAME:$TRAVIS_COMMIT
LATEST_TAG=$QNAME:latest

if [[ $TRAVIS_TAG ]]; then
    RELEASE_TAG=$QNAME:$TRAVIS_TAG
    BUILD_TAG=$RELEASE_TAG.$TRAVIS_BUILD_NUMBER
fi

echo "tag docker image"

docker tag $QNAME $GIT_TAG
docker tag $QNAME $LATEST_TAG

if [[ $TRAVIS_TAG ]]; then
    echo "Tagging Release $TRAVIS_TAG"
    docker tag $QNAME $RELEASE_TAG
    docker tag $QNAME $BUILD_TAG
fi

echo "publish at docker hub"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push $GIT_TAG
docker push $LATEST_TAG

if [[ $TRAVIS_TAG ]]; then
    docker push $RELEASE_TAG
    docker push $BUILD_TAG
fi