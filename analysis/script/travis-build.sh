#!/usr/bin/env bash

cd analysis
./gradlew ktlintFormat
./gradlew ktlintTestSourceSetFormat
./gradlew build
