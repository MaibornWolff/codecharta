#!/usr/bin/env bash

cd analysis
./gradlew :distTar
./gradlew :test
./gradlew :integrationTest
