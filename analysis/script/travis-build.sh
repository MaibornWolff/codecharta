#!/usr/bin/env bash

cd analysis
./gradlew build
sonar-scanner || true
