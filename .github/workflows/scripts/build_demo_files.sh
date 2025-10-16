#!/usr/bin/env bash

analysis/gradlew -p analysis/ installDist

mkdir temp_dir

git ls-files > temp_dir/file-name-list.txt
git log --numstat --raw --topo-order --reverse -m > temp_dir/git.log

cd temp_dir || exit
CCSH=../analysis/build/install/codecharta-analysis/bin/ccsh

# Data for for both visualization and analysis
$CCSH gitlogparser log-scan --git-log git.log --repo-files file-name-list.txt -o codecharta_git.cc.json -nc

# Map for visualization
$CCSH modify --set-root root/visualization -o codecharta_git_mod.cc.json codecharta_git.cc.json
$CCSH unifiedparser ../visualization -o codecharta_unified_visualization.cc.json -nc
$CCSH sonarimport -nc -o codecharta_sonar_visualization.cc.json https://sonarcloud.io maibornwolff-gmbh_codecharta_visualization
# Create one zipped map for pipeline build
$CCSH merge -o ../visualization/dist/bundler/browser/codecharta_visualization.cc.json codecharta_sonar_visualization.cc.json codecharta_unified_visualization.cc.json codecharta_git_mod.cc.json

# Map for analysis
$CCSH modify --set-root root/analysis -o codecharta_git_mod.cc.json codecharta_git.cc.json
$CCSH unifiedparser ../analysis -o codecharta_unified_analysis.cc.json -nc
$CCSH sonarimport -nc -o codecharta_sonar_analysis.cc.json https://sonarcloud.io maibornwolff-gmbh_codecharta_analysis
# Create one zipped map for pipeline build
$CCSH merge -o ../visualization/dist/bundler/browser/codecharta_analysis.cc.json codecharta_sonar_analysis.cc.json codecharta_unified_analysis.cc.json codecharta_git_mod.cc.json

cd ..
rm -r temp_dir
