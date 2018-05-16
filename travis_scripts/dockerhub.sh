#!/bin/bash

echo $DOCKER_PASSWORD | docker login -u="$DOCKER_USERNAME" --password-stdin
docker build --build-arg BUILD_ENV=travis -t slidewiki/nlpstore:latest-dev ./
docker push slidewiki/nlpstore:latest-dev
