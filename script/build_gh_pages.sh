#!/usr/bin/env bash

mkdir -p gh-pages/visualization/
cp -R visualization/dist/coverage gh-pages/visualization/
cp -R visualization/dist/docs gh-pages/visualization/
cp -R visualization/dist/webpack/ gh-pages/visualization/app/

# get sonar analysis
analysis/gradlew -p analysis/ installDist
analysis/build/install/codecharta-analysis/bin/ccsh sonarimport -o gh-pages/visualization/app/codecharta.cc.json https://sonarcloud.io de.maibornwolff.codecharta:visualization
