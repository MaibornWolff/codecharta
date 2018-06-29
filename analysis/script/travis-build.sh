#!/usr/bin/env bash

cd analysis
chmod +x import/OOParser/src/generated
strace ./gradlew build integrationTest