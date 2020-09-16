#!/usr/bin/env bash

cd analysis
./gradlew ktlintTestSourceSetFormat
./gradlew build
