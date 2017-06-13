#!/bin/bash

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker build -t slidewiki/nlpstore:latest-dev ./
docker push slidewiki/nlpstore:latest-dev
