#!/usr/bin/env bash

mkdir -p gh-pages/visualization/
cp -R visualization/dist/coverage gh-pages/visualization/
cp -R visualization/dist/webpack/ gh-pages/visualization/app/

analysis/gradlew -p analysis/ installDist

mkdir gh-pages/demo_files
cd gh-pages/demo_files
CCSH=../../analysis/build/install/codecharta-analysis/bin/ccsh

git log --numstat --raw --topo-order > git.log
$CCSH scmlogparser -o codecharta_git.cc.json --input-format GIT_LOG_NUMSTAT_RAW git.log

# Map for visualization
$CCSH modify --set-root root/visualization -o codecharta_git_mod.cc.json codecharta_git.cc.json

$CCSH sonarimport -o codecharta_sonar.cc.json https://sonarcloud.io maibornwolff-gmbh_codecharta_visualization
$CCSH modify --set-root root/maibornwolff-gmbh_codecharta_visualization -o codecharta_sonar_mod.cc.json codecharta_sonar.cc.json

$CCSH merge -o ../visualization/app/codecharta.cc.json codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json

# Map for analysis
$CCSH sonarimport -o codecharta_sonar_analysis.cc.json https://sonarcloud.io maibornwolff-gmbh_codecharta_analysis
$CCSH modify --set-root root/maibornwolff-gmbh_codecharta_analysis -o codecharta_sonar_mod.cc.json codecharta_sonar_analysis.cc.json
$CCSH modify --set-root root/analysis -o codecharta_git_mod.cc.json codecharta_git.cc.json
$CCSH merge -o ../visualization/app/codecharta_analysis.cc.json codecharta_sonar_mod.cc.json codecharta_git_mod.cc.json


cd ../..
rm -r gh-pages/demo_files
